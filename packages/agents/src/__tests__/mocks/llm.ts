import { vi } from "vitest";
import type { LLMClient, LLMMessage, LLMResponse } from "../../llm.js";

// ── Default structured response ───────────────────────────────────────────────

export const DEFAULT_LLM_RESPONSE = {
  decision: "accept",
  score: 90,
};

// ── Mock factory ──────────────────────────────────────────────────────────────

export function createMockLLMClient(
  response: Record<string, unknown> = DEFAULT_LLM_RESPONSE,
): LLMClient {
  return {
    complete: vi.fn().mockResolvedValue({
      content: JSON.stringify(response),
    } satisfies LLMResponse),
  };
}

// ── Helper: parse agent JSON responses safely ─────────────────────────────────

export function parseAgentResponse<T = Record<string, unknown>>(
  raw: LLMResponse,
): T {
  return JSON.parse(raw.content) as T;
}

// ── Usage in tests ────────────────────────────────────────────────────────────
//
//   import { createMockLLMClient } from "./__tests__/mocks/llm.js";
//   import { setLLMClient } from "../llm.js";
//
//   beforeEach(() => {
//     setLLMClient(createMockLLMClient({ decision: "reject", score: 20 }));
//   });
