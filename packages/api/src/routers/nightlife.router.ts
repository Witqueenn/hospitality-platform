import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc";

const NIGHT_TYPES = [
  "DJ_NIGHT",
  "LIVE_MUSIC",
  "VIP_LOUNGE",
  "COCKTAIL_PARTY",
  "THEMED_NIGHT",
  "POOL_PARTY",
  "COMEDY_SHOW",
  "OTHER",
] as const;

const nightInput = z.object({
  name: z.string().min(1),
  experienceType: z.enum(NIGHT_TYPES),
  description: z.string().optional(),
  date: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  priceCents: z.number().int().min(0).optional(),
  capacity: z.number().int().min(1).optional(),
  minAge: z.number().int().min(0).optional(),
  dressCode: z.string().optional(),
  features: z.array(z.string()).default([]),
});

export const nightlifeRouter = router({
  getPublic: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const exp = await ctx.db.nightExperience.findFirst({
        where: { id: input.id, isActive: true },
        include: {
          hotel: {
            select: {
              id: true,
              name: true,
              slug: true,
              starRating: true,
              address: true,
            },
          },
        },
      });
      if (!exp) throw new TRPCError({ code: "NOT_FOUND" });
      return exp;
    }),

  list: protectedProcedure
    .input(z.object({ hotelId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.nightExperience.findMany({
        where: { hotelId: input.hotelId, tenantId: ctx.tenantId },
        orderBy: { createdAt: "desc" },
      });
    }),

  create: protectedProcedure
    .input(z.object({ hotelId: z.string().uuid() }).merge(nightInput))
    .mutation(async ({ ctx, input }) => {
      const hotel = await ctx.db.hotel.findFirst({
        where: { id: input.hotelId, tenantId: ctx.tenantId },
        select: { tenantId: true },
      });
      if (!hotel) throw new TRPCError({ code: "NOT_FOUND" });
      return ctx.db.nightExperience.create({
        data: {
          hotelId: input.hotelId,
          tenantId: hotel.tenantId,
          name: input.name,
          experienceType: input.experienceType,
          description: input.description,
          date: input.date ? new Date(input.date) : undefined,
          startTime: input.startTime,
          endTime: input.endTime,
          priceCents: input.priceCents,
          capacity: input.capacity,
          minAge: input.minAge,
          dressCode: input.dressCode,
          features: input.features,
          photos: [],
        },
      });
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string().uuid() }).merge(nightInput.partial()))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const existing = await ctx.db.nightExperience.findFirst({
        where: { id, tenantId: ctx.tenantId },
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      return ctx.db.nightExperience.update({
        where: { id },
        data: {
          ...data,
          date: data.date ? new Date(data.date) : undefined,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.nightExperience.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      return ctx.db.nightExperience.update({
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
      const existing = await ctx.db.nightExperience.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      return ctx.db.nightExperience.update({
        where: { id: input.id },
        data: { photos: input.photos },
      });
    }),
});
