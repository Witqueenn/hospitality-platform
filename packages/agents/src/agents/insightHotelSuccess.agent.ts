import type { Agent, AgentInput, AgentOutput, AgentAction } from "@repo/shared";
import { getLLMClient } from "../llm.js";

export class InsightHotelSuccessAgent implements Agent {
  type = "INSIGHT_HOTEL_SUCCESS" as const;
  name = "Hotel Success & Insight Agent";
  description =
    "Analyzes operational patterns to detect recurring issues and opportunities";

  async execute(input: AgentInput): Promise<AgentOutput> {
    const { context } = input;
    const { hotel, history } = context;

    if (!hotel) {
      return {
        agentType: "INSIGHT_HOTEL_SUCCESS",
        decision: "No hotel context for insight generation",
        reasoning: "Missing hotel data",
        confidence: 0.5,
        actions: [],
        escalate: false,
      };
    }

    // Pre-aggregate stats — LLM interprets patterns
    const categoryCounts: Record<string, number> = {};
    history.previousCases.forEach((c) => {
      categoryCounts[c.category] = (categoryCounts[c.category] ?? 0) + 1;
    });

    const avgCompensation =
      history.compensationHistory.length > 0
        ? history.compensationHistory.reduce(
            (s, c) => s + (c.valueCents ?? 0),
            0,
          ) / history.compensationHistory.length
        : 0;

    const raw = await getLLMClient().complete([
      {
        role: "system",
        content: `You are the ${this.name}. ${this.description}.
Identify operational patterns and generate actionable insights. Respond with JSON only:
{
  "decision": string,
  "reasoning": string,
  "confidence": number,
  "escalate": false,
  "metadata": {
    "insights": string[],
    "recurringIssues": { "category": string, "count": number, "severity": "critical" | "warning" }[]
  }
}`,
      },
      {
        role: "user",
        content: JSON.stringify({
          hotel: { id: hotel.id, name: hotel.name },
          categoryCounts,
          avgCompensationCents: avgCompensation,
          totalCases: history.previousCases.length,
          totalCompensationEvents: history.compensationHistory.length,
        }),
      },
    ]);

    const parsed = JSON.parse(raw.content) as {
      decision: string;
      reasoning: string;
      confidence: number;
      escalate: boolean;
      metadata: {
        insights: string[];
        recurringIssues: {
          category: string;
          count: number;
          severity: "critical" | "warning";
        }[];
      };
    };

    const actions: AgentAction[] = parsed.metadata.recurringIssues.map(
      (issue) => ({
        type: "create_insight",
        payload: {
          hotelId: hotel.id,
          insightType: "recurring_issue",
          category: issue.category,
          title: `Recurring ${issue.category.replace(/_/g, " ").toLowerCase()} complaints`,
          description: `${issue.count} cases detected. Recommend operational review.`,
          severity: issue.severity,
          isActionable: true,
          data: issue,
        },
        requiresApproval: false,
        priority: "normal" as const,
      }),
    );

    return {
      agentType: "INSIGHT_HOTEL_SUCCESS",
      ...parsed,
      actions,
      metadata: { ...parsed.metadata, categoryCounts, avgCompensation },
    };
  }
}
