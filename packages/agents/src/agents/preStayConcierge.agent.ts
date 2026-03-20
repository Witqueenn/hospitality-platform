import type { Agent, AgentInput, AgentOutput } from "@repo/shared";
import { getLLMClient } from "../llm.js";

export class PreStayConciergeAgent implements Agent {
  type = "PRE_STAY_CONCIERGE" as const;
  name = "Pre-Stay Concierge Agent";
  description =
    "Prepares pre-arrival communications and upsell recommendations";

  async execute(input: AgentInput): Promise<AgentOutput> {
    const { context } = input;
    const { guest, hotel, booking } = context;

    if (!guest || !hotel || !booking) {
      return {
        agentType: "PRE_STAY_CONCIERGE",
        decision: "Insufficient context for pre-stay preparation",
        reasoning: "Missing guest, hotel, or booking data",
        confidence: 0.5,
        actions: [],
        escalate: false,
      };
    }

    const raw = await getLLMClient().complete([
      {
        role: "system",
        content: `You are the ${this.name}. ${this.description}.
Generate a personalised pre-arrival message and list any upsell opportunities.
Respond with JSON only:
{
  "decision": string,
  "reasoning": string,
  "confidence": number,
  "escalate": false,
  "metadata": {
    "messageSubject": string,
    "messageBody": string,
    "upsells": string[]
  }
}`,
      },
      {
        role: "user",
        content: JSON.stringify({
          guest: { name: guest.name, preferences: guest.preferences },
          hotel: {
            name: hotel.name,
            amenities: hotel.amenities,
            policies: hotel.policies,
          },
          booking: {
            checkIn: (booking as Record<string, unknown>)["checkIn"],
            checkOut: (booking as Record<string, unknown>)["checkOut"],
            guestCount: (booking as Record<string, unknown>)["guestCount"],
          },
        }),
      },
    ]);

    const parsed = JSON.parse(raw.content) as {
      decision: string;
      reasoning: string;
      confidence: number;
      escalate: boolean;
      metadata: {
        messageSubject: string;
        messageBody: string;
        upsells: string[];
      };
    };

    return {
      agentType: "PRE_STAY_CONCIERGE",
      ...parsed,
      actions: [
        {
          type: "send_notification",
          payload: {
            recipientId: guest.id,
            subject: parsed.metadata.messageSubject,
            body: parsed.metadata.messageBody,
            channel: "booking",
          },
          requiresApproval: false,
          priority: "normal",
        },
      ],
    };
  }
}
