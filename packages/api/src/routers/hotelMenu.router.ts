import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "../trpc.js";

const MENU_TYPES = [
  "BREAKFAST",
  "LUNCH",
  "DINNER",
  "ALL_DAY",
  "ROOM_SERVICE",
  "POOLSIDE",
  "BAR",
  "BRUNCH",
  "TASTING",
  "SPECIAL",
] as const;

const MGMT_ROLES = [
  "HOTEL_ADMIN",
  "HOTEL_MANAGER",
  "FB_MANAGER",
  "OPERATIONS_MANAGER",
] as const;

function requireMgmt(role: string) {
  if (!(MGMT_ROLES as readonly string[]).includes(role)) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
}

export const hotelMenuRouter = router({
  // Public / guest: list menus for a hotel
  listForHotel: protectedProcedure
    .input(
      z.object({
        hotelId: z.string().uuid(),
        menuType: z.enum(MENU_TYPES).optional(),
        activeOnly: z.boolean().default(true),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.hotelVenueMenu.findMany({
        where: {
          hotelId: input.hotelId,
          tenantId: ctx.tenantId,
          ...(input.activeOnly && { isActive: true }),
          ...(input.menuType && { menuType: input.menuType }),
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      });
    }),

  // Guest: get menus for their active stay
  forStay: protectedProcedure
    .input(z.object({ stayId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const stay = await ctx.db.guestStaySession.findFirst({
        where: {
          id: input.stayId,
          guestId: ctx.session.userId,
          status: "ACTIVE",
        },
        select: { hotelId: true },
      });
      if (!stay) throw new TRPCError({ code: "NOT_FOUND" });

      return ctx.db.hotelVenueMenu.findMany({
        where: {
          hotelId: stay.hotelId,
          tenantId: ctx.tenantId,
          isActive: true,
        },
        orderBy: [{ sortOrder: "asc" }],
      });
    }),

  // Hotel staff: get single menu
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const menu = await ctx.db.hotelVenueMenu.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      });
      if (!menu) throw new TRPCError({ code: "NOT_FOUND" });
      return menu;
    }),

  // Admin: create menu
  create: protectedProcedure
    .input(
      z.object({
        hotelId: z.string().uuid(),
        venueRef: z.string().uuid().optional(),
        name: z.string().min(1),
        description: z.string().optional(),
        menuType: z.enum(MENU_TYPES),
        content: z.record(z.unknown()).optional(),
        isActive: z.boolean().default(true),
        sortOrder: z.number().int().default(0),
        validFrom: z.string().datetime().optional(),
        validUntil: z.string().datetime().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      requireMgmt(ctx.session.role);
      return ctx.db.hotelVenueMenu.create({
        data: {
          tenantId: ctx.tenantId!,
          hotelId: input.hotelId,
          venueRef: input.venueRef,
          name: input.name,
          description: input.description,
          menuType: input.menuType,
          content: (input.content ?? {}) as object,
          isActive: input.isActive,
          sortOrder: input.sortOrder,
          validFrom: input.validFrom ? new Date(input.validFrom) : undefined,
          validUntil: input.validUntil ? new Date(input.validUntil) : undefined,
        },
      });
    }),

  // Admin: update menu
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        menuType: z.enum(MENU_TYPES).optional(),
        content: z.record(z.unknown()).optional(),
        isActive: z.boolean().optional(),
        sortOrder: z.number().int().optional(),
        validFrom: z.string().datetime().optional(),
        validUntil: z.string().datetime().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      requireMgmt(ctx.session.role);
      const { id, validFrom, validUntil, content, ...rest } = input;
      return ctx.db.hotelVenueMenu.update({
        where: { id },
        data: {
          ...rest,
          ...(content !== undefined && { content: content as object }),
          ...(validFrom && { validFrom: new Date(validFrom) }),
          ...(validUntil && { validUntil: new Date(validUntil) }),
        },
      });
    }),

  // Admin: delete
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      requireMgmt(ctx.session.role);
      return ctx.db.hotelVenueMenu.delete({ where: { id: input.id } });
    }),
});
