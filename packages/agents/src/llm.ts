// ─────────────────────────────────────────────
// LLM Client Abstraction
//
// Decouples agents from any specific provider.
// Swap the implementation when an API key is available —
// tests always use the mock and never need one.
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
      "No LLM provider configured. Set a real client via setLLMClient() or mock this module in tests.",
    );
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
