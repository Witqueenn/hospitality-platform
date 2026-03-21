import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "../trpc.js";
import { createVenueSchema } from "@repo/shared";

export const venueRouter = router({
  list: protectedProcedure
    .input(z.object({ hotelId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.venue.findMany({
        where: {
          hotelId: input.hotelId,
          tenantId: ctx.tenantId,
          isActive: true,
        },
        orderBy: { name: "asc" },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const venue = await ctx.db.venue.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      });
      if (!venue) throw new TRPCError({ code: "NOT_FOUND" });
      return venue;
    }),

  create: protectedProcedure
    .input(createVenueSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.venue.create({
        data: { ...input, tenantId: ctx.tenantId! },
      });
    }),

  update: protectedProcedure
    .input(
      z
        .object({ id: z.string().uuid() })
        .merge(createVenueSchema.partial().omit({ hotelId: true })),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.venue.update({ where: { id }, data });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.venue.update({
        where: { id: input.id },
        data: { isActive: false },
      });
    }),
});
