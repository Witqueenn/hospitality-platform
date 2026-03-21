import { z } from "zod";

export const createEventRequestSchema = z.object({
  hotelId: z.string().uuid(),
  eventType: z.enum([
    "MEETING",
    "CONFERENCE",
    "WORKSHOP",
    "WEDDING",
    "GALA_DINNER",
    "LAUNCH_EVENT",
    "PRIVATE_EVENT",
    "CORPORATE_RETREAT",
    "BIRTHDAY",
    "OTHER",
  ]),
  title: z.string().min(3).max(200),
  description: z.string().max(5000).optional(),
  eventDate: z.string().date(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  guestCount: z.number().int().min(1),
  budgetCents: z.number().int().positive().optional(),
  requirements: z.record(z.unknown()).default({}),
});

export const createVenueSchema = z.object({
  hotelId: z.string().uuid(),
  name: z.string().min(2).max(200),
  description: z.string().max(5000).optional(),
  floorLevel: z.string().optional(),
  sizeSquareMeters: z.number().positive().optional(),
  capacities: z.record(z.number().int().positive()),
  defaultLayout: z
    .enum([
      "THEATER",
      "CLASSROOM",
      "U_SHAPE",
      "BOARDROOM",
      "BANQUET_ROUND",
      "COCKTAIL",
      "HOLLOW_SQUARE",
      "CUSTOM",
    ])
    .optional(),
  availableLayouts: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  avEquipment: z.array(z.string()).default([]),
  ratePerHour: z.number().int().positive().optional(),
  ratePerDay: z.number().int().positive().optional(),
});

export type CreateEventRequestInput = z.infer<typeof createEventRequestSchema>;
export type CreateVenueInput = z.infer<typeof createVenueSchema>;
