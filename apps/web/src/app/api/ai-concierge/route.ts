// ─────────────────────────────────────────────────────────────────────────────
// AI Concierge – Streaming API Route
//
// Compatible with OpenUI's openAIReadableStreamAdapter.
// Returns an OpenAI-compatible SSE stream so the client-side OpenUI hooks
// can consume it transparently.
//
// POST /api/ai-concierge
// Body: { messages: { role: "user"|"assistant"|"system", content: string }[] }
// Auth: Authorization: Bearer <session-token>
// ─────────────────────────────────────────────────────────────────────────────

import { db } from "@repo/db";
import { CONCIERGE_SYSTEM_PROMPT } from "@/lib/openui-hospitality";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Message = { role: "system" | "user" | "assistant"; content: string };

export async function POST(req: Request) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const token =
    req.headers.get("authorization")?.replace("Bearer ", "") ??
    new URL(req.url).searchParams.get("token");

  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const session = await db.session.findUnique({
    where: { token },
    include: { user: { include: { hotel: true } } },
  });

  if (!session || session.expiresAt < new Date()) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let messages: Message[] = [];
  try {
    const body = (await req.json()) as { messages?: Message[] };
    messages = body.messages ?? [];
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Prepend system prompt (always fresh)
  const fullMessages: Message[] = [
    { role: "system", content: CONCIERGE_SYSTEM_PROMPT },
    ...messages.filter((m) => m.role !== "system"),
  ];

  // ── Choose provider ───────────────────────────────────────────────────────
  // Prefer Anthropic (native streaming), fall back to OpenRouter (OAI-compat)
  if (process.env["ANTHROPIC_API_KEY"]) {
    return streamAnthropic(fullMessages);
  }
  if (process.env["OPENROUTER_API_KEY"]) {
    return streamOpenRouter(fullMessages);
  }

  return new Response(
    JSON.stringify({
      error:
        "No LLM provider configured. Set ANTHROPIC_API_KEY or OPENROUTER_API_KEY.",
    }),
    { status: 503, headers: { "Content-Type": "application/json" } },
  );
}

// ── OpenRouter (OpenAI-compatible, native SSE) ─────────────────────────────

async function streamOpenRouter(messages: Message[]) {
  const apiKey = process.env["OPENROUTER_API_KEY"]!;
  const model =
    process.env["AGENT_DEFAULT_MODEL"] ?? "deepseek/deepseek-chat-v3-0324";
  const baseUrl =
    process.env["OPENROUTER_BASE_URL"] ?? "https://openrouter.ai/api/v1";

  const upstream = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://heo.platform",
      "X-Title": "HEO Hospitality Platform",
    },
    body: JSON.stringify({ model, messages, stream: true, temperature: 0.4 }),
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    return new Response(JSON.stringify({ error: `Upstream error: ${text}` }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Pipe stream directly — already in OpenAI SSE format
  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

// ── Anthropic → OpenAI SSE adapter ────────────────────────────────────────

async function streamAnthropic(messages: Message[]) {
  const apiKey = process.env["ANTHROPIC_API_KEY"]!;
  const model = process.env["ANTHROPIC_MODEL"] ?? "claude-sonnet-4-6";

  const systemMessage = messages.find((m) => m.role === "system");
  const convoMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      stream: true,
      ...(systemMessage ? { system: systemMessage.content } : {}),
      messages: convoMessages,
    }),
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    return new Response(JSON.stringify({ error: `Anthropic error: ${text}` }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Convert Anthropic SSE → OpenAI SSE format
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const id = `chatcmpl-${Date.now()}`;

  const transformed = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      const text = decoder.decode(chunk, { stream: true });
      const lines = text.split("\n");

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const raw = line.slice(6).trim();
        if (!raw || raw === "[DONE]") continue;

        try {
          const evt = JSON.parse(raw) as {
            type: string;
            delta?: { type: string; text?: string };
          };

          if (evt.type === "content_block_delta" && evt.delta?.text) {
            const oaiChunk = {
              id,
              object: "chat.completion.chunk",
              created: Math.floor(Date.now() / 1000),
              model: process.env["ANTHROPIC_MODEL"] ?? "claude-sonnet-4-6",
              choices: [
                {
                  index: 0,
                  delta: { content: evt.delta.text },
                  finish_reason: null,
                },
              ],
            };
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(oaiChunk)}\n\n`),
            );
          } else if (evt.type === "message_stop") {
            const stopChunk = {
              id,
              object: "chat.completion.chunk",
              created: Math.floor(Date.now() / 1000),
              model: process.env["ANTHROPIC_MODEL"] ?? "claude-sonnet-4-6",
              choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
            };
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify(stopChunk)}\n\ndata: [DONE]\n\n`,
              ),
            );
          }
        } catch {
          // Skip malformed SSE lines
        }
      }
    },
  });

  return new Response(upstream.body!.pipeThrough(transformed), {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
