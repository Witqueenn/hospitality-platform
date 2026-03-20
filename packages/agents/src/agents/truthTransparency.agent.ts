import type { Agent, AgentInput, AgentOutput } from "@repo/shared";
import { getLLMClient } from "../llm.js";

export class TruthTransparencyAgent implements Agent {
  type = "TRUTH_TRANSPARENCY" as const;
  name = "Truth & Transparency Agent";
  description = "Validates listing accuracy and flags undisclosed issues";

  async execute(input: AgentInput): Promise<AgentOutput> {
    const { context } = input;
    const { hotel } = context;

    if (!hotel) {
      return {
        agentType: "TRUTH_TRANSPARENCY",
        decision: "No hotel to validate",
        reasoning: "Missing hotel context",
        confidence: 0.5,
        actions: [],
        escalate: false,
      };
    }

    const raw = await getLLMClient().complete([
      {
        role: "system",
        content: `You are the ${this.name}. ${this.description}.
Audit the hotel listing for completeness and accuracy. Respond with JSON only:
{
  "decision": string,
  "reasoning": string,
  "confidence": number,
  "escalate": boolean,
  "escalationReason": string | null,
  "metadata": { "score": number, "flags": string[], "verified": string[] }
}`,
      },
      {
        role: "user",
        content: JSON.stringify({
          hotel: {
            name: hotel.name,
            amenities: hotel.amenities,
            wifiQuality: hotel.wifiQuality,
            noiseNotes: hotel.noiseNotes,
            policies: hotel.policies,
          },
        }),
      },
    ]);

    const parsed = JSON.parse(raw.content) as {
      decision: string;
      reasoning: string;
      confidence: number;
      escalate: boolean;
      escalationReason?: string;
      metadata: { score: number; flags: string[]; verified: string[] };
    };

    const actions =
      parsed.metadata.flags.length > 0
        ? [
            {
              type: "flag_hotel_listing",
              payload: {
                flags: parsed.metadata.flags,
                score: parsed.metadata.score,
              },
              requiresApproval: false,
              priority: "normal" as const,
            },
          ]
        : [];

    return {
      agentType: "TRUTH_TRANSPARENCY",
      ...parsed,
      escalationReason: parsed.escalationReason ?? undefined,
      actions,
    };
  }
}
