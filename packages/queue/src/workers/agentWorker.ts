import { Worker } from "bullmq";
import { orchestrate } from "@repo/agents";
import { redisConnection } from "../connection.js";
import { QUEUES, type AgentJobData } from "../jobs.js";

export function startAgentWorker() {
  const worker = new Worker<AgentJobData>(
    QUEUES.AGENT,
    async (job) => {
      const { triggerEvent, payload, tenantId } = job.data;
      console.log(
        `[AgentWorker] Processing: ${triggerEvent} for tenant ${tenantId}`,
      );

      const results = await orchestrate(triggerEvent, payload, tenantId);

      console.log(
        `[AgentWorker] Completed: ${results.length} agent(s) executed`,
      );
      return results;
    },
    {
      connection: redisConnection,
      concurrency: 5,
    },
  );

  worker.on("failed", (job, err) => {
    console.error(`[AgentWorker] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}
