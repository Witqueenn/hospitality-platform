import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "../trpc.js";

export const tenantRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.role !== "SUPER_ADMIN") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    return ctx.db.tenant.findMany({ orderBy: { createdAt: "desc" } });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      if (
        ctx.session.role !== "SUPER_ADMIN" &&
        ctx.session.tenantId !== input.id
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return ctx.db.tenant.findUnique({ where: { id: input.id } });
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        slug: z.string(),
        billingPlan: z.string().default("starter"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.role !== "SUPER_ADMIN")
        throw new TRPCError({ code: "FORBIDDEN" });

      return ctx.db.tenant.create({
        data: {
          name: input.name,
          slug: input.slug,
          billingPlan: input.billingPlan,
          status: "ACTIVE",
        },
      });
    }),

  suspend: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.role !== "SUPER_ADMIN")
        throw new TRPCError({ code: "FORBIDDEN" });
      return ctx.db.tenant.update({
        where: { id: input.id },
        data: { status: "SUSPENDED" },
      });
    }),

  activate: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.role !== "SUPER_ADMIN")
        throw new TRPCError({ code: "FORBIDDEN" });
      return ctx.db.tenant.update({
        where: { id: input.id },
        data: { status: "ACTIVE" },
      });
    }),

  upsertPolicy: protectedProcedure
    .input(
      z.object({
        tenantId: z.string().uuid(),
        policyKey: z.string(),
        policyValue: z.unknown(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (
        ctx.session.role !== "SUPER_ADMIN" &&
        ctx.session.role !== "PLATFORM_OPS"
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return ctx.db.tenantPolicy.upsert({
        where: {
          tenantId_policyKey: {
            tenantId: input.tenantId,
            policyKey: input.policyKey,
          },
        },
        create: {
          tenantId: input.tenantId,
          policyKey: input.policyKey,
          policyValue: input.policyValue as object,
          description: input.description,
        },
        update: {
          policyValue: input.policyValue as object,
          description: input.description,
        },
      });
    }),

  listPolicies: protectedProcedure
    .input(z.object({ tenantId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.tenantPolicy.findMany({
        where: { tenantId: input.tenantId },
      });
    }),
});
