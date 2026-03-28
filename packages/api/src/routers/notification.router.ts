import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const notificationRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        unreadOnly: z.boolean().default(false),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.pageSize;

      const where = {
        tenantId: ctx.tenantId,
        recipientId: ctx.session.userId,
        ...(input.unreadOnly && { readAt: null }),
      };

      const [items, total] = await Promise.all([
        ctx.db.notification.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: input.pageSize,
        }),
        ctx.db.notification.count({ where }),
      ]);

      return { items, total, page: input.page, pageSize: input.pageSize };
    }),

  markRead: protectedProcedure
    .input(z.object({ ids: z.array(z.string().uuid()) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.notification.updateMany({
        where: {
          id: { in: input.ids },
          recipientId: ctx.session.userId,
          tenantId: ctx.tenantId,
        },
        data: { readAt: new Date() },
      });
      return { ok: true };
    }),

  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.notification.updateMany({
      where: {
        recipientId: ctx.session.userId,
        tenantId: ctx.tenantId,
        readAt: null,
      },
      data: { readAt: new Date() },
    });
    return { ok: true };
  }),

  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await ctx.db.notification.count({
      where: {
        recipientId: ctx.session.userId,
        tenantId: ctx.tenantId,
        readAt: null,
      },
    });
    return { count };
  }),
});
