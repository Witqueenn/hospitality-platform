// @ts-nocheck
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc.js";

const FLASH_STATUSES = [
  "DRAFT",
  "SCHEDULED",
  "ACTIVE",
  "PAUSED",
  "ENDED",
] as const;

export const flashInventoryRouter = router({
  // ── Public: tonight deals feed ─────────────────────────────────
  listActive: publicProcedure
    .input(
      z.object({
        hotelId: z.string().uuid().optional(),
        date: z.string().optional(),
        limit: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();
      return ctx.db.inventoryFlashWindow.findMany({
        where: {
          status: "ACTIVE",
          startsAt: { lte: now },
          endsAt: { gte: now },
          ...(input.hotelId ? { hotelId: input.hotelId } : {}),
        },
        include: {
          hotel: {
            select: {
              id: true,
              name: true,
              slug: true,
              photos: true,
              starRating: true,
            },
          },
          roomType: {
            select: { id: true, name: true, capacity: true, photos: true },
          },
          rateSnapshots: {
            where: input.date
              ? { inventoryDate: new Date(input.date) }
              : undefined,
            take: 1,
          },
        },
        take: input.limit,
        orderBy: { startsAt: "desc" },
      });
    }),

  getWindow: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const win = await ctx.db.inventoryFlashWindow.findFirst({
        where: { id: input.id, tenantId: ctx.session.tenantId },
        include: {
          rateSnapshots: { orderBy: { inventoryDate: "asc" } },
          roomType: true,
        },
      });
      if (!win) throw new TRPCError({ code: "NOT_FOUND" });
      return win;
    }),

  // ── Hotel management ───────────────────────────────────────────
  listForHotel: protectedProcedure
    .input(
      z.object({
        hotelId: z.string().uuid(),
        status: z.enum(FLASH_STATUSES).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.inventoryFlashWindow.findMany({
        where: {
          hotelId: input.hotelId,
          tenantId: ctx.session.tenantId,
          ...(input.status ? { status: input.status } : {}),
        },
        include: {
          roomType: { select: { name: true } },
          _count: { select: { rateSnapshots: true } },
        },
        orderBy: { startsAt: "desc" },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        hotelId: z.string().uuid(),
        roomTypeId: z.string().uuid(),
        name: z.string().min(1),
        startsAt: z.string().datetime(),
        endsAt: z.string().datetime(),
        visibilityRule: z.record(z.unknown()).default({}),
        pricingRule: z.record(z.unknown()).default({}),
        isVipEarlyAccess: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.inventoryFlashWindow.create({
        data: {
          tenantId: ctx.session.tenantId,
          hotelId: input.hotelId,
          roomTypeId: input.roomTypeId,
          name: input.name,
          startsAt: new Date(input.startsAt),
          endsAt: new Date(input.endsAt),
          visibilityRule: input.visibilityRule as any,
          pricingRule: input.pricingRule as any,
          isVipEarlyAccess: input.isVipEarlyAccess,
          status: "DRAFT",
        },
      });
    }),

  updateStatus: protectedProcedure
    .input(z.object({ id: z.string().uuid(), status: z.enum(FLASH_STATUSES) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.inventoryFlashWindow.update({
        where: { id: input.id, tenantId: ctx.session.tenantId },
        data: { status: input.status },
      });
    }),

  addSnapshot: protectedProcedure
    .input(
      z.object({
        inventoryFlashWindowId: z.string().uuid(),
        roomInventoryId: z.string().uuid(),
        inventoryDate: z.string(),
        originalPriceCents: z.number().int(),
        flashPriceCents: z.number().int(),
        availableCount: z.number().int(),
        bookingTypeTarget: z.enum(["SAME_NIGHT", "NIGHT_USE", "ROOM"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.flashRateSnapshot.create({
        data: {
          tenantId: ctx.session.tenantId,
          inventoryFlashWindowId: input.inventoryFlashWindowId,
          roomInventoryId: input.roomInventoryId,
          inventoryDate: new Date(input.inventoryDate),
          originalPriceCents: input.originalPriceCents,
          flashPriceCents: input.flashPriceCents,
          availableCount: input.availableCount,
          bookingTypeTarget: input.bookingTypeTarget,
        },
      });
    }),
});

export const nightUseRouter = router({
  listPolicies: protectedProcedure
    .input(z.object({ hotelId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.nightUsePolicy.findMany({
        where: { hotelId: input.hotelId, tenantId: ctx.session.tenantId },
        include: { roomType: { select: { name: true } } },
      });
    }),

  createPolicy: protectedProcedure
    .input(
      z.object({
        hotelId: z.string().uuid(),
        roomTypeId: z.string().uuid().optional(),
        checkInFrom: z.string(),
        checkOutUntil: z.string(),
        minHours: z.number().int().optional(),
        maxHours: z.number().int().optional(),
        baseDiscountPercent: z.number().int().min(0).max(100).optional(),
        ruleConfig: z.record(z.unknown()).default({}),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { ruleConfig, ...rest } = input;
      return ctx.db.nightUsePolicy.create({
        data: {
          tenantId: ctx.session.tenantId,
          isActive: true,
          ruleConfig: ruleConfig as any,
          ...rest,
        },
      });
    }),

  togglePolicy: protectedProcedure
    .input(z.object({ id: z.string().uuid(), isActive: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.nightUsePolicy.update({
        where: { id: input.id, tenantId: ctx.session.tenantId },
        data: { isActive: input.isActive },
      });
    }),
});
