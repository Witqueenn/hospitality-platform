import type { Agent, AgentInput, AgentOutput, AgentAction } from "@repo/shared";
import { SLA } from "@repo/shared";
import { getLLMClient } from "../llm.js";

const SEVERITY_MAP: Record<string, "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"> = {
  SAFETY_CONCERN: "CRITICAL",
  STAFF_BEHAVIOR: "HIGH",
  AC_BROKEN: "HIGH",
  WRONG_ROOM: "HIGH",
  BILLING_ISSUE: "HIGH",
  ROOM_NOT_READY: "MEDIUM",
  ROOM_CLEANLINESS: "MEDIUM",
  NOISE_COMPLAINT: "MEDIUM",
  CHECK_IN_DELAY: "MEDIUM",
  WIFI_ISSUE: "LOW",
  FOOD_QUALITY: "LOW",
  AMENITY_MISSING: "LOW",
  EVENT_ISSUE: "MEDIUM",
  OTHER: "MEDIUM",
};

export class StaySupportAgent implements Agent {
  type = "STAY_SUPPORT" as const;
  name = "Stay Support Agent";
  description = "Classifies support cases and recommends immediate actions";

  async execute(input: AgentInput): Promise<AgentOutput> {
    const { context, payload } = input;
    const { case: supportCase, guest, hotel } = context;

    const category =
      (supportCase?.category as string | undefined) ??
      (payload["category"] as string | undefined) ??
      "OTHER";

    // Severity and SLA are deterministic — keep in code
    const severity = SEVERITY_MAP[category] ?? "MEDIUM";
    const slaConfig = SLA[severity];
    const responseDeadline = new Date(
      Date.now() + slaConfig.responseMinutes * 60 * 1000,
    );
    const resolutionDeadline = new Date(
      Date.now() + slaConfig.resolutionMinutes * 60 * 1000,
    );

    const raw = await getLLMClient().complete([
      {
        role: "system",
        content: `You are the ${this.name}. ${this.description}.
Recommend the best immediate action for this support case.
Respond with JSON only:
{
  "decision": string,
  "reasoning": string,
  "confidence": number,
  "escalate": boolean,
  "escalationReason": string | null,
  "metadata": { "recommendedAction": string }
}`,
      },
      {
        role: "user",
        content: JSON.stringify({
          category,
          severity,
          sla: slaConfig,
          guestName: guest?.name,
          hotelName: hotel?.name,
          caseDescription: supportCase?.description,
        }),
      },
    ]);

    const parsed = JSON.parse(raw.content) as {
      decision: string;
      reasoning: string;
      confidence: number;
      escalate: boolean;
      escalationReason?: string;
      metadata: { recommendedAction: string };
    };

    const actions: AgentAction[] = [];

    if (supportCase?.id) {
      actions.push({
        type: "update_case_status",
        payload: { caseId: supportCase.id, status: "IN_PROGRESS" },
        requiresApproval: false,
        priority: "immediate",
      });
    }

    if (guest) {
      actions.push({
        type: "send_notification",
        payload: {
          recipientId: guest.id,
          subject: "Your case is being handled",
          body: `Dear ${guest.name}, we have received your report and our team is working on it. Expected response within ${slaConfig.responseMinutes} minutes.`,
          channel: "support",
        },
        requiresApproval: false,
        priority: "immediate",
      });
    }

    return {
      agentType: "STAY_SUPPORT",
      decision: parsed.decision,
      reasoning: parsed.reasoning,
      confidence: parsed.confidence,
      actions,
      escalate: parsed.escalate,
      escalationReason: parsed.escalationReason ?? undefined,
      metadata: {
        severity,
        category,
        recommendedAction: parsed.metadata.recommendedAction,
        responseDeadline,
        resolutionDeadline,
        sla: slaConfig,
      },
    };
  }
}
