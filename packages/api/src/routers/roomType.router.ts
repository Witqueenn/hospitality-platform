import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "../trpc.js";
import { createRoomTypeSchema, inventoryUpdateSchema } from "@repo/shared";

export const roomTypeRouter = router({
  list: protectedProcedure
    .input(z.object({ hotelId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.roomType.findMany({
        where: { hotelId: input.hotelId, tenantId: ctx.tenantId },
        orderBy: { sortOrder: "asc" },
      });
    }),

  create: protectedProcedure
    .input(createRoomTypeSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.roomType.create({
        data: {
          ...input,
          tenantId: ctx.tenantId!,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z
        .object({ id: z.string().uuid() })
        .merge(createRoomTypeSchema.partial().omit({ hotelId: true })),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.roomType.update({ where: { id }, data });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.roomType.update({
        where: { id: input.id },
        data: { isActive: false },
      });
    }),
});

export const roomInventoryRouter = router({
  getCalendar: protectedProcedure
    .input(
      z.object({
        roomTypeId: z.string().uuid(),
        from: z.string().date(),
        to: z.string().date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.roomInventory.findMany({
        where: {
          roomTypeId: input.roomTypeId,
          tenantId: ctx.tenantId,
          date: {
            gte: new Date(input.from),
            lte: new Date(input.to),
          },
        },
        orderBy: { date: "asc" },
      });
    }),

  bulkUpsert: protectedProcedure
    .input(z.array(inventoryUpdateSchema))
    .mutation(async ({ ctx, input }) => {
      const results = await Promise.all(
        input.map((item) =>
          ctx.db.roomInventory.upsert({
            where: {
              roomTypeId_date: {
                roomTypeId: item.roomTypeId,
                date: new Date(item.date),
              },
            },
            create: {
              roomTypeId: item.roomTypeId,
              tenantId: ctx.tenantId!,
              date: new Date(item.date),
              totalCount: item.totalCount,
              availableCount: item.availableCount,
              pricePerNight: item.pricePerNight,
              minStay: item.minStay,
            },
            update: {
              totalCount: item.totalCount,
              availableCount: item.availableCount,
              pricePerNight: item.pricePerNight,
              minStay: item.minStay,
            },
          }),
        ),
      );

      return { updated: results.length };
    }),

  checkAvailability: protectedProcedure
    .input(
      z.object({
        roomTypeId: z.string().uuid(),
        checkIn: z.string().date(),
        checkOut: z.string().date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const inventory = await ctx.db.roomInventory.findMany({
        where: {
          roomTypeId: input.roomTypeId,
          date: {
            gte: new Date(input.checkIn),
            lt: new Date(input.checkOut),
          },
          availableCount: { gt: 0 },
        },
        orderBy: { date: "asc" },
      });

      const checkInDate = new Date(input.checkIn);
      const checkOutDate = new Date(input.checkOut);
      const nights = Math.ceil(
        (checkOutDate.getTime() - checkInDate.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      const isAvailable = inventory.length === nights;
      const totalCents = inventory.reduce(
        (sum, inv) => sum + inv.pricePerNight,
        0,
      );

      return { isAvailable, totalCents, nights, inventory };
    }),
});

export const availabilityRouter = router({
  check: protectedProcedure
    .input(
      z.object({
        hotelId: z.string().uuid(),
        checkIn: z.string().date(),
        checkOut: z.string().date(),
        guestCount: z.number().int().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const checkInDate = new Date(input.checkIn);
      const checkOutDate = new Date(input.checkOut);
      const nights = Math.ceil(
        (checkOutDate.getTime() - checkInDate.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      const roomTypes = await ctx.db.roomType.findMany({
        where: {
          hotelId: input.hotelId,
          isActive: true,
          capacity: { gte: input.guestCount },
        },
        include: {
          inventory: {
            where: {
              date: { gte: checkInDate, lt: checkOutDate },
              availableCount: { gt: 0 },
            },
          },
        },
      });

      return roomTypes
        .filter((rt) => rt.inventory.length === nights)
        .map((rt) => ({
          roomType: rt,
          totalCents: rt.inventory.reduce(
            (sum, inv) => sum + inv.pricePerNight,
            0,
          ),
          nights,
          minPrice: Math.min(...rt.inventory.map((i) => i.pricePerNight)),
        }));
    }),
});
