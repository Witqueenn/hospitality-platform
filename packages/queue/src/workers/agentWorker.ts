import { Worker } from "bullmq";
import { orchestrate } from "@repo/agents";
import { redisConnection } from "../connection.js";
import { QUEUES, type AgentJobData } from "../jobs.js";
import { logger } from "../logger.js";

export function startAgentWorker() {
  const worker = new Worker<AgentJobData>(
    QUEUES.AGENT,
    async (job) => {
      const { triggerEvent, payload, tenantId } = job.data;
      logger.info("AgentWorker", "Processing job", { triggerEvent, tenantId });

      const results = await orchestrate(triggerEvent, payload, tenantId);

      logger.info("AgentWorker", "Job completed", {
        agentsExecuted: results.length,
      });
      return results;
    },
    {
      connection: redisConnection,
      concurrency: 5,
    },
  );

  worker.on("failed", (job, err) => {
    logger.error("AgentWorker", "Job failed", {
      jobId: job?.id,
      error: err.message,
    });
  });

  return worker;
}
