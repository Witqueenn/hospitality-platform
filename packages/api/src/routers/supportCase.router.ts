import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "../trpc.js";
import {
  createSupportCaseSchema,
  updateCaseStatusSchema,
  assignCaseSchema,
  addTimelineEntrySchema,
  caseListSchema,
  generateCaseRef,
  SLA,
} from "@repo/shared";
import type { CaseSeverity } from "@prisma/client";

function computeSLADeadlines(severity: CaseSeverity) {
  const slaConfig = SLA[severity as keyof typeof SLA];
  const now = new Date();
  const responseDeadline = new Date(
    now.getTime() + slaConfig.responseMinutes * 60 * 1000,
  );
  const resolutionDeadline = new Date(
    now.getTime() + slaConfig.resolutionMinutes * 60 * 1000,
  );
  return { responseDeadline, resolutionDeadline };
}

export const supportCaseRouter = router({
  create: protectedProcedure
    .input(createSupportCaseSchema)
    .mutation(async ({ ctx, input }) => {
      const caseRef = generateCaseRef();
      const severity: CaseSeverity =
        input.category === "SAFETY_CONCERN" ? "CRITICAL" : "MEDIUM";

      const { responseDeadline, resolutionDeadline } =
        computeSLADeadlines(severity);

      const supportCase = await ctx.db.supportCase.create({
        data: {
          tenantId: ctx.tenantId!,
          hotelId: input.hotelId,
          guestId: ctx.session.userId,
          bookingId: input.bookingId,
          caseRef,
          category: input.category,
          severity,
          status: "OPEN",
          title: input.title,
          description: input.description,
          roomNumber: input.roomNumber,
          responseDeadline,
          resolutionDeadline,
          timeline: {
            create: {
              tenantId: ctx.tenantId!,
              actorType: "guest",
              actorId: ctx.session.userId,
              actorName: ctx.session.name,
              eventType: "message",
              content: input.description,
            },
          },
        },
        include: { timeline: true },
      });

      return supportCase;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const supportCase = await ctx.db.supportCase.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.tenantId,
          ...(ctx.session.role === "GUEST" && { guestId: ctx.session.userId }),
        },
        include: {
          timeline: { orderBy: { createdAt: "asc" } },
          compensations: true,
          guest: { select: { id: true, name: true, email: true } },
          assignedTo: { select: { id: true, name: true, role: true } },
          booking: {
            select: {
              id: true,
              bookingRef: true,
              checkIn: true,
              checkOut: true,
            },
          },
        },
      });

      if (!supportCase) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return supportCase;
    }),

  list: protectedProcedure
    .input(caseListSchema)
    .query(async ({ ctx, input }) => {
      const { hotelId, status, severity, page, pageSize } = input;
      const skip = (page - 1) * pageSize;

      const where = {
        tenantId: ctx.tenantId,
        ...(ctx.session.role === "GUEST" && { guestId: ctx.session.userId }),
        ...(hotelId && { hotelId }),
        ...(status && { status }),
        ...(severity && { severity }),
      };

      const [cases, total] = await Promise.all([
        ctx.db.supportCase.findMany({
          where,
          include: {
            guest: { select: { id: true, name: true } },
            assignedTo: { select: { id: true, name: true } },
            hotel: { select: { id: true, name: true } },
          },
          orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
          skip,
          take: pageSize,
        }),
        ctx.db.supportCase.count({ where }),
      ]);

      return {
        items: cases,
        total,
        page,
        pageSize,
        hasNext: page * pageSize < total,
        hasPrev: page > 1,
      };
    }),

  updateStatus: protectedProcedure
    .input(updateCaseStatusSchema)
    .mutation(async ({ ctx, input }) => {
      const supportCase = await ctx.db.supportCase.findFirst({
        where: { id: input.caseId, tenantId: ctx.tenantId },
      });

      if (!supportCase) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const updateData: Record<string, unknown> = { status: input.status };

      if (input.status === "RESOLVED") {
        updateData["resolvedAt"] = new Date();
      } else if (input.status === "CLOSED") {
        updateData["closedAt"] = new Date();
      }

      const [updatedCase] = await Promise.all([
        ctx.db.supportCase.update({
          where: { id: input.caseId },
          data: updateData,
        }),
        input.note &&
          ctx.db.caseTimeline.create({
            data: {
              caseId: input.caseId,
              tenantId: ctx.tenantId!,
              actorType: "staff",
              actorId: ctx.session.userId,
              actorName: ctx.session.name,
              eventType: "status_change",
              content: input.note,
              metadata: { from: supportCase.status, to: input.status },
            },
          }),
      ]);

      return updatedCase;
    }),

  assign: protectedProcedure
    .input(assignCaseSchema)
    .mutation(async ({ ctx, input }) => {
      const [updatedCase] = await Promise.all([
        ctx.db.supportCase.update({
          where: { id: input.caseId },
          data: { assignedToId: input.assignedToId, status: "IN_PROGRESS" },
        }),
        ctx.db.caseTimeline.create({
          data: {
            caseId: input.caseId,
            tenantId: ctx.tenantId!,
            actorType: "staff",
            actorId: ctx.session.userId,
            actorName: ctx.session.name,
            eventType: "assignment",
            content: `Case assigned to staff member`,
            metadata: { assignedToId: input.assignedToId },
          },
        }),
      ]);

      return updatedCase;
    }),

  addTimelineEntry: protectedProcedure
    .input(addTimelineEntrySchema)
    .mutation(async ({ ctx, input }) => {
      const isGuest = ctx.session.role === "GUEST";

      return ctx.db.caseTimeline.create({
        data: {
          caseId: input.caseId,
          tenantId: ctx.tenantId!,
          actorType: isGuest ? "guest" : "staff",
          actorId: ctx.session.userId,
          actorName: ctx.session.name,
          eventType: input.eventType,
          content: input.content,
        },
      });
    }),

  proposeCompensation: protectedProcedure
    .input(
      z.object({
        caseId: z.string().uuid(),
        compensationType: z.enum([
          "ROOM_UPGRADE",
          "LATE_CHECKOUT",
          "EARLY_CHECKIN",
          "BREAKFAST_INCLUDED",
          "PARTIAL_REFUND",
          "FULL_REFUND",
          "SERVICE_VOUCHER",
          "AMENITY_CREDIT",
          "EVENT_DISCOUNT",
          "FREE_NIGHT",
          "OTHER",
        ]),
        description: z.string(),
        valueCents: z.number().int().positive().optional(),
        reasoning: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const AUTO_APPROVE_MAX = Number(
        process.env["COMPENSATION_AUTO_APPROVE_MAX_CENTS"] ?? 2500,
      );

      const requiresApproval =
        (input.valueCents ?? 0) > AUTO_APPROVE_MAX ||
        input.compensationType === "FULL_REFUND" ||
        input.compensationType === "FREE_NIGHT";

      return ctx.db.compensationAction.create({
        data: {
          tenantId: ctx.tenantId!,
          caseId: input.caseId,
          compensationType: input.compensationType,
          description: input.description,
          valueCents: input.valueCents,
          reasoning: input.reasoning,
          requiresApproval,
          status: requiresApproval ? "PENDING_APPROVAL" : "PROPOSED",
        },
      });
    }),

  approveCompensation: protectedProcedure
    .input(
      z.object({
        compensationId: z.string().uuid(),
        note: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const approverRoles = [
        "GUEST_RELATIONS",
        "OPERATIONS_MANAGER",
        "FINANCE_APPROVER",
        "HOTEL_ADMIN",
      ] as const;

      if (
        !approverRoles.includes(
          ctx.session.role as (typeof approverRoles)[number],
        )
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const approval = await ctx.db.approvalRequest.create({
        data: {
          tenantId: ctx.tenantId!,
          requestType: "compensation",
          referenceId: input.compensationId,
          referenceType: "compensation_action",
          requestedBy: ctx.session.userId,
          summary: input.note ?? "Compensation approved",
          status: "approved",
          approverId: ctx.session.userId,
          approverNote: input.note,
          decidedAt: new Date(),
        },
      });

      return ctx.db.compensationAction.update({
        where: { id: input.compensationId },
        data: {
          status: "APPROVED",
          approvalId: approval.id,
        },
      });
    }),

  executeCompensation: protectedProcedure
    .input(z.object({ compensationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.compensationAction.update({
        where: { id: input.compensationId },
        data: { status: "EXECUTED", executedAt: new Date() },
      });
    }),
});
