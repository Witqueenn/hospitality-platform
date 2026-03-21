import { Worker } from "bullmq";
import { db } from "@repo/db";
import { redisConnection } from "../connection.js";
import { QUEUES, type SLACheckJobData } from "../jobs.js";
import { logger } from "../logger.js";

export function startSLACheckWorker() {
  const worker = new Worker<SLACheckJobData>(
    QUEUES.SLA_CHECK,
    async (job) => {
      const { caseId, tenantId } = job.data;

      const supportCase = await db.supportCase.findUnique({
        where: { id: caseId },
      });
      if (!supportCase) return;

      const now = new Date();

      // Check response deadline breach
      if (
        supportCase.responseDeadline &&
        now > supportCase.responseDeadline &&
        supportCase.status === "OPEN"
      ) {
        // Escalate the case
        await db.supportCase.update({
          where: { id: caseId },
          data: { status: "ESCALATED" },
        });

        await db.caseTimeline.create({
          data: {
            caseId,
            tenantId,
            actorType: "system",
            actorName: "SLA Monitor",
            eventType: "status_change",
            content: "Case escalated: response SLA breached",
            metadata: { responseDeadline: supportCase.responseDeadline },
          },
        });

        logger.info("SLACheckWorker", "Case escalated - SLA breached", {
          caseId,
        });
      }
    },
    {
      connection: redisConnection,
      concurrency: 5,
    },
  );

  worker.on("failed", (job, err) => {
    logger.error("SLACheckWorker", "Job failed", {
      jobId: job?.id,
      error: err.message,
    });
  });

  return worker;
}
