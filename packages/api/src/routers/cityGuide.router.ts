import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc.js";

const EXPERIENCE_CATEGORIES = [
  "FREE_WALK",
  "CITY_INTRO",
  "FOOD_TOUR",
  "NIGHT_TOUR",
  "BUSINESS_HELPER",
  "CULTURAL",
  "SHOPPING",
  "FAMILY",
  "OTHER",
] as const;

const GUIDE_PERSONAS = [
  "SOLO",
  "FAMILY",
  "BUSINESS",
  "LUXURY",
  "BUDGET",
  "FIRST_TIME_VISITOR",
] as const;

export const cityGuideRouter = router({
  // ── Public ──────────────────────────────────────────────────────
  listGuides: publicProcedure
    .input(
      z.object({
        cityCode: z.string().optional(),
        countryCode: z.string().optional(),
        languageCode: z.string().default("en"),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.cityGuide.findMany({
        where: {
          isActive: true,
          ...(input.cityCode ? { cityCode: input.cityCode } : {}),
          ...(input.countryCode ? { countryCode: input.countryCode } : {}),
          languageCode: input.languageCode,
        },
        include: {
          _count: { select: { sections: true, experiences: true } },
        },
        orderBy: { cityName: "asc" },
      });
    }),

  getGuide: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const guide = await ctx.db.cityGuide.findFirst({
        where: { id: input.id, isActive: true },
        include: {
          sections: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
          },
          experiences: {
            where: { isActive: true },
            include: {
              slots: { where: { isActive: true }, take: 3 },
            },
          },
        },
      });
      if (!guide) throw new TRPCError({ code: "NOT_FOUND" });
      return guide;
    }),

  getGuideByCity: publicProcedure
    .input(
      z.object({
        cityCode: z.string(),
        languageCode: z.string().default("en"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const guide = await ctx.db.cityGuide.findFirst({
        where: {
          cityCode: input.cityCode,
          languageCode: input.languageCode,
          isActive: true,
        },
        include: {
          sections: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
          },
          experiences: {
            where: { isActive: true },
            include: {
              slots: { where: { isActive: true }, take: 3 },
            },
          },
        },
      });
      if (!guide) throw new TRPCError({ code: "NOT_FOUND" });
      return guide;
    }),

  // ── Management ─────────────────────────────────────────────────
  createGuide: protectedProcedure
    .input(
      z.object({
        cityCode: z.string().min(1),
        cityName: z.string().min(1),
        countryCode: z.string().min(1),
        languageCode: z.string().default("en"),
        summary: z.string().optional(),
        safetyNotes: z.string().optional(),
        transportTips: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.cityGuide.create({
        data: { tenantId: ctx.session.tenantId, ...input },
      });
    }),

  updateGuide: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        summary: z.string().optional(),
        safetyNotes: z.string().optional(),
        transportTips: z.string().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.cityGuide.update({
        where: { id, tenantId: ctx.session.tenantId },
        data,
      });
    }),

  addSection: protectedProcedure
    .input(
      z.object({
        cityGuideId: z.string().uuid(),
        sectionKey: z.string().min(1),
        title: z.string().min(1),
        body: z.string(),
        persona: z.enum(GUIDE_PERSONAS).optional(),
        sortOrder: z.number().int().default(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.cityGuideSection.create({
        data: {
          tenantId: ctx.session.tenantId,
          cityGuideId: input.cityGuideId,
          sectionKey: input.sectionKey,
          title: input.title,
          body: input.body,
          persona: input.persona,
          sortOrder: input.sortOrder,
        },
      });
    }),

  updateSection: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().optional(),
        body: z.string().optional(),
        sortOrder: z.number().int().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.cityGuideSection.update({
        where: { id, tenantId: ctx.session.tenantId },
        data,
      });
    }),
});

export const localExperienceRouter = router({
  // ── Public ──────────────────────────────────────────────────────
  listExperiences: publicProcedure
    .input(
      z.object({
        cityGuideId: z.string().uuid().optional(),
        hotelId: z.string().uuid().optional(),
        category: z.enum(EXPERIENCE_CATEGORIES).optional(),
        limit: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.localExperience.findMany({
        where: {
          isActive: true,
          ...(input.cityGuideId ? { cityGuideId: input.cityGuideId } : {}),
          ...(input.hotelId ? { hotelId: input.hotelId } : {}),
          ...(input.category ? { category: input.category } : {}),
        },
        include: {
          hotel: { select: { id: true, name: true, slug: true } },
          slots: {
            where: { isActive: true },
            take: 3,
            orderBy: { startsAt: "asc" },
          },
        },
        take: input.limit,
        orderBy: { createdAt: "desc" },
      });
    }),

  getExperience: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const exp = await ctx.db.localExperience.findFirst({
        where: { id: input.id, isActive: true },
        include: {
          hotel: { select: { id: true, name: true, slug: true } },
          cityGuide: { select: { cityName: true } },
          slots: {
            where: { isActive: true },
            orderBy: { startsAt: "asc" },
            take: 30,
          },
        },
      });
      if (!exp) throw new TRPCError({ code: "NOT_FOUND" });
      return exp;
    }),

  // ── Hotel management ───────────────────────────────────────────
  createExperience: protectedProcedure
    .input(
      z.object({
        cityGuideId: z.string().uuid().optional(),
        hotelId: z.string().uuid().optional(),
        slug: z.string().min(1),
        name: z.string().min(1),
        category: z.enum(EXPERIENCE_CATEGORIES),
        description: z.string().optional(),
        durationMinutes: z.number().int().min(1).optional(),
        city: z.string().optional(),
        maxGuests: z.number().int().min(1).optional(),
        priceCents: z.number().int().min(0).optional(),
        currency: z.string().length(3).default("USD"),
        meetingPoint: z.record(z.unknown()).optional(),
        languages: z.array(z.string()).default([]),
        tags: z.array(z.string()).default([]),
        isFree: z.boolean().default(false),
        isVipExclusive: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { meetingPoint, languages, tags, ...rest } = input;
      return ctx.db.localExperience.create({
        data: {
          tenantId: ctx.session.tenantId,
          meetingPoint: meetingPoint as any,
          languages: languages as any,
          tags: tags as any,
          ...rest,
        },
      });
    }),

  addSlot: protectedProcedure
    .input(
      z.object({
        localExperienceId: z.string().uuid(),
        startsAt: z.string().datetime(),
        endsAt: z.string().datetime().optional(),
        capacity: z.number().int().min(1).optional(),
        availableCount: z.number().int().optional(),
        priceOverrideCents: z.number().int().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.localExperienceSlot.create({
        data: {
          tenantId: ctx.session.tenantId,
          localExperienceId: input.localExperienceId,
          startsAt: new Date(input.startsAt),
          endsAt: input.endsAt ? new Date(input.endsAt) : undefined,
          capacity: input.capacity,
          availableCount: input.availableCount ?? input.capacity,
          priceOverrideCents: input.priceOverrideCents,
        },
      });
    }),

  // ── Reservations ────────────────────────────────────────────────
  bookExperience: protectedProcedure
    .input(
      z.object({
        localExperienceId: z.string().uuid(),
        localExperienceSlotId: z.string().uuid().optional(),
        bookingId: z.string().uuid().optional(),
        partySize: z.number().int().min(1).default(1),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const exp = await ctx.db.localExperience.findFirst({
        where: { id: input.localExperienceId },
      });
      if (!exp)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Experience not found",
        });

      const priceCents = (exp.priceCents ?? 0) * input.partySize;

      return ctx.db.localExperienceReservation.create({
        data: {
          tenantId: ctx.session.tenantId,
          guestId: ctx.session.userId,
          localExperienceId: input.localExperienceId,
          localExperienceSlotId: input.localExperienceSlotId,
          bookingId: input.bookingId,
          partySize: input.partySize,
          notes: input.notes,
          subtotalCents: priceCents,
          totalCents: priceCents,
        },
      });
    }),

  myReservations: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.localExperienceReservation.findMany({
      where: { guestId: ctx.session.userId, tenantId: ctx.session.tenantId },
      include: {
        localExperience: { select: { name: true, category: true } },
        localExperienceSlot: { select: { startsAt: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  listForHotel: protectedProcedure
    .input(z.object({ hotelId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.localExperienceReservation.findMany({
        where: {
          tenantId: ctx.session.tenantId,
          localExperience: { hotelId: input.hotelId },
        },
        include: {
          guest: { select: { id: true, name: true, email: true } },
          localExperience: { select: { name: true, category: true } },
          localExperienceSlot: { select: { startsAt: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }),
});
