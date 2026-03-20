import { TRPCError } from "@trpc/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import type { Prisma } from "@prisma/client";
import { router, publicProcedure, protectedProcedure } from "../trpc.js";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
} from "@repo/shared";

export const authRouter = router({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      // Find or create default tenant
      let tenant = await ctx.db.tenant.findFirst({
        where: { slug: input.tenantSlug ?? "default" },
      });

      if (!tenant) {
        tenant = await ctx.db.tenant.create({
          data: {
            name: "Default",
            slug: "default",
            status: "ACTIVE",
          },
        });
      }

      // Check if email already taken within tenant
      const existing = await ctx.db.user.findFirst({
        where: { tenantId: tenant.id, email: input.email },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already registered",
        });
      }

      const passwordHash = await bcrypt.hash(input.password, 12);

      const user = await ctx.db.user.create({
        data: {
          tenantId: tenant.id,
          email: input.email,
          name: input.name,
          passwordHash,
          role: input.role,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          tenantId: true,
        },
      });

      return { user };
    }),

  login: publicProcedure.input(loginSchema).mutation(async ({ ctx, input }) => {
    const user = await ctx.db.user.findFirst({
      where: { email: input.email, isActive: true },
    });

    if (!user?.passwordHash) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid credentials",
      });
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid credentials",
      });
    }

    // Create session
    const token = crypto.randomBytes(48).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await ctx.db.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Update last login
    await ctx.db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        hotelId: user.hotelId,
      },
    };
  }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    const token = ctx.headers.get("authorization")?.replace("Bearer ", "");
    if (token) {
      await ctx.db.session.deleteMany({ where: { token } });
    }
    return { ok: true };
  }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        hotelId: true,
        avatarUrl: true,
        phone: true,
        preferences: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    return user;
  }),

  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.update({
        where: { id: ctx.session.userId },
        data: {
          ...(input.name !== undefined && { name: input.name }),
          ...(input.phone !== undefined && { phone: input.phone }),
          ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
          ...(input.preferences !== undefined && {
            preferences: input.preferences as Prisma.InputJsonValue,
          }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          avatarUrl: true,
          preferences: true,
        },
      });

      return user;
    }),

  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.userId },
      });

      if (!user?.passwordHash) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const valid = await bcrypt.compare(
        input.currentPassword,
        user.passwordHash,
      );
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Current password is incorrect",
        });
      }

      const passwordHash = await bcrypt.hash(input.newPassword, 12);
      await ctx.db.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });

      return { ok: true };
    }),

  listStaff: protectedProcedure
    .input(z.object({ hotelId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const staff = await ctx.db.user.findMany({
        where: {
          tenantId: ctx.tenantId,
          hotelId: input.hotelId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
        },
        orderBy: { name: "asc" },
      });

      return staff;
    }),

  inviteStaff: protectedProcedure
    .input(
      z.object({
        hotelId: z.string().uuid(),
        email: z.string().email(),
        name: z.string().min(2),
        role: z.enum([
          "HOTEL_ADMIN",
          "HOTEL_MANAGER",
          "FRONT_DESK",
          "RESERVATIONS_MANAGER",
          "EVENTS_MANAGER",
          "BANQUET_MANAGER",
          "FB_MANAGER",
          "GUEST_RELATIONS",
          "OPERATIONS_MANAGER",
          "FINANCE_APPROVER",
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (
        ctx.session.role !== "HOTEL_ADMIN" &&
        ctx.session.role !== "SUPER_ADMIN"
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const existing = await ctx.db.user.findFirst({
        where: { tenantId: ctx.tenantId, email: input.email },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already exists",
        });
      }

      // Generate temp password
      const tempPassword = crypto.randomBytes(12).toString("hex");
      const passwordHash = await bcrypt.hash(tempPassword, 12);

      const user = await ctx.db.user.create({
        data: {
          tenantId: ctx.tenantId!,
          hotelId: input.hotelId,
          email: input.email,
          name: input.name,
          passwordHash,
          role: input.role,
        },
        select: { id: true, email: true, name: true, role: true },
      });

      return { user, tempPassword };
    }),
});
