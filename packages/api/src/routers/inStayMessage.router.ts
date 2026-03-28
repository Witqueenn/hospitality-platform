import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "../trpc.js";

export const inStayMessageRouter = router({
  // Hotel: send a message to a guest's stay
  send: protectedProcedure
    .input(
      z.object({
        stayId: z.string().uuid(),
        guestId: z.string().uuid(),
        hotelId: z.string().uuid(),
        category: z.enum([
          "WELCOME",
          "WIFI",
          "EVENT",
          "DINING",
          "UPSELL",
          "ALERT",
          "SERVICE_UPDATE",
          "CHECKOUT_REMINDER",
        ]),
        subject: z.string().optional(),
        body: z.string().min(1),
        channel: z.string().optional(),
        metadata: z.record(z.unknown()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const message = await ctx.db.inStayMessage.create({
        data: {
          tenantId: ctx.tenantId!,
          stayId: input.stayId,
          guestId: input.guestId,
          hotelId: input.hotelId,
          category: input.category,
          subject: input.subject,
          body: input.body,
          channel: input.channel,
          sentAt: new Date(),
          metadata: (input.metadata ?? {}) as object,
        },
      });

      // Mark the stay delivery flag if this is a categorized auto-message
      if (input.category === "WELCOME") {
        await ctx.db.guestStaySession.update({
          where: { id: input.stayId },
          data: { welcomeSentAt: new Date() },
        });
      } else if (input.category === "WIFI") {
        await ctx.db.guestStaySession.update({
          where: { id: input.stayId },
          data: { wifiSentAt: new Date() },
        });
      }

      return message;
    }),

  // Guest: mark a message as read
  markRead: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const msg = await ctx.db.inStayMessage.findFirst({
        where: { id: input.id, guestId: ctx.session.userId },
      });
      if (!msg) throw new TRPCError({ code: "NOT_FOUND" });

      return ctx.db.inStayMessage.update({
        where: { id: input.id },
        data: { readAt: new Date() },
      });
    }),

  // Guest: list messages for their active stay
  listForStay: protectedProcedure
    .input(
      z.object({
        stayId: z.string().uuid(),
        category: z
          .enum([
            "WELCOME",
            "WIFI",
            "EVENT",
            "DINING",
            "UPSELL",
            "ALERT",
            "SERVICE_UPDATE",
            "CHECKOUT_REMINDER",
          ])
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where = {
        stayId: input.stayId,
        tenantId: ctx.tenantId,
        ...(ctx.session.role === "GUEST" && { guestId: ctx.session.userId }),
        ...(input.category && { category: input.category }),
      };

      return ctx.db.inStayMessage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    }),

  // Hotel: list outbound messages for a stay
  listByHotel: protectedProcedure
    .input(
      z.object({
        hotelId: z.string().uuid(),
        stayId: z.string().uuid().optional(),
        category: z
          .enum([
            "WELCOME",
            "WIFI",
            "EVENT",
            "DINING",
            "UPSELL",
            "ALERT",
            "SERVICE_UPDATE",
            "CHECKOUT_REMINDER",
          ])
          .optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.pageSize;
      const where = {
        hotelId: input.hotelId,
        tenantId: ctx.tenantId,
        ...(input.stayId && { stayId: input.stayId }),
        ...(input.category && { category: input.category }),
      };

      const [items, total] = await Promise.all([
        ctx.db.inStayMessage.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: input.pageSize,
        }),
        ctx.db.inStayMessage.count({ where }),
      ]);

      return { items, total, page: input.page, pageSize: input.pageSize };
    }),
});
