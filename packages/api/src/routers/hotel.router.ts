import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { router, protectedProcedure, publicProcedure } from "../trpc.js";
import {
  createHotelSchema,
  updateHotelSchema,
  hotelSearchSchema,
} from "@repo/shared";

export const hotelRouter = router({
  search: publicProcedure
    .input(hotelSearchSchema)
    .query(async ({ ctx, input }) => {
      const {
        city,
        country,
        checkIn,
        checkOut,
        guestCount,
        starRating,
        maxPriceCents,
        tags,
        page,
        pageSize,
      } = input;
      const skip = (page - 1) * pageSize;

      const hotels = await ctx.db.hotel.findMany({
        where: {
          status: "ACTIVE",
          ...(city && {
            address: {
              path: ["city"],
              string_contains: city,
            },
          }),
          ...(country && {
            address: {
              path: ["country"],
              string_contains: country,
            },
          }),
          ...(starRating && { starRating }),
        },
        include: {
          roomTypes: {
            where: { isActive: true },
            include: {
              inventory: {
                where: {
                  ...(checkIn &&
                    checkOut && {
                      date: { gte: new Date(checkIn), lte: new Date(checkOut) },
                    }),
                  availableCount: { gt: 0 },
                },
              },
            },
          },
          reviews: {
            where: { moderationStatus: "APPROVED" },
            select: { overallScore: true },
          },
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      });

      const total = await ctx.db.hotel.count({ where: { status: "ACTIVE" } });

      return {
        items: hotels,
        total,
        page,
        pageSize,
        hasNext: page * pageSize < total,
        hasPrev: page > 1,
      };
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const hotel = await ctx.db.hotel.findFirst({
        where: { slug: input.slug, status: "ACTIVE" },
        include: {
          roomTypes: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
          },
          venues: { where: { isActive: true } },
          diningExperiences: { where: { isActive: true } },
          nightExperiences: { where: { isActive: true } },
          reviews: {
            where: { moderationStatus: "APPROVED" },
            orderBy: { createdAt: "desc" },
            take: 10,
            include: { guest: { select: { name: true, avatarUrl: true } } },
          },
        },
      });

      if (!hotel) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Hotel not found" });
      }

      return hotel;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const hotel = await ctx.db.hotel.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
        include: {
          roomTypes: true,
          venues: true,
          staff: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isActive: true,
            },
          },
        },
      });

      if (!hotel) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return hotel;
    }),

  list: protectedProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.pageSize;

      const [hotels, total] = await Promise.all([
        ctx.db.hotel.findMany({
          where: { tenantId: ctx.tenantId },
          orderBy: { createdAt: "desc" },
          skip,
          take: input.pageSize,
        }),
        ctx.db.hotel.count({ where: { tenantId: ctx.tenantId } }),
      ]);

      return {
        items: hotels,
        total,
        page: input.page,
        pageSize: input.pageSize,
        hasNext: input.page * input.pageSize < total,
        hasPrev: input.page > 1,
      };
    }),

  create: protectedProcedure
    .input(createHotelSchema)
    .mutation(async ({ ctx, input }) => {
      if (
        ctx.session.role !== "SUPER_ADMIN" &&
        ctx.session.role !== "PLATFORM_OPS"
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const existing = await ctx.db.hotel.findFirst({
        where: { tenantId: ctx.tenantId, slug: input.slug },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Hotel slug already exists",
        });
      }

      const hotel = await ctx.db.hotel.create({
        data: {
          tenantId: ctx.tenantId!,
          name: input.name,
          slug: input.slug,
          description: input.description,
          shortDescription: input.shortDescription,
          starRating: input.starRating,
          address: input.address,
          timezone: input.timezone,
          currency: input.currency,
          status: "DRAFT",
        },
      });

      return hotel;
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string().uuid() }).merge(updateHotelSchema))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const hotel = await ctx.db.hotel.findFirst({
        where: { id, tenantId: ctx.tenantId },
      });

      if (!hotel) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return ctx.db.hotel.update({
        where: { id },
        data,
      });
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum([
          "DRAFT",
          "PENDING_VERIFICATION",
          "ACTIVE",
          "SUSPENDED",
          "ARCHIVED",
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const allowedRoles = [
        "SUPER_ADMIN",
        "PLATFORM_OPS",
        "HOTEL_ADMIN",
      ] as const;
      if (
        !allowedRoles.includes(
          ctx.session.role as (typeof allowedRoles)[number],
        )
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return ctx.db.hotel.update({
        where: { id: input.id },
        data: { status: input.status },
      });
    }),

  updatePhotos: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        photos: z.array(
          z.object({
            url: z.string().url(),
            caption: z.string().optional(),
            category: z.string().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.hotel.update({
        where: { id: input.id },
        data: { photos: input.photos },
      });
    }),

  updateAmenities: protectedProcedure
    .input(z.object({ id: z.string().uuid(), amenities: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.hotel.update({
        where: { id: input.id },
        data: { amenities: input.amenities },
      });
    }),

  updatePolicies: protectedProcedure
    .input(z.object({ id: z.string().uuid(), policies: z.record(z.unknown()) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.hotel.update({
        where: { id: input.id },
        data: { policies: input.policies as Prisma.InputJsonValue },
      });
    }),
});
