import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "../trpc.js";

const REVIEW_TYPES = [
  "FRONT_DESK",
  "CONCIERGE",
  "HOUSEKEEPING",
  "DINING",
  "ROOM_SERVICE",
  "MANAGEMENT",
] as const;

const MGMT_ROLES = [
  "HOTEL_ADMIN",
  "HOTEL_MANAGER",
  "GUEST_RELATIONS",
  "SUPER_ADMIN",
  "PLATFORM_OPS",
] as const;

function canModerate(role: string) {
  return (MGMT_ROLES as readonly string[]).includes(role);
}

export const staffReviewRouter = router({
  // Guest: submit a review for a staff member
  create: protectedProcedure
    .input(
      z.object({
        staffProfileId: z.string().uuid(),
        bookingId: z.string().uuid().optional(),
        reviewType: z.enum(REVIEW_TYPES),
        rating: z.number().int().min(1).max(5),
        title: z.string().optional(),
        body: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.role !== "GUEST") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only guests can submit staff reviews.",
        });
      }

      // Prevent duplicate review for same staff + booking
      if (input.bookingId) {
        const existing = await ctx.db.staffGuestReview.findFirst({
          where: {
            staffProfileId: input.staffProfileId,
            guestId: ctx.session.userId,
            bookingId: input.bookingId,
          },
        });
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message:
              "You have already reviewed this staff member for this booking.",
          });
        }
      }

      return ctx.db.staffGuestReview.create({
        data: {
          tenantId: ctx.tenantId!,
          staffProfileId: input.staffProfileId,
          guestId: ctx.session.userId,
          bookingId: input.bookingId,
          reviewType: input.reviewType,
          rating: input.rating,
          title: input.title,
          body: input.body,
          moderationStatus: "PENDING",
        },
      });
    }),

  // Public / hotel: list reviews for a staff profile
  listForStaff: protectedProcedure
    .input(
      z.object({
        staffProfileId: z.string().uuid(),
        moderationStatus: z
          .enum(["PENDING", "APPROVED", "REJECTED", "FLAGGED"])
          .optional()
          .default("APPROVED"),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Non-moderators can only see approved reviews
      const status = !canModerate(ctx.session.role)
        ? "APPROVED"
        : input.moderationStatus;

      const skip = (input.page - 1) * input.pageSize;
      const where = {
        staffProfileId: input.staffProfileId,
        tenantId: ctx.tenantId,
        moderationStatus: status,
      };

      const [items, total] = await Promise.all([
        ctx.db.staffGuestReview.findMany({
          where,
          select: {
            id: true,
            rating: true,
            title: true,
            body: true,
            reviewType: true,
            moderationStatus: true,
            createdAt: true,
            // Don't expose guestId publicly
            ...(canModerate(ctx.session.role) && { guestId: true }),
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: input.pageSize,
        }),
        ctx.db.staffGuestReview.count({ where }),
      ]);

      return { items, total, page: input.page, pageSize: input.pageSize };
    }),

  // Hotel/admin: moderate a review
  moderate: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(["APPROVED", "REJECTED", "FLAGGED"]),
        addToGratitudeWall: z.boolean().default(false),
        hotelId: z.string().uuid().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!canModerate(ctx.session.role))
        throw new TRPCError({ code: "FORBIDDEN" });

      const review = await ctx.db.staffGuestReview.update({
        where: { id: input.id },
        data: {
          moderationStatus: input.status,
          moderatedBy: ctx.session.userId,
          moderatedAt: new Date(),
          ...(input.status === "APPROVED" &&
            input.addToGratitudeWall && {
              isGratitudeWall: true,
            }),
        },
        include: { staffProfile: { select: { id: true, hotelId: true } } },
      });

      // Recalculate rating after moderation
      if (input.status === "APPROVED" || input.status === "REJECTED") {
        const reviews = await ctx.db.staffGuestReview.findMany({
          where: {
            staffProfileId: review.staffProfileId,
            moderationStatus: "APPROVED",
          },
          select: { rating: true },
        });
        const count = reviews.length;
        const avg =
          count > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / count : null;
        await ctx.db.staffProfile.update({
          where: { id: review.staffProfileId },
          data: { reviewCount: count, ...(avg !== null && { avgRating: avg }) },
        });
      }

      // Create gratitude wall entry if needed
      if (
        input.status === "APPROVED" &&
        input.addToGratitudeWall &&
        input.hotelId
      ) {
        await ctx.db.gratitudeWallEntry.upsert({
          where: { reviewId: input.id },
          create: {
            tenantId: ctx.tenantId!,
            hotelId: input.hotelId,
            staffProfileId: review.staffProfileId,
            reviewId: input.id,
            isActive: true,
          },
          update: { isActive: true },
        });
      }

      return review;
    }),

  // Hotel/admin: list reviews by hotel with optional status filter
  listByHotel: protectedProcedure
    .input(
      z.object({
        hotelId: z.string().uuid(),
        moderationStatus: z
          .enum(["PENDING", "APPROVED", "REJECTED", "FLAGGED"])
          .optional()
          .default("PENDING"),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!canModerate(ctx.session.role))
        throw new TRPCError({ code: "FORBIDDEN" });

      const skip = (input.page - 1) * input.pageSize;
      const where = {
        tenantId: ctx.tenantId,
        moderationStatus: input.moderationStatus,
        staffProfile: { hotelId: input.hotelId },
      };

      const [items, total] = await Promise.all([
        ctx.db.staffGuestReview.findMany({
          where,
          include: {
            staffProfile: {
              select: { id: true, name: true, department: true },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: input.pageSize,
        }),
        ctx.db.staffGuestReview.count({ where }),
      ]);

      return { items, total, page: input.page, pageSize: input.pageSize };
    }),

  // Hotel/admin: list pending reviews for moderation
  pendingModeration: protectedProcedure
    .input(
      z.object({
        hotelId: z.string().uuid().optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!canModerate(ctx.session.role))
        throw new TRPCError({ code: "FORBIDDEN" });

      const skip = (input.page - 1) * input.pageSize;
      const where = {
        tenantId: ctx.tenantId,
        moderationStatus: "PENDING" as const,
        ...(input.hotelId && {
          staffProfile: { hotelId: input.hotelId },
        }),
      };

      const [items, total] = await Promise.all([
        ctx.db.staffGuestReview.findMany({
          where,
          include: {
            staffProfile: {
              select: { id: true, name: true, department: true },
            },
          },
          orderBy: { createdAt: "asc" },
          skip,
          take: input.pageSize,
        }),
        ctx.db.staffGuestReview.count({ where }),
      ]);

      return { items, total, page: input.page, pageSize: input.pageSize };
    }),
});
