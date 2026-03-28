// @ts-nocheck
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc";

const TRUSTED_STAY_TYPES = [
  "APARTMENT",
  "ROOM",
  "STUDIO",
  "SERVICED_APARTMENT",
  "VILLA",
  "OTHER",
] as const;
const STAY_TERMS = ["DAILY", "WEEKLY", "MONTHLY", "FLEX"] as const;
const VERIFICATION_STATUSES = [
  "PENDING",
  "VERIFIED",
  "REJECTED",
  "SUSPENDED",
] as const;

export const trustedStayRouter = router({
  // ── Public listings ──────────────────────────────────────────────
  listUnits: publicProcedure
    .input(
      z.object({
        trustedStayType: z.enum(TRUSTED_STAY_TYPES).optional(),
        stayTerm: z.enum(STAY_TERMS).optional(),
        limit: z.number().int().min(1).max(50).default(20),
        offset: z.number().int().default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.trustedStayUnit.findMany({
        where: {
          isActive: true,
          ...(input.trustedStayType
            ? { trustedStayType: input.trustedStayType }
            : {}),
          ...(input.stayTerm ? { stayTerm: input.stayTerm } : {}),
        },
        include: {
          host: {
            select: { id: true, displayName: true, verificationStatus: true },
          },
          ratePlans: { where: { isActive: true } },
        },
        take: input.limit,
        skip: input.offset,
        orderBy: { createdAt: "desc" },
      });
    }),

  getUnit: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const unit = await ctx.db.trustedStayUnit.findFirst({
        where: { id: input.id, isActive: true },
        include: {
          host: true,
          ratePlans: { where: { isActive: true } },
          availability: {
            where: { date: { gte: new Date() } },
            orderBy: { date: "asc" },
            take: 60,
          },
        },
      });
      if (!unit) throw new TRPCError({ code: "NOT_FOUND" });
      return unit;
    }),

  // ── Host management ─────────────────────────────────────────────
  listHosts: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.trustedStayHost.findMany({
      where: { tenantId: ctx.session.tenantId },
      include: { units: true, _count: { select: { verifications: true } } },
      orderBy: { createdAt: "desc" },
    });
  }),

  createHost: protectedProcedure
    .input(
      z.object({
        displayName: z.string().min(1),
        legalName: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        hostType: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.trustedStayHost.create({
        data: {
          tenantId: ctx.session.tenantId,
          ...input,
        },
      });
    }),

  createUnit: protectedProcedure
    .input(
      z.object({
        hostId: z.string().uuid(),
        hotelId: z.string().uuid().optional(),
        slug: z.string().min(1),
        name: z.string().min(1),
        trustedStayType: z.enum(TRUSTED_STAY_TYPES),
        stayTerm: z.enum(STAY_TERMS),
        description: z.string().optional(),
        address: z.record(z.unknown()),
        geo: z.record(z.unknown()).optional(),
        roomCount: z.number().int().min(0).optional(),
        guestCapacity: z.number().int().min(1).optional(),
        amenities: z.array(z.string()).default([]),
        houseRules: z.record(z.unknown()).default({}),
        tags: z.array(z.string()).default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { address, geo, houseRules, amenities, tags, ...rest } = input;
      return ctx.db.trustedStayUnit.create({
        data: {
          tenantId: ctx.session.tenantId,
          address: address as any,
          geo: geo as any,
          houseRules: houseRules as any,
          amenities: amenities as any,
          tags: tags as any,
          ...rest,
        },
      });
    }),

  updateUnit: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        description: z.string().optional(),
        amenities: z.array(z.string()).optional(),
        houseRules: z.record(z.unknown()).optional(),
        tags: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, amenities, houseRules, tags, ...rest } = input;
      return ctx.db.trustedStayUnit.update({
        where: { id, tenantId: ctx.session.tenantId },
        data: {
          ...rest,
          ...(amenities !== undefined ? { amenities: amenities as any } : {}),
          ...(houseRules !== undefined
            ? { houseRules: houseRules as any }
            : {}),
          ...(tags !== undefined ? { tags: tags as any } : {}),
        },
      });
    }),

  // ── Rate Plans ──────────────────────────────────────────────────
  createRatePlan: protectedProcedure
    .input(
      z.object({
        trustedStayUnitId: z.string().uuid(),
        code: z.string().min(1),
        name: z.string().min(1),
        stayTerm: z.enum(STAY_TERMS),
        nightlyPriceCents: z.number().int().min(0).optional(),
        weeklyPriceCents: z.number().int().min(0).optional(),
        monthlyPriceCents: z.number().int().min(0).optional(),
        depositCents: z.number().int().min(0).optional(),
        cancellationPolicy: z.record(z.unknown()).default({}),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { cancellationPolicy, ...rest } = input;
      return ctx.db.trustedStayRatePlan.create({
        data: {
          tenantId: ctx.session.tenantId,
          cancellationPolicy: cancellationPolicy as any,
          ...rest,
        },
      });
    }),

  // ── Availability ────────────────────────────────────────────────
  setAvailability: protectedProcedure
    .input(
      z.object({
        trustedStayUnitId: z.string().uuid(),
        dates: z.array(
          z.object({
            date: z.string(),
            isAvailable: z.boolean(),
            priceCents: z.number().int().optional(),
            minNights: z.number().int().optional(),
            maxNights: z.number().int().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const ops = input.dates.map((d) =>
        ctx.db.trustedStayAvailability.upsert({
          where: {
            trustedStayUnitId_date: {
              trustedStayUnitId: input.trustedStayUnitId,
              date: new Date(d.date),
            },
          },
          create: {
            tenantId: ctx.session.tenantId,
            trustedStayUnitId: input.trustedStayUnitId,
            date: new Date(d.date),
            isAvailable: d.isAvailable,
            priceCents: d.priceCents,
            minNights: d.minNights,
            maxNights: d.maxNights,
          },
          update: {
            isAvailable: d.isAvailable,
            priceCents: d.priceCents,
            minNights: d.minNights,
            maxNights: d.maxNights,
          },
        }),
      );
      return ctx.db.$transaction(ops);
    }),

  // ── Verification (admin) ────────────────────────────────────────
  listPendingVerifications: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.trustedStayVerification.findMany({
      where: { tenantId: ctx.session.tenantId, status: "PENDING" },
      include: {
        host: { select: { displayName: true } },
        trustedStayUnit: { select: { name: true, trustedStayType: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  }),

  submitVerification: protectedProcedure
    .input(
      z.object({
        hostId: z.string().uuid().optional(),
        trustedStayUnitId: z.string().uuid().optional(),
        verificationType: z.string(),
        evidence: z.record(z.unknown()).default({}),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { evidence, ...rest } = input;
      return ctx.db.trustedStayVerification.create({
        data: {
          tenantId: ctx.session.tenantId,
          status: "PENDING",
          evidence: evidence as any,
          ...rest,
        },
      });
    }),

  reviewVerification: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(VERIFICATION_STATUSES),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const verification = await ctx.db.trustedStayVerification.update({
        where: { id: input.id, tenantId: ctx.session.tenantId },
        data: {
          status: input.status,
          notes: input.notes,
          verifiedAt: input.status === "VERIFIED" ? new Date() : undefined,
        },
      });

      // Propagate status to host or unit
      if (verification.hostId && input.status === "VERIFIED") {
        await ctx.db.trustedStayHost.update({
          where: { id: verification.hostId },
          data: { verificationStatus: "VERIFIED" },
        });
      }
      if (verification.trustedStayUnitId) {
        await ctx.db.trustedStayUnit.update({
          where: { id: verification.trustedStayUnitId },
          data: { verificationStatus: input.status },
        });
      }

      return verification;
    }),
});
