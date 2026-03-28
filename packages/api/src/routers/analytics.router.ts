import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const analyticsRouter = router({
  hotelDashboard: protectedProcedure
    .input(z.object({ hotelId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      const [
        occupancyToday,
        revenueMonth,
        openCases,
        criticalCases,
        upcomingEvents,
        recentInsights,
      ] = await Promise.all([
        // Occupancy
        ctx.db.booking.count({
          where: {
            hotelId: input.hotelId,
            tenantId: ctx.tenantId,
            status: "CHECKED_IN",
          },
        }),
        // Revenue MTD
        ctx.db.booking.aggregate({
          where: {
            hotelId: input.hotelId,
            tenantId: ctx.tenantId,
            status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] },
            createdAt: { gte: monthStart },
          },
          _sum: { totalCents: true },
        }),
        // Open cases
        ctx.db.supportCase.count({
          where: {
            hotelId: input.hotelId,
            tenantId: ctx.tenantId,
            status: {
              in: [
                "OPEN",
                "IN_PROGRESS",
                "AWAITING_HOTEL",
                "AWAITING_APPROVAL",
              ],
            },
          },
        }),
        // Critical cases
        ctx.db.supportCase.count({
          where: {
            hotelId: input.hotelId,
            tenantId: ctx.tenantId,
            severity: "CRITICAL",
            status: { in: ["OPEN", "IN_PROGRESS"] },
          },
        }),
        // Upcoming events (next 14 days)
        ctx.db.eventRequest.findMany({
          where: {
            hotelId: input.hotelId,
            tenantId: ctx.tenantId,
            status: "CONFIRMED",
            eventDate: {
              gte: today,
              lte: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
            },
          },
          include: { beo: { select: { id: true, status: true } } },
          orderBy: { eventDate: "asc" },
          take: 10,
        }),
        // Recent insights
        ctx.db.hotelInsight.findMany({
          where: {
            hotelId: input.hotelId,
            tenantId: ctx.tenantId,
            acknowledgedAt: null,
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
      ]);

      return {
        occupancyToday,
        revenueMtdCents: revenueMonth._sum.totalCents ?? 0,
        openCases,
        criticalCases,
        upcomingEvents,
        recentInsights,
      };
    }),

  caseMetrics: protectedProcedure
    .input(
      z.object({
        hotelId: z.string().uuid(),
        from: z.string().date(),
        to: z.string().date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const from = new Date(input.from);
      const to = new Date(input.to);

      const cases = await ctx.db.supportCase.findMany({
        where: {
          hotelId: input.hotelId,
          tenantId: ctx.tenantId,
          createdAt: { gte: from, lte: to },
        },
        select: {
          id: true,
          category: true,
          severity: true,
          status: true,
          createdAt: true,
          resolvedAt: true,
        },
      });

      const byCategory: Record<string, number> = {};
      const bySeverity: Record<string, number> = {};

      cases.forEach((c) => {
        byCategory[c.category] = (byCategory[c.category] ?? 0) + 1;
        bySeverity[c.severity] = (bySeverity[c.severity] ?? 0) + 1;
      });

      const resolved = cases.filter((c) => c.resolvedAt);
      const avgResolutionMs =
        resolved.length > 0
          ? resolved.reduce(
              (sum, c) =>
                sum + (c.resolvedAt!.getTime() - c.createdAt.getTime()),
              0,
            ) / resolved.length
          : 0;

      return {
        total: cases.length,
        byCategory,
        bySeverity,
        avgResolutionHours: Math.round(avgResolutionMs / 3600000),
      };
    }),

  occupancyTrend: protectedProcedure
    .input(
      z.object({
        hotelId: z.string().uuid(),
        days: z.number().int().min(7).max(90).default(14),
      }),
    )
    .query(async ({ ctx, input }) => {
      const data = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = input.days - 1; i >= 0; i--) {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

        const count = await ctx.db.booking.count({
          where: {
            hotelId: input.hotelId,
            tenantId: ctx.tenantId,
            status: { in: ["CHECKED_IN", "CHECKED_OUT"] },
            checkIn: { lte: date },
            checkOut: { gte: nextDate },
          },
        });

        data.push({ date: date.toISOString().split("T")[0], bookings: count });
      }

      return data;
    }),
});
