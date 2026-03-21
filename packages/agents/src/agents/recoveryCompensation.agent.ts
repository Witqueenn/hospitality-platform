import type { Agent, AgentInput, AgentOutput, AgentAction } from "@repo/shared";
import { COMPENSATION_AUTO_APPROVE_MAX_CENTS } from "@repo/shared";
import { getLLMClient } from "../llm.js";

export class RecoveryCompensationAgent implements Agent {
  type = "RECOVERY_COMPENSATION" as const;
  name = "Recovery & Compensation Agent";
  description = "Proposes fair, consistent service recovery compensation";

  async execute(input: AgentInput): Promise<AgentOutput> {
    const { context } = input;
    const { case: supportCase, history } = context;

    const severity = (supportCase?.severity as string | undefined) ?? "MEDIUM";

    // Hard limit check — never delegate to LLM
    const totalPastCompensations = history.compensationHistory.reduce(
      (sum, c) => sum + (c.valueCents ?? 0),
      0,
    );

    if (totalPastCompensations > 50000) {
      return {
        agentType: "RECOVERY_COMPENSATION",
        decision: "Compensation limit reached for this guest",
        reasoning: `Guest has already received $${(totalPastCompensations / 100).toFixed(2)} in compensation. Escalating for human review.`,
        confidence: 0.9,
        actions: [],
        escalate: true,
        escalationReason:
          "Guest compensation history exceeds automatic threshold",
      };
    }

    const raw = await getLLMClient().complete([
      {
        role: "system",
        content: `You are the ${this.name}. ${this.description}.
Propose a fair compensation for the incident. Respond with JSON only:
{
  "decision": string,
  "reasoning": string,
  "confidence": number,
  "escalate": false,
  "metadata": {
    "compensationType": "AMENITY_CREDIT" | "BREAKFAST_INCLUDED" | "PARTIAL_REFUND" | "FREE_NIGHT",
    "valueCents": number | null,
    "description": string,
    "requiresApproval": boolean
  }
}`,
      },
      {
        role: "user",
        content: JSON.stringify({
          severity,
          category: supportCase?.category,
          pastCompensationTotalCents: totalPastCompensations,
          autoApproveThresholdCents: COMPENSATION_AUTO_APPROVE_MAX_CENTS,
        }),
      },
    ]);

    const parsed = JSON.parse(raw.content) as {
      decision: string;
      reasoning: string;
      confidence: number;
      escalate: boolean;
      metadata: {
        compensationType: string;
        valueCents: number | null;
        description: string;
        requiresApproval: boolean;
      };
    };

    const actions: AgentAction[] = [];

    if (supportCase?.id) {
      actions.push({
        type: "propose_compensation",
        payload: {
          caseId: supportCase.id,
          compensationType: parsed.metadata.compensationType,
          description: parsed.metadata.description,
          valueCents: parsed.metadata.valueCents,
          reasoning: parsed.reasoning,
        },
        requiresApproval: parsed.metadata.requiresApproval,
        priority: severity === "CRITICAL" ? "immediate" : "normal",
      });
    }

    return {
      agentType: "RECOVERY_COMPENSATION",
      decision: parsed.decision,
      reasoning: parsed.reasoning,
      confidence: parsed.confidence,
      actions,
      escalate: false,
      metadata: { ...parsed.metadata, totalPastCompensations },
    };
  }
}
