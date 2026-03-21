import type { Agent, AgentInput, AgentOutput } from "@repo/shared";
import { getLLMClient } from "../llm.js";

export class FBPlanningAgent implements Agent {
  type = "FB_PLANNING" as const;
  name = "F&B Planning Agent";
  description = "Plans food and beverage for events and dining experiences";

  async execute(input: AgentInput): Promise<AgentOutput> {
    const { context } = input;
    const { eventRequest } = context;

    const raw = await getLLMClient().complete([
      {
        role: "system",
        content: `You are the ${this.name}. ${this.description}.
Create a detailed F&B plan for the event. Respond with JSON only:
{
  "decision": string,
  "reasoning": string,
  "confidence": number,
  "escalate": false,
  "metadata": {
    "serviceStyle": "buffet" | "plated" | "stations" | "cocktail",
    "suggestions": string[],
    "dietaryNotes": string[]
  }
}`,
      },
      {
        role: "user",
        content: JSON.stringify({
          guestCount: eventRequest?.guestCount ?? 0,
          eventType: eventRequest?.eventType,
          requirements: eventRequest?.requirements,
          budgetCents: eventRequest?.budgetCents,
        }),
      },
    ]);

    const parsed = JSON.parse(raw.content) as {
      decision: string;
      reasoning: string;
      confidence: number;
      escalate: boolean;
      metadata: {
        serviceStyle: string;
        suggestions: string[];
        dietaryNotes: string[];
      };
    };

    return { agentType: "FB_PLANNING", ...parsed, actions: [] };
  }
}
