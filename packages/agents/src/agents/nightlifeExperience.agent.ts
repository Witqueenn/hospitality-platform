import type { Agent, AgentInput, AgentOutput } from "@repo/shared";
import { getLLMClient } from "../llm.js";

export class NightlifeExperienceAgent implements Agent {
  type = "NIGHTLIFE_EXPERIENCE" as const;
  name = "Nightlife Experience Agent";
  description =
    "Curates nightlife recommendations and manages night experience bookings";

  async execute(input: AgentInput): Promise<AgentOutput> {
    const { context } = input;
    const { guest, hotel } = context;

    const raw = await getLLMClient().complete([
      {
        role: "system",
        content: `You are the ${this.name}. ${this.description}.
Curate personalised nightlife recommendations for the guest. Respond with JSON only:
{
  "decision": string,
  "reasoning": string,
  "confidence": number,
  "escalate": false,
  "metadata": { "recommendations": string[] }
}`,
      },
      {
        role: "user",
        content: JSON.stringify({
          guest: { name: guest?.name, preferences: guest?.preferences },
          hotelLocation: hotel ? { name: hotel.name } : null,
        }),
      },
    ]);

    const parsed = JSON.parse(raw.content) as {
      decision: string;
      reasoning: string;
      confidence: number;
      escalate: boolean;
      metadata: { recommendations: string[] };
    };

    return { agentType: "NIGHTLIFE_EXPERIENCE", ...parsed, actions: [] };
  }
}
