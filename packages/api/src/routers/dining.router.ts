import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "../trpc.js";

const DINING_TYPES = [
  "RESTAURANT",
  "ROOM_SERVICE",
  "BRUNCH",
  "ROOFTOP",
  "PRIVATE_DINING",
  "GROUP_DINING",
  "BUFFET",
] as const;

const diningInput = z.object({
  name: z.string().min(1),
  diningType: z.enum(DINING_TYPES),
  description: z.string().optional(),
  cuisine: z.array(z.string()).default([]),
  capacity: z.number().int().min(1).optional(),
  priceRange: z.string().optional(),
  menuHighlights: z.array(z.string()).default([]),
});

export const diningRouter = router({
  list: protectedProcedure
    .input(z.object({ hotelId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.diningExperience.findMany({
        where: { hotelId: input.hotelId, tenantId: ctx.tenantId },
        orderBy: { name: "asc" },
      });
    }),

  create: protectedProcedure
    .input(z.object({ hotelId: z.string().uuid() }).merge(diningInput))
    .mutation(async ({ ctx, input }) => {
      const hotel = await ctx.db.hotel.findFirst({
        where: { id: input.hotelId, tenantId: ctx.tenantId },
        select: { tenantId: true },
      });
      if (!hotel) throw new TRPCError({ code: "NOT_FOUND" });
      return ctx.db.diningExperience.create({
        data: {
          hotelId: input.hotelId,
          tenantId: hotel.tenantId,
          name: input.name,
          diningType: input.diningType,
          description: input.description,
          cuisine: input.cuisine,
          capacity: input.capacity,
          priceRange: input.priceRange,
          menuHighlights: input.menuHighlights,
          openHours: {},
        },
      });
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string().uuid() }).merge(diningInput.partial()))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const existing = await ctx.db.diningExperience.findFirst({
        where: { id, tenantId: ctx.tenantId },
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      return ctx.db.diningExperience.update({ where: { id }, data });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.diningExperience.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      return ctx.db.diningExperience.update({
        where: { id: input.id },
        data: { isActive: false },
      });
    }),

  updatePhotos: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        photos: z.array(
          z.object({
            url: z.string().url(),
            thumb: z.string().url(),
            alt: z.string(),
            credit: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.diningExperience.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      return ctx.db.diningExperience.update({
        where: { id: input.id },
        data: { photos: input.photos },
      });
    }),
});
