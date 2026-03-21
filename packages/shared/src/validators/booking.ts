import { z } from "zod";

export const createBookingSchema = z.object({
  hotelId: z.string().uuid(),
  roomTypeId: z.string().uuid(),
  checkIn: z.string().date(),
  checkOut: z.string().date(),
  guestCount: z.number().int().min(1).max(20),
  childCount: z.number().int().min(0).default(0),
  specialRequests: z.string().max(2000).optional(),
});

export const cancelBookingSchema = z.object({
  bookingId: z.string().uuid(),
  reason: z.string().max(1000).optional(),
});

export const checkInSchema = z.object({
  bookingId: z.string().uuid(),
  roomNumber: z.string().optional(),
  notes: z.string().optional(),
});

export const checkOutSchema = z.object({
  bookingId: z.string().uuid(),
  notes: z.string().optional(),
});

export const bookingListSchema = z.object({
  hotelId: z.string().uuid().optional(),
  status: z
    .enum([
      "PENDING",
      "CONFIRMED",
      "CHECKED_IN",
      "CHECKED_OUT",
      "CANCELLED",
      "NO_SHOW",
    ])
    .optional(),
  checkIn: z.string().date().optional(),
  checkOut: z.string().date().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type BookingListInput = z.infer<typeof bookingListSchema>;
