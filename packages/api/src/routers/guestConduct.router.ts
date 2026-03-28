import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

// IMPORTANT: Conduct notes are STRICTLY INTERNAL.
// They must NEVER be exposed to guests or the public.
// Access is restricted to hotel management and platform ops.

const RESTRICTED_ROLES = [
  "HOTEL_ADMIN",
  "HOTEL_MANAGER",
  "GUEST_RELATIONS",
  "OPERATIONS_MANAGER",
  "SUPER_ADMIN",
  "PLATFORM_OPS",
] as const;

function requireRestricted(role: string) {
  if (!(RESTRICTED_ROLES as readonly string[]).includes(role)) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
}

export const guestConductRouter = router({
  // Hotel mgmt: create an internal conduct note
  create: protectedProcedure
    .input(
      z.object({
        staffProfileId: z.string().uuid(),
        guestId: z.string().uuid(),
        bookingId: z.string().uuid().optional(),
        noteType: z.enum([
          "RESPECTFUL",
          "HELPFUL",
          "COMPLAINT",
          "DAMAGE_RISK",
          "ABUSE",
          "SAFETY_ISSUE",
          "VIP",
        ]),
        severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("LOW"),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      requireRestricted(ctx.session.role);

      return ctx.db.staffGuestConductNote.create({
        data: {
          tenantId: ctx.tenantId!,
          staffProfileId: input.staffProfileId,
          guestId: input.guestId,
          bookingId: input.bookingId,
          noteType: input.noteType,
          severity: input.severity,
          content: input.content,
          isInternal: true, // Always true - enforced at data layer
          createdBy: ctx.session.userId,
        },
      });
    }),

  // Hotel mgmt: list conduct notes for a guest (internal only)
  listForGuest: protectedProcedure
    .input(z.object({ guestId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      requireRestricted(ctx.session.role);

      return ctx.db.staffGuestConductNote.findMany({
        where: {
          guestId: input.guestId,
          tenantId: ctx.tenantId,
          isInternal: true,
        },
        select: {
          id: true,
          noteType: true,
          severity: true,
          content: true,
          createdAt: true,
          bookingId: true,
          // Only show who created to mgmt
          createdBy: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Hotel mgmt: list conduct notes by staff profile
  listForStaff: protectedProcedure
    .input(z.object({ staffProfileId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      requireRestricted(ctx.session.role);

      return ctx.db.staffGuestConductNote.findMany({
        where: {
          staffProfileId: input.staffProfileId,
          tenantId: ctx.tenantId,
          isInternal: true,
        },
        select: {
          id: true,
          guestId: true,
          noteType: true,
          severity: true,
          content: true,
          createdAt: true,
          bookingId: true,
          createdBy: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Platform ops / admin: delete a note (for compliance/fairness)
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Only super admin or platform ops can delete notes
      if (!["SUPER_ADMIN", "PLATFORM_OPS"].includes(ctx.session.role)) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return ctx.db.staffGuestConductNote.delete({ where: { id: input.id } });
    }),
});
