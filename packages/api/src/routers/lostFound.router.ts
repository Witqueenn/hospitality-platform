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

let lfCounter = 0;
function generateItemRef(): string {
  const ts = Date.now().toString(36).toUpperCase();
  lfCounter = (lfCounter + 1) % 9999;
  return `LF-${ts}-${String(lfCounter).padStart(4, "0")}`;
}

export const lostFoundRouter = router({
  // Hotel staff: log a found item
  logFound: protectedProcedure
    .input(
      z.object({
        hotelId: z.string().uuid(),
        description: z.string().min(1),
        category: z.string().optional(),
        foundAt: z.string().datetime(),
        foundLocation: z.string().optional(),
        storageLocation: z.string().optional(),
        photo: z.string().url().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!isHotelRole(ctx.session.role))
        throw new TRPCError({ code: "FORBIDDEN" });

      return ctx.db.lostFoundItem.create({
        data: {
          tenantId: ctx.tenantId!,
          hotelId: input.hotelId,
          itemRef: generateItemRef(),
          description: input.description,
          category: input.category,
          foundAt: new Date(input.foundAt),
          foundLocation: input.foundLocation,
          storageLocation: input.storageLocation,
          photo: input.photo,
          notes: input.notes,
          loggedById: ctx.session.userId,
          status: "STORED",
        },
      });
    }),

  // Hotel: list found items
  listItems: protectedProcedure
    .input(
      z.object({
        hotelId: z.string().uuid(),
        status: z
          .enum([
            "STORED",
            "CLAIMED",
            "SHIPPED",
            "RETURNED",
            "DONATED",
            "DISCARDED",
          ])
          .optional(),
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
      };

      const [items, total] = await Promise.all([
        ctx.db.lostFoundItem.findMany({
          where,
          include: {
            claims: { select: { id: true, status: true, guestId: true } },
          },
          orderBy: { foundAt: "desc" },
          skip,
          take: input.pageSize,
        }),
        ctx.db.lostFoundItem.count({ where }),
      ]);

      return { items, total, page: input.page, pageSize: input.pageSize };
    }),

  // Hotel: update item status
  updateItemStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum([
          "STORED",
          "CLAIMED",
          "SHIPPED",
          "RETURNED",
          "DONATED",
          "DISCARDED",
        ]),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!isHotelRole(ctx.session.role))
        throw new TRPCError({ code: "FORBIDDEN" });
      const { id, notes, ...data } = input;
      return ctx.db.lostFoundItem.update({
        where: { id },
        data: { ...data, ...(notes && { notes }) },
      });
    }),

  // Guest: report a lost item claim
  reportLost: protectedProcedure
    .input(
      z.object({
        bookingId: z.string().uuid().optional(),
        description: z.string().min(1),
        category: z.string().optional(),
        lostAt: z.string().datetime().optional(),
        lostLocation: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.lostFoundClaim.create({
        data: {
          tenantId: ctx.tenantId!,
          guestId: ctx.session.userId,
          bookingId: input.bookingId,
          description: input.description,
          category: input.category,
          lostAt: input.lostAt ? new Date(input.lostAt) : undefined,
          lostLocation: input.lostLocation,
          notes: input.notes,
          status: "OPEN",
        },
      });
    }),

  // Guest: list their claims
  myClaims: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.lostFoundClaim.findMany({
      where: { guestId: ctx.session.userId, tenantId: ctx.tenantId },
      include: {
        item: {
          select: { id: true, itemRef: true, description: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Hotel: list all claims
  listClaims: protectedProcedure
    .input(
      z.object({
        hotelId: z.string().uuid().optional(),
        status: z
          .enum([
            "OPEN",
            "MATCHED",
            "COLLECTING",
            "SHIPPED",
            "RESOLVED",
            "CLOSED",
          ])
          .optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!isHotelRole(ctx.session.role))
        throw new TRPCError({ code: "FORBIDDEN" });
      const skip = (input.page - 1) * input.pageSize;
      const where = {
        tenantId: ctx.tenantId,
        ...(input.status && { status: input.status }),
      };

      const [items, total] = await Promise.all([
        ctx.db.lostFoundClaim.findMany({
          where,
          include: {
            item: { select: { id: true, itemRef: true, description: true } },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: input.pageSize,
        }),
        ctx.db.lostFoundClaim.count({ where }),
      ]);
      return { items, total, page: input.page, pageSize: input.pageSize };
    }),

  // Hotel: match a claim to a found item
  matchClaimToItem: protectedProcedure
    .input(
      z.object({
        claimId: z.string().uuid(),
        itemId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!isHotelRole(ctx.session.role))
        throw new TRPCError({ code: "FORBIDDEN" });

      const [claim] = await Promise.all([
        ctx.db.lostFoundClaim.update({
          where: { id: input.claimId },
          data: { itemId: input.itemId, status: "MATCHED" },
        }),
        ctx.db.lostFoundItem.update({
          where: { id: input.itemId },
          data: { status: "CLAIMED" },
        }),
      ]);
      return claim;
    }),

  // Hotel: update claim status
  updateClaimStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum([
          "OPEN",
          "MATCHED",
          "COLLECTING",
          "SHIPPED",
          "RESOLVED",
          "CLOSED",
        ]),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!isHotelRole(ctx.session.role))
        throw new TRPCError({ code: "FORBIDDEN" });
      const { id, notes, ...data } = input;
      return ctx.db.lostFoundClaim.update({
        where: { id },
        data: {
          ...data,
          ...(notes && { notes }),
          ...(data.status === "RESOLVED" && { resolvedAt: new Date() }),
        },
      });
    }),
});
