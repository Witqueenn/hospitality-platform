import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

const REQUEST_TYPES = [
  "EXTRA_TOWELS",
  "HOUSEKEEPING",
  "ROOM_CLEANING",
  "MINIBAR_REFILL",
  "AC_ISSUE",
  "TV_INTERNET_ISSUE",
  "LUGGAGE_ASSISTANCE",
  "WAKE_UP_CALL",
  "BABY_CRIB",
  "MAINTENANCE",
  "OTHER",
] as const;

const HOTEL_ROLES = [
  "HOTEL_ADMIN",
  "HOTEL_MANAGER",
  "FRONT_DESK",
  "OPERATIONS_MANAGER",
  "GUEST_RELATIONS",
] as const;

function isHotelRole(role: string) {
  return (HOTEL_ROLES as readonly string[]).includes(role);
}

let reqCounter = 0;
function generateRequestRef(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, "0");
  reqCounter = (reqCounter + 1) % 1000;
  return `SRQ-${ts}-${rand}`;
}

export const guestServiceRequestRouter = router({
  // Guest: create a service request
  create: protectedProcedure
    .input(
      z.object({
        stayId: z.string().uuid(),
        hotelId: z.string().uuid(),
        requestType: z.enum(REQUEST_TYPES),
        description: z.string().optional(),
        roomNumber: z.string().optional(),
        scheduledFor: z.string().datetime().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify guest owns this stay
      const stay = await ctx.db.guestStaySession.findFirst({
        where: {
          id: input.stayId,
          status: "ACTIVE",
          ...(ctx.session.role === "GUEST" && { guestId: ctx.session.userId }),
        },
      });
      if (!stay) throw new TRPCError({ code: "NOT_FOUND" });

      return ctx.db.guestServiceRequest.create({
        data: {
          tenantId: ctx.tenantId!,
          hotelId: input.hotelId,
          stayId: input.stayId,
          guestId: ctx.session.userId,
          requestRef: generateRequestRef(),
          requestType: input.requestType,
          description: input.description,
          roomNumber: input.roomNumber ?? stay.roomNumber,
          scheduledFor: input.scheduledFor
            ? new Date(input.scheduledFor)
            : undefined,
        },
      });
    }),

  // Guest: get their own requests
  myRequests: protectedProcedure
    .input(
      z.object({
        stayId: z.string().uuid(),
        status: z
          .enum([
            "PENDING",
            "ASSIGNED",
            "IN_PROGRESS",
            "COMPLETED",
            "CANCELLED",
          ])
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.guestServiceRequest.findMany({
        where: {
          stayId: input.stayId,
          tenantId: ctx.tenantId,
          ...(ctx.session.role === "GUEST" && { guestId: ctx.session.userId }),
          ...(input.status && { status: input.status }),
        },
        include: {
          assignments: {
            take: 1,
            orderBy: { assignedAt: "desc" },
          },
          completions: {
            take: 1,
            orderBy: { completedAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Hotel: list service requests
  list: protectedProcedure
    .input(
      z.object({
        hotelId: z.string().uuid(),
        status: z
          .enum([
            "PENDING",
            "ASSIGNED",
            "IN_PROGRESS",
            "COMPLETED",
            "CANCELLED",
          ])
          .optional(),
        priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!isHotelRole(ctx.session.role)) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const skip = (input.page - 1) * input.pageSize;
      const where = {
        hotelId: input.hotelId,
        tenantId: ctx.tenantId,
        ...(input.status && { status: input.status }),
        ...(input.priority && { priority: input.priority }),
      };

      const [items, total] = await Promise.all([
        ctx.db.guestServiceRequest.findMany({
          where,
          include: {
            stay: {
              select: { id: true, roomNumber: true },
            },
            assignments: { take: 1, orderBy: { assignedAt: "desc" } },
          },
          orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
          skip,
          take: input.pageSize,
        }),
        ctx.db.guestServiceRequest.count({ where }),
      ]);

      return { items, total, page: input.page, pageSize: input.pageSize };
    }),

  // Hotel: get single request
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const req = await ctx.db.guestServiceRequest.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.tenantId,
          ...(ctx.session.role === "GUEST" && { guestId: ctx.session.userId }),
        },
        include: {
          assignments: { orderBy: { assignedAt: "asc" } },
          completions: { orderBy: { completedAt: "desc" } },
          stay: { select: { id: true, roomNumber: true, guestId: true } },
        },
      });
      if (!req) throw new TRPCError({ code: "NOT_FOUND" });
      return req;
    }),

  // Hotel: assign request
  assign: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        assignedTo: z.string().uuid(),
        note: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!isHotelRole(ctx.session.role))
        throw new TRPCError({ code: "FORBIDDEN" });

      const [updated] = await Promise.all([
        ctx.db.guestServiceRequest.update({
          where: { id: input.id },
          data: { status: "ASSIGNED" },
        }),
        ctx.db.serviceTaskAssignment.create({
          data: {
            tenantId: ctx.tenantId!,
            requestId: input.id,
            assignedTo: input.assignedTo,
            assignedBy: ctx.session.userId,
            note: input.note,
          },
        }),
      ]);
      return updated;
    }),

  // Hotel / Staff: update status
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum([
          "PENDING",
          "ASSIGNED",
          "IN_PROGRESS",
          "COMPLETED",
          "CANCELLED",
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!isHotelRole(ctx.session.role))
        throw new TRPCError({ code: "FORBIDDEN" });
      return ctx.db.guestServiceRequest.update({
        where: { id: input.id },
        data: { status: input.status },
      });
    }),

  // Staff: complete a request
  complete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        note: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!isHotelRole(ctx.session.role))
        throw new TRPCError({ code: "FORBIDDEN" });

      const [updated] = await Promise.all([
        ctx.db.guestServiceRequest.update({
          where: { id: input.id },
          data: { status: "COMPLETED" },
        }),
        ctx.db.taskCompletionLog.create({
          data: {
            tenantId: ctx.tenantId!,
            requestId: input.id,
            completedBy: ctx.session.userId,
            note: input.note,
          },
        }),
      ]);
      return updated;
    }),

  // Guest: rate completed request
  rate: protectedProcedure
    .input(
      z.object({
        requestId: z.string().uuid(),
        rating: z.number().int().min(1).max(5),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const log = await ctx.db.taskCompletionLog.findFirst({
        where: { requestId: input.requestId },
        orderBy: { completedAt: "desc" },
      });
      if (!log) throw new TRPCError({ code: "NOT_FOUND" });

      return ctx.db.taskCompletionLog.update({
        where: { id: log.id },
        data: { guestRating: input.rating },
      });
    }),
});
