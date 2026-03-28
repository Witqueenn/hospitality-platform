// @ts-nocheck
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc.js";

const VIP_TIERS = ["CORE", "COMFORT", "SIGNATURE"] as const;
const VIP_MEMBERSHIP_STATUSES = [
  "ACTIVE",
  "PAUSED",
  "CANCELLED",
  "EXPIRED",
  "TRIAL",
] as const;

export const vipRouter = router({
  // ── VIP Plans ──────────────────────────────────────────────────
  listPlans: publicProcedure
    .input(z.object({ tenantId: z.string().uuid().optional() }))
    .query(async ({ ctx, input }) => {
      const tenantId = input.tenantId ?? ctx.session?.tenantId;
      if (!tenantId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "tenantId required",
        });
      return ctx.db.vipPlan.findMany({
        where: { tenantId, isActive: true },
        include: { benefits: { where: { isActive: true } } },
        orderBy: { tier: "asc" },
      });
    }),

  getPlan: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const plan = await ctx.db.vipPlan.findFirst({
        where: { id: input.id, isActive: true },
        include: { benefits: { where: { isActive: true } } },
      });
      if (!plan) throw new TRPCError({ code: "NOT_FOUND" });
      return plan;
    }),

  createPlan: protectedProcedure
    .input(
      z.object({
        code: z.string().min(1),
        name: z.string().min(1),
        tier: z.enum(VIP_TIERS),
        description: z.string().optional(),
        monthlyPriceCents: z.number().int().min(0).optional(),
        yearlyPriceCents: z.number().int().min(0).optional(),
        currency: z.string().length(3).default("USD"),
        benefitConfig: z.record(z.unknown()).default({}),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { benefitConfig, ...rest } = input;
      return ctx.db.vipPlan.create({
        data: {
          ...rest,
          tenantId: ctx.session.tenantId,
          benefitConfig: benefitConfig as any,
        },
      });
    }),

  updatePlan: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        description: z.string().optional(),
        monthlyPriceCents: z.number().int().min(0).optional(),
        yearlyPriceCents: z.number().int().min(0).optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.vipPlan.update({
        where: { id, tenantId: ctx.session.tenantId },
        data,
      });
    }),

  // ── User Memberships ───────────────────────────────────────────
  myMembership: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.userVipMembership.findFirst({
      where: {
        tenantId: ctx.session.tenantId,
        userId: ctx.session.userId,
        status: "ACTIVE",
      },
      include: {
        vipPlan: { include: { benefits: { where: { isActive: true } } } },
      },
    });
  }),

  enrollMembership: protectedProcedure
    .input(
      z.object({
        vipPlanId: z.string().uuid(),
        startsAt: z.string().datetime(),
        source: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.userVipMembership.create({
        data: {
          tenantId: ctx.session.tenantId,
          userId: ctx.session.userId,
          vipPlanId: input.vipPlanId,
          startsAt: new Date(input.startsAt),
          source: input.source ?? "purchase",
          status: "TRIAL",
        },
      });
    }),

  cancelMembership: protectedProcedure
    .input(z.object({ membershipId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.userVipMembership.update({
        where: {
          id: input.membershipId,
          userId: ctx.session.userId,
          tenantId: ctx.session.tenantId,
        },
        data: { status: "CANCELLED", autoRenew: false },
      });
    }),

  listMemberships: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid().optional(),
        status: z.enum(VIP_MEMBERSHIP_STATUSES).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.userVipMembership.findMany({
        where: {
          tenantId: ctx.session.tenantId,
          userId: input.userId ?? ctx.session.userId,
          ...(input.status ? { status: input.status } : {}),
        },
        include: { vipPlan: true },
        orderBy: { createdAt: "desc" },
      });
    }),

  // ── Benefit Wallet ─────────────────────────────────────────────
  myWallet: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.userBenefitWallet.findMany({
      where: {
        tenantId: ctx.session.tenantId,
        userId: ctx.session.userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
  }),

  // ── VIP Offers ─────────────────────────────────────────────────
  listOffers: protectedProcedure
    .input(z.object({ hotelId: z.string().uuid().optional() }))
    .query(async ({ ctx, input }) => {
      const now = new Date();
      return ctx.db.vipOffer.findMany({
        where: {
          tenantId: ctx.session.tenantId,
          isActive: true,
          ...(input.hotelId ? { hotelId: input.hotelId } : {}),
          OR: [{ endsAt: null }, { endsAt: { gt: now } }],
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  createOffer: protectedProcedure
    .input(
      z.object({
        hotelId: z.string().uuid().optional(),
        vipPlanId: z.string().uuid().optional(),
        title: z.string().min(1),
        description: z.string().optional(),
        offerType: z.string(),
        config: z.record(z.unknown()).default({}),
        startsAt: z.string().datetime().optional(),
        endsAt: z.string().datetime().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { config, startsAt, endsAt, ...rest } = input;
      return ctx.db.vipOffer.create({
        data: {
          tenantId: ctx.session.tenantId,
          ...rest,
          config: config as any,
          startsAt: startsAt ? new Date(startsAt) : undefined,
          endsAt: endsAt ? new Date(endsAt) : undefined,
        },
      });
    }),
});
