import type { Agent, AgentInput, AgentOutput } from "@repo/shared";
import { getLLMClient } from "../llm.js";

export class EventMatchAgent implements Agent {
  type = "EVENT_MATCH" as const;
  name = "Event Match Agent";
  description =
    "Matches event requests with suitable hotel venues and capabilities";

  async execute(input: AgentInput): Promise<AgentOutput> {
    const { context } = input;
    const { eventRequest, hotel } = context;

    if (!eventRequest) {
      return {
        agentType: "EVENT_MATCH",
        decision: "No event request to evaluate",
        reasoning: "Missing event request context",
        confidence: 0.5,
        actions: [],
        escalate: false,
      };
    }

    const raw = await getLLMClient().complete([
      {
        role: "system",
        content: `You are the ${this.name}. ${this.description}.
Evaluate the fit between the event request and hotel capabilities. Respond with JSON only:
{
  "decision": string,
  "reasoning": string,
  "confidence": number,
  "escalate": boolean,
  "escalationReason": string | null,
  "metadata": { "score": number, "matchFactors": string[] }
}`,
      },
      {
        role: "user",
        content: JSON.stringify({
          eventRequest: {
            eventType: eventRequest.eventType,
            guestCount: eventRequest.guestCount,
            budgetCents: eventRequest.budgetCents,
            requirements: eventRequest.requirements,
            eventDate: eventRequest.eventDate,
          },
          hotel: hotel
            ? { name: hotel.name, amenities: hotel.amenities }
            : null,
        }),
      },
    ]);

    const parsed = JSON.parse(raw.content) as {
      decision: string;
      reasoning: string;
      confidence: number;
      escalate: boolean;
      escalationReason?: string;
      metadata: { score: number; matchFactors: string[] };
    };

    return {
      agentType: "EVENT_MATCH",
      ...parsed,
      escalationReason: parsed.escalationReason ?? undefined,
      actions: [],
    };
  }
}
