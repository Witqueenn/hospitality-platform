import { z } from "zod";

export const hotelAddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string().optional(),
  country: z.string(),
  postalCode: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const createHotelSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().max(5000).optional(),
  shortDescription: z.string().max(500).optional(),
  starRating: z.number().int().min(1).max(5).optional(),
  address: hotelAddressSchema,
  timezone: z.string().default("UTC"),
  currency: z.string().length(3).default("USD"),
});

export const updateHotelSchema = createHotelSchema
  .partial()
  .omit({ slug: true });

export const hotelSearchSchema = z.object({
  city: z.string().optional(),
  country: z.string().optional(),
  checkIn: z.string().date().optional(),
  checkOut: z.string().date().optional(),
  guestCount: z.number().int().min(1).default(1),
  starRating: z.number().int().min(1).max(5).optional(),
  amenities: z.array(z.string()).optional(),
  maxPriceCents: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export const createRoomTypeSchema = z.object({
  hotelId: z.string().uuid(),
  name: z.string().min(2).max(200),
  description: z.string().max(5000).optional(),
  capacity: z.number().int().min(1).max(20),
  bedType: z.string(),
  sizeSqm: z.number().positive().optional(),
  floor: z.string().optional(),
  features: z.array(z.string()).default([]),
  accessibilityFeatures: z.array(z.string()).default([]),
  noiseNotes: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

export const inventoryUpdateSchema = z.object({
  roomTypeId: z.string().uuid(),
  date: z.string().date(),
  totalCount: z.number().int().min(0),
  availableCount: z.number().int().min(0),
  pricePerNight: z.number().int().positive(),
  minStay: z.number().int().min(1).default(1),
});

export type CreateHotelInput = z.infer<typeof createHotelSchema>;
export type UpdateHotelInput = z.infer<typeof updateHotelSchema>;
export type HotelSearchInput = z.infer<typeof hotelSearchSchema>;
export type CreateRoomTypeInput = z.infer<typeof createRoomTypeSchema>;
export type InventoryUpdateInput = z.infer<typeof inventoryUpdateSchema>;
