import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

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

function requireHotelRole(role: string) {
  if (!isHotelRole(role)) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
}

export const guestStayRouter = router({
  // Hotel staff: open a stay session on check-in
  openSession: protectedProcedure
    .input(
      z.object({
        bookingId: z.string().uuid(),
        guestId: z.string().uuid(),
        hotelId: z.string().uuid(),
        roomNumber: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      requireHotelRole(ctx.session.role);

      // Prevent duplicate active sessions
      const existing = await ctx.db.guestStaySession.findFirst({
        where: {
          bookingId: input.bookingId,
          status: "ACTIVE",
        },
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An active stay session already exists for this booking.",
        });
      }

      const session = await ctx.db.guestStaySession.create({
        data: {
          tenantId: ctx.tenantId!,
          hotelId: input.hotelId,
          bookingId: input.bookingId,
          guestId: input.guestId,
          roomNumber: input.roomNumber,
          status: "ACTIVE",
        },
      });

      return session;
    }),

  // Hotel staff: close session on check-out
  closeSession: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      requireHotelRole(ctx.session.role);

      const session = await ctx.db.guestStaySession.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      });
      if (!session) throw new TRPCError({ code: "NOT_FOUND" });

      return ctx.db.guestStaySession.update({
        where: { id: input.id },
        data: { status: "CHECKED_OUT", checkOutAt: new Date() },
      });
    }),

  // Guest: get their active stay
  myActive: protectedProcedure.query(async ({ ctx }) => {
    const session = await ctx.db.guestStaySession.findFirst({
      where: {
        guestId: ctx.session.userId,
        status: "ACTIVE",
      },
      include: {
        hotel: {
          select: { id: true, name: true, slug: true, contactInfo: true },
        },
        booking: {
          select: {
            id: true,
            bookingRef: true,
            checkIn: true,
            checkOut: true,
            guestCount: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });
    return session;
  }),

  // Guest or hotel: get session by id
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const session = await ctx.db.guestStaySession.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.tenantId,
          ...(ctx.session.role === "GUEST" && { guestId: ctx.session.userId }),
        },
        include: {
          hotel: { select: { id: true, name: true, slug: true } },
          booking: {
            select: {
              id: true,
              bookingRef: true,
              checkIn: true,
              checkOut: true,
            },
          },
          serviceRequests: { orderBy: { createdAt: "desc" }, take: 10 },
          messages: { orderBy: { createdAt: "desc" }, take: 20 },
        },
      });
      if (!session) throw new TRPCError({ code: "NOT_FOUND" });
      return session;
    }),

  // Hotel: list all active sessions
  listActive: protectedProcedure
    .input(
      z.object({
        hotelId: z.string().uuid(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      requireHotelRole(ctx.session.role);
      const skip = (input.page - 1) * input.pageSize;

      const [items, total] = await Promise.all([
        ctx.db.guestStaySession.findMany({
          where: {
            hotelId: input.hotelId,
            tenantId: ctx.tenantId,
            status: "ACTIVE",
          },
          include: {
            guest: { select: { id: true, name: true, email: true } },
            booking: {
              select: {
                id: true,
                bookingRef: true,
                checkIn: true,
                checkOut: true,
              },
            },
            serviceRequests: {
              where: { status: { in: ["PENDING", "ASSIGNED", "IN_PROGRESS"] } },
              select: { id: true, requestType: true, status: true },
            },
          },
          orderBy: { checkInAt: "desc" },
          skip,
          take: input.pageSize,
        }),
        ctx.db.guestStaySession.count({
          where: {
            hotelId: input.hotelId,
            tenantId: ctx.tenantId,
            status: "ACTIVE",
          },
        }),
      ]);

      return { items, total, page: input.page, pageSize: input.pageSize };
    }),

  // Hotel: mark a delivery flag
  markDelivered: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        field: z.enum([
          "welcomeSentAt",
          "wifiSentAt",
          "menusSentAt",
          "supportInfoSentAt",
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      requireHotelRole(ctx.session.role);
      return ctx.db.guestStaySession.update({
        where: { id: input.id },
        data: { [input.field]: new Date() },
      });
    }),
});
