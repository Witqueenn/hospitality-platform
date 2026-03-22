import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "../trpc.js";

const MGMT_ROLES = [
  "HOTEL_ADMIN",
  "HOTEL_MANAGER",
  "OPERATIONS_MANAGER",
] as const;

function requireMgmt(role: string) {
  if (!(MGMT_ROLES as readonly string[]).includes(role)) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
}

export const hotelWifiRouter = router({
  // Admin: list all wifi credentials for a hotel
  list: protectedProcedure
    .input(z.object({ hotelId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      requireMgmt(ctx.session.role);
      return ctx.db.hotelWifiCredential.findMany({
        where: { hotelId: input.hotelId, tenantId: ctx.tenantId },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      });
    }),

  // Guest: get wifi for their active stay (masked for security - returns data)
  forGuest: protectedProcedure
    .input(z.object({ stayId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Verify this guest owns this stay
      const stay = await ctx.db.guestStaySession.findFirst({
        where: {
          id: input.stayId,
          guestId: ctx.session.userId,
          status: "ACTIVE",
        },
        select: { hotelId: true },
      });
      if (!stay) throw new TRPCError({ code: "NOT_FOUND" });

      return ctx.db.hotelWifiCredential.findMany({
        where: {
          hotelId: stay.hotelId,
          tenantId: ctx.tenantId,
          isActive: true,
        },
        select: {
          id: true,
          networkName: true,
          password: true,
          zone: true,
          description: true,
          sortOrder: true,
        },
        orderBy: [{ sortOrder: "asc" }],
      });
    }),

  // Admin: create wifi credential
  create: protectedProcedure
    .input(
      z.object({
        hotelId: z.string().uuid(),
        networkName: z.string().min(1),
        password: z.string().min(1),
        zone: z.string().optional(),
        description: z.string().optional(),
        sortOrder: z.number().int().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      requireMgmt(ctx.session.role);
      return ctx.db.hotelWifiCredential.create({
        data: {
          tenantId: ctx.tenantId!,
          hotelId: input.hotelId,
          networkName: input.networkName,
          password: input.password,
          zone: input.zone,
          description: input.description,
          sortOrder: input.sortOrder ?? 0,
        },
      });
    }),

  // Admin: update
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        networkName: z.string().min(1).optional(),
        password: z.string().min(1).optional(),
        zone: z.string().optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
        sortOrder: z.number().int().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      requireMgmt(ctx.session.role);
      const { id, ...data } = input;
      return ctx.db.hotelWifiCredential.update({
        where: { id },
        data,
      });
    }),

  // Admin: delete
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      requireMgmt(ctx.session.role);
      return ctx.db.hotelWifiCredential.delete({ where: { id: input.id } });
    }),
});
