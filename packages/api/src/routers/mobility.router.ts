import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc.js";

const MOBILITY_TYPES = [
  "AIRPORT_TRANSFER",
  "RENTAL_CAR",
  "CHAUFFEUR",
  "CITY_TRANSFER",
  "HOURLY_DRIVER",
] as const;
const MOBILITY_RESERVATION_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "EN_ROUTE",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
] as const;

export const mobilityRouter = router({
  // ── Public: browse providers & products ────────────────────────
  listProviders: publicProcedure
    .input(
      z.object({
        mobilityType: z.enum(MOBILITY_TYPES).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.mobilityProvider.findMany({
        where: {
          isActive: true,
          ...(input.mobilityType ? { mobilityType: input.mobilityType } : {}),
        },
        include: {
          products: { where: { isActive: true }, take: 5 },
        },
        orderBy: { ratingAggregate: "desc" },
      });
    }),

  listProducts: publicProcedure
    .input(
      z.object({
        hotelId: z.string().uuid().optional(),
        mobilityType: z.enum(MOBILITY_TYPES).optional(),
        limit: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.mobilityProduct.findMany({
        where: {
          isActive: true,
          ...(input.hotelId ? { hotelId: input.hotelId } : {}),
          ...(input.mobilityType ? { mobilityType: input.mobilityType } : {}),
        },
        include: {
          mobilityProvider: {
            select: { id: true, name: true, ratingAggregate: true },
          },
          hotel: { select: { id: true, name: true, slug: true } },
        },
        take: input.limit,
      });
    }),

  getProduct: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.mobilityProduct.findFirst({
        where: { id: input.id, isActive: true },
        include: {
          mobilityProvider: true,
          hotel: {
            select: { id: true, name: true, slug: true, address: true },
          },
        },
      });
      if (!product) throw new TRPCError({ code: "NOT_FOUND" });
      return product;
    }),

  // ── Hotel management ───────────────────────────────────────────
  listForHotel: protectedProcedure
    .input(z.object({ hotelId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.mobilityProduct.findMany({
        where: { hotelId: input.hotelId, tenantId: ctx.session.tenantId },
        include: {
          mobilityProvider: { select: { name: true } },
          _count: { select: { reservations: true } },
        },
        orderBy: { mobilityType: "asc" },
      });
    }),

  createProvider: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        mobilityType: z.enum(MOBILITY_TYPES),
        cities: z.array(z.string()).default([]),
        serviceAreas: z.array(z.string()).default([]),
        contactInfo: z.record(z.unknown()).default({}),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { cities, serviceAreas, contactInfo, ...rest } = input;
      return ctx.db.mobilityProvider.create({
        data: {
          tenantId: ctx.session.tenantId,
          cities: cities as any,
          serviceAreas: serviceAreas as any,
          contactInfo: contactInfo as any,
          ...rest,
        },
      });
    }),

  createProduct: protectedProcedure
    .input(
      z.object({
        mobilityProviderId: z.string().uuid(),
        hotelId: z.string().uuid().optional(),
        name: z.string().min(1),
        code: z.string().min(1),
        mobilityType: z.enum(MOBILITY_TYPES),
        description: z.string().optional(),
        vehicleClass: z.string().optional(),
        capacity: z.number().int().min(1).optional(),
        baggageCapacity: z.number().int().optional(),
        city: z.string().optional(),
        currency: z.string().length(3).default("USD"),
        pricingConfig: z.record(z.unknown()).default({}),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { pricingConfig, ...rest } = input;
      return ctx.db.mobilityProduct.create({
        data: {
          tenantId: ctx.session.tenantId,
          pricingConfig: pricingConfig as any,
          ...rest,
        },
      });
    }),

  updateProduct: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
        pricingConfig: z.record(z.unknown()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, pricingConfig, ...rest } = input;
      return ctx.db.mobilityProduct.update({
        where: { id, tenantId: ctx.session.tenantId },
        data: {
          ...rest,
          ...(pricingConfig !== undefined
            ? { pricingConfig: pricingConfig as any }
            : {}),
        },
      });
    }),
});

export const mobilityReservationRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        mobilityProviderId: z.string().uuid(),
        mobilityProductId: z.string().uuid(),
        hotelId: z.string().uuid().optional(),
        bookingId: z.string().uuid().optional(),
        pickupAt: z.string().datetime(),
        pickupLocation: z.record(z.unknown()),
        dropoffLocation: z.record(z.unknown()).optional(),
        passengerCount: z.number().int().min(1).default(1),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { pickupLocation, dropoffLocation, ...rest } = input;
      return ctx.db.mobilityReservation.create({
        data: {
          tenantId: ctx.session.tenantId,
          guestId: ctx.session.userId,
          pickupLocation: pickupLocation as any,
          dropoffLocation: dropoffLocation as any,
          pickupAt: new Date(rest.pickupAt),
          mobilityProviderId: rest.mobilityProviderId,
          mobilityProductId: rest.mobilityProductId,
          hotelId: rest.hotelId,
          bookingId: rest.bookingId,
          passengerCount: rest.passengerCount,
          notes: rest.notes,
        },
        include: { mobilityProduct: true },
      });
    }),

  myReservations: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.mobilityReservation.findMany({
      where: { guestId: ctx.session.userId, tenantId: ctx.session.tenantId },
      include: {
        mobilityProduct: { select: { name: true, mobilityType: true } },
        hotel: { select: { name: true, slug: true } },
      },
      orderBy: { pickupAt: "desc" },
    });
  }),

  listForHotel: protectedProcedure
    .input(
      z.object({
        hotelId: z.string().uuid(),
        status: z.enum(MOBILITY_RESERVATION_STATUSES).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.mobilityReservation.findMany({
        where: {
          tenantId: ctx.session.tenantId,
          ...(input.hotelId ? { hotelId: input.hotelId } : {}),
          ...(input.status ? { status: input.status } : {}),
        },
        include: {
          guest: { select: { id: true, name: true, email: true } },
          mobilityProduct: { select: { name: true, mobilityType: true } },
        },
        orderBy: { pickupAt: "asc" },
      });
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(MOBILITY_RESERVATION_STATUSES),
        externalRef: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.mobilityReservation.update({
        where: { id, tenantId: ctx.session.tenantId },
        data,
      });
    }),

  cancel: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.mobilityReservation.update({
        where: { id: input.id, guestId: ctx.session.userId },
        data: { status: "CANCELLED" },
      });
    }),
});
