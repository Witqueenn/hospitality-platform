// @ts-nocheck
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc";

export const bundleRouter = router({
  // ── Public: browse bundles ──────────────────────────────────────
  listActive: publicProcedure
    .input(
      z.object({
        hotelId: z.string().uuid().optional(),
        limit: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();
      return ctx.db.bundleOffer.findMany({
        where: {
          isActive: true,
          OR: [{ startsAt: null }, { startsAt: { lte: now } }],
          AND: {
            OR: [{ endsAt: null }, { endsAt: { gte: now } }],
          },
          ...(input.hotelId ? { hotelId: input.hotelId } : {}),
        },
        include: {
          hotel: { select: { id: true, name: true, slug: true } },
          items: { orderBy: { sortOrder: "asc" } },
        },
        take: input.limit,
        orderBy: { createdAt: "desc" },
      });
    }),

  getBundle: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const bundle = await ctx.db.bundleOffer.findFirst({
        where: { id: input.id, isActive: true },
        include: {
          hotel: { select: { id: true, name: true, slug: true } },
          items: { orderBy: { sortOrder: "asc" } },
        },
      });
      if (!bundle) throw new TRPCError({ code: "NOT_FOUND" });
      return bundle;
    }),

  // ── Hotel management ───────────────────────────────────────────
  listForHotel: protectedProcedure
    .input(z.object({ hotelId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.bundleOffer.findMany({
        where: { hotelId: input.hotelId, tenantId: ctx.session.tenantId },
        include: {
          items: true,
          _count: { select: { bookings: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        hotelId: z.string().uuid().optional(),
        name: z.string().min(1),
        code: z.string().min(1),
        description: z.string().optional(),
        bundleType: z.string().default("CURATED"),
        pricingMode: z.string().default("FIXED"),
        totalCents: z.number().int().min(0).optional(),
        currency: z.string().length(3).default("USD"),
        startsAt: z.string().datetime().optional(),
        endsAt: z.string().datetime().optional(),
        isVipOnly: z.boolean().default(false),
        rules: z.record(z.unknown()).default({}),
        items: z
          .array(
            z.object({
              itemType: z.string(),
              referenceId: z.string().uuid().optional(),
              quantity: z.number().int().min(1).default(1),
              unitCents: z.number().int().min(0).optional(),
              sortOrder: z.number().int().default(0),
            }),
          )
          .default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { items, rules, startsAt, endsAt, ...bundleData } = input;
      return ctx.db.bundleOffer.create({
        data: {
          tenantId: ctx.session.tenantId,
          rules: rules as any,
          ...bundleData,
          startsAt: startsAt ? new Date(startsAt) : undefined,
          endsAt: endsAt ? new Date(endsAt) : undefined,
          items: {
            create: items.map((item) => ({
              tenantId: ctx.session.tenantId,
              ...item,
            })),
          },
        },
        include: { items: true },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        description: z.string().optional(),
        totalCents: z.number().int().min(0).optional(),
        startsAt: z.string().datetime().optional(),
        endsAt: z.string().datetime().optional(),
        isActive: z.boolean().optional(),
        isVipOnly: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, startsAt, endsAt, ...data } = input;
      return ctx.db.bundleOffer.update({
        where: { id, tenantId: ctx.session.tenantId },
        data: {
          ...data,
          ...(startsAt !== undefined ? { startsAt: new Date(startsAt) } : {}),
          ...(endsAt !== undefined ? { endsAt: new Date(endsAt) } : {}),
        },
      });
    }),

  addItem: protectedProcedure
    .input(
      z.object({
        bundleOfferId: z.string().uuid(),
        itemType: z.string(),
        referenceId: z.string().uuid().optional(),
        quantity: z.number().int().min(1).default(1),
        unitCents: z.number().int().min(0).optional(),
        sortOrder: z.number().int().default(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.bundleItem.create({
        data: { tenantId: ctx.session.tenantId, ...input },
      });
    }),

  removeItem: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.bundleItem.delete({
        where: { id: input.id, tenantId: ctx.session.tenantId },
      });
    }),
});
