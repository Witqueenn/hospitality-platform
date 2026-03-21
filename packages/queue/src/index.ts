export { redisConnection } from "./connection.js";
export type { ConnectionOptions } from "bullmq";
export { QUEUES } from "./jobs.js";
export type {
  AgentJobData,
  NotificationJobData,
  InsightJobData,
  SLACheckJobData,
} from "./jobs.js";
export { startAgentWorker } from "./workers/agentWorker.js";
export { startNotificationWorker } from "./workers/notificationWorker.js";
export { startSLACheckWorker } from "./workers/slaCheckWorker.js";
export { logger } from "./logger.js";

// Queue factory helpers
import { Queue } from "bullmq";
import { redisConnection } from "./connection.js";
import { QUEUES, type AgentJobData, type NotificationJobData } from "./jobs.js";

export const agentQueue = new Queue<AgentJobData>(QUEUES.AGENT, {
  connection: redisConnection,
});

export const notificationQueue = new Queue<NotificationJobData>(
  QUEUES.NOTIFICATION,
  {
    connection: redisConnection,
  },
);
