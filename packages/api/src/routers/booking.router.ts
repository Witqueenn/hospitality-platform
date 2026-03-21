import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "../trpc.js";
import {
  createBookingSchema,
  cancelBookingSchema,
  bookingListSchema,
  generateBookingRef,
} from "@repo/shared";

export const bookingRouter = router({
  create: protectedProcedure
    .input(createBookingSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        hotelId,
        roomTypeId,
        checkIn,
        checkOut,
        guestCount,
        childCount,
        specialRequests,
      } = input;

      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      if (checkOutDate <= checkInDate) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Check-out must be after check-in",
        });
      }

      const nights = Math.ceil(
        (checkOutDate.getTime() - checkInDate.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      // Check availability
      const inventory = await ctx.db.roomInventory.findMany({
        where: {
          roomTypeId,
          date: { gte: checkInDate, lt: checkOutDate },
          availableCount: { gt: 0 },
        },
      });

      if (inventory.length < nights) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Room not available for selected dates",
        });
      }

      const subtotalCents = inventory.reduce(
        (sum, inv) => sum + inv.pricePerNight,
        0,
      );
      const taxCents = Math.floor(subtotalCents * 0.1); // 10% tax
      const totalCents = subtotalCents + taxCents;
      const bookingRef = generateBookingRef();

      // Create booking + decrement inventory in a transaction
      const booking = await ctx.db.$transaction(async (tx) => {
        const newBooking = await tx.booking.create({
          data: {
            tenantId: ctx.tenantId!,
            hotelId,
            guestId: ctx.session.userId,
            bookingType: "ROOM",
            bookingRef,
            status: "CONFIRMED",
            checkIn: checkInDate,
            checkOut: checkOutDate,
            guestCount,
            childCount,
            subtotalCents,
            taxCents,
            totalCents,
            paymentStatus: "PENDING",
            specialRequests,
            items: {
              create: {
                tenantId: ctx.tenantId!,
                itemType: "ROOM",
                referenceId: roomTypeId,
                description: `Room stay: ${nights} night(s)`,
                quantity: nights,
                unitCents: Math.floor(subtotalCents / nights),
                totalCents: subtotalCents,
              },
            },
          },
          include: {
            items: true,
            hotel: { select: { name: true, slug: true } },
          },
        });

        // Decrement available count
        await Promise.all(
          inventory.map((inv) =>
            tx.roomInventory.update({
              where: { id: inv.id },
              data: { availableCount: { decrement: 1 } },
            }),
          ),
        );

        return newBooking;
      });

      return booking;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const booking = await ctx.db.booking.findFirst({
        where: {
          id: input.id,
          ...(ctx.session.role === "GUEST" && { guestId: ctx.session.userId }),
        },
        include: {
          items: true,
          hotel: {
            select: {
              id: true,
              name: true,
              slug: true,
              address: true,
              contactInfo: true,
            },
          },
          guest: { select: { id: true, name: true, email: true, phone: true } },
          supportCases: {
            select: { id: true, caseRef: true, status: true, severity: true },
          },
        },
      });

      if (!booking) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return booking;
    }),

  list: protectedProcedure
    .input(bookingListSchema)
    .query(async ({ ctx, input }) => {
      const { hotelId, status, page, pageSize } = input;
      const skip = (page - 1) * pageSize;

      const where = {
        tenantId: ctx.tenantId,
        ...(ctx.session.role === "GUEST" && { guestId: ctx.session.userId }),
        ...(hotelId && { hotelId }),
        ...(status && { status }),
      };

      const [bookings, total] = await Promise.all([
        ctx.db.booking.findMany({
          where,
          include: {
            hotel: { select: { id: true, name: true, slug: true } },
            guest: { select: { id: true, name: true, email: true } },
            items: {
              include: {
                roomType: { select: { id: true, name: true, bedType: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: pageSize,
        }),
        ctx.db.booking.count({ where }),
      ]);

      return {
        items: bookings,
        total,
        page,
        pageSize,
        hasNext: page * pageSize < total,
        hasPrev: page > 1,
      };
    }),

  cancel: protectedProcedure
    .input(cancelBookingSchema)
    .mutation(async ({ ctx, input }) => {
      const booking = await ctx.db.booking.findFirst({
        where: {
          id: input.bookingId,
          tenantId: ctx.tenantId,
          ...(ctx.session.role === "GUEST" && { guestId: ctx.session.userId }),
        },
      });

      if (!booking) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (!["PENDING", "CONFIRMED"].includes(booking.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Booking cannot be cancelled in its current state",
        });
      }

      return ctx.db.booking.update({
        where: { id: input.bookingId },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          internalNotes: input.reason ?? null,
        },
      });
    }),

  checkIn: protectedProcedure
    .input(
      z.object({
        bookingId: z.string().uuid(),
        roomNumber: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const staffRoles = [
        "FRONT_DESK",
        "RESERVATIONS_MANAGER",
        "HOTEL_ADMIN",
      ] as const;
      if (
        !staffRoles.includes(ctx.session.role as (typeof staffRoles)[number])
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const booking = await ctx.db.booking.findFirst({
        where: {
          id: input.bookingId,
          tenantId: ctx.tenantId,
          status: "CONFIRMED",
        },
      });

      if (!booking) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Confirmed booking not found",
        });
      }

      return ctx.db.booking.update({
        where: { id: input.bookingId },
        data: {
          status: "CHECKED_IN",
          checkedInAt: new Date(),
          ...(input.notes && { internalNotes: input.notes }),
        },
      });
    }),

  checkOut: protectedProcedure
    .input(
      z.object({ bookingId: z.string().uuid(), notes: z.string().optional() }),
    )
    .mutation(async ({ ctx, input }) => {
      const staffRoles = [
        "FRONT_DESK",
        "RESERVATIONS_MANAGER",
        "HOTEL_ADMIN",
      ] as const;
      if (
        !staffRoles.includes(ctx.session.role as (typeof staffRoles)[number])
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return ctx.db.booking.update({
        where: { id: input.bookingId },
        data: {
          status: "CHECKED_OUT",
          checkedOutAt: new Date(),
          ...(input.notes && { internalNotes: input.notes }),
        },
      });
    }),

  markNoShow: protectedProcedure
    .input(z.object({ bookingId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.booking.update({
        where: { id: input.bookingId },
        data: { status: "NO_SHOW" },
      });
    }),
});
