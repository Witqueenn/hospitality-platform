import { Worker } from "bullmq";
import type { Prisma } from "@prisma/client";
import { db } from "@repo/db";
import { redisConnection } from "../connection.js";
import { QUEUES, type NotificationJobData } from "../jobs.js";

export function startNotificationWorker() {
  const worker = new Worker<NotificationJobData>(
    QUEUES.NOTIFICATION,
    async (job) => {
      const { tenantId, recipientId, type, channel, subject, body, metadata } =
        job.data;

      const notification = await db.notification.create({
        data: {
          tenantId,
          recipientId,
          type,
          channel,
          subject,
          body,
          metadata: (metadata ?? {}) as Prisma.InputJsonValue,
          status: "SENT",
          sentAt: new Date(),
        },
      });

      console.log(
        `[NotificationWorker] Sent notification ${notification.id} to ${recipientId}`,
      );
      return { notificationId: notification.id };
    },
    {
      connection: redisConnection,
      concurrency: 10,
    },
  );

  worker.on("failed", (job, err) => {
    console.error(`[NotificationWorker] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}
