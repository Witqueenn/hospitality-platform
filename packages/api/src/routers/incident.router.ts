import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "../trpc.js";

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

let incCounter = 0;
function generateIncidentRef(): string {
  const ts = Date.now().toString(36).toUpperCase();
  incCounter = (incCounter + 1) % 1000;
  return `INC-${ts}-${String(incCounter).padStart(3, "0")}`;
}

export const incidentRouter = router({
  // Guest or hotel: report an incident
  create: protectedProcedure
    .input(
      z.object({
        hotelId: z.string().uuid(),
        stayId: z.string().uuid().optional(),
        bookingId: z.string().uuid().optional(),
        category: z.enum([
          "ROOM_ISSUE",
          "SERVICE_FAILURE",
          "STAFF_COMPLAINT",
          "FACILITY_ISSUE",
          "BILLING_DISPUTE",
          "NOISE_COMPLAINT",
          "SAFETY_CONCERN",
          "FOOD_QUALITY",
          "OTHER",
        ]),
        severity: z
          .enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
          .default("MEDIUM"),
        title: z.string().min(1),
        description: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const slaMap: Record<string, number> = {
        LOW: 48,
        MEDIUM: 24,
        HIGH: 8,
        CRITICAL: 2,
      };

      const dueAt = new Date(
        Date.now() + slaMap[input.severity]! * 60 * 60 * 1000,
      );

      return ctx.db.serviceIncident.create({
        data: {
          tenantId: ctx.tenantId!,
          hotelId: input.hotelId,
          guestId:
            ctx.session.role === "GUEST" ? ctx.session.userId : undefined,
          bookingId: input.bookingId,
          stayId: input.stayId,
          incidentRef: generateIncidentRef(),
          category: input.category,
          severity: input.severity,
          title: input.title,
          description: input.description,
          status: "OPEN",
          slaHours: slaMap[input.severity],
          dueAt,
        },
      });
    }),

  // Hotel: list incidents
  list: protectedProcedure
    .input(
      z.object({
        hotelId: z.string().uuid(),
        status: z
          .enum([
            "OPEN",
            "IN_PROGRESS",
            "AWAITING_RESPONSE",
            "RESOLVED",
            "CLOSED",
          ])
          .optional(),
        severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!isHotelRole(ctx.session.role))
        throw new TRPCError({ code: "FORBIDDEN" });

      const skip = (input.page - 1) * input.pageSize;
      const where = {
        hotelId: input.hotelId,
        tenantId: ctx.tenantId,
        ...(input.status && { status: input.status }),
        ...(input.severity && { severity: input.severity }),
      };

      const [items, total] = await Promise.all([
        ctx.db.serviceIncident.findMany({
          where,
          include: {
            resolutions: { take: 1, orderBy: { createdAt: "desc" } },
            recoveryOffers: {
              where: { status: "PENDING" },
              select: { id: true, offerType: true, status: true },
            },
          },
          orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
          skip,
          take: input.pageSize,
        }),
        ctx.db.serviceIncident.count({ where }),
      ]);

      return { items, total, page: input.page, pageSize: input.pageSize };
    }),

  // Get single incident
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const incident = await ctx.db.serviceIncident.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.tenantId,
          ...(ctx.session.role === "GUEST" && { guestId: ctx.session.userId }),
        },
        include: {
          resolutions: { orderBy: { createdAt: "desc" } },
          recoveryOffers: { orderBy: { createdAt: "desc" } },
          actionLogs: { orderBy: { createdAt: "asc" } },
        },
      });
      if (!incident) throw new TRPCError({ code: "NOT_FOUND" });
      return incident;
    }),

  // Hotel: update status
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum([
          "OPEN",
          "IN_PROGRESS",
          "AWAITING_RESPONSE",
          "RESOLVED",
          "CLOSED",
        ]),
        note: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!isHotelRole(ctx.session.role))
        throw new TRPCError({ code: "FORBIDDEN" });

      const updates: Record<string, unknown> = { status: input.status };
      if (input.status === "RESOLVED") updates.resolvedAt = new Date();

      const [incident] = await Promise.all([
        ctx.db.serviceIncident.update({
          where: { id: input.id },
          data: updates,
        }),
        ctx.db.recoveryActionLog.create({
          data: {
            tenantId: ctx.tenantId!,
            incidentId: input.id,
            actorId: ctx.session.userId,
            action: `Status updated to ${input.status}`,
            note: input.note,
          },
        }),
      ]);
      return incident;
    }),

  // Hotel: assign to team/person
  assign: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        assignedToId: z.string().uuid().optional(),
        assignedTeam: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!isHotelRole(ctx.session.role))
        throw new TRPCError({ code: "FORBIDDEN" });
      const { id, ...data } = input;
      return ctx.db.serviceIncident.update({ where: { id }, data });
    }),

  // Hotel: add resolution
  resolve: protectedProcedure
    .input(
      z.object({
        incidentId: z.string().uuid(),
        resolution: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!isHotelRole(ctx.session.role))
        throw new TRPCError({ code: "FORBIDDEN" });

      const [resolution] = await Promise.all([
        ctx.db.serviceResolution.create({
          data: {
            tenantId: ctx.tenantId!,
            incidentId: input.incidentId,
            resolvedBy: ctx.session.userId,
            resolution: input.resolution,
          },
        }),
        ctx.db.serviceIncident.update({
          where: { id: input.incidentId },
          data: { status: "RESOLVED", resolvedAt: new Date() },
        }),
      ]);
      return resolution;
    }),

  // Guest: confirm resolution
  confirmResolution: protectedProcedure
    .input(
      z.object({
        resolutionId: z.string().uuid(),
        confirmed: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.serviceResolution.update({
        where: { id: input.resolutionId },
        data: {
          guestConfirmed: input.confirmed,
          confirmedAt: new Date(),
        },
      });
    }),
});
