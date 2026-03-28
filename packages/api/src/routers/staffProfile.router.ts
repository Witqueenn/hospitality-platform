import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

const DEPARTMENTS = [
  "FRONT_DESK",
  "CONCIERGE",
  "HOUSEKEEPING",
  "DINING",
  "ROOM_SERVICE",
  "MANAGEMENT",
  "MAINTENANCE",
  "SPA",
  "SECURITY",
  "OTHER",
] as const;

const MGMT_ROLES = ["HOTEL_ADMIN", "HOTEL_MANAGER"] as const;

function requireMgmt(role: string) {
  if (!(MGMT_ROLES as readonly string[]).includes(role)) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
}

export const staffProfileRouter = router({
  // Public: get a staff profile by slug (only approved public profiles)
  getBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const profile = await ctx.db.staffProfile.findFirst({
        where: { slug: input.slug, isPublic: true, isActive: true },
        include: {
          hotel: { select: { id: true, name: true, slug: true } },
          badges: {
            where: { expiresAt: null },
            orderBy: { awardedAt: "desc" },
          },
          reviews: {
            where: { moderationStatus: "APPROVED" },
            select: {
              id: true,
              rating: true,
              title: true,
              body: true,
              reviewType: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      });
      if (!profile) throw new TRPCError({ code: "NOT_FOUND" });
      return profile;
    }),

  // Hotel: list all staff profiles
  listByHotel: protectedProcedure
    .input(
      z.object({
        hotelId: z.string().uuid(),
        department: z.enum(DEPARTMENTS).optional(),
        isActive: z.boolean().optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.pageSize;
      const where = {
        hotelId: input.hotelId,
        tenantId: ctx.tenantId,
        ...(input.department && { department: input.department }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      };

      const [items, total] = await Promise.all([
        ctx.db.staffProfile.findMany({
          where,
          include: {
            user: { select: { id: true, email: true, role: true } },
            badges: {
              where: { expiresAt: null },
              select: { badgeType: true },
            },
          },
          orderBy: [{ department: "asc" }, { name: "asc" }],
          skip,
          take: input.pageSize,
        }),
        ctx.db.staffProfile.count({ where }),
      ]);

      return { items, total, page: input.page, pageSize: input.pageSize };
    }),

  // Hotel mgmt: create a staff profile
  create: protectedProcedure
    .input(
      z.object({
        hotelId: z.string().uuid(),
        userId: z.string().uuid().optional(),
        name: z.string().min(1),
        role: z.string().min(1),
        department: z.enum(DEPARTMENTS),
        languages: z.array(z.string()).default([]),
        yearsExperience: z.number().int().optional(),
        bio: z.string().optional(),
        isPublic: z.boolean().default(false),
        tipEnabled: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      requireMgmt(ctx.session.role);

      const slug = `${input.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;

      return ctx.db.staffProfile.create({
        data: {
          tenantId: ctx.tenantId!,
          hotelId: input.hotelId,
          userId: input.userId,
          slug,
          name: input.name,
          role: input.role,
          department: input.department,
          languages: input.languages,
          yearsExperience: input.yearsExperience,
          bio: input.bio,
          isPublic: input.isPublic,
          tipEnabled: input.tipEnabled,
        },
      });
    }),

  // Hotel mgmt: update profile
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        role: z.string().min(1).optional(),
        department: z.enum(DEPARTMENTS).optional(),
        languages: z.array(z.string()).optional(),
        yearsExperience: z.number().int().optional(),
        bio: z.string().optional(),
        isPublic: z.boolean().optional(),
        tipEnabled: z.boolean().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      requireMgmt(ctx.session.role);
      const { id, ...data } = input;
      return ctx.db.staffProfile.update({ where: { id }, data });
    }),

  // Internal: recalculate avg rating (called after review approval)
  recalculateRating: protectedProcedure
    .input(z.object({ staffProfileId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const reviews = await ctx.db.staffGuestReview.findMany({
        where: {
          staffProfileId: input.staffProfileId,
          moderationStatus: "APPROVED",
        },
        select: { rating: true },
      });

      const count = reviews.length;
      const avg =
        count > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / count : null;

      return ctx.db.staffProfile.update({
        where: { id: input.staffProfileId },
        data: {
          reviewCount: count,
          avgRating: avg !== null ? avg : undefined,
        },
      });
    }),
});
