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

const EMPLOYMENT_TYPES = [
  "FULL_TIME",
  "PART_TIME",
  "SEASONAL",
  "INTERNSHIP",
  "TRAINEE",
  "TEMPORARY",
] as const;

const EXPERIENCE_LEVELS = [
  "ENTRY",
  "JUNIOR",
  "MID",
  "SENIOR",
  "MANAGEMENT",
] as const;
const POSTING_STATUSES = ["DRAFT", "PUBLISHED", "CLOSED", "FILLED"] as const;

const MGMT_ROLES = [
  "HOTEL_ADMIN",
  "HOTEL_MANAGER",
  "SUPER_ADMIN",
  "PLATFORM_OPS",
] as const;

function requireMgmt(role: string) {
  if (!(MGMT_ROLES as readonly string[]).includes(role)) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
}

function generateSlug(title: string): string {
  const clean = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `${clean}-${Date.now()}`;
}

export const jobPostingRouter = router({
  // Public: browse job postings
  search: protectedProcedure
    .input(
      z.object({
        city: z.string().optional(),
        country: z.string().optional(),
        department: z.enum(DEPARTMENTS).optional(),
        employmentType: z.enum(EMPLOYMENT_TYPES).optional(),
        experienceLevel: z.enum(EXPERIENCE_LEVELS).optional(),
        accommodationIncluded: z.boolean().optional(),
        visaSupport: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
        query: z.string().optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.pageSize;
      const where = {
        tenantId: ctx.tenantId,
        status: "PUBLISHED" as const,
        ...(input.city && {
          city: { contains: input.city, mode: "insensitive" as const },
        }),
        ...(input.country && { country: input.country }),
        ...(input.department && { department: input.department }),
        ...(input.employmentType && { employmentType: input.employmentType }),
        ...(input.experienceLevel && {
          experienceLevel: input.experienceLevel,
        }),
        ...(input.accommodationIncluded !== undefined && {
          accommodationIncluded: input.accommodationIncluded,
        }),
        ...(input.visaSupport !== undefined && {
          visaSupport: input.visaSupport,
        }),
        ...(input.isFeatured !== undefined && { isFeatured: input.isFeatured }),
        ...(input.query && {
          OR: [
            { title: { contains: input.query, mode: "insensitive" as const } },
            {
              description: {
                contains: input.query,
                mode: "insensitive" as const,
              },
            },
          ],
        }),
      };

      const [items, total] = await Promise.all([
        ctx.db.jobPosting.findMany({
          where,
          include: {
            hotel: { select: { id: true, name: true, slug: true } },
            tags: { select: { tag: true } },
            benefits: { select: { label: true } },
            _count: { select: { applications: true } },
          },
          orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
          skip,
          take: input.pageSize,
        }),
        ctx.db.jobPosting.count({ where }),
      ]);

      return { items, total, page: input.page, pageSize: input.pageSize };
    }),

  // Public: get a single job posting
  getBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const posting = await ctx.db.jobPosting.findFirst({
        where: {
          slug: input.slug,
          status: "PUBLISHED",
          tenantId: ctx.tenantId,
        },
        include: {
          hotel: {
            select: { id: true, name: true, slug: true, starRating: true },
          },
          tags: { select: { tag: true } },
          requirements: { select: { label: true, isRequired: true } },
          benefits: { select: { label: true } },
        },
      });
      if (!posting) throw new TRPCError({ code: "NOT_FOUND" });
      return posting;
    }),

  // Hotel: get own posting (any status)
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      requireMgmt(ctx.session.role);
      const posting = await ctx.db.jobPosting.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
        include: {
          tags: true,
          requirements: true,
          benefits: true,
          _count: { select: { applications: true } },
        },
      });
      if (!posting) throw new TRPCError({ code: "NOT_FOUND" });
      return posting;
    }),

  // Hotel: list own postings
  listByHotel: protectedProcedure
    .input(
      z.object({
        hotelId: z.string().uuid(),
        status: z.enum(POSTING_STATUSES).optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      requireMgmt(ctx.session.role);
      const skip = (input.page - 1) * input.pageSize;
      const where = {
        hotelId: input.hotelId,
        tenantId: ctx.tenantId,
        ...(input.status && { status: input.status }),
      };

      const [items, total] = await Promise.all([
        ctx.db.jobPosting.findMany({
          where,
          include: {
            _count: { select: { applications: true } },
            tags: { select: { tag: true } },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: input.pageSize,
        }),
        ctx.db.jobPosting.count({ where }),
      ]);

      return { items, total, page: input.page, pageSize: input.pageSize };
    }),

  // Hotel: create a job posting
  create: protectedProcedure
    .input(
      z.object({
        hotelId: z.string().uuid(),
        title: z.string().min(1),
        department: z.enum(DEPARTMENTS),
        employmentType: z.enum(EMPLOYMENT_TYPES),
        city: z.string().min(1),
        country: z.string().min(1),
        description: z.string().min(1),
        salaryMinCents: z.number().int().optional(),
        salaryMaxCents: z.number().int().optional(),
        currency: z.string().length(3).default("USD"),
        languages: z.array(z.string()).default([]),
        experienceLevel: z.enum(EXPERIENCE_LEVELS).default("ENTRY"),
        accommodationIncluded: z.boolean().default(false),
        mealsIncluded: z.boolean().default(false),
        visaSupport: z.boolean().default(false),
        deadline: z.string().datetime().optional(),
        tags: z.array(z.string()).default([]),
        requirements: z
          .array(
            z.object({
              label: z.string(),
              isRequired: z.boolean().default(true),
            }),
          )
          .default([]),
        benefits: z.array(z.string()).default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      requireMgmt(ctx.session.role);

      const { tags, requirements, benefits, ...postingData } = input;

      return ctx.db.jobPosting.create({
        data: {
          tenantId: ctx.tenantId!,
          ...postingData,
          slug: generateSlug(input.title),
          deadline: input.deadline ? new Date(input.deadline) : undefined,
          status: "DRAFT",
          tags: { create: tags.map((tag) => ({ tag })) },
          requirements: { create: requirements },
          benefits: { create: benefits.map((label) => ({ label })) },
        },
        include: { tags: true, requirements: true, benefits: true },
      });
    }),

  // Hotel: update posting
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(1).optional(),
        department: z.enum(DEPARTMENTS).optional(),
        employmentType: z.enum(EMPLOYMENT_TYPES).optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        description: z.string().optional(),
        salaryMinCents: z.number().int().optional(),
        salaryMaxCents: z.number().int().optional(),
        accommodationIncluded: z.boolean().optional(),
        mealsIncluded: z.boolean().optional(),
        visaSupport: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
        deadline: z.string().datetime().optional(),
        status: z.enum(POSTING_STATUSES).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      requireMgmt(ctx.session.role);
      const { id, deadline, ...rest } = input;
      return ctx.db.jobPosting.update({
        where: { id },
        data: {
          ...rest,
          ...(deadline && { deadline: new Date(deadline) }),
        },
      });
    }),

  // Hotel: publish posting
  publish: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      requireMgmt(ctx.session.role);
      return ctx.db.jobPosting.update({
        where: { id: input.id },
        data: { status: "PUBLISHED" },
      });
    }),

  // Hotel: close/fill posting
  close: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        reason: z.enum(["CLOSED", "FILLED"]).default("CLOSED"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      requireMgmt(ctx.session.role);
      return ctx.db.jobPosting.update({
        where: { id: input.id },
        data: { status: input.reason },
      });
    }),
});
