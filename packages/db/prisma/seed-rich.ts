/**
 * seed-rich.ts
 * Comprehensive data enrichment for the hospitality platform.
 * Safe to run multiple times — uses findFirst guards before creating.
 *
 * Run:
 *   DATABASE_URL="postgresql://dev:devpass@localhost:5432/hospitality_platform" \
 *   npx tsx packages/db/prisma/seed-rich.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d;
}

function daysAgo(n: number): Date {
  return daysFromNow(-n);
}

/** Ensure a GUEST user exists; return the record either way. */
async function ensureGuest(
  tenantId: string,
  email: string,
  name: string,
  passwordHash: string,
  preferences: object = {},
) {
  const existing = await db.user.findFirst({
    where: { tenantId, email },
  });
  if (existing) return existing;
  return db.user.create({
    data: { tenantId, email, name, passwordHash, role: "GUEST", preferences },
  });
}

/** Ensure a staff user (HOTEL_ADMIN | FRONT_DESK) exists; return the record. */
async function ensureStaff(
  tenantId: string,
  hotelId: string,
  email: string,
  name: string,
  passwordHash: string,
  role: "HOTEL_ADMIN" | "FRONT_DESK",
) {
  const existing = await db.user.findFirst({ where: { tenantId, email } });
  if (existing) return existing;
  return db.user.create({
    data: { tenantId, hotelId, email, name, passwordHash, role },
  });
}

/** Create a booking only if bookingRef doesn't already exist. */
async function ensureBooking(
  data: Parameters<typeof db.booking.create>[0]["data"],
) {
  const existing = await db.booking.findFirst({
    where: { bookingRef: data.bookingRef as string },
  });
  if (existing) {
    console.log(`  skip booking ${data.bookingRef} (already exists)`);
    return existing;
  }
  return db.booking.create({ data });
}

/** Create a support case only if caseRef doesn't exist. */
async function ensureSupportCase(
  data: Parameters<typeof db.supportCase.create>[0]["data"],
) {
  const existing = await db.supportCase.findFirst({
    where: { caseRef: data.caseRef as string },
  });
  if (existing) {
    console.log(`  skip case ${data.caseRef} (already exists)`);
    return existing;
  }
  return db.supportCase.create({ data });
}

/** Create a review only if the exact (hotelId, guestId, title) combo is absent. */
async function ensureReview(
  data: Parameters<typeof db.review.create>[0]["data"],
) {
  const existing = await db.review.findFirst({
    where: {
      hotelId: data.hotelId as string,
      guestId: data.guestId as string,
      title: data.title as string,
    },
  });
  if (existing) {
    console.log(`  skip review "${data.title}" (already exists)`);
    return existing;
  }
  return db.review.create({ data });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== seed-rich.ts starting ===\n");

  // ── Resolve existing tenant & hotels ──────────────────────────────────────
  const tenant = await db.tenant.findFirst({ where: { slug: "grand-hotels" } });
  if (!tenant)
    throw new Error("Tenant 'grand-hotels' not found. Run seed.ts first.");

  const hotel1 = await db.hotel.findFirst({
    where: { tenantId: tenant.id, slug: "grand-palace-istanbul" },
  });
  if (!hotel1) throw new Error("hotel1 (Grand Palace Istanbul) not found.");

  const hotel2 = await db.hotel.findFirst({
    where: { tenantId: tenant.id, slug: "boutique-athens" },
  });
  if (!hotel2) throw new Error("hotel2 (The Athens Boutique) not found.");

  // Fetch existing hotel1 front-desk staff for assignment
  const h1FrontDesk = await db.user.findFirst({
    where: { tenantId: tenant.id, email: "frontdesk@grandpalace.com" },
  });

  console.log("Resolved tenant:", tenant.name);
  console.log("Resolved hotel1:", hotel1.name);
  console.log("Resolved hotel2:", hotel2.name, "\n");

  // ─── Shared password hash ────────────────────────────────────────────────
  const staffHash = await bcrypt.hash("staff123456", 12);
  const guestHash = await bcrypt.hash("guest123456", 12);

  // ═══════════════════════════════════════════════════════════════════════════
  // HOTEL 2 — THE ATHENS BOUTIQUE
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("── Athens Boutique ──────────────────────────────────────────");

  // ── Staff ─────────────────────────────────────────────────────────────────
  const athensAdmin = await ensureStaff(
    tenant.id,
    hotel2.id,
    "manager@athensb.com",
    "Nikos Papadopoulos",
    staffHash,
    "HOTEL_ADMIN",
  );
  const athensFD = await ensureStaff(
    tenant.id,
    hotel2.id,
    "frontdesk@athensb.com",
    "Sofia Georgiou",
    staffHash,
    "FRONT_DESK",
  );
  console.log("  + Athens staff users: Nikos Papadopoulos, Sofia Georgiou");

  // ── Room Types ─────────────────────────────────────────────────────────────
  let classicDouble = await db.roomType.findFirst({
    where: { hotelId: hotel2.id, name: "Classic Double" },
  });
  if (!classicDouble) {
    classicDouble = await db.roomType.create({
      data: {
        hotelId: hotel2.id,
        tenantId: tenant.id,
        name: "Classic Double",
        description:
          "Elegantly appointed double room with city views and classic Greek décor.",
        capacity: 2,
        bedType: "double",
        sizeSqm: 28,
        floor: "Floors 1-3",
        features: ["city-view", "minibar", "air-conditioning", "safe"],
        sortOrder: 1,
      },
    });
    console.log("  + Room type: Classic Double");
  } else {
    console.log("  skip room type: Classic Double (exists)");
  }

  let acropolisViewSuite = await db.roomType.findFirst({
    where: { hotelId: hotel2.id, name: "Acropolis View Suite" },
  });
  if (!acropolisViewSuite) {
    acropolisViewSuite = await db.roomType.create({
      data: {
        hotelId: hotel2.id,
        tenantId: tenant.id,
        name: "Acropolis View Suite",
        description:
          "Premium suite with direct Acropolis view, separate lounge, and marble bathroom.",
        capacity: 2,
        bedType: "king",
        sizeSqm: 52,
        floor: "Floors 4-5",
        features: [
          "acropolis-view",
          "minibar",
          "bathtub",
          "balcony",
          "espresso-machine",
          "premium-amenities",
        ],
        sortOrder: 2,
      },
    });
    console.log("  + Room type: Acropolis View Suite");
  } else {
    console.log("  skip room type: Acropolis View Suite (exists)");
  }

  let deluxeTwin = await db.roomType.findFirst({
    where: { hotelId: hotel2.id, name: "Deluxe Twin" },
  });
  if (!deluxeTwin) {
    deluxeTwin = await db.roomType.create({
      data: {
        hotelId: hotel2.id,
        tenantId: tenant.id,
        name: "Deluxe Twin",
        description:
          "Spacious twin room ideal for colleagues or friends, with contemporary décor.",
        capacity: 2,
        bedType: "twin",
        sizeSqm: 32,
        floor: "Floors 2-4",
        features: ["city-view", "minibar", "work-desk", "air-conditioning"],
        sortOrder: 3,
      },
    });
    console.log("  + Room type: Deluxe Twin");
  } else {
    console.log("  skip room type: Deluxe Twin (exists)");
  }

  // ── Room Inventory — 30 days ──────────────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let inventoryCreated = 0;
  const athensRoomTypes = [
    { rt: classicDouble, total: 10, basePrice: 12000 },
    { rt: acropolisViewSuite, total: 4, basePrice: 22000 },
    { rt: deluxeTwin, total: 6, basePrice: 15000 },
  ];

  for (let i = 0; i < 30; i++) {
    const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
    for (const { rt, total, basePrice } of athensRoomTypes) {
      const existing = await db.roomInventory.findFirst({
        where: { roomTypeId: rt.id, date },
      });
      if (!existing) {
        const weekendSurcharge =
          date.getDay() === 5 || date.getDay() === 6 ? 2000 : 0;
        await db.roomInventory.create({
          data: {
            roomTypeId: rt.id,
            tenantId: tenant.id,
            date,
            totalCount: total,
            availableCount:
              i % 6 === 0
                ? Math.max(1, Math.floor(total * 0.3))
                : Math.floor(total * 0.7),
            pricePerNight: basePrice + weekendSurcharge,
            minStay: 1,
          },
        });
        inventoryCreated++;
      }
    }
  }
  console.log(
    `  + Room inventory: ${inventoryCreated} slots created (30 days x 3 types)`,
  );

  // ── Venue — Rooftop Terrace ───────────────────────────────────────────────
  let rooftopTerrace = await db.venue.findFirst({
    where: { hotelId: hotel2.id, name: "Rooftop Terrace" },
  });
  if (!rooftopTerrace) {
    rooftopTerrace = await db.venue.create({
      data: {
        hotelId: hotel2.id,
        tenantId: tenant.id,
        name: "Rooftop Terrace",
        description:
          "Stunning open-air terrace with panoramic Acropolis views. Ideal for intimate events and cocktail receptions.",
        floorLevel: "Rooftop (5th floor)",
        sizeSquareMeters: 200,
        capacities: { COCKTAIL: 80, BANQUET_ROUND: 60, THEATER: 70 },
        defaultLayout: "COCKTAIL",
        availableLayouts: ["COCKTAIL", "BANQUET_ROUND", "THEATER"],
        features: [
          "acropolis-view",
          "outdoor",
          "bar",
          "ambient-lighting",
          "sound-system",
        ],
        avEquipment: ["wireless-microphone", "bluetooth-speaker", "LED-lights"],
        ratePerHour: 8000,
        ratePerDay: 55000,
      },
    });
    console.log("  + Venue: Rooftop Terrace");
  } else {
    console.log("  skip venue: Rooftop Terrace (exists)");
  }

  // ── Dining — Olive Garden Restaurant ─────────────────────────────────────
  let oliveGarden = await db.diningExperience.findFirst({
    where: { hotelId: hotel2.id, name: "Olive Garden Restaurant" },
  });
  if (!oliveGarden) {
    oliveGarden = await db.diningExperience.create({
      data: {
        hotelId: hotel2.id,
        tenantId: tenant.id,
        name: "Olive Garden Restaurant",
        diningType: "RESTAURANT",
        description:
          "Authentic Mediterranean cuisine celebrating Greek culinary traditions with fresh, local ingredients.",
        cuisine: ["Mediterranean", "Greek", "Mezze"],
        openHours: {
          mon: "07:30-22:30",
          tue: "07:30-22:30",
          wed: "07:30-22:30",
          thu: "07:30-22:30",
          fri: "07:30-23:30",
          sat: "08:00-23:30",
          sun: "08:00-22:00",
        },
        capacity: 60,
        priceRange: "$$",
        menuHighlights: [
          "Grilled Octopus",
          "Moussaka",
          "Spanakopita",
          "Greek Salad",
          "Baklava",
        ],
      },
    });
    console.log("  + Dining: Olive Garden Restaurant");
  } else {
    console.log("  skip dining: Olive Garden Restaurant (exists)");
  }

  // ── Athens Boutique Guest Users ───────────────────────────────────────────
  const athensGuests = await Promise.all([
    ensureGuest(
      tenant.id,
      "eleni.papadaki@email.gr",
      "Eleni Papadaki",
      guestHash,
      { language: "el" },
    ),
    ensureGuest(tenant.id, "thomas.muller@web.de", "Thomas Müller", guestHash, {
      requiresGoodWifi: true,
    }),
    ensureGuest(
      tenant.id,
      "isabelle.martin@gmail.fr",
      "Isabelle Martin",
      guestHash,
      { noiseSensitive: true },
    ),
    ensureGuest(
      tenant.id,
      "george.stavros@yahoo.gr",
      "Georgios Stavros",
      guestHash,
    ),
    ensureGuest(tenant.id, "diana.kowalski@wp.pl", "Diana Kowalski", guestHash),
    ensureGuest(
      tenant.id,
      "antonio.ricci@libero.it",
      "Antonio Ricci",
      guestHash,
    ),
    ensureGuest(
      tenant.id,
      "marie.dubois@orange.fr",
      "Marie Dubois",
      guestHash,
      { noiseSensitive: true },
    ),
    ensureGuest(
      tenant.id,
      "alex.petrov@mail.ru",
      "Aleksandr Petrov",
      guestHash,
    ),
  ]);
  console.log("  + 8 Athens guest users");

  // ── Athens Bookings (8) ───────────────────────────────────────────────────
  const athensBookingDefs = [
    {
      ref: "HEO-ATH-001",
      guest: athensGuests[0],
      status: "CONFIRMED" as const,
      checkIn: daysFromNow(5),
      checkOut: daysFromNow(8),
      guests: 2,
      subtotal: 36000,
      tax: 3600,
      total: 39600,
      payment: "CAPTURED" as const,
      requests: "Late check-in after 22:00 please",
    },
    {
      ref: "HEO-ATH-002",
      guest: athensGuests[1],
      status: "CHECKED_IN" as const,
      checkIn: daysAgo(1),
      checkOut: daysFromNow(3),
      guests: 1,
      subtotal: 88000,
      tax: 8800,
      total: 96800,
      payment: "CAPTURED" as const,
      checkedInAt: daysAgo(1),
    },
    {
      ref: "HEO-ATH-003",
      guest: athensGuests[2],
      status: "CHECKED_OUT" as const,
      checkIn: daysAgo(7),
      checkOut: daysAgo(3),
      guests: 2,
      subtotal: 48000,
      tax: 4800,
      total: 52800,
      payment: "CAPTURED" as const,
      checkedInAt: daysAgo(7),
      checkedOutAt: daysAgo(3),
    },
    {
      ref: "HEO-ATH-004",
      guest: athensGuests[3],
      status: "PENDING" as const,
      checkIn: daysFromNow(14),
      checkOut: daysFromNow(17),
      guests: 2,
      subtotal: 44000,
      tax: 4400,
      total: 48400,
      payment: "PENDING" as const,
      requests: "Acropolis view room strongly preferred",
    },
    {
      ref: "HEO-ATH-005",
      guest: athensGuests[4],
      status: "CANCELLED" as const,
      checkIn: daysFromNow(2),
      checkOut: daysFromNow(5),
      guests: 1,
      subtotal: 36000,
      tax: 3600,
      total: 39600,
      payment: "REFUNDED" as const,
      cancelledAt: daysAgo(2),
    },
    {
      ref: "HEO-ATH-006",
      guest: athensGuests[5],
      status: "CONFIRMED" as const,
      checkIn: daysFromNow(20),
      checkOut: daysFromNow(25),
      guests: 2,
      subtotal: 75000,
      tax: 7500,
      total: 82500,
      payment: "AUTHORIZED" as const,
      requests: "Anniversary trip — any complimentary extras appreciated",
    },
    {
      ref: "HEO-ATH-007",
      guest: athensGuests[6],
      status: "CHECKED_OUT" as const,
      checkIn: daysAgo(14),
      checkOut: daysAgo(10),
      guests: 2,
      subtotal: 60000,
      tax: 6000,
      total: 66000,
      payment: "CAPTURED" as const,
      checkedInAt: daysAgo(14),
      checkedOutAt: daysAgo(10),
    },
    {
      ref: "HEO-ATH-008",
      guest: athensGuests[7],
      status: "CONFIRMED" as const,
      checkIn: daysFromNow(30),
      checkOut: daysFromNow(34),
      guests: 1,
      subtotal: 48000,
      tax: 4800,
      total: 52800,
      payment: "CAPTURED" as const,
    },
  ];

  let athensBookingsCreated = 0;
  const athensBookings: Awaited<ReturnType<typeof ensureBooking>>[] = [];
  for (const b of athensBookingDefs) {
    const booking = await ensureBooking({
      tenantId: tenant.id,
      hotelId: hotel2.id,
      guestId: b.guest.id,
      bookingType: "ROOM",
      bookingRef: b.ref,
      status: b.status,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      guestCount: b.guests,
      subtotalCents: b.subtotal,
      taxCents: b.tax,
      totalCents: b.total,
      currency: "EUR",
      paymentStatus: b.payment,
      specialRequests: (b as any).requests ?? null,
      checkedInAt: (b as any).checkedInAt ?? null,
      checkedOutAt: (b as any).checkedOutAt ?? null,
      cancelledAt: (b as any).cancelledAt ?? null,
    });
    athensBookings.push(booking);
    if (!(booking as any)._alreadyExisted) athensBookingsCreated++;
  }
  console.log(`  + ${athensBookingDefs.length} Athens bookings processed`);

  // ── Athens Support Cases (3) ───────────────────────────────────────────────
  await ensureSupportCase({
    tenantId: tenant.id,
    hotelId: hotel2.id,
    guestId: athensGuests[1].id,
    bookingId: athensBookings[1].id,
    caseRef: "CASE-ATH-001",
    category: "WIFI_ISSUE",
    severity: "MEDIUM",
    status: "IN_PROGRESS",
    title: "Wi-Fi signal very weak in room 312",
    description:
      "The wireless signal in my room barely reaches 1-2 bars. I need stable internet for work calls.",
    roomNumber: "312",
    assignedToId: athensFD.id,
    responseDeadline: daysFromNow(0),
    resolutionDeadline: daysFromNow(1),
    timeline: {
      create: [
        {
          tenantId: tenant.id,
          actorType: "guest",
          actorId: athensGuests[1].id,
          actorName: "Thomas Müller",
          eventType: "message",
          content:
            "Wi-Fi is extremely slow, barely usable. Please fix urgently — I have video calls.",
        },
        {
          tenantId: tenant.id,
          actorType: "staff",
          actorId: athensFD.id,
          actorName: "Sofia Georgiou",
          eventType: "status_change",
          content: "IT technician dispatched to check router on floor 3.",
          metadata: { from: "OPEN", to: "IN_PROGRESS" },
        },
      ],
    },
    compensations: {
      create: {
        tenantId: tenant.id,
        compensationType: "SERVICE_VOUCHER",
        description:
          "Complimentary dinner at Olive Garden Restaurant for the inconvenience",
        valueCents: 5000,
        status: "APPROVED",
        requiresApproval: false,
        reasoning:
          "MEDIUM Wi-Fi issue impacting business guest — service voucher offered",
        executedAt: new Date(),
      },
    },
  });

  await ensureSupportCase({
    tenantId: tenant.id,
    hotelId: hotel2.id,
    guestId: athensGuests[2].id,
    bookingId: athensBookings[2].id,
    caseRef: "CASE-ATH-002",
    category: "NOISE_COMPLAINT",
    severity: "HIGH",
    status: "RESOLVED",
    title: "Loud construction noise early morning",
    description:
      "Construction work started at 7am next to the hotel, waking me up on multiple mornings. Completely unacceptable.",
    roomNumber: "204",
    assignedToId: athensFD.id,
    responseDeadline: daysAgo(5),
    resolutionDeadline: daysAgo(4),
    resolvedAt: daysAgo(4),
    timeline: {
      create: [
        {
          tenantId: tenant.id,
          actorType: "guest",
          actorId: athensGuests[2].id,
          actorName: "Isabelle Martin",
          eventType: "message",
          content:
            "Third morning in a row I've been woken up at 7am by construction. I'm a light sleeper and this is ruining my stay.",
        },
        {
          tenantId: tenant.id,
          actorType: "staff",
          actorId: athensAdmin.id,
          actorName: "Nikos Papadopoulos",
          eventType: "status_change",
          content:
            "Guest moved to quieter room on opposite side of building. Partial refund issued for 2 nights.",
          metadata: { from: "OPEN", to: "RESOLVED" },
        },
      ],
    },
    compensations: {
      create: {
        tenantId: tenant.id,
        compensationType: "PARTIAL_REFUND",
        description:
          "Partial refund for 2 nights impacted by construction noise",
        valueCents: 24000,
        status: "EXECUTED",
        requiresApproval: true,
        reasoning:
          "HIGH severity repeated noise complaint — 2-night partial refund justified",
        executedAt: daysAgo(4),
      },
    },
  });

  await ensureSupportCase({
    tenantId: tenant.id,
    hotelId: hotel2.id,
    guestId: athensGuests[3].id,
    caseRef: "CASE-ATH-003",
    category: "AMENITY_MISSING",
    severity: "LOW",
    status: "CLOSED",
    title: "Hairdryer missing from room",
    description:
      "There is no hairdryer in the room. The welcome card says one should be provided.",
    roomNumber: "107",
    assignedToId: athensFD.id,
    responseDeadline: daysAgo(10),
    resolutionDeadline: daysAgo(9),
    resolvedAt: daysAgo(10),
    closedAt: daysAgo(9),
    guestRating: 8,
    timeline: {
      create: [
        {
          tenantId: tenant.id,
          actorType: "guest",
          actorId: athensGuests[3].id,
          actorName: "Georgios Stavros",
          eventType: "message",
          content: "No hairdryer in the room — could you bring one please?",
        },
        {
          tenantId: tenant.id,
          actorType: "staff",
          actorId: athensFD.id,
          actorName: "Sofia Georgiou",
          eventType: "resolution",
          content:
            "Hairdryer delivered to room within 10 minutes. Guest confirmed satisfied.",
          metadata: { resolutionTime: "10 minutes" },
        },
      ],
    },
  });
  console.log("  + 3 Athens support cases");

  // ── Athens Reviews (5) ────────────────────────────────────────────────────
  await ensureReview({
    tenantId: tenant.id,
    hotelId: hotel2.id,
    guestId: athensGuests[2].id,
    bookingId: athensBookings[2].id,
    overallScore: 6,
    scores: {
      cleanliness: 7,
      staff: 8,
      wifi: 6,
      dining: 7,
      noise: 3,
      roomAccuracy: 7,
    },
    title: "Great location, but noisy mornings ruined it",
    text: "The hotel is beautifully located and the staff were genuinely kind and responsive. However, construction noise outside from 7am made it impossible to sleep in. The room relocation helped, but the damage was done.",
    sentiment: "mixed",
    sentimentScore: 0.42,
    moderationStatus: "APPROVED",
    hotelResponse:
      "Dear Isabelle, we sincerely apologise for the disruption caused by the neighbouring construction, which is entirely outside our control. We are glad our team responded quickly by relocating you and issuing a partial refund. We hope to welcome you back under much quieter circumstances.",
    respondedAt: daysAgo(3),
  });

  await ensureReview({
    tenantId: tenant.id,
    hotelId: hotel2.id,
    guestId: athensGuests[6].id,
    bookingId: athensBookings[6].id,
    overallScore: 9,
    scores: {
      cleanliness: 10,
      staff: 9,
      wifi: 8,
      dining: 9,
      noise: 9,
      roomAccuracy: 9,
    },
    title: "A wonderful Athens gem",
    text: "From the moment we arrived, we were charmed. The rooftop view of the Acropolis at sunset is simply magical. Olive Garden serves some of the best Greek food I have ever tasted. Staff remembered our names from day one.",
    sentiment: "positive",
    sentimentScore: 0.92,
    moderationStatus: "APPROVED",
    hotelResponse:
      "Thank you so much, Marie! The Acropolis sunset really is something special. We are delighted you enjoyed the Olive Garden and our team's personal touch. A bientôt!",
    respondedAt: daysAgo(8),
  });

  await ensureReview({
    tenantId: tenant.id,
    hotelId: hotel2.id,
    guestId: athensGuests[5].id,
    bookingId: athensBookings[5].id,
    overallScore: 10,
    scores: {
      cleanliness: 10,
      staff: 10,
      wifi: 9,
      dining: 10,
      noise: 10,
      roomAccuracy: 10,
    },
    title: "Perfect anniversary escape",
    text: "My partner and I celebrated our anniversary here and it exceeded every expectation. Nikos arranged a surprise champagne on the rooftop terrace — an absolutely unforgettable gesture. The Acropolis View Suite was stunning.",
    sentiment: "positive",
    sentimentScore: 0.98,
    moderationStatus: "APPROVED",
    hotelResponse:
      "Congratulations on your anniversary, Antonio! It was our absolute pleasure to make your celebration special. The rooftop at dusk is our secret weapon — shh! Warmest wishes to you both.",
    respondedAt: daysAgo(1),
  });

  await ensureReview({
    tenantId: tenant.id,
    hotelId: hotel2.id,
    guestId: athensGuests[7].id,
    overallScore: 8,
    scores: {
      cleanliness: 9,
      staff: 9,
      wifi: 7,
      dining: 8,
      noise: 8,
      roomAccuracy: 8,
    },
    title: "Very good boutique experience",
    text: "Excellent boutique hotel with warm hospitality. The Wi-Fi could be more reliable but everything else — from the rooms to the staff — was very good. Will return.",
    sentiment: "positive",
    sentimentScore: 0.78,
    moderationStatus: "APPROVED",
  });

  await ensureReview({
    tenantId: tenant.id,
    hotelId: hotel2.id,
    guestId: athensGuests[0].id,
    overallScore: 7,
    scores: {
      cleanliness: 8,
      staff: 9,
      wifi: 6,
      dining: 7,
      noise: 7,
      roomAccuracy: 7,
    },
    title: "Charming hotel, average Wi-Fi",
    text: "Very charming hotel in an incredible location. The staff, especially Sofia at front desk, was extremely helpful. Wi-Fi connectivity is the only real weakness — it dropped several times during my stay.",
    sentiment: "positive",
    sentimentScore: 0.68,
    moderationStatus: "APPROVED",
    hotelResponse:
      "Thank you, Eleni! We're investing in our network infrastructure this quarter — your feedback helps us prioritise. Sofia will be thrilled to hear the mention!",
    respondedAt: new Date(),
  });
  console.log("  + 5 Athens reviews");

  // ── Athens Event Request (Wedding) ────────────────────────────────────────
  const athensEventExists = await db.eventRequest.findFirst({
    where: { hotelId: hotel2.id, eventType: "WEDDING" },
  });
  if (!athensEventExists) {
    await db.eventRequest.create({
      data: {
        tenantId: tenant.id,
        hotelId: hotel2.id,
        requesterId: athensGuests[5].id,
        eventType: "WEDDING",
        title: "Petridis-Rossi Wedding Celebration",
        description:
          "Intimate rooftop wedding reception with Acropolis backdrop. Ceremony followed by dinner and dancing.",
        eventDate: daysFromNow(45),
        startTime: "18:00",
        endTime: "00:00",
        guestCount: 120,
        budgetCents: 2500000,
        requirements: {
          catering: true,
          floral: true,
          music: true,
          photography: false,
          dietary_options: ["vegan", "gluten-free", "kosher"],
          bar: true,
        },
        status: "PROPOSAL_SENT",
        proposalSentAt: daysAgo(2),
        eventBooking: {
          create: {
            tenantId: tenant.id,
            venueId: rooftopTerrace.id,
            layout: "BANQUET_ROUND",
            setupTime: "14:00",
            breakdownTime: "01:00",
            contractedPax: 120,
            guaranteedPax: 100,
            totalCents: 2200000,
            depositCents: 440000,
          },
        },
        beo: {
          create: {
            tenantId: tenant.id,
            status: "DRAFT",
            title: "BEO — Petridis-Rossi Wedding",
            content: {
              eventName: "Petridis-Rossi Wedding Celebration",
              venue: "Rooftop Terrace",
              date: new Date(daysFromNow(45)).toLocaleDateString("en-GB"),
              guestCount: 120,
            },
            runOfShow: [
              {
                time: "14:00",
                activity: "Venue setup & floral decoration",
                responsible: "Operations",
              },
              {
                time: "17:30",
                activity: "Guest arrival & welcome cocktails",
                responsible: "F&B",
              },
              {
                time: "18:00",
                activity: "Ceremony begins",
                responsible: "Event Coordinator",
              },
              {
                time: "18:45",
                activity: "Photography session",
                responsible: "Couple",
              },
              {
                time: "19:30",
                activity: "Dinner service begins",
                responsible: "F&B",
              },
              {
                time: "21:30",
                activity: "Wedding cake cutting",
                responsible: "F&B",
              },
              {
                time: "22:00",
                activity: "Dancing begins",
                responsible: "Music",
              },
              {
                time: "00:00",
                activity: "Event concludes",
                responsible: "Operations",
              },
            ],
            fbRequirements: {
              cocktailHour: {
                canapés: 8,
                alcoholic: true,
                non_alcoholic: true,
              },
              dinner: {
                style: "plated",
                courses: 4,
                dietary: ["vegan", "gluten-free", "kosher"],
              },
              cake: { tiers: 4, flavor: "lemon-olive oil" },
              openBar: { duration: "6 hours" },
            },
            staffingPlan: [
              { role: "Event Coordinator", count: 1 },
              { role: "F&B Staff", count: 10 },
              { role: "Bartender", count: 2 },
              { role: "Setup Crew", count: 4 },
              { role: "Security", count: 2 },
            ],
          },
        },
      },
    });
    console.log("  + Event request: Petridis-Rossi Wedding");
  } else {
    console.log("  skip event: Wedding (exists)");
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HOTEL 1 — GRAND PALACE ISTANBUL
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("\n── Grand Palace Istanbul ──────────────────────────────────");

  // ── Istanbul Guest Users ──────────────────────────────────────────────────
  const istanbulGuests = await Promise.all([
    ensureGuest(
      tenant.id,
      "james.wilson@outlook.com",
      "James Wilson",
      guestHash,
      { requiresGoodWifi: true },
    ),
    ensureGuest(tenant.id, "emma.davis@gmail.com", "Emma Davis", guestHash, {
      noiseSensitive: true,
    }),
    ensureGuest(
      tenant.id,
      "carlos.rodriguez@hotmail.es",
      "Carlos Rodriguez",
      guestHash,
    ),
    ensureGuest(
      tenant.id,
      "yuki.tanaka@softbank.jp",
      "Yuki Tanaka",
      guestHash,
      { language: "ja" },
    ),
    ensureGuest(
      tenant.id,
      "fatima.al-rashid@gmail.ae",
      "Fatima Al-Rashid",
      guestHash,
    ),
    ensureGuest(tenant.id, "liam.obrien@eircom.ie", "Liam O'Brien", guestHash),
    ensureGuest(tenant.id, "priya.sharma@tata.in", "Priya Sharma", guestHash, {
      requiresGoodWifi: true,
    }),
    ensureGuest(
      tenant.id,
      "mikhail.volkov@yandex.ru",
      "Mikhail Volkov",
      guestHash,
    ),
    ensureGuest(
      tenant.id,
      "sophie.laurent@sfr.fr",
      "Sophie Laurent",
      guestHash,
      { noiseSensitive: true },
    ),
    ensureGuest(tenant.id, "omar.hassan@gmail.eg", "Omar Hassan", guestHash),
  ]);
  console.log("  + 10 Istanbul guest users");

  // ── Istanbul Additional Bookings (10) ─────────────────────────────────────
  const istanbulBookingDefs = [
    {
      ref: "HEO-IST-010",
      guest: istanbulGuests[0],
      status: "CONFIRMED" as const,
      checkIn: daysFromNow(4),
      checkOut: daysFromNow(7),
      guests: 2,
      subtotal: 56700,
      tax: 5670,
      total: 62370,
      payment: "CAPTURED" as const,
      requests: "Bosphorus view room, high floor preferred",
    },
    {
      ref: "HEO-IST-011",
      guest: istanbulGuests[1],
      status: "CHECKED_IN" as const,
      checkIn: daysAgo(2),
      checkOut: daysFromNow(2),
      guests: 1,
      subtotal: 115600,
      tax: 11560,
      total: 127160,
      payment: "CAPTURED" as const,
      checkedInAt: daysAgo(2),
      requests: "Quiet room away from elevator",
    },
    {
      ref: "HEO-IST-012",
      guest: istanbulGuests[2],
      status: "CHECKED_OUT" as const,
      checkIn: daysAgo(10),
      checkOut: daysAgo(6),
      guests: 2,
      subtotal: 75600,
      tax: 7560,
      total: 83160,
      payment: "CAPTURED" as const,
      checkedInAt: daysAgo(10),
      checkedOutAt: daysAgo(6),
    },
    {
      ref: "HEO-IST-013",
      guest: istanbulGuests[3],
      status: "CONFIRMED" as const,
      checkIn: daysFromNow(12),
      checkOut: daysFromNow(16),
      guests: 2,
      subtotal: 115600,
      tax: 11560,
      total: 127160,
      payment: "AUTHORIZED" as const,
      requests: "Celebrating wedding anniversary — any upgrade possible?",
    },
    {
      ref: "HEO-IST-014",
      guest: istanbulGuests[4],
      status: "PENDING" as const,
      checkIn: daysFromNow(21),
      checkOut: daysFromNow(25),
      guests: 3,
      subtotal: 75600,
      tax: 7560,
      total: 83160,
      payment: "PENDING" as const,
    },
    {
      ref: "HEO-IST-015",
      guest: istanbulGuests[5],
      status: "CANCELLED" as const,
      checkIn: daysFromNow(1),
      checkOut: daysFromNow(4),
      guests: 1,
      subtotal: 56700,
      tax: 5670,
      total: 62370,
      payment: "REFUNDED" as const,
      cancelledAt: daysAgo(1),
    },
    {
      ref: "HEO-IST-016",
      guest: istanbulGuests[6],
      status: "CHECKED_IN" as const,
      checkIn: daysAgo(1),
      checkOut: daysFromNow(4),
      guests: 1,
      subtotal: 94500,
      tax: 9450,
      total: 103950,
      payment: "CAPTURED" as const,
      checkedInAt: daysAgo(1),
      requests: "Need reliable Wi-Fi — remote worker",
    },
    {
      ref: "HEO-IST-017",
      guest: istanbulGuests[7],
      status: "CHECKED_OUT" as const,
      checkIn: daysAgo(20),
      checkOut: daysAgo(15),
      guests: 2,
      subtotal: 144500,
      tax: 14450,
      total: 158950,
      payment: "CAPTURED" as const,
      checkedInAt: daysAgo(20),
      checkedOutAt: daysAgo(15),
    },
    {
      ref: "HEO-IST-018",
      guest: istanbulGuests[8],
      status: "CONFIRMED" as const,
      checkIn: daysFromNow(28),
      checkOut: daysFromNow(32),
      guests: 2,
      subtotal: 115600,
      tax: 11560,
      total: 127160,
      payment: "CAPTURED" as const,
      requests: "Quiet room, no street noise if possible",
    },
    {
      ref: "HEO-IST-019",
      guest: istanbulGuests[9],
      status: "NO_SHOW" as const,
      checkIn: daysAgo(3),
      checkOut: daysAgo(1),
      guests: 1,
      subtotal: 37800,
      tax: 3780,
      total: 41580,
      payment: "CAPTURED" as const,
    },
  ];

  const istanbulBookings: Awaited<ReturnType<typeof ensureBooking>>[] = [];
  for (const b of istanbulBookingDefs) {
    const booking = await ensureBooking({
      tenantId: tenant.id,
      hotelId: hotel1.id,
      guestId: b.guest.id,
      bookingType: "ROOM",
      bookingRef: b.ref,
      status: b.status,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      guestCount: b.guests,
      subtotalCents: b.subtotal,
      taxCents: b.tax,
      totalCents: b.total,
      currency: "USD",
      paymentStatus: b.payment,
      specialRequests: (b as any).requests ?? null,
      checkedInAt: (b as any).checkedInAt ?? null,
      checkedOutAt: (b as any).checkedOutAt ?? null,
      cancelledAt: (b as any).cancelledAt ?? null,
    });
    istanbulBookings.push(booking);
  }
  console.log(`  + ${istanbulBookingDefs.length} Istanbul bookings processed`);

  // ── Istanbul Additional Support Cases (4) ─────────────────────────────────
  await ensureSupportCase({
    tenantId: tenant.id,
    hotelId: hotel1.id,
    guestId: istanbulGuests[1].id,
    bookingId: istanbulBookings[1].id,
    caseRef: "CASE-IST-010",
    category: "ROOM_CLEANLINESS",
    severity: "HIGH",
    status: "IN_PROGRESS",
    title: "Room not properly cleaned on day 2",
    description:
      "Housekeeping missed our room entirely today. Bins overflowing, bathroom not cleaned, beds unmade. This is a 5-star hotel.",
    roomNumber: "617",
    assignedToId: h1FrontDesk?.id,
    responseDeadline: daysFromNow(0),
    resolutionDeadline: daysFromNow(0),
    timeline: {
      create: [
        {
          tenantId: tenant.id,
          actorType: "guest",
          actorId: istanbulGuests[1].id,
          actorName: "Emma Davis",
          eventType: "message",
          content:
            "Our room was completely skipped by housekeeping. Bins full, bathroom dirty. Very disappointed.",
        },
        {
          tenantId: tenant.id,
          actorType: "staff",
          actorId: h1FrontDesk?.id ?? tenant.id,
          actorName: "Elif Kaya",
          eventType: "status_change",
          content:
            "Housekeeping supervisor dispatched immediately. Full clean scheduled within the hour.",
          metadata: { from: "OPEN", to: "IN_PROGRESS" },
        },
      ],
    },
    compensations: {
      create: {
        tenantId: tenant.id,
        compensationType: "AMENITY_CREDIT",
        description: "Spa credit as apology for missed housekeeping",
        valueCents: 5000,
        status: "APPROVED",
        requiresApproval: false,
        reasoning:
          "HIGH severity cleanliness fail at 5-star property — spa credit warranted",
        executedAt: new Date(),
      },
    },
  });

  await ensureSupportCase({
    tenantId: tenant.id,
    hotelId: hotel1.id,
    guestId: istanbulGuests[6].id,
    bookingId: istanbulBookings[6].id,
    caseRef: "CASE-IST-011",
    category: "NOISE_COMPLAINT",
    severity: "MEDIUM",
    status: "RESOLVED",
    title: "Noise from adjacent room late at night",
    description:
      "The guests in the room next door were extremely loud until 2am. I called front desk but nothing changed for over an hour.",
    roomNumber: "824",
    assignedToId: h1FrontDesk?.id,
    responseDeadline: daysAgo(0),
    resolutionDeadline: daysAgo(0),
    resolvedAt: daysAgo(1),
    guestRating: 7,
    timeline: {
      create: [
        {
          tenantId: tenant.id,
          actorType: "guest",
          actorId: istanbulGuests[6].id,
          actorName: "Priya Sharma",
          eventType: "message",
          content:
            "Next-door room has been loud for hours. I've called twice — please do something.",
        },
        {
          tenantId: tenant.id,
          actorType: "staff",
          actorId: h1FrontDesk?.id ?? tenant.id,
          actorName: "Elif Kaya",
          eventType: "resolution",
          content:
            "Security visited room 826 and guests quieted down. Late-checkout offered to Ms Sharma as compensation.",
        },
      ],
    },
    compensations: {
      create: {
        tenantId: tenant.id,
        compensationType: "LATE_CHECKOUT",
        description:
          "Complimentary 2pm late checkout as apology for noise disturbance",
        valueCents: 0,
        status: "EXECUTED",
        requiresApproval: false,
        reasoning:
          "MEDIUM noise issue — late checkout provided as goodwill gesture",
        executedAt: daysAgo(1),
      },
    },
  });

  await ensureSupportCase({
    tenantId: tenant.id,
    hotelId: hotel1.id,
    guestId: istanbulGuests[7].id,
    bookingId: istanbulBookings[7].id,
    caseRef: "CASE-IST-012",
    category: "BILLING_ISSUE",
    severity: "HIGH",
    status: "AWAITING_APPROVAL",
    title: "Minibar items charged but not consumed",
    description:
      "My final bill includes minibar charges of $78 for items I never touched. I need this rectified immediately.",
    roomNumber: "1102",
    assignedToId: h1FrontDesk?.id,
    responseDeadline: daysAgo(14),
    resolutionDeadline: daysAgo(13),
    timeline: {
      create: [
        {
          tenantId: tenant.id,
          actorType: "guest",
          actorId: istanbulGuests[7].id,
          actorName: "Mikhail Volkov",
          eventType: "message",
          content:
            "I am disputing the minibar charges on my bill. I did not consume any minibar items. Please investigate.",
        },
        {
          tenantId: tenant.id,
          actorType: "staff",
          actorId: h1FrontDesk?.id ?? tenant.id,
          actorName: "Elif Kaya",
          eventType: "status_change",
          content:
            "Minibar charge dispute escalated to Finance for review. Awaiting approval for full refund.",
          metadata: { from: "OPEN", to: "AWAITING_APPROVAL" },
        },
      ],
    },
    compensations: {
      create: {
        tenantId: tenant.id,
        compensationType: "PARTIAL_REFUND",
        description: "Full refund of disputed minibar charges ($78)",
        valueCents: 7800,
        status: "PENDING_APPROVAL",
        requiresApproval: true,
        reasoning:
          "HIGH severity billing dispute — refund requires Finance approval",
      },
    },
  });

  await ensureSupportCase({
    tenantId: tenant.id,
    hotelId: hotel1.id,
    guestId: istanbulGuests[8].id,
    bookingId: istanbulBookings[8].id,
    caseRef: "CASE-IST-013",
    category: "AC_BROKEN",
    severity: "CRITICAL",
    status: "ESCALATED",
    title: "No hot water and heating malfunction — room uninhabitable",
    description:
      "Both hot water and room heating have failed completely. It is currently 8°C outside and the room is freezing. I have a young child with me.",
    roomNumber: "509",
    assignedToId: h1FrontDesk?.id,
    responseDeadline: new Date(Date.now() + 15 * 60 * 1000),
    resolutionDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000),
    timeline: {
      create: [
        {
          tenantId: tenant.id,
          actorType: "guest",
          actorId: istanbulGuests[8].id,
          actorName: "Sophie Laurent",
          eventType: "message",
          content:
            "URGENT: No heating and no hot water. My child is cold. This is completely unacceptable. I need this fixed NOW or a room change.",
        },
        {
          tenantId: tenant.id,
          actorType: "staff",
          actorId: h1FrontDesk?.id ?? tenant.id,
          actorName: "Elif Kaya",
          eventType: "status_change",
          content:
            "ESCALATED to Hotel Manager. Guest offered immediate room upgrade. Engineering team emergency dispatch.",
          metadata: { from: "OPEN", to: "ESCALATED" },
        },
      ],
    },
    compensations: {
      create: {
        tenantId: tenant.id,
        compensationType: "ROOM_UPGRADE",
        description:
          "Emergency upgrade to Junior Suite for remaining stay + complimentary breakfast",
        valueCents: 0,
        status: "EXECUTED",
        requiresApproval: false,
        reasoning:
          "CRITICAL severity — child safety concern, immediate room upgrade mandatory",
        executedAt: new Date(),
      },
    },
  });
  console.log("  + 4 Istanbul support cases");

  // ── Istanbul Additional Reviews (3) ───────────────────────────────────────
  await ensureReview({
    tenantId: tenant.id,
    hotelId: hotel1.id,
    guestId: istanbulGuests[2].id,
    bookingId: istanbulBookings[2].id,
    overallScore: 9,
    scores: {
      cleanliness: 10,
      staff: 10,
      wifi: 8,
      dining: 9,
      noise: 9,
      roomAccuracy: 9,
    },
    title: "Bosphorus magic — absolutely worth it",
    text: "Waking up to the Bosphorus every morning was surreal. The Grand Palace lives up to its name in every way. Service was flawless and the Ottoman breakfast spread is something I will dream about.",
    sentiment: "positive",
    sentimentScore: 0.94,
    moderationStatus: "APPROVED",
    hotelResponse:
      "Gracias, Carlos! Our Ottoman breakfast has been perfected over many years and we are so glad you enjoyed it. The Bosphorus does tend to spoil guests — we hope to see you again very soon.",
    respondedAt: daysAgo(5),
  });

  await ensureReview({
    tenantId: tenant.id,
    hotelId: hotel1.id,
    guestId: istanbulGuests[3].id,
    overallScore: 8,
    scores: {
      cleanliness: 9,
      staff: 9,
      wifi: 7,
      dining: 8,
      noise: 8,
      roomAccuracy: 8,
    },
    title: "Exceptional hotel, Wi-Fi needs work",
    text: "Overall a magnificent property. The Junior Suite was spacious and elegantly furnished. My only complaint is the Wi-Fi connectivity which dropped several times during my stay — a notable issue for business travellers.",
    sentiment: "positive",
    sentimentScore: 0.72,
    moderationStatus: "APPROVED",
    hotelResponse:
      "Thank you, Yuki-san! We appreciate your honest feedback on our Wi-Fi — we have a network upgrade scheduled and your comments will help us prioritise. We hope to welcome you back soon.",
    respondedAt: daysAgo(10),
  });

  await ensureReview({
    tenantId: tenant.id,
    hotelId: hotel1.id,
    guestId: istanbulGuests[0].id,
    overallScore: 10,
    scores: {
      cleanliness: 10,
      staff: 10,
      wifi: 9,
      dining: 10,
      noise: 10,
      roomAccuracy: 10,
    },
    title: "Finest hotel experience of my life",
    text: "I have stayed in many 5-star hotels across the world and the Grand Palace Istanbul stands in a class of its own. Every single detail was perfection. The Bosphorus Restaurant deserves its own Michelin star.",
    sentiment: "positive",
    sentimentScore: 0.99,
    moderationStatus: "APPROVED",
    hotelResponse:
      "James, this review genuinely made our entire team's week. We will pass this on to our restaurant team — your Michelin comment might just inspire them! Thank you for choosing us.",
    respondedAt: daysAgo(2),
  });
  console.log("  + 3 Istanbul reviews");

  // ── Istanbul Additional Event Request (Gala Dinner) ────────────────────────
  const galaExists = await db.eventRequest.findFirst({
    where: { hotelId: hotel1.id, eventType: "GALA_DINNER" },
  });

  // Resolve the existing Grand Ballroom venue for hotel1
  const grandBallroom = await db.venue.findFirst({
    where: { hotelId: hotel1.id, name: "Grand Ballroom" },
  });

  if (!galaExists && grandBallroom) {
    await db.eventRequest.create({
      data: {
        tenantId: tenant.id,
        hotelId: hotel1.id,
        requesterId: istanbulGuests[4].id,
        eventType: "GALA_DINNER",
        title: "Al-Rashid Family Gala Dinner 2026",
        description:
          "Exclusive gala dinner for 80 distinguished guests to celebrate a milestone family anniversary.",
        eventDate: daysFromNow(35),
        startTime: "19:00",
        endTime: "01:00",
        guestCount: 80,
        budgetCents: 3500000,
        requirements: {
          catering: true,
          halal_menu: true,
          live_music: true,
          floral: true,
          valet: true,
          dietary_options: ["halal", "vegetarian"],
        },
        status: "NEGOTIATING",
        proposalSentAt: daysAgo(5),
        eventBooking: {
          create: {
            tenantId: tenant.id,
            venueId: grandBallroom.id,
            layout: "BANQUET_ROUND",
            setupTime: "15:00",
            breakdownTime: "02:00",
            contractedPax: 80,
            guaranteedPax: 70,
            totalCents: 3200000,
            depositCents: 640000,
          },
        },
        beo: {
          create: {
            tenantId: tenant.id,
            status: "DRAFT",
            title: "BEO — Al-Rashid Family Gala Dinner",
            content: {
              eventName: "Al-Rashid Family Gala Dinner 2026",
              venue: "Grand Ballroom",
              date: new Date(daysFromNow(35)).toLocaleDateString("en-GB"),
              guestCount: 80,
            },
            runOfShow: [
              {
                time: "15:00",
                activity: "Ballroom setup and floral installation",
                responsible: "Operations",
              },
              {
                time: "18:30",
                activity: "Guest arrival and welcome reception",
                responsible: "F&B",
              },
              {
                time: "19:00",
                activity: "Guests seated, dinner service begins",
                responsible: "F&B",
              },
              {
                time: "20:30",
                activity: "Speeches and tributes",
                responsible: "Family",
              },
              {
                time: "21:30",
                activity: "Live music and dancing",
                responsible: "Entertainment",
              },
              {
                time: "23:00",
                activity: "Dessert and midnight tea service",
                responsible: "F&B",
              },
              {
                time: "01:00",
                activity: "Event concludes, guests depart",
                responsible: "Operations",
              },
            ],
            fbRequirements: {
              welcome: { canapes: 6, mocktails: true, alcoholic: false },
              dinner: {
                style: "plated",
                courses: 5,
                halal: true,
                dietary: ["vegetarian"],
              },
              dessert: {
                selection: "Arabic sweets, French pastries",
                coffee_tea: true,
              },
            },
            staffingPlan: [
              { role: "Event Coordinator", count: 1 },
              { role: "F&B Staff", count: 12 },
              { role: "Sommelier (non-alcoholic)", count: 1 },
              { role: "AV & Lighting", count: 2 },
              { role: "Security & Valet", count: 5 },
            ],
          },
        },
      },
    });
    console.log("  + Event request: Al-Rashid Family Gala Dinner");
  } else {
    console.log("  skip event: Gala Dinner (exists or ballroom missing)");
  }

  // ── Istanbul Night Experience — Night Bar ─────────────────────────────────
  const nightBarExists = await db.nightExperience.findFirst({
    where: { hotelId: hotel1.id, name: "Night Bar" },
  });
  if (!nightBarExists) {
    await db.nightExperience.create({
      data: {
        hotelId: hotel1.id,
        tenantId: tenant.id,
        name: "Night Bar",
        experienceType: "VIP_LOUNGE",
        description:
          "Sophisticated late-night bar featuring rare Turkish spirits, international cocktails, and live jazz every Friday and Saturday. Stunning Bosphorus views after dark.",
        startTime: "21:00",
        endTime: "03:00",
        priceCents: 3500,
        capacity: 60,
        minAge: 21,
        dressCode: "Smart casual — no sportswear",
        features: [
          "bosphorus-view",
          "live-jazz-fri-sat",
          "craft-cocktails",
          "rare-spirits",
          "vip-table-service",
          "sommelier",
        ],
      },
    });
    console.log("  + Night experience: Night Bar");
  } else {
    console.log("  skip night experience: Night Bar (exists)");
  }

  // ─── Summary ──────────────────────────────────────────────────────────────
  console.log("\n=== seed-rich.ts complete ===\n");
  console.log("Summary of enriched data:");
  console.log("  The Athens Boutique:");
  console.log(
    "    - 3 room types (Classic Double, Acropolis View Suite, Deluxe Twin)",
  );
  console.log(`    - ${inventoryCreated} room inventory slots (30 days)`);
  console.log("    - 1 venue: Rooftop Terrace");
  console.log("    - 1 dining: Olive Garden Restaurant");
  console.log(
    "    - 2 staff: Nikos Papadopoulos (HOTEL_ADMIN), Sofia Georgiou (FRONT_DESK)",
  );
  console.log("    - 8 guest users");
  console.log(
    "    - 8 bookings (CONFIRMED/CHECKED_IN/CHECKED_OUT/PENDING/CANCELLED)",
  );
  console.log("    - 3 support cases (WIFI, NOISE, AMENITY)");
  console.log("    - 5 reviews (scores 6-10)");
  console.log("    - 1 event request: Petridis-Rossi Wedding (120 guests)");
  console.log("  Grand Palace Istanbul:");
  console.log("    - 10 guest users");
  console.log("    - 10 additional bookings (varied statuses incl. NO_SHOW)");
  console.log(
    "    - 4 support cases (CLEANLINESS, NOISE, BILLING, CRITICAL HEATING)",
  );
  console.log("    - 3 reviews (scores 8-10)");
  console.log(
    "    - 1 event request: Al-Rashid Family Gala Dinner (80 guests)",
  );
  console.log("    - 1 night experience: Night Bar (VIP Lounge)");
  console.log("\nDemo credentials:");
  console.log("  Athens Admin:      manager@athensb.com / staff123456");
  console.log("  Athens Front Desk: frontdesk@athensb.com / staff123456");
  console.log("  Guest (any):       <email above> / guest123456");
}

main()
  .catch((e) => {
    console.error("seed-rich.ts failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
