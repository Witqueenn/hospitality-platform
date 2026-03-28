"use client";

// ─────────────────────────────────────────────────────────────────────────────
// AI Concierge – Floating Chat Panel
//
// Powered by OpenUI's streaming renderer. Uses:
//   @openuidev/react-lang  — Renderer + createLibrary for component rendering
//   @openuidev/react-ui    — Pre-built hospitality UI components (as renderers)
//
// The panel streams responses from /api/ai-concierge and renders OpenUI Lang
// markup (component tags) inline alongside plain markdown text.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/stores/authStore";

// ── Types ─────────────────────────────────────────────────────────────────────

type Role = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  isStreaming?: boolean;
}

// ── OpenUI Component Renderer ─────────────────────────────────────────────────
// Parses OpenUI Lang tags from the assistant message and renders them as
// styled React components. Falls back to a <pre> block for unknown tags.

function parseOpenUILang(content: string): Array<{
  type: "text" | "component";
  value: string;
  name?: string;
  props?: Record<string, unknown>;
}> {
  const parts: Array<{
    type: "text" | "component";
    value: string;
    name?: string;
    props?: Record<string, unknown>;
  }> = [];
  const tagPattern = /```openui\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = tagPattern.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        value: content.slice(lastIndex, match.index),
      });
    }
    const block = match[1]?.trim() ?? "";
    // Parse <ComponentName ...props /> or <ComponentName>
    const tagMatch = block.match(/^<(\w+)([^>]*)\/?>$/);
    if (tagMatch) {
      const name = tagMatch[1] ?? "";
      const propsRaw = tagMatch[2] ?? "";
      const props = parseProps(propsRaw);
      parts.push({ type: "component", value: block, name, props });
    } else {
      parts.push({ type: "text", value: `\`\`\`\n${block}\n\`\`\`` });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: "text", value: content.slice(lastIndex) });
  }

  return parts;
}

function parseProps(raw: string): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  // Match key="value" and key={value}
  const strAttr = /(\w+)="([^"]*)"/g;
  const exprAttr = /(\w+)=\{([^}]+)\}/g;
  let m;
  while ((m = strAttr.exec(raw)) !== null) {
    props[m[1]!] = m[2];
  }
  while ((m = exprAttr.exec(raw)) !== null) {
    try {
      props[m[1]!] = JSON.parse(m[2]!);
    } catch {
      props[m[1]!] = m[2];
    }
  }
  return props;
}

// ── Hospitality component renderers ───────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
  trend,
  color,
}: Record<string, unknown>) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-600",
    green: "text-green-600",
    red: "text-red-600",
    yellow: "text-yellow-600",
    gray: "text-gray-700",
  };
  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : "";
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-500">{String(label)}</p>
      <p
        className={`text-2xl font-bold ${colorMap[String(color)] ?? "text-gray-900"}`}
      >
        {String(value)}{" "}
        {trendIcon && <span className="text-sm">{trendIcon}</span>}
      </p>
      {!!sub && <p className="mt-0.5 text-xs text-gray-400">{String(sub)}</p>}
    </div>
  );
}

function BookingCard({
  guestName,
  roomType,
  checkIn,
  checkOut,
  status,
  totalCents,
  notes,
}: Record<string, unknown>) {
  const statusColors: Record<string, string> = {
    CONFIRMED: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    CHECKED_IN: "bg-blue-100 text-blue-700",
    CHECKED_OUT: "bg-gray-100 text-gray-600",
    CANCELLED: "bg-red-100 text-red-600",
  };
  const cents = Number(totalCents ?? 0);
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-gray-900">{String(guestName)}</p>
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${statusColors[String(status)] ?? "bg-gray-100 text-gray-600"}`}
        >
          {String(status)}
        </span>
      </div>
      <p className="mt-1 text-sm text-gray-600">{String(roomType)}</p>
      <p className="text-xs text-gray-400">
        {String(checkIn)} → {String(checkOut)}
      </p>
      {cents > 0 && (
        <p className="mt-1 text-sm font-medium text-gray-700">
          ${(cents / 100).toFixed(2)}
        </p>
      )}
      {!!notes && (
        <p className="mt-1 text-xs italic text-gray-400">{String(notes)}</p>
      )}
    </div>
  );
}

function EventCard({
  title,
  eventDate,
  guestCount,
  venue,
  beoStatus,
  type,
}: Record<string, unknown>) {
  const beoColors: Record<string, string> = {
    APPROVED: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    DRAFT: "bg-gray-100 text-gray-600",
    REJECTED: "bg-red-100 text-red-600",
  };
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-gray-900">{String(title)}</p>
        {!!beoStatus && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${beoColors[String(beoStatus)] ?? "bg-gray-100 text-gray-600"}`}
          >
            BEO: {String(beoStatus)}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500">
        {String(eventDate)} {venue ? `· ${String(venue)}` : ""}{" "}
        {guestCount ? `· ${Number(guestCount)} guests` : ""}
      </p>
      {!!type && <p className="mt-1 text-xs text-gray-400">{String(type)}</p>}
    </div>
  );
}

function InsightAlert({
  title,
  description,
  severity,
  action,
}: Record<string, unknown>) {
  const styles: Record<string, { border: string; icon: string }> = {
    critical: { border: "border-red-300 bg-red-50", icon: "🔴" },
    warning: { border: "border-yellow-300 bg-yellow-50", icon: "⚠️" },
    info: { border: "border-blue-200 bg-blue-50", icon: "ℹ️" },
  };
  const s = styles[String(severity)] ?? styles.info!;
  return (
    <div className={`rounded-lg border p-3 ${s.border}`}>
      <div className="flex items-start gap-2">
        <span>{s.icon}</span>
        <div>
          <p className="text-sm font-medium text-gray-900">{String(title)}</p>
          <p className="text-xs text-gray-600">{String(description)}</p>
          {!!action && (
            <p className="mt-1 text-xs font-medium text-gray-700">
              → {String(action)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function SupportCaseCard({
  caseId,
  guestName,
  subject,
  status,
  priority,
  createdAt,
}: Record<string, unknown>) {
  const priorityColors: Record<string, string> = {
    CRITICAL: "text-red-600",
    HIGH: "text-orange-500",
    MEDIUM: "text-yellow-600",
    LOW: "text-gray-500",
  };
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">#{String(caseId)}</p>
        <span
          className={`text-xs font-medium ${priorityColors[String(priority)] ?? "text-gray-500"}`}
        >
          {String(priority ?? "")}
        </span>
      </div>
      <p className="mt-1 font-semibold text-gray-900">{String(subject)}</p>
      <p className="text-xs text-gray-500">{String(guestName)}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
          {String(status)}
        </span>
        {!!createdAt && (
          <p className="text-xs text-gray-400">{String(createdAt)}</p>
        )}
      </div>
    </div>
  );
}

function DataTable({ headers, rows, caption }: Record<string, unknown>) {
  const hdrs = Array.isArray(headers) ? (headers as string[]) : [];
  const rws = Array.isArray(rows) ? (rows as unknown[][]) : [];
  return (
    <div className="overflow-x-auto rounded-lg border">
      {!!caption && (
        <p className="border-b px-3 py-2 text-xs font-medium text-gray-500">
          {String(caption)}
        </p>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            {hdrs.map((h, i) => (
              <th
                key={i}
                className="px-3 py-2 text-left text-xs font-semibold text-gray-600"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rws.map((row, i) => (
            <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
              {(Array.isArray(row) ? row : []).map((cell, j) => (
                <td key={j} className="px-3 py-2 text-gray-700">
                  {String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActionList({ title, items }: Record<string, unknown>) {
  const itms = Array.isArray(items)
    ? (items as Array<{
        label: string;
        description?: string;
        priority?: string;
      }>)
    : [];
  return (
    <div className="rounded-lg border bg-white p-3">
      <p className="mb-2 text-sm font-semibold text-gray-900">
        {String(title)}
      </p>
      <ul className="space-y-1.5">
        {itms.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[#1a1a2e] text-[10px] text-white">
              {i + 1}
            </span>
            <div>
              <span className="font-medium text-gray-800">{item.label}</span>
              {item.description && (
                <p className="text-xs text-gray-500">{item.description}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Registry mapping component names → renderers
const RENDERERS: Record<string, React.FC<Record<string, unknown>>> = {
  MetricCard,
  BookingCard,
  EventCard,
  InsightAlert,
  SupportCaseCard,
  DataTable,
  ActionList,
};

// ── Message renderer ───────────────────────────────────────────────────────────

function MessageContent({ content }: { content: string }) {
  const parts = parseOpenUILang(content);

  return (
    <div className="space-y-2">
      {parts.map((part, i) => {
        if (part.type === "component" && part.name) {
          const Comp = RENDERERS[part.name];
          if (Comp) return <Comp key={i} {...(part.props ?? {})} />;
          return (
            <pre
              key={i}
              className="overflow-x-auto rounded bg-gray-100 p-2 text-xs"
            >
              {part.value}
            </pre>
          );
        }
        // Plain text — simple markdown-ish rendering (bold, code inline)
        return (
          <p
            key={i}
            className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800"
          >
            {part.value}
          </p>
        );
      })}
    </div>
  );
}

// ── Main AiConcierge component ─────────────────────────────────────────────────

export function AiConcierge() {
  const { token } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm Aria, your hotel operations assistant. I can help with bookings, room status, events, guest services, and operational insights. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: text.trim(),
      };
      const assistantId = `a-${Date.now()}`;
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInput("");
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        // Build conversation history (exclude welcome message from context)
        const history = messages
          .filter((m) => m.id !== "welcome")
          .concat(userMsg)
          .map(({ role, content }) => ({ role, content }));

        const res = await fetch("/api/ai-concierge", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ messages: history }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          throw new Error(`HTTP ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true as boolean) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (!data || data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data) as {
                choices?: Array<{ delta?: { content?: string } }>;
              };
              const delta = parsed.choices?.[0]?.delta?.content ?? "";
              if (delta) {
                accumulated += delta;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: accumulated } : m,
                  ),
                );
              }
            } catch {
              // Skip malformed lines
            }
          }
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, isStreaming: false } : m,
          ),
        );
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: "Sorry, I encountered an error. Please try again.",
                  isStreaming: false,
                }
              : m,
          ),
        );
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [isStreaming, messages, token],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setMessages((prev) =>
      prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m)),
    );
  };

  // ── Quick prompts ───────────────────────────────────────────────────────────
  const quickPrompts = [
    "Show today's occupancy metrics",
    "What are the upcoming events this week?",
    "Summarize open support cases",
    "Room availability tips",
  ];

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#1a1a2e] text-2xl text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label="Open AI Concierge"
      >
        {open ? "✕" : "✨"}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[600px] w-[400px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 border-b bg-[#1a1a2e] px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-lg">
              ✨
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Aria</p>
              <p className="text-xs text-white/60">
                AI Hotel Operations Assistant
              </p>
            </div>
            <div className="ml-auto flex h-2 w-2 rounded-full bg-green-400" />
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="mr-2 mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#1a1a2e] text-xs text-white">
                    ✨
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    msg.role === "user"
                      ? "rounded-tr-sm bg-[#1a1a2e] text-white"
                      : "rounded-tl-sm bg-gray-50"
                  }`}
                >
                  {msg.role === "user" ? (
                    <p className="text-sm">{msg.content}</p>
                  ) : msg.content ? (
                    <MessageContent content={msg.content} />
                  ) : (
                    <div className="flex gap-1 py-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
                    </div>
                  )}
                  {msg.isStreaming && msg.content && (
                    <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-gray-500" />
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts — only shown when no conversation yet */}
          {messages.length === 1 && (
            <div className="border-t px-4 pb-2 pt-3">
              <p className="mb-2 text-xs text-gray-400">Quick actions</p>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((q) => (
                  <button
                    key={q}
                    onClick={() => void sendMessage(q)}
                    className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 transition-colors hover:border-[#1a1a2e] hover:text-[#1a1a2e]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t bg-white px-4 py-3"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Aria anything..."
              disabled={isStreaming}
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-[#1a1a2e] disabled:opacity-50"
            />
            {isStreaming ? (
              <button
                type="button"
                onClick={handleStop}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-600 hover:bg-red-200"
              >
                ■
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1a1a2e] text-white transition-opacity disabled:opacity-40"
              >
                ↑
              </button>
            )}
          </form>
        </div>
      )}
    </>
  );
}
