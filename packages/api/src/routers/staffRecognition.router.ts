import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "../trpc.js";

const BADGE_TYPES = [
  "GUEST_FAVORITE",
  "TOP_CONCIERGE",
  "FRONT_DESK_STAR",
  "HOUSEKEEPING_APPRECIATED",
  "SERVICE_EXCELLENCE",
  "FAST_RESPONDER",
] as const;

const MGMT_ROLES = ["HOTEL_ADMIN", "HOTEL_MANAGER"] as const;

function requireMgmt(role: string) {
  if (!(MGMT_ROLES as readonly string[]).includes(role)) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
}

export const staffRecognitionRouter = router({
  // Hotel mgmt: award a badge to a staff member
  awardBadge: protectedProcedure
    .input(
      z.object({
        staffProfileId: z.string().uuid(),
        badgeType: z.enum(BADGE_TYPES),
        expiresAt: z.string().datetime().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      requireMgmt(ctx.session.role);

      const badge = await ctx.db.staffBadge.create({
        data: {
          tenantId: ctx.tenantId!,
          staffProfileId: input.staffProfileId,
          badgeType: input.badgeType,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
        },
      });

      // Log the recognition event
      await ctx.db.staffRecognitionLog.create({
        data: {
          tenantId: ctx.tenantId!,
          staffProfileId: input.staffProfileId,
          period: new Date().toISOString().slice(0, 7), // YYYY-MM
          metric: `badge_${input.badgeType}`,
          value: 1,
          note: `Badge awarded: ${input.badgeType}`,
        },
      });

      return badge;
    }),

  // Hotel: list badges for a staff member
  listBadges: protectedProcedure
    .input(z.object({ staffProfileId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.staffBadge.findMany({
        where: {
          staffProfileId: input.staffProfileId,
          tenantId: ctx.tenantId,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        orderBy: { awardedAt: "desc" },
      });
    }),

  // Hotel: revoke a badge
  revokeBadge: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      requireMgmt(ctx.session.role);
      return ctx.db.staffBadge.delete({ where: { id: input.id } });
    }),

  // Hotel: get gratitude wall entries
  gratitudeWall: protectedProcedure
    .input(
      z.object({
        hotelId: z.string().uuid(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.pageSize;
      const where = {
        hotelId: input.hotelId,
        tenantId: ctx.tenantId,
        isActive: true,
      };

      const [items, total] = await Promise.all([
        ctx.db.gratitudeWallEntry.findMany({
          where,
          include: {
            staffProfile: {
              select: {
                id: true,
                name: true,
                slug: true,
                department: true,
                avgRating: true,
              },
            },
            review: {
              select: {
                rating: true,
                title: true,
                body: true,
                reviewType: true,
              },
            },
          },
          orderBy: { featuredAt: "desc" },
          skip,
          take: input.pageSize,
        }),
        ctx.db.gratitudeWallEntry.count({ where }),
      ]);

      return { items, total, page: input.page, pageSize: input.pageSize };
    }),

  // Hotel mgmt: add/remove from gratitude wall
  toggleGratitudeWall: protectedProcedure
    .input(
      z.object({
        reviewId: z.string().uuid(),
        hotelId: z.string().uuid(),
        staffProfileId: z.string().uuid(),
        active: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      requireMgmt(ctx.session.role);

      if (!input.active) {
        return ctx.db.gratitudeWallEntry.updateMany({
          where: { reviewId: input.reviewId, tenantId: ctx.tenantId },
          data: { isActive: false },
        });
      }

      return ctx.db.gratitudeWallEntry.upsert({
        where: { reviewId: input.reviewId },
        create: {
          tenantId: ctx.tenantId!,
          hotelId: input.hotelId,
          staffProfileId: input.staffProfileId,
          reviewId: input.reviewId,
          isActive: true,
        },
        update: { isActive: true, featuredAt: new Date() },
      });
    }),

  // Hotel: recognition log for a staff member
  recognitionLog: protectedProcedure
    .input(
      z.object({
        staffProfileId: z.string().uuid(),
        period: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.staffRecognitionLog.findMany({
        where: {
          staffProfileId: input.staffProfileId,
          tenantId: ctx.tenantId,
          ...(input.period && { period: input.period }),
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    }),
});
