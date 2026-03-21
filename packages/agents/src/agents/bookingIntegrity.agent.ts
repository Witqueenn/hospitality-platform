import type { Agent, AgentInput, AgentOutput } from "@repo/shared";
import { NO_SHOW_FLAG_THRESHOLD } from "@repo/shared";
import { getLLMClient } from "../llm.js";

export class BookingIntegrityAgent implements Agent {
  type = "BOOKING_INTEGRITY" as const;
  name = "Booking Integrity Agent";
  description = "Prevents booking failures through pre-booking validation";

  async execute(input: AgentInput): Promise<AgentOutput> {
    const { context, payload } = input;
    const { guest } = context;

    // ── Hard rules evaluated in code (deterministic) ──────────────────────────
    const risks: string[] = [];
    const checks: string[] = [];

    if ((guest?.noShowCount ?? 0) >= NO_SHOW_FLAG_THRESHOLD) {
      risks.push(`Guest has ${guest!.noShowCount} no-shows`);
    } else {
      checks.push("No-show history: acceptable");
    }

    const checkIn = payload["checkIn"] as string | undefined;
    const checkOut = payload["checkOut"] as string | undefined;

    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      if (checkOutDate <= checkInDate)
        risks.push("Check-out must be after check-in");
      else checks.push("Date logic: valid");
      if (checkInDate < new Date()) risks.push("Check-in date is in the past");
    }

    const availableCount = payload["availableCount"] as number | undefined;
    if (availableCount !== undefined && availableCount <= 2) {
      risks.push(`Low availability: only ${availableCount} room(s) left`);
    }

    // ── LLM decides final verdict ─────────────────────────────────────────────
    const raw = await getLLMClient().complete([
      {
        role: "system",
        content: `You are the ${this.name}. ${this.description}.
Based on the pre-computed risk analysis, return a final verdict. Respond with JSON only:
{
  "decision": "PROCEED" | "FLAG" | "BLOCK",
  "reasoning": string,
  "confidence": number,
  "escalate": boolean,
  "escalationReason": string | null
}`,
      },
      {
        role: "user",
        content: JSON.stringify({ risks, checks, payload }),
      },
    ]);

    const parsed = JSON.parse(raw.content) as {
      decision: "PROCEED" | "FLAG" | "BLOCK";
      reasoning: string;
      confidence: number;
      escalate: boolean;
      escalationReason?: string;
    };

    const actions =
      parsed.decision === "FLAG"
        ? [
            {
              type: "flag_booking_risk",
              payload: { risks },
              requiresApproval: false,
              priority: "normal" as const,
            },
          ]
        : [];

    return {
      agentType: "BOOKING_INTEGRITY",
      decision: `${parsed.decision}: ${checks.length} checks passed, ${risks.length} risk(s) found`,
      reasoning: parsed.reasoning,
      confidence: parsed.confidence,
      actions,
      escalate: parsed.escalate,
      escalationReason: parsed.escalationReason ?? undefined,
      metadata: { decision: parsed.decision, risks, checks },
    };
  }
}
