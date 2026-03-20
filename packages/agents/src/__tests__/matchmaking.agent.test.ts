import { describe, it, expect } from "vitest";
import { MatchmakingAgent } from "../agents/matchmaking.agent.js";
import type { AgentInput } from "@repo/shared";

const agent = new MatchmakingAgent();

const baseHotel = {
  id: "hotel-1",
  name: "Test Hotel",
  amenities: ["pool", "gym", "spa"],
  averageReviewScore: 8.5,
  wifiQuality: "fast" as const,
  noiseNotes: null,
};

const baseGuest = {
  id: "guest-1",
  name: "Alice",
  preferences: {},
  noShowCount: 0,
};

function makeInput(overrides: Partial<AgentInput["context"]> = {}): AgentInput {
  return {
    context: { guest: baseGuest, hotel: baseHotel, ...overrides },
    payload: {},
  };
}

describe("MatchmakingAgent", () => {
  it("returns a score between 0 and 100", async () => {
    const output = await agent.execute(makeInput());
    const score = (output.metadata as Record<string, unknown>)?.[
      "score"
    ] as number;
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("returns lower confidence when no hotel context", async () => {
    const output = await agent.execute(makeInput({ hotel: undefined }));
    expect(output.confidence).toBe(0.5);
    expect(output.escalate).toBe(false);
  });

  it("penalises poor wifi when guest requires it", async () => {
    const withFastWifi = await agent.execute(
      makeInput({
        guest: { ...baseGuest, preferences: { requiresGoodWifi: true } },
      }),
    );
    const withPoorWifi = await agent.execute(
      makeInput({
        guest: { ...baseGuest, preferences: { requiresGoodWifi: true } },
        hotel: { ...baseHotel, wifiQuality: "poor" as const },
      }),
    );

    const scoreFast = (withFastWifi.metadata as Record<string, unknown>)?.[
      "score"
    ] as number;
    const scorePoor = (withPoorWifi.metadata as Record<string, unknown>)?.[
      "score"
    ] as number;
    expect(scoreFast).toBeGreaterThan(scorePoor);
  });

  it("adds warnings for guests with 2+ no-shows", async () => {
    const output = await agent.execute(
      makeInput({ guest: { ...baseGuest, noShowCount: 2 } }),
    );
    const warnings = (output.metadata as Record<string, unknown>)?.[
      "warnings"
    ] as string[];
    expect(warnings.some((w) => w.includes("no-show"))).toBe(true);
  });

  it("boosts score for amenity match", async () => {
    const withMatch = await agent.execute(
      makeInput({
        guest: { ...baseGuest, preferences: { amenities: ["pool", "gym"] } },
      }),
    );
    const withMismatch = await agent.execute(
      makeInput({
        guest: {
          ...baseGuest,
          preferences: { amenities: ["beach", "casino"] },
        },
      }),
    );

    const scoreMatch = (withMatch.metadata as Record<string, unknown>)?.[
      "score"
    ] as number;
    const scoreMismatch = (withMismatch.metadata as Record<string, unknown>)?.[
      "score"
    ] as number;
    expect(scoreMatch).toBeGreaterThan(scoreMismatch);
  });
});
