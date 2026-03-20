// ─────────────────────────────────────────────
// LLM Client Abstraction
//
// Decouples agents from any specific provider.
// Priority: Anthropic → OpenRouter → Stub
// Tests always use the mock and never need a key.
// ─────────────────────────────────────────────

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMResponse {
  content: string;
}

export interface LLMClient {
  complete(messages: LLMMessage[]): Promise<LLMResponse>;
}

// ── Stub (default until a real provider is wired in) ──────────────────────────

export class StubLLMClient implements LLMClient {
  async complete(_messages: LLMMessage[]): Promise<LLMResponse> {
    throw new Error(
      "No LLM provider configured. Set OPENROUTER_API_KEY or ANTHROPIC_API_KEY, or mock this module in tests.",
    );
  }
}

// ── OpenRouter (OpenAI-compatible — free tier available) ──────────────────────

export class OpenRouterLLMClient implements LLMClient {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(options?: { apiKey?: string; baseUrl?: string; model?: string }) {
    this.apiKey = options?.apiKey ?? process.env["OPENROUTER_API_KEY"] ?? "";
    this.baseUrl =
      options?.baseUrl ??
      process.env["OPENROUTER_BASE_URL"] ??
      "https://openrouter.ai/api/v1";
    this.model =
      options?.model ??
      process.env["AGENT_DEFAULT_MODEL"] ??
      "deepseek/deepseek-chat";
  }

  async complete(messages: LLMMessage[]): Promise<LLMResponse> {
    if (!this.apiKey) {
      throw new Error(
        "OPENROUTER_API_KEY is not set. Get a free key at https://openrouter.ai",
      );
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "HTTP-Referer": "https://heo.platform",
        "X-Title": "HEO Hospitality Platform",
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenRouter API error ${response.status}: ${text}`);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from OpenRouter API");
    }

    return { content };
  }
}

// ── Anthropic (Claude — premium option) ──────────────────────────────────────

export class AnthropicLLMClient implements LLMClient {
  private apiKey: string;
  private model: string;

  constructor(options?: { apiKey?: string; model?: string }) {
    this.apiKey = options?.apiKey ?? process.env["ANTHROPIC_API_KEY"] ?? "";
    this.model =
      options?.model ?? process.env["ANTHROPIC_MODEL"] ?? "claude-sonnet-4-6";
  }

  async complete(messages: LLMMessage[]): Promise<LLMResponse> {
    if (!this.apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set. Get a key at https://console.anthropic.com",
      );
    }

    const systemMessage = messages.find((m) => m.role === "system");
    const conversationMessages = messages.filter((m) => m.role !== "system");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 1024,
        ...(systemMessage ? { system: systemMessage.content } : {}),
        messages: conversationMessages.map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Anthropic API error ${response.status}: ${text}`);
    }

    const data = (await response.json()) as {
      content: Array<{ type: string; text: string }>;
    };

    const content = data.content.find((c) => c.type === "text")?.text;
    if (!content) {
      throw new Error("Empty response from Anthropic API");
    }

    return { content };
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

let _client: LLMClient = new StubLLMClient();

export function setLLMClient(client: LLMClient): void {
  _client = client;
}

export function getLLMClient(): LLMClient {
  return _client;
}

// ── Auto-initialise from environment ─────────────────────────────────────────
// Called once at server startup. Anthropic takes priority when both keys exist.

export function createLLMClient(): LLMClient {
  if (process.env["ANTHROPIC_API_KEY"]) {
    return new AnthropicLLMClient();
  }
  if (process.env["OPENROUTER_API_KEY"]) {
    return new OpenRouterLLMClient();
  }
  return new StubLLMClient();
}
