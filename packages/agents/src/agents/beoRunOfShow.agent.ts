import type { Agent, AgentInput, AgentOutput } from "@repo/shared";
import { getLLMClient } from "../llm.js";

export class BEORunOfShowAgent implements Agent {
  type = "BEO_RUNOFSHOW" as const;
  name = "BEO & Run-of-Show Agent";
  description = "Generates Banquet Event Orders and run-of-show timelines";

  async execute(input: AgentInput): Promise<AgentOutput> {
    const { context } = input;
    const { eventRequest } = context;

    if (!eventRequest) {
      return {
        agentType: "BEO_RUNOFSHOW",
        decision: "No event request to generate BEO for",
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
Generate a detailed Banquet Event Order and run-of-show timeline. Respond with JSON only:
{
  "decision": string,
  "reasoning": string,
  "confidence": number,
  "escalate": false,
  "metadata": {
    "beoContent": {
      "eventType": string,
      "title": string,
      "date": string,
      "guestCount": number,
      "sections": string[],
      "notes": string
    },
    "runOfShow": { "time": string, "activity": string, "responsible": string }[]
  }
}`,
      },
      {
        role: "user",
        content: JSON.stringify({
          eventType: eventRequest.eventType,
          title: eventRequest.title,
          eventDate: eventRequest.eventDate,
          startTime: eventRequest.startTime,
          endTime: eventRequest.endTime,
          guestCount: eventRequest.guestCount,
          requirements: eventRequest.requirements,
        }),
      },
    ]);

    const parsed = JSON.parse(raw.content) as {
      decision: string;
      reasoning: string;
      confidence: number;
      escalate: boolean;
      metadata: {
        beoContent: Record<string, unknown>;
        runOfShow: { time: string; activity: string; responsible: string }[];
      };
    };

    return {
      agentType: "BEO_RUNOFSHOW",
      ...parsed,
      actions: [
        {
          type: "create_beo",
          payload: {
            eventRequestId: eventRequest.id,
            beoContent: parsed.metadata.beoContent,
            runOfShow: parsed.metadata.runOfShow,
          },
          requiresApproval: true,
          priority: "normal",
        },
      ],
    };
  }
}
