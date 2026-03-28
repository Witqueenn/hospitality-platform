import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

const MGMT_ROLES = [
  "HOTEL_ADMIN",
  "HOTEL_MANAGER",
  "FINANCE_APPROVER",
] as const;

function canManage(role: string) {
  return (MGMT_ROLES as readonly string[]).includes(role);
}

export const staffTipRouter = router({
  // Guest: send a tip to a staff member
  send: protectedProcedure
    .input(
      z.object({
        staffProfileId: z.string().uuid(),
        bookingId: z.string().uuid().optional(),
        amountCents: z.number().int().positive(),
        currency: z.string().length(3).default("USD"),
        message: z.string().max(500).optional(),
        tipType: z
          .enum(["POST_SERVICE", "POST_STAY", "THANK_YOU"])
          .default("POST_STAY"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.role !== "GUEST") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only guests can send tips.",
        });
      }

      // Verify staff has tipping enabled
      const profile = await ctx.db.staffProfile.findFirst({
        where: { id: input.staffProfileId, tipEnabled: true, isActive: true },
        select: { id: true, tipEnabled: true },
      });
      if (!profile) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This staff member does not accept tips.",
        });
      }

      return ctx.db.staffTip.create({
        data: {
          tenantId: ctx.tenantId!,
          staffProfileId: input.staffProfileId,
          guestId: ctx.session.userId,
          bookingId: input.bookingId,
          amountCents: input.amountCents,
          currency: input.currency,
          message: input.message,
          tipType: input.tipType,
          status: "PENDING",
        },
      });
    }),

  // Guest: list tips they've sent
  mySent: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.staffTip.findMany({
      where: { guestId: ctx.session.userId, tenantId: ctx.tenantId },
      include: {
        staffProfile: {
          select: { id: true, name: true, slug: true, department: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Hotel mgmt: list all tips for a hotel
  listByHotel: protectedProcedure
    .input(
      z.object({
        hotelId: z.string().uuid(),
        status: z
          .enum(["PENDING", "SETTLED", "REFUNDED", "CANCELLED"])
          .optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!canManage(ctx.session.role))
        throw new TRPCError({ code: "FORBIDDEN" });

      const skip = (input.page - 1) * input.pageSize;
      const where = {
        tenantId: ctx.tenantId,
        staffProfile: { hotelId: input.hotelId },
        ...(input.status && { status: input.status }),
      };

      const [items, total] = await Promise.all([
        ctx.db.staffTip.findMany({
          where,
          include: {
            staffProfile: {
              select: { id: true, name: true, department: true },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: input.pageSize,
        }),
        ctx.db.staffTip.count({ where }),
      ]);

      return { items, total, page: input.page, pageSize: input.pageSize };
    }),

  // Hotel mgmt: list tips for a staff member
  listForStaff: protectedProcedure
    .input(
      z.object({
        staffProfileId: z.string().uuid(),
        status: z
          .enum(["PENDING", "SETTLED", "REFUNDED", "CANCELLED"])
          .optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!canManage(ctx.session.role))
        throw new TRPCError({ code: "FORBIDDEN" });

      const skip = (input.page - 1) * input.pageSize;
      const where = {
        staffProfileId: input.staffProfileId,
        tenantId: ctx.tenantId,
        ...(input.status && { status: input.status }),
      };

      const [items, total] = await Promise.all([
        ctx.db.staffTip.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: input.pageSize,
        }),
        ctx.db.staffTip.count({ where }),
      ]);

      const totalCents = items
        .filter((t) => t.status === "PENDING" || t.status === "SETTLED")
        .reduce((s, t) => s + t.amountCents, 0);

      return {
        items,
        total,
        totalCents,
        page: input.page,
        pageSize: input.pageSize,
      };
    }),

  // Hotel mgmt: settle tips for a staff member
  settle: protectedProcedure
    .input(
      z.object({
        staffProfileId: z.string().uuid(),
        tipIds: z.array(z.string().uuid()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!canManage(ctx.session.role))
        throw new TRPCError({ code: "FORBIDDEN" });

      return ctx.db.staffTip.updateMany({
        where: {
          id: { in: input.tipIds },
          staffProfileId: input.staffProfileId,
          tenantId: ctx.tenantId!,
          status: "PENDING",
        },
        data: { status: "SETTLED", settledAt: new Date() },
      });
    }),
});
