import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const reviewRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        hotelId: z.string().uuid(),
        bookingId: z.string().uuid().optional(),
        overallScore: z.number().int().min(1).max(10),
        scores: z.record(z.number().int().min(1).max(10)).default({}),
        title: z.string().max(200).optional(),
        text: z.string().max(5000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.review.create({
        data: {
          tenantId: ctx.tenantId!,
          hotelId: input.hotelId,
          guestId: ctx.session.userId,
          bookingId: input.bookingId,
          overallScore: input.overallScore,
          scores: input.scores,
          title: input.title,
          text: input.text,
          moderationStatus: "PENDING",
        },
      });
    }),

  list: protectedProcedure
    .input(
      z.object({
        hotelId: z.string().uuid(),
        moderationStatus: z
          .enum(["PENDING", "APPROVED", "FLAGGED", "REJECTED"])
          .optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.pageSize;

      const where = {
        hotelId: input.hotelId,
        tenantId: ctx.tenantId,
        ...(input.moderationStatus && {
          moderationStatus: input.moderationStatus,
        }),
      };

      const [items, total] = await Promise.all([
        ctx.db.review.findMany({
          where,
          include: {
            guest: { select: { id: true, name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: input.pageSize,
        }),
        ctx.db.review.count({ where }),
      ]);

      return { items, total, page: input.page, pageSize: input.pageSize };
    }),

  moderate: protectedProcedure
    .input(
      z.object({
        reviewId: z.string().uuid(),
        status: z.enum(["APPROVED", "FLAGGED", "REJECTED"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const staffRoles = [
        "PLATFORM_OPS",
        "SUPER_ADMIN",
        "HOTEL_ADMIN",
      ] as const;
      if (
        !staffRoles.includes(ctx.session.role as (typeof staffRoles)[number])
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return ctx.db.review.update({
        where: { id: input.reviewId },
        data: { moderationStatus: input.status },
      });
    }),

  respond: protectedProcedure
    .input(
      z.object({
        reviewId: z.string().uuid(),
        response: z.string().min(10).max(2000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.review.update({
        where: { id: input.reviewId },
        data: { hotelResponse: input.response, respondedAt: new Date() },
      });
    }),

  stats: protectedProcedure
    .input(z.object({ hotelId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const reviews = await ctx.db.review.findMany({
        where: {
          hotelId: input.hotelId,
          tenantId: ctx.tenantId,
          moderationStatus: "APPROVED",
        },
        select: { overallScore: true, scores: true },
      });

      if (reviews.length === 0) return { avg: 0, count: 0, distribution: {} };

      const avg =
        reviews.reduce((sum, r) => sum + r.overallScore, 0) / reviews.length;
      const distribution: Record<number, number> = {};
      for (let i = 1; i <= 10; i++) distribution[i] = 0;
      reviews.forEach((r) => {
        distribution[r.overallScore] = (distribution[r.overallScore] ?? 0) + 1;
      });

      return {
        avg: Math.round(avg * 10) / 10,
        count: reviews.length,
        distribution,
      };
    }),
});
