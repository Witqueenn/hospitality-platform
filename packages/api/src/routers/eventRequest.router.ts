import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { router, protectedProcedure } from "../trpc.js";
import { createEventRequestSchema } from "@repo/shared";

export const eventRequestRouter = router({
  create: protectedProcedure
    .input(createEventRequestSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.eventRequest.create({
        data: {
          tenantId: ctx.tenantId!,
          hotelId: input.hotelId,
          requesterId: ctx.session.userId,
          eventType: input.eventType,
          title: input.title,
          description: input.description,
          eventDate: new Date(input.eventDate),
          startTime: input.startTime,
          endTime: input.endTime,
          guestCount: input.guestCount,
          budgetCents: input.budgetCents,
          requirements: input.requirements as Prisma.InputJsonValue,
          status: "INQUIRY",
        },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const req = await ctx.db.eventRequest.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.tenantId,
          ...(ctx.session.role === "GUEST" && {
            requesterId: ctx.session.userId,
          }),
        },
        include: {
          eventBooking: { include: { venue: true } },
          beo: true,
          requester: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
      });

      if (!req) throw new TRPCError({ code: "NOT_FOUND" });
      return req;
    }),

  list: protectedProcedure
    .input(
      z.object({
        hotelId: z.string().uuid().optional(),
        status: z
          .enum([
            "INQUIRY",
            "PROPOSAL_SENT",
            "NEGOTIATING",
            "CONFIRMED",
            "CANCELLED",
            "COMPLETED",
          ])
          .optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.pageSize;

      const where = {
        tenantId: ctx.tenantId,
        ...(ctx.session.role === "GUEST" && {
          requesterId: ctx.session.userId,
        }),
        ...(input.hotelId && { hotelId: input.hotelId }),
        ...(input.status && { status: input.status }),
      };

      const [items, total] = await Promise.all([
        ctx.db.eventRequest.findMany({
          where,
          include: {
            requester: { select: { id: true, name: true, email: true } },
            hotel: { select: { id: true, name: true } },
          },
          orderBy: { eventDate: "asc" },
          skip,
          take: input.pageSize,
        }),
        ctx.db.eventRequest.count({ where }),
      ]);

      return {
        items,
        total,
        page: input.page,
        pageSize: input.pageSize,
        hasNext: input.page * input.pageSize < total,
        hasPrev: input.page > 1,
      };
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum([
          "INQUIRY",
          "PROPOSAL_SENT",
          "NEGOTIATING",
          "CONFIRMED",
          "CANCELLED",
          "COMPLETED",
        ]),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.eventRequest.update({
        where: { id: input.id },
        data: {
          status: input.status,
          ...(input.status === "CONFIRMED" && { confirmedAt: new Date() }),
          ...(input.status === "PROPOSAL_SENT" && {
            proposalSentAt: new Date(),
          }),
          ...(input.notes && { internalNotes: input.notes }),
        },
      });
    }),

  createBEO: protectedProcedure
    .input(
      z.object({
        eventRequestId: z.string().uuid(),
        title: z.string(),
        content: z.record(z.unknown()).default({}),
        runOfShow: z.array(z.record(z.unknown())).default([]),
        fbRequirements: z.record(z.unknown()).default({}),
        staffingPlan: z.array(z.record(z.unknown())).default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.bEO.create({
        data: {
          tenantId: ctx.tenantId!,
          eventRequestId: input.eventRequestId,
          title: input.title,
          content: input.content as Prisma.InputJsonValue,
          runOfShow: input.runOfShow as Prisma.InputJsonValue,
          fbRequirements: input.fbRequirements as Prisma.InputJsonValue,
          staffingPlan: input.staffingPlan as Prisma.InputJsonValue,
          status: "DRAFT",
        },
      });
    }),

  approveBEO: protectedProcedure
    .input(z.object({ beoId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.bEO.update({
        where: { id: input.beoId },
        data: {
          status: "APPROVED",
          approvedBy: ctx.session.userId,
          approvedAt: new Date(),
        },
      });
    }),
});
