import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc.js";

const AMENITY_TYPES = [
  "GYM",
  "POOL",
  "TENNIS",
  "SPA",
  "SAUNA",
  "HAMMAM",
  "CO_WORKING",
  "KIDS_CLUB",
  "BEACH_ACCESS",
  "OTHER",
] as const;

const ACCESS_UNITS = ["HOURLY", "DAILY", "WEEKLY", "MONTHLY"] as const;

export const amenityRouter = router({
  // ── Asset listing ──────────────────────────────────────────────
  listPublic: publicProcedure
    .input(
      z.object({
        hotelId: z.string().uuid().optional(),
        amenityType: z.enum(AMENITY_TYPES).optional(),
        onlyExternal: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.amenityAsset.findMany({
        where: {
          ...(input.hotelId ? { hotelId: input.hotelId } : {}),
          ...(input.amenityType ? { amenityType: input.amenityType } : {}),
          ...(input.onlyExternal ? { isExternalAccessOpen: true } : {}),
          isActive: true,
        },
        include: {
          hotel: { select: { id: true, name: true, slug: true } },
          passPlans: { where: { isActive: true } },
          schedules: { where: { isActive: true } },
        },
      });
    }),

  getBySlug: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const asset = await ctx.db.amenityAsset.findFirst({
        where: { id: input.id, isActive: true },
        include: {
          hotel: {
            select: { id: true, name: true, slug: true, address: true },
          },
          passPlans: { where: { isActive: true } },
          schedules: {
            where: { isActive: true },
            orderBy: { dayOfWeek: "asc" },
          },
        },
      });
      if (!asset) throw new TRPCError({ code: "NOT_FOUND" });
      return asset;
    }),

  // ── Hotel management ───────────────────────────────────────────
  listForHotel: protectedProcedure
    .input(z.object({ hotelId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.amenityAsset.findMany({
        where: { hotelId: input.hotelId, tenantId: ctx.session.tenantId },
        include: {
          passPlans: true,
          schedules: true,
          _count: { select: { reservations: true } },
        },
        orderBy: { amenityType: "asc" },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        hotelId: z.string().uuid(),
        code: z.string().min(1),
        name: z.string().min(1),
        amenityType: z.enum(AMENITY_TYPES),
        description: z.string().optional(),
        locationLabel: z.string().optional(),
        capacity: z.number().int().optional(),
        isExternalAccessOpen: z.boolean().default(false),
        isVipOnly: z.boolean().default(false),
        photos: z.array(z.string()).default([]),
        features: z.array(z.string()).default([]),
        rules: z.record(z.unknown()).default({}),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { rules, photos, features, ...rest } = input;
      return ctx.db.amenityAsset.create({
        data: {
          tenantId: ctx.session.tenantId,
          rules: rules as any,
          photos: photos as any,
          features: features as any,
          ...rest,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        description: z.string().optional(),
        locationLabel: z.string().optional(),
        capacity: z.number().int().optional(),
        isExternalAccessOpen: z.boolean().optional(),
        isVipOnly: z.boolean().optional(),
        isActive: z.boolean().optional(),
        photos: z.array(z.string()).optional(),
        features: z.array(z.string()).optional(),
        rules: z.record(z.unknown()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, rules, photos, features, ...rest } = input;
      return ctx.db.amenityAsset.update({
        where: { id, tenantId: ctx.session.tenantId },
        data: {
          ...rest,
          ...(rules !== undefined ? { rules: rules as any } : {}),
          ...(photos !== undefined ? { photos: photos as any } : {}),
          ...(features !== undefined ? { features: features as any } : {}),
        },
      });
    }),

  // ── Pass Plans ─────────────────────────────────────────────────
  createPassPlan: protectedProcedure
    .input(
      z.object({
        amenityAssetId: z.string().uuid(),
        code: z.string().min(1),
        name: z.string().min(1),
        accessUnit: z.enum(ACCESS_UNITS),
        durationCount: z.number().int().min(1).default(1),
        priceCents: z.number().int().min(0),
        currency: z.string().length(3).default("USD"),
        totalVisits: z.number().int().optional(),
        vipDiscountPercent: z.number().int().min(0).max(100).optional(),
        rules: z.record(z.unknown()).default({}),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { rules, ...rest } = input;
      return ctx.db.amenityPassPlan.create({
        data: {
          tenantId: ctx.session.tenantId,
          rules: rules as any,
          ...rest,
        },
      });
    }),

  updatePassPlan: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        priceCents: z.number().int().min(0).optional(),
        vipDiscountPercent: z.number().int().min(0).max(100).optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.amenityPassPlan.update({
        where: { id, tenantId: ctx.session.tenantId },
        data,
      });
    }),

  // ── Schedules ──────────────────────────────────────────────────
  setSchedule: protectedProcedure
    .input(
      z.object({
        amenityAssetId: z.string().uuid(),
        schedules: z.array(
          z.object({
            dayOfWeek: z.number().int().min(0).max(6),
            opensAt: z.string(),
            closesAt: z.string(),
            slotDurationMinutes: z.number().int().optional(),
            capacityPerSlot: z.number().int().optional(),
            externalAccessStart: z.string().optional(),
            externalAccessEnd: z.string().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.amenitySchedule.deleteMany({
        where: {
          amenityAssetId: input.amenityAssetId,
          tenantId: ctx.session.tenantId,
        },
      });
      return ctx.db.amenitySchedule.createMany({
        data: input.schedules.map((s) => ({
          tenantId: ctx.session.tenantId,
          amenityAssetId: input.amenityAssetId,
          ...s,
        })),
      });
    }),
});

export const amenityReservationRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        hotelId: z.string().uuid(),
        amenityAssetId: z.string().uuid(),
        amenityPassPlanId: z.string().uuid().optional(),
        bookingId: z.string().uuid().optional(),
        accessDate: z.string(),
        startsAt: z.string().datetime().optional(),
        endsAt: z.string().datetime().optional(),
        partySize: z.number().int().min(1).default(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const plan = input.amenityPassPlanId
        ? await ctx.db.amenityPassPlan.findFirst({
            where: { id: input.amenityPassPlanId },
          })
        : null;

      return ctx.db.amenityReservation.create({
        data: {
          tenantId: ctx.session.tenantId,
          hotelId: input.hotelId,
          amenityAssetId: input.amenityAssetId,
          amenityPassPlanId: input.amenityPassPlanId,
          bookingId: input.bookingId,
          guestId: ctx.session.userId,
          accessDate: new Date(input.accessDate),
          startsAt: input.startsAt ? new Date(input.startsAt) : undefined,
          endsAt: input.endsAt ? new Date(input.endsAt) : undefined,
          partySize: input.partySize,
          subtotalCents: plan?.priceCents ?? 0,
          totalCents: plan?.priceCents ?? 0,
        },
        include: { amenityAsset: true, amenityPassPlan: true },
      });
    }),

  myReservations: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.amenityReservation.findMany({
      where: { guestId: ctx.session.userId, tenantId: ctx.session.tenantId },
      include: {
        amenityAsset: { select: { name: true, amenityType: true } },
        hotel: { select: { name: true, slug: true } },
      },
      orderBy: { accessDate: "desc" },
    });
  }),

  cancel: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.amenityReservation.update({
        where: { id: input.id, guestId: ctx.session.userId },
        data: { status: "CANCELLED" },
      });
    }),

  listForHotel: protectedProcedure
    .input(
      z.object({
        hotelId: z.string().uuid(),
        date: z.string().optional(),
        amenityAssetId: z.string().uuid().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.amenityReservation.findMany({
        where: {
          hotelId: input.hotelId,
          tenantId: ctx.session.tenantId,
          ...(input.date ? { accessDate: new Date(input.date) } : {}),
          ...(input.amenityAssetId
            ? { amenityAssetId: input.amenityAssetId }
            : {}),
        },
        include: {
          guest: { select: { id: true, name: true, email: true } },
          amenityAsset: { select: { name: true, amenityType: true } },
          amenityPassPlan: true,
        },
        orderBy: [{ accessDate: "asc" }, { startsAt: "asc" }],
      });
    }),

  checkIn: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.amenityReservation.update({
        where: { id: input.id, tenantId: ctx.session.tenantId },
        data: { status: "CHECKED_IN" },
      });
    }),
});
