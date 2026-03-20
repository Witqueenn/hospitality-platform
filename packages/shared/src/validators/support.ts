import { z } from "zod";

export const createSupportCaseSchema = z.object({
  hotelId: z.string().uuid(),
  bookingId: z.string().uuid().optional(),
  category: z.enum([
    "ROOM_CLEANLINESS",
    "ROOM_NOT_READY",
    "NOISE_COMPLAINT",
    "WIFI_ISSUE",
    "AC_BROKEN",
    "WRONG_ROOM",
    "BILLING_ISSUE",
    "STAFF_BEHAVIOR",
    "SAFETY_CONCERN",
    "FOOD_QUALITY",
    "EVENT_ISSUE",
    "AMENITY_MISSING",
    "CHECK_IN_DELAY",
    "OTHER",
  ]),
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(5000),
  roomNumber: z.string().optional(),
});

export const updateCaseStatusSchema = z.object({
  caseId: z.string().uuid(),
  status: z.enum([
    "OPEN",
    "IN_PROGRESS",
    "AWAITING_HOTEL",
    "AWAITING_GUEST",
    "AWAITING_APPROVAL",
    "RESOLVED",
    "CLOSED",
    "ESCALATED",
  ]),
  note: z.string().max(2000).optional(),
});

export const assignCaseSchema = z.object({
  caseId: z.string().uuid(),
  assignedToId: z.string().uuid(),
});

export const addTimelineEntrySchema = z.object({
  caseId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  eventType: z.enum([
    "message",
    "status_change",
    "assignment",
    "compensation",
    "resolution",
  ]),
});

export const caseListSchema = z.object({
  hotelId: z.string().uuid().optional(),
  status: z
    .enum([
      "OPEN",
      "IN_PROGRESS",
      "AWAITING_HOTEL",
      "AWAITING_GUEST",
      "AWAITING_APPROVAL",
      "RESOLVED",
      "CLOSED",
      "ESCALATED",
    ])
    .optional(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  category: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export type CreateSupportCaseInput = z.infer<typeof createSupportCaseSchema>;
export type UpdateCaseStatusInput = z.infer<typeof updateCaseStatusSchema>;
