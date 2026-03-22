// @ts-nocheck
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "../trpc.js";

const PARTNER_TYPES = [
  "HOTEL",
  "MOBILITY",
  "EXPERIENCE",
  "AMENITY",
  "TRUSTED_STAY_HOST",
  "OTHER",
] as const;
const SETTLEMENT_STATUSES = [
  "DRAFT",
  "READY",
  "PAID",
  "FAILED",
  "VOID",
] as const;

export const partnerRouter = router({
  // ── Partner management ─────────────────────────────────────────
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.partner.findMany({
      where: { tenantId: ctx.session.tenantId },
      include: {
        _count: { select: { commissionRules: true, settlementLines: true } },
      },
      orderBy: { name: "asc" },
    });
  }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const partner = await ctx.db.partner.findFirst({
        where: { id: input.id, tenantId: ctx.session.tenantId },
        include: {
          commissionRules: { where: { isActive: true } },
        },
      });
      if (!partner) throw new TRPCError({ code: "NOT_FOUND" });
      return partner;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        partnerType: z.enum(PARTNER_TYPES),
        contactInfo: z.record(z.unknown()).default({}),
        contractMetadata: z.record(z.unknown()).default({}),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { contactInfo, contractMetadata, ...rest } = input;
      return ctx.db.partner.create({
        data: {
          tenantId: ctx.session.tenantId,
          contactInfo: contactInfo as any,
          contractMetadata: contractMetadata as any,
          ...rest,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        contactInfo: z.record(z.unknown()).optional(),
        contractMetadata: z.record(z.unknown()).optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, contactInfo, contractMetadata, ...rest } = input;
      return ctx.db.partner.update({
        where: { id, tenantId: ctx.session.tenantId },
        data: {
          ...rest,
          ...(contactInfo !== undefined
            ? { contactInfo: contactInfo as any }
            : {}),
          ...(contractMetadata !== undefined
            ? { contractMetadata: contractMetadata as any }
            : {}),
        },
      });
    }),

  // ── Commission Rules ────────────────────────────────────────────
  listCommissionRules: protectedProcedure
    .input(z.object({ partnerId: z.string().uuid().optional() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.commissionRule.findMany({
        where: {
          tenantId: ctx.session.tenantId,
          ...(input.partnerId ? { partnerId: input.partnerId } : {}),
          isActive: true,
        },
        include: { partner: { select: { name: true, partnerType: true } } },
        orderBy: { createdAt: "desc" },
      });
    }),

  createCommissionRule: protectedProcedure
    .input(
      z.object({
        partnerId: z.string().uuid().optional(),
        moduleKey: z.string().min(1),
        ruleType: z.string().min(1),
        value: z.number(),
        currency: z.string().length(3).optional(),
        startsAt: z.string().datetime().optional(),
        endsAt: z.string().datetime().optional(),
        config: z.record(z.unknown()).default({}),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { config, startsAt, endsAt, ...rest } = input;
      return ctx.db.commissionRule.create({
        data: {
          tenantId: ctx.session.tenantId,
          config: config as any,
          ...rest,
          startsAt: startsAt ? new Date(startsAt) : undefined,
          endsAt: endsAt ? new Date(endsAt) : undefined,
        },
      });
    }),

  updateCommissionRule: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        value: z.number().optional(),
        isActive: z.boolean().optional(),
        endsAt: z.string().datetime().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, endsAt, ...data } = input;
      return ctx.db.commissionRule.update({
        where: { id, tenantId: ctx.session.tenantId },
        data: {
          ...data,
          ...(endsAt !== undefined ? { endsAt: new Date(endsAt) } : {}),
        },
      });
    }),
});

export const settlementRouter = router({
  // ── Settlement batches ─────────────────────────────────────────
  listBatches: protectedProcedure
    .input(
      z.object({
        partnerId: z.string().uuid().optional(),
        status: z.enum(SETTLEMENT_STATUSES).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.settlementBatch.findMany({
        where: {
          tenantId: ctx.session.tenantId,
          ...(input.status ? { status: input.status } : {}),
        },
        include: {
          _count: { select: { lines: true } },
        },
        orderBy: { periodEnd: "desc" },
      });
    }),

  getBatch: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const batch = await ctx.db.settlementBatch.findFirst({
        where: { id: input.id, tenantId: ctx.session.tenantId },
        include: {
          lines: {
            include: {
              booking: { select: { id: true, checkIn: true, checkOut: true } },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });
      if (!batch) throw new TRPCError({ code: "NOT_FOUND" });
      return batch;
    }),

  createBatch: protectedProcedure
    .input(
      z.object({
        batchRef: z.string().min(1),
        periodStart: z.string(),
        periodEnd: z.string(),
        currency: z.string().length(3).default("USD"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.settlementBatch.create({
        data: {
          tenantId: ctx.session.tenantId,
          batchRef: input.batchRef,
          periodStart: new Date(input.periodStart),
          periodEnd: new Date(input.periodEnd),
          currency: input.currency,
        },
      });
    }),

  addLine: protectedProcedure
    .input(
      z.object({
        settlementBatchId: z.string().uuid(),
        partnerId: z.string().uuid().optional(),
        bookingId: z.string().uuid().optional(),
        moduleKey: z.string(),
        grossCents: z.number().int().min(0),
        commissionCents: z.number().int().min(0),
        netCents: z.number().int().min(0),
        currency: z.string().length(3).default("USD"),
        metadata: z.record(z.unknown()).default({}),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { metadata, ...rest } = input;
      const line = await ctx.db.settlementLine.create({
        data: {
          tenantId: ctx.session.tenantId,
          metadata: metadata as any,
          ...rest,
        },
      });

      // Update batch totals
      await ctx.db.settlementBatch.update({
        where: { id: input.settlementBatchId },
        data: {
          totalGrossCents: { increment: input.grossCents },
          totalCommissionCents: { increment: input.commissionCents },
          totalNetCents: { increment: input.netCents },
        },
      });

      return line;
    }),

  updateBatchStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(SETTLEMENT_STATUSES),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.settlementBatch.update({
        where: { id: input.id, tenantId: ctx.session.tenantId },
        data: { status: input.status },
      });
    }),
});
