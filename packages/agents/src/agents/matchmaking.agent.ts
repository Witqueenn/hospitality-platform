import type { Agent, AgentInput, AgentOutput } from "@repo/shared";
import { getLLMClient } from "../llm.js";

export class MatchmakingAgent implements Agent {
  type = "MATCHMAKING" as const;
  name = "Matchmaking Agent";
  description = "Ranks hotels and rooms based on guest profile fit";

  async execute(input: AgentInput): Promise<AgentOutput> {
    const { context, payload } = input;
    const { guest, hotel } = context;

    if (!hotel) {
      return {
        agentType: "MATCHMAKING",
        decision: "No hotel context to evaluate",
        reasoning: "Hotel data not available for scoring",
        confidence: 0.5,
        actions: [],
        escalate: false,
      };
    }

    const raw = await getLLMClient().complete([
      {
        role: "system",
        content: `You are the ${this.name}. ${this.description}.
Evaluate the hotel-guest fit holistically. Respond with JSON only:
{
  "decision": string,
  "reasoning": string,
  "confidence": number,
  "escalate": false,
  "metadata": { "score": number, "positives": string[], "warnings": string[] }
}`,
      },
      {
        role: "user",
        content: JSON.stringify({
          guest: {
            preferences: guest?.preferences,
            noShowCount: guest?.noShowCount,
          },
          hotel: {
            amenities: hotel.amenities,
            averageReviewScore: hotel.averageReviewScore,
            wifiQuality: hotel.wifiQuality,
            noiseNotes: hotel.noiseNotes,
            policies: hotel.policies,
          },
          payload,
        }),
      },
    ]);

    const parsed = JSON.parse(raw.content) as {
      decision: string;
      reasoning: string;
      confidence: number;
      escalate: boolean;
      metadata: { score: number; positives: string[]; warnings: string[] };
    };

    return { agentType: "MATCHMAKING", ...parsed, actions: [] };
  }
}
