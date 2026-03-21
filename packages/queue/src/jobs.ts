// ─────────────────────────────────────────────
// Job Type Definitions
// ─────────────────────────────────────────────

export interface AgentJobData {
  triggerEvent: string;
  payload: Record<string, unknown>;
  tenantId: string;
}

export interface NotificationJobData {
  tenantId: string;
  recipientId: string;
  type: "EMAIL" | "SMS" | "PUSH" | "IN_APP";
  channel: string;
  subject: string;
  body: string;
  metadata?: Record<string, unknown>;
}

export interface InsightJobData {
  tenantId: string;
  hotelId: string;
  triggerType: "case_resolved" | "review_submitted" | "checkout_completed";
  referenceId: string;
}

export interface SLACheckJobData {
  tenantId: string;
  caseId: string;
}

export const QUEUES = {
  AGENT: "agent-execution",
  NOTIFICATION: "notifications",
  INSIGHT: "insights",
  SLA_CHECK: "sla-checks",
} as const;
