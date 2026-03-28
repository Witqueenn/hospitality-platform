import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "../trpc.js";

const STATUSES = [
  "SUBMITTED",
  "SHORTLISTED",
  "INTERVIEW",
  "REJECTED",
  "HIRED",
] as const;
const HR_ROLES = [
  "HOTEL_ADMIN",
  "HOTEL_MANAGER",
  "SUPER_ADMIN",
  "PLATFORM_OPS",
] as const;

function isHR(role: string) {
  return (HR_ROLES as readonly string[]).includes(role);
}

export const jobApplicationRouter = router({
  // Guest/user: apply to a job
  submit: protectedProcedure
    .input(
      z.object({
        postingId: z.string().uuid(),
        coverLetter: z.string().optional(),
        appType: z
          .enum(["INTERNAL_STAFF", "OPEN_MARKET", "INTERNSHIP"])
          .default("OPEN_MARKET"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check posting is open
      const posting = await ctx.db.jobPosting.findFirst({
        where: {
          id: input.postingId,
          status: "PUBLISHED",
          tenantId: ctx.tenantId,
        },
        select: { id: true, title: true },
      });
      if (!posting) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job posting not found or not open.",
        });
      }

      // Prevent duplicate application
      const existing = await ctx.db.jobApplication.findFirst({
        where: { postingId: input.postingId, applicantId: ctx.session.userId },
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You have already applied to this position.",
        });
      }

      const application = await ctx.db.jobApplication.create({
        data: {
          tenantId: ctx.tenantId!,
          postingId: input.postingId,
          applicantId: ctx.session.userId,
          appType: input.appType,
          coverLetter: input.coverLetter,
          status: "SUBMITTED",
        },
      });

      // Log initial status
      await ctx.db.applicationStatusHistory.create({
        data: {
          tenantId: ctx.tenantId!,
          applicationId: application.id,
          fromStatus: "SUBMITTED",
          toStatus: "SUBMITTED",
          changedBy: ctx.session.userId,
          note: "Application submitted",
        },
      });

      return application;
    }),

  // User: list their applications
  myApplications: protectedProcedure
    .input(
      z.object({
        status: z.enum(STATUSES).optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.pageSize;
      const where = {
        applicantId: ctx.session.userId,
        tenantId: ctx.tenantId,
        ...(input.status && { status: input.status }),
      };

      const [items, total] = await Promise.all([
        ctx.db.jobApplication.findMany({
          where,
          include: {
            posting: {
              select: {
                id: true,
                title: true,
                city: true,
                country: true,
                employmentType: true,
                status: true,
                slug: true,
                hotel: { select: { name: true } },
              },
            },
            interviews: { orderBy: { scheduledAt: "asc" }, take: 1 },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: input.pageSize,
        }),
        ctx.db.jobApplication.count({ where }),
      ]);

      return { items, total, page: input.page, pageSize: input.pageSize };
    }),

  // HR: list applications for a posting
  listByPosting: protectedProcedure
    .input(
      z.object({
        postingId: z.string().uuid(),
        status: z.enum(STATUSES).optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!isHR(ctx.session.role)) throw new TRPCError({ code: "FORBIDDEN" });

      const skip = (input.page - 1) * input.pageSize;
      const where = {
        postingId: input.postingId,
        tenantId: ctx.tenantId,
        ...(input.status && { status: input.status }),
      };

      const [items, total] = await Promise.all([
        ctx.db.jobApplication.findMany({
          where,
          include: {
            interviews: { orderBy: { scheduledAt: "desc" }, take: 1 },
            recruiterNotes: { orderBy: { createdAt: "asc" } },
          },
          orderBy: { createdAt: "asc" },
          skip,
          take: input.pageSize,
        }),
        ctx.db.jobApplication.count({ where }),
      ]);

      return { items, total, page: input.page, pageSize: input.pageSize };
    }),

  // HR: get application detail
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const app = await ctx.db.jobApplication.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.tenantId,
          ...(isHR(ctx.session.role)
            ? {}
            : { applicantId: ctx.session.userId }),
        },
        include: {
          posting: {
            include: {
              hotel: { select: { id: true, name: true } },
              requirements: true,
              benefits: true,
            },
          },
          interviews: { orderBy: { scheduledAt: "asc" } },
          statusHistory: { orderBy: { createdAt: "asc" } },
          recruiterNotes: isHR(ctx.session.role)
            ? { orderBy: { createdAt: "desc" } }
            : false,
        },
      });
      if (!app) throw new TRPCError({ code: "NOT_FOUND" });
      return app;
    }),

  // HR: update application status
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(STATUSES),
        note: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!isHR(ctx.session.role)) throw new TRPCError({ code: "FORBIDDEN" });

      const current = await ctx.db.jobApplication.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
        select: { status: true },
      });
      if (!current) throw new TRPCError({ code: "NOT_FOUND" });

      const [updated] = await Promise.all([
        ctx.db.jobApplication.update({
          where: { id: input.id },
          data: { status: input.status },
        }),
        ctx.db.applicationStatusHistory.create({
          data: {
            tenantId: ctx.tenantId!,
            applicationId: input.id,
            fromStatus: current.status,
            toStatus: input.status,
            changedBy: ctx.session.userId,
            note: input.note,
          },
        }),
      ]);
      return updated;
    }),

  // HR: schedule interview
  scheduleInterview: protectedProcedure
    .input(
      z.object({
        applicationId: z.string().uuid(),
        scheduledAt: z.string().datetime(),
        format: z.string().default("video"),
        interviewerIds: z.array(z.string().uuid()).default([]),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!isHR(ctx.session.role)) throw new TRPCError({ code: "FORBIDDEN" });

      const [interview] = await Promise.all([
        ctx.db.jobInterview.create({
          data: {
            tenantId: ctx.tenantId!,
            applicationId: input.applicationId,
            scheduledAt: new Date(input.scheduledAt),
            format: input.format,
            interviewerIds: input.interviewerIds,
            notes: input.notes,
          },
        }),
        ctx.db.jobApplication.update({
          where: { id: input.applicationId },
          data: { status: "INTERVIEW" },
        }),
      ]);
      return interview;
    }),

  // HR: add recruiter note
  addNote: protectedProcedure
    .input(
      z.object({
        applicationId: z.string().uuid(),
        content: z.string().min(1),
        isPrivate: z.boolean().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!isHR(ctx.session.role)) throw new TRPCError({ code: "FORBIDDEN" });

      return ctx.db.recruiterNote.create({
        data: {
          tenantId: ctx.tenantId!,
          applicationId: input.applicationId,
          authorId: ctx.session.userId,
          content: input.content,
          isPrivate: input.isPrivate,
        },
      });
    }),
});
