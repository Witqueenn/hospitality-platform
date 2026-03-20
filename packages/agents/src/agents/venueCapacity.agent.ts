import type { Agent, AgentInput, AgentOutput } from "@repo/shared";
import { db } from "@repo/db";
import { getLLMClient } from "../llm.js";

export class VenueCapacityAgent implements Agent {
  type = "VENUE_CAPACITY" as const;
  name = "Venue Capacity Agent";
  description = "Validates venue availability and capacity for event requests";

  async execute(input: AgentInput): Promise<AgentOutput> {
    const { context } = input;
    const { eventRequest, hotel } = context;

    if (!eventRequest || !hotel) {
      return {
        agentType: "VENUE_CAPACITY",
        decision: "Insufficient context to validate capacity",
        reasoning: "Missing event request or hotel context",
        confidence: 0.5,
        actions: [],
        escalate: false,
      };
    }

    // DB query stays in code — LLM interprets the results
    const venues = await db.venue.findMany({
      where: { hotelId: hotel.id, isActive: true },
    });

    const suitableVenues = venues.filter((v) => {
      const caps = v.capacities as Record<string, number>;
      return Object.values(caps).some((cap) => cap >= eventRequest.guestCount);
    });

    const raw = await getLLMClient().complete([
      {
        role: "system",
        content: `You are the ${this.name}. ${this.description}.
Interpret the venue availability data and recommend next steps. Respond with JSON only:
{
  "decision": string,
  "reasoning": string,
  "confidence": number,
  "escalate": boolean,
  "escalationReason": string | null,
  "metadata": { "suitableVenues": { "id": string, "name": string }[] }
}`,
      },
      {
        role: "user",
        content: JSON.stringify({
          requestedGuestCount: eventRequest.guestCount,
          eventType: eventRequest.eventType,
          suitableVenues: suitableVenues.map((v) => ({
            id: v.id,
            name: v.name,
            capacities: v.capacities,
          })),
          totalVenuesChecked: venues.length,
        }),
      },
    ]);

    const parsed = JSON.parse(raw.content) as {
      decision: string;
      reasoning: string;
      confidence: number;
      escalate: boolean;
      escalationReason?: string;
      metadata: { suitableVenues: { id: string; name: string }[] };
    };

    return {
      agentType: "VENUE_CAPACITY",
      ...parsed,
      escalationReason: parsed.escalationReason ?? undefined,
      actions: [],
    };
  }
}
