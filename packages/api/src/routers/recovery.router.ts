import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

const MGMT_ROLES = [
  "HOTEL_ADMIN",
  "HOTEL_MANAGER",
  "GUEST_RELATIONS",
  "OPERATIONS_MANAGER",
] as const;

function requireMgmt(role: string) {
  if (!(MGMT_ROLES as readonly string[]).includes(role)) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
}

export const recoveryRouter = router({
  // Hotel: create a recovery offer for an incident
  createOffer: protectedProcedure
    .input(
      z.object({
        incidentId: z.string().uuid(),
        offerType: z.enum([
          "DISCOUNT",
          "AMENITY_PASS",
          "DINING_CREDIT",
          "LATE_CHECKOUT",
          "REFUND_NOTE",
          "VIP_CREDIT",
        ]),
        description: z.string().min(1),
        valueCents: z.number().int().optional(),
        expiresAt: z.string().datetime().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      requireMgmt(ctx.session.role);

      const offer = await ctx.db.recoveryOffer.create({
        data: {
          tenantId: ctx.tenantId!,
          incidentId: input.incidentId,
          offerType: input.offerType,
          description: input.description,
          valueCents: input.valueCents,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
        },
      });

      await ctx.db.recoveryActionLog.create({
        data: {
          tenantId: ctx.tenantId!,
          incidentId: input.incidentId,
          actorId: ctx.session.userId,
          action: `Recovery offer created: ${input.offerType}`,
        },
      });

      return offer;
    }),

  // Guest: accept or decline an offer
  respondToOffer: protectedProcedure
    .input(
      z.object({
        offerId: z.string().uuid(),
        accept: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const offer = await ctx.db.recoveryOffer.findFirst({
        where: { id: input.offerId, tenantId: ctx.tenantId },
        include: { incident: { select: { guestId: true } } },
      });
      if (!offer) throw new TRPCError({ code: "NOT_FOUND" });

      // Only the affected guest can respond
      if (
        offer.incident.guestId &&
        offer.incident.guestId !== ctx.session.userId
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return ctx.db.recoveryOffer.update({
        where: { id: input.offerId },
        data: {
          status: input.accept ? "ACCEPTED" : "DECLINED",
          acceptedAt: input.accept ? new Date() : undefined,
        },
      });
    }),

  // Hotel: list offers for an incident
  listForIncident: protectedProcedure
    .input(z.object({ incidentId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.recoveryOffer.findMany({
        where: { incidentId: input.incidentId, tenantId: ctx.tenantId },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Hotel: get action log for an incident
  actionLog: protectedProcedure
    .input(z.object({ incidentId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      requireMgmt(ctx.session.role);
      return ctx.db.recoveryActionLog.findMany({
        where: { incidentId: input.incidentId, tenantId: ctx.tenantId },
        orderBy: { createdAt: "asc" },
      });
    }),

  // Hotel: add action log entry manually
  addLog: protectedProcedure
    .input(
      z.object({
        incidentId: z.string().uuid(),
        action: z.string().min(1),
        note: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      requireMgmt(ctx.session.role);
      return ctx.db.recoveryActionLog.create({
        data: {
          tenantId: ctx.tenantId!,
          incidentId: input.incidentId,
          actorId: ctx.session.userId,
          action: input.action,
          note: input.note,
        },
      });
    }),
});
