import { db } from "@repo/db";
import type { AgentInput, AgentOutput } from "@repo/shared";
import { PIPELINES } from "./pipelines.js";
import { getAgent } from "./registry.js";
import { buildContext, loadHistory, loadPolicies } from "./contextBuilder.js";
import crypto from "crypto";

const CONFIDENCE_THRESHOLD = Number(
  process.env["AGENT_CONFIDENCE_THRESHOLD"] ?? 0.6,
);

async function createSession(
  triggerType: string,
  triggerRef: string,
  tenantId: string,
) {
  return db.orchestrationSession.create({
    data: {
      tenantId,
      triggerType,
      triggerRef,
      status: "active",
    },
  });
}

async function logExecution(
  sessionId: string,
  tenantId: string,
  caseId: string | undefined,
  agentType: string,
  input: AgentInput,
  output: AgentOutput,
  durationMs: number,
) {
  await db.agentExecutionLog.create({
    data: {
      tenantId,
      sessionId,
      caseId,
      agentType: agentType as Parameters<
        typeof db.agentExecutionLog.create
      >[0]["data"]["agentType"],
      triggerEvent: input.triggerEvent,
      inputPayload: input.payload as object,
      outputPayload: output as unknown as object,
      decisionSummary: output.decision,
      reasoning: output.reasoning,
      confidenceScore: output.confidence,
      durationMs,
      escalated: output.escalate,
    },
  });
}

async function createEscalation(
  tenantId: string,
  sessionId: string,
  output: AgentOutput,
  payload: Record<string, unknown>,
) {
  const referenceId = (payload["caseId"] as string | undefined) ?? sessionId;

  await db.approvalRequest.create({
    data: {
      tenantId,
      requestType: "escalation",
      referenceId,
      referenceType: "orchestration_session",
      requestedBy: `agent:${output.agentType.toLowerCase()}`,
      summary: output.escalationReason ?? "Agent escalation triggered",
      details: {
        sessionId,
        agentType: output.agentType,
        confidence: output.confidence,
      },
      status: "pending",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });
}

export async function orchestrate(
  triggerEvent: string,
  payload: Record<string, unknown>,
  tenantId: string,
): Promise<AgentOutput[]> {
  const pipeline = PIPELINES[triggerEvent];
  if (!pipeline?.length) return [];

  const triggerRef =
    (payload["caseId"] as string | undefined) ??
    (payload["bookingId"] as string | undefined) ??
    crypto.randomUUID();

  const session = await createSession(triggerEvent, triggerRef, tenantId);

  const baseContext = await buildContext(tenantId, payload);
  const policies = await loadPolicies(tenantId);
  const history = await loadHistory(baseContext);
  const context = { ...baseContext, sessionId: session.id, policies, history };

  const results: AgentOutput[] = [];

  for (const agentType of pipeline) {
    const agent = getAgent(agentType);
    const input: AgentInput = {
      context,
      triggerEvent,
      payload: { ...payload, previousAgentResults: results },
    };

    const startMs = Date.now();
    const output = await agent.execute(input);
    const durationMs = Date.now() - startMs;

    await logExecution(
      session.id,
      tenantId,
      payload["caseId"] as string | undefined,
      agentType,
      input,
      output,
      durationMs,
    );

    if (output.escalate || output.confidence < CONFIDENCE_THRESHOLD) {
      await createEscalation(tenantId, session.id, output, payload);

      await db.orchestrationSession.update({
        where: { id: session.id },
        data: {
          status: "suspended",
          agentsInvoked: results as unknown as object[],
        },
      });

      return results;
    }

    // Execute non-approval actions
    for (const action of output.actions) {
      if (!action.requiresApproval) {
        await executeAction(action, tenantId, payload);
      }
    }

    results.push(output);
  }

  await db.orchestrationSession.update({
    where: { id: session.id },
    data: {
      status: "completed",
      completedAt: new Date(),
      agentsInvoked: results as unknown as object[],
    },
  });

  return results;
}

async function executeAction(
  action: AgentOutput["actions"][number],
  tenantId: string,
  payload: Record<string, unknown>,
) {
  switch (action.type) {
    case "update_case_status": {
      const { caseId, status } = action.payload as {
        caseId: string;
        status: string;
      };
      if (caseId && status) {
        await db.supportCase.update({
          where: { id: caseId },
          data: {
            status: status as Parameters<
              typeof db.supportCase.update
            >[0]["data"]["status"],
          },
        });
      }
      break;
    }
    case "send_notification": {
      const { recipientId, subject, body, channel } = action.payload as {
        recipientId: string;
        subject: string;
        body: string;
        channel: string;
      };
      if (recipientId) {
        await db.notification.create({
          data: {
            tenantId,
            recipientId,
            type: "IN_APP",
            channel: channel ?? "system",
            subject: subject ?? "Notification",
            body: body ?? "",
          },
        });
      }
      break;
    }
    case "create_insight": {
      const hotelId = action.payload["hotelId"] as string | undefined;
      if (hotelId) {
        await db.hotelInsight.create({
          data: {
            tenantId,
            hotelId,
            insightType:
              (action.payload["insightType"] as string) ?? "operational_alert",
            title: (action.payload["title"] as string) ?? "Agent Insight",
            description: (action.payload["description"] as string) ?? "",
            severity: action.payload["severity"] as string | undefined,
            isActionable: (action.payload["isActionable"] as boolean) ?? false,
            data: (action.payload["data"] as object) ?? {},
          },
        });
      }
      break;
    }
    default:
      // Unknown action type — log and skip
      break;
  }
}
