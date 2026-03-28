import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCallerFactory, type Session } from "../trpc";
import { bookingRouter } from "../routers/booking.router";

// ── Mock @repo/db ─────────────────────────────────────────────────────────────
vi.mock("@repo/db", () => ({
  db: {
    roomInventory: { findMany: vi.fn(), update: vi.fn() },
    booking: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { db } from "@repo/db";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const GUEST_SESSION: Session = {
  userId: "user-1",
  tenantId: "tenant-1",
  role: "GUEST",
  email: "guest@test.com",
  name: "Alice",
};

const FRONT_DESK_SESSION: Session = {
  ...GUEST_SESSION,
  userId: "staff-1",
  role: "FRONT_DESK",
};

const BOOKING_INPUT = {
  hotelId: "00000000-0000-0000-0000-000000000001",
  roomTypeId: "00000000-0000-0000-0000-000000000002",
  checkIn: "2026-06-01",
  checkOut: "2026-06-03", // 2 nights
  guestCount: 2,
  childCount: 0,
};

const INVENTORY_ROWS = [
  {
    id: "inv-1",
    date: new Date("2026-06-01"),
    pricePerNight: 15000,
    availableCount: 3,
  },
  {
    id: "inv-2",
    date: new Date("2026-06-02"),
    pricePerNight: 15000,
    availableCount: 3,
  },
];

const CREATED_BOOKING = {
  id: "booking-1",
  bookingRef: "HEO-ABCD1234",
  status: "CONFIRMED",
  guestId: GUEST_SESSION.userId,
  hotelId: BOOKING_INPUT.hotelId,
  subtotalCents: 30000,
  taxCents: 3000,
  totalCents: 33000,
  items: [],
  hotel: { name: "Test Hotel", slug: "test-hotel" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const createCaller = createCallerFactory(bookingRouter);

function makeCaller(session: Session = GUEST_SESSION) {
  return createCaller({
    db,
    session,
    headers: new Headers(),
    tenantId: session.tenantId,
  });
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(db.$transaction).mockImplementation((fn) => fn(db));
  vi.mocked(db.roomInventory.findMany).mockResolvedValue(
    INVENTORY_ROWS as never,
  );
  vi.mocked(db.booking.create).mockResolvedValue(CREATED_BOOKING as never);
  vi.mocked(db.roomInventory.update).mockResolvedValue({} as never);
});

// ── create ────────────────────────────────────────────────────────────────────

describe("booking.create", () => {
  it("creates a booking and returns id", async () => {
    const booking = await makeCaller().create(BOOKING_INPUT);

    expect(booking.id).toBeDefined();
    expect(booking.bookingRef).toMatch(/^HEO-/);
  });

  it("calculates total as subtotal + 10% tax", async () => {
    const booking = await makeCaller().create(BOOKING_INPUT);

    // 2 nights × 15 000 = 30 000 subtotal, 3 000 tax, 33 000 total
    expect(booking.subtotalCents).toBe(30000);
    expect(booking.taxCents).toBe(3000);
    expect(booking.totalCents).toBe(33000);
  });

  it("throws BAD_REQUEST when check-out is before check-in", async () => {
    await expect(
      makeCaller().create({ ...BOOKING_INPUT, checkOut: "2026-05-30" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("throws CONFLICT when inventory is insufficient", async () => {
    // Only 1 inventory row for a 2-night stay
    vi.mocked(db.roomInventory.findMany).mockResolvedValue([
      INVENTORY_ROWS[0]!,
    ] as never);

    await expect(makeCaller().create(BOOKING_INPUT)).rejects.toMatchObject({
      code: "CONFLICT",
      message: expect.stringContaining("not available"),
    });
  });

  it("decrements availableCount for each night in a transaction", async () => {
    await makeCaller().create(BOOKING_INPUT);

    expect(db.$transaction).toHaveBeenCalledOnce();
    expect(db.roomInventory.update).toHaveBeenCalledTimes(
      INVENTORY_ROWS.length,
    );
    expect(db.roomInventory.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { availableCount: { decrement: 1 } },
      }),
    );
  });
});

// ── cancel ────────────────────────────────────────────────────────────────────

describe("booking.cancel", () => {
  it("cancels a CONFIRMED booking", async () => {
    vi.mocked(db.booking.findFirst).mockResolvedValue({
      ...CREATED_BOOKING,
      status: "CONFIRMED",
    } as never);
    vi.mocked(db.booking.update).mockResolvedValue({
      ...CREATED_BOOKING,
      status: "CANCELLED",
    } as never);

    const result = await makeCaller().cancel({ bookingId: "booking-1" });

    expect(result.status).toBe("CANCELLED");
    expect(db.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "CANCELLED",
          cancelledAt: expect.any(Date),
        }),
      }),
    );
  });

  it("throws BAD_REQUEST when booking is already CHECKED_IN", async () => {
    vi.mocked(db.booking.findFirst).mockResolvedValue({
      ...CREATED_BOOKING,
      status: "CHECKED_IN",
    } as never);

    await expect(
      makeCaller().cancel({ bookingId: "booking-1" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("throws NOT_FOUND for a booking that does not belong to the guest", async () => {
    vi.mocked(db.booking.findFirst).mockResolvedValue(null);

    await expect(
      makeCaller().cancel({ bookingId: "booking-999" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

// ── checkIn ───────────────────────────────────────────────────────────────────

describe("booking.checkIn", () => {
  it("allows FRONT_DESK to check in a CONFIRMED booking", async () => {
    vi.mocked(db.booking.findFirst).mockResolvedValue({
      ...CREATED_BOOKING,
      status: "CONFIRMED",
    } as never);
    vi.mocked(db.booking.update).mockResolvedValue({
      ...CREATED_BOOKING,
      status: "CHECKED_IN",
    } as never);

    const result = await makeCaller(FRONT_DESK_SESSION).checkIn({
      bookingId: "booking-1",
    });

    expect(result.status).toBe("CHECKED_IN");
  });

  it("throws FORBIDDEN when a GUEST attempts check-in", async () => {
    await expect(
      makeCaller(GUEST_SESSION).checkIn({ bookingId: "booking-1" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
