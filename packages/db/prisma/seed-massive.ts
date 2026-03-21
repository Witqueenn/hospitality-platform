/**
 * seed-massive.ts — large-volume realistic data.
 * Safe to run multiple times (findFirst guards everywhere).
 *
 * Run:
 *   DATABASE_URL="postgresql://dev:devpass@localhost:5432/hospitality_platform" \
 *   ./packages/db/node_modules/.bin/tsx packages/db/prisma/seed-massive.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

function dateOnly(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}
function daysFromNow(n: number) {
  return dateOnly(new Date(Date.now() + n * 86_400_000));
}
function daysAgo(n: number) {
  return daysFromNow(-n);
}

async function ensureGuest(
  tenantId: string,
  email: string,
  name: string,
  hash: string,
) {
  const ex = await db.user.findFirst({ where: { tenantId, email } });
  if (ex) return ex;
  return db.user.create({
    data: {
      tenantId,
      email,
      name,
      passwordHash: hash,
      role: "GUEST",
      preferences: {},
    },
  });
}

async function ensureBooking(
  ref: string,
  data: Parameters<typeof db.booking.create>[0]["data"],
) {
  const ex = await db.booking.findFirst({ where: { bookingRef: ref } });
  if (ex) {
    process.stdout.write(".");
    return ex;
  }
  return db.booking.create({ data });
}

async function ensureReview(
  hotelId: string,
  guestId: string,
  title: string,
  data: Parameters<typeof db.review.create>[0]["data"],
) {
  const ex = await db.review.findFirst({ where: { hotelId, guestId, title } });
  if (ex) {
    process.stdout.write(".");
    return ex;
  }
  return db.review.create({ data });
}

async function ensureCase(
  ref: string,
  data: Parameters<typeof db.supportCase.create>[0]["data"],
) {
  const ex = await db.supportCase.findFirst({ where: { caseRef: ref } });
  if (ex) {
    process.stdout.write(".");
    return ex;
  }
  return db.supportCase.create({ data });
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("=== seed-massive.ts starting ===\n");

  const tenant = await db.tenant.findFirst({ where: { slug: "grand-hotels" } });
  if (!tenant) throw new Error("Tenant not found. Run seed.ts first.");

  const hotel1 = await db.hotel.findFirst({
    where: { tenantId: tenant.id, slug: "grand-palace-istanbul" },
  });
  if (!hotel1) throw new Error("grand-palace-istanbul not found.");
  const hotel2 = await db.hotel.findFirst({
    where: { tenantId: tenant.id, slug: "boutique-athens" },
  });
  if (!hotel2) throw new Error("boutique-athens not found.");

  const guestHash = await bcrypt.hash("guest123456", 10);

  // ── Staff refs ────────────────────────────────────────────────────────────
  const h1FD = await db.user.findFirst({
    where: { tenantId: tenant.id, email: "frontdesk@grandpalace.com" },
  });
  const h2FD = await db.user.findFirst({
    where: { tenantId: tenant.id, email: "frontdesk@athensb.com" },
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ROOM TYPES
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("── Room Types ───────────────────────────────────────────────");

  async function ensureRoomType(hotelId: string, name: string, data: object) {
    const ex = await db.roomType.findFirst({ where: { hotelId, name } });
    if (ex) {
      console.log(`  skip room type: ${name}`);
      return ex;
    }
    const rt = await db.roomType.create({
      data: { hotelId, tenantId: tenant.id, name, ...data } as any,
    });
    console.log(`  + ${name}`);
    return rt;
  }

  const h1Deluxe = await ensureRoomType(hotel1.id, "Deluxe Bosphorus Room", {
    description: "Panoramic Bosphorus view, Ottoman décor.",
    capacity: 2,
    bedType: "king",
    sizeSqm: 42,
    baseRateCents: 38000,
    features: ["bosphorus-view", "minibar", "rain-shower"],
    sortOrder: 1,
  });
  const h1Exec = await ensureRoomType(hotel1.id, "Executive Suite", {
    description: "Private terrace, butler service.",
    capacity: 3,
    bedType: "king",
    sizeSqm: 85,
    baseRateCents: 72000,
    features: ["terrace", "butler", "jacuzzi", "minibar"],
    sortOrder: 2,
  });
  const h1Sup = await ensureRoomType(hotel1.id, "Superior Double", {
    description: "Modern comforts, heart of Istanbul.",
    capacity: 2,
    bedType: "double",
    sizeSqm: 32,
    baseRateCents: 22000,
    features: ["air-conditioning", "safe", "work-desk"],
    sortOrder: 3,
  });
  const h1Twin = await ensureRoomType(hotel1.id, "Twin Room", {
    description: "Two twin beds, garden courtyard view.",
    capacity: 2,
    bedType: "twin",
    sizeSqm: 30,
    baseRateCents: 20000,
    features: ["garden-view", "air-conditioning"],
    sortOrder: 4,
  });
  const h2Studio = await ensureRoomType(hotel2.id, "Garden Studio", {
    description: "Private garden terrace, solo travellers.",
    capacity: 1,
    bedType: "single",
    sizeSqm: 22,
    baseRateCents: 16000,
    features: ["garden-terrace", "kitchenette"],
    sortOrder: 3,
  });
  const h2Family = await ensureRoomType(hotel2.id, "Family Suite", {
    description: "Connecting rooms — king + bunk beds.",
    capacity: 4,
    bedType: "king",
    sizeSqm: 65,
    baseRateCents: 45000,
    features: ["connecting-rooms", "bunk-beds", "city-view"],
    sortOrder: 4,
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GUESTS (20)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log(
    "\n── Guests ───────────────────────────────────────────────────",
  );

  const guestDefs = [
    ["alice.johnson@example.com", "Alice Johnson"],
    ["bob.smith@example.com", "Bob Smith"],
    ["claire.dubois@example.fr", "Claire Dubois"],
    ["david.brown@example.co.uk", "David Brown"],
    ["emma.wilson@example.com", "Emma Wilson"],
    ["feng.li@example.cn", "Feng Li"],
    ["giulia.romano@example.it", "Giulia Romano"],
    ["hans.mueller@example.de", "Hans Mueller"],
    ["isabella.costa@example.br", "Isabella Costa"],
    ["james.taylor@example.com", "James Taylor"],
    ["kenji.tanaka@example.jp", "Kenji Tanaka"],
    ["laura.martin@example.es", "Laura Martin"],
    ["michael.lee@example.com", "Michael Lee"],
    ["natalia.petrov@example.ru", "Natalia Petrov"],
    ["omar.hassan@example.ae", "Omar Hassan"],
    ["priya.patel@example.in", "Priya Patel"],
    ["rachel.green@example.com", "Rachel Green"],
    ["stefan.klein@example.at", "Stefan Klein"],
    ["tariq.alrashid@example.sa", "Tariq Al-Rashid"],
    ["ursula.vogel@example.ch", "Ursula Vogel"],
  ] as const;

  const guests = await Promise.all(
    guestDefs.map(([email, name]) =>
      ensureGuest(tenant.id, email, name, guestHash),
    ),
  );
  const [
    alice,
    bob,
    claire,
    david,
    emma,
    feng,
    giulia,
    hans,
    isabella,
    james,
    kenji,
    laura,
    michael,
    natalia,
    omar,
    priya,
    rachel,
    stefan,
    tariq,
    ursula,
  ] = guests;
  console.log(`  + ${guests.length} guests ensured`);

  // Fetch existing room types for each hotel (so we can always find one)
  const allH1RT = await db.roomType.findMany({ where: { hotelId: hotel1.id } });
  const allH2RT = await db.roomType.findMany({ where: { hotelId: hotel2.id } });
  const h1RT = (i: number) => allH1RT[i % allH1RT.length];
  const h2RT = (i: number) => allH2RT[i % allH2RT.length];

  // ═══════════════════════════════════════════════════════════════════════════
  // BOOKINGS — Grand Palace Istanbul (40)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log(
    "\n── Bookings: Grand Palace Istanbul ──────────────────────────",
  );

  type BS =
    | "PENDING"
    | "CONFIRMED"
    | "CHECKED_IN"
    | "CHECKED_OUT"
    | "CANCELLED";
  type PS = "PENDING" | "CAPTURED" | "REFUNDED";

  const h1B: Array<{
    ref: string;
    g: typeof alice;
    ci: Date;
    co: Date;
    cents: number;
    status: BS;
    pay: PS;
    i: number;
  }> = [
    {
      ref: "GPI-2025-001",
      g: alice,
      ci: daysAgo(120),
      co: daysAgo(117),
      cents: 45000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 0,
    },
    {
      ref: "GPI-2025-002",
      g: bob,
      ci: daysAgo(110),
      co: daysAgo(107),
      cents: 38000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 1,
    },
    {
      ref: "GPI-2025-003",
      g: claire,
      ci: daysAgo(100),
      co: daysAgo(95),
      cents: 62000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 2,
    },
    {
      ref: "GPI-2025-004",
      g: david,
      ci: daysAgo(95),
      co: daysAgo(92),
      cents: 52000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 3,
    },
    {
      ref: "GPI-2025-005",
      g: emma,
      ci: daysAgo(90),
      co: daysAgo(86),
      cents: 68000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 0,
    },
    {
      ref: "GPI-2025-006",
      g: feng,
      ci: daysAgo(85),
      co: daysAgo(80),
      cents: 75000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 1,
    },
    {
      ref: "GPI-2025-007",
      g: giulia,
      ci: daysAgo(80),
      co: daysAgo(77),
      cents: 43000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 2,
    },
    {
      ref: "GPI-2025-008",
      g: hans,
      ci: daysAgo(75),
      co: daysAgo(70),
      cents: 82000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 3,
    },
    {
      ref: "GPI-2025-009",
      g: isabella,
      ci: daysAgo(70),
      co: daysAgo(67),
      cents: 51000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 0,
    },
    {
      ref: "GPI-2025-010",
      g: james,
      ci: daysAgo(65),
      co: daysAgo(62),
      cents: 46000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 1,
    },
    {
      ref: "GPI-2025-011",
      g: kenji,
      ci: daysAgo(60),
      co: daysAgo(54),
      cents: 120000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 2,
    },
    {
      ref: "GPI-2025-012",
      g: laura,
      ci: daysAgo(58),
      co: daysAgo(55),
      cents: 49000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 3,
    },
    {
      ref: "GPI-2025-013",
      g: michael,
      ci: daysAgo(55),
      co: daysAgo(51),
      cents: 64000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 0,
    },
    {
      ref: "GPI-2025-014",
      g: natalia,
      ci: daysAgo(50),
      co: daysAgo(47),
      cents: 53000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 1,
    },
    {
      ref: "GPI-2025-015",
      g: omar,
      ci: daysAgo(45),
      co: daysAgo(40),
      cents: 95000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 2,
    },
    {
      ref: "GPI-2025-016",
      g: priya,
      ci: daysAgo(42),
      co: daysAgo(39),
      cents: 48000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 3,
    },
    {
      ref: "GPI-2025-017",
      g: rachel,
      ci: daysAgo(38),
      co: daysAgo(35),
      cents: 44000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 0,
    },
    {
      ref: "GPI-2025-018",
      g: stefan,
      ci: daysAgo(35),
      co: daysAgo(30),
      cents: 79000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 1,
    },
    {
      ref: "GPI-2025-019",
      g: tariq,
      ci: daysAgo(30),
      co: daysAgo(27),
      cents: 55000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 2,
    },
    {
      ref: "GPI-2025-020",
      g: ursula,
      ci: daysAgo(28),
      co: daysAgo(25),
      cents: 51000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 3,
    },
    {
      ref: "GPI-2025-021",
      g: alice,
      ci: daysAgo(20),
      co: daysAgo(17),
      cents: 47000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 0,
    },
    {
      ref: "GPI-2025-022",
      g: bob,
      ci: daysAgo(15),
      co: daysAgo(12),
      cents: 42000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 1,
    },
    {
      ref: "GPI-2025-023",
      g: claire,
      ci: daysAgo(12),
      co: daysAgo(9),
      cents: 56000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 2,
    },
    {
      ref: "GPI-2025-024",
      g: david,
      ci: daysAgo(8),
      co: daysAgo(5),
      cents: 50000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 3,
    },
    {
      ref: "GPI-2025-025",
      g: emma,
      ci: daysAgo(5),
      co: daysAgo(2),
      cents: 61000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 0,
    },
    {
      ref: "GPI-2025-026",
      g: feng,
      ci: daysAgo(2),
      co: daysFromNow(1),
      cents: 72000,
      status: "CHECKED_IN",
      pay: "CAPTURED",
      i: 1,
    },
    {
      ref: "GPI-2025-027",
      g: giulia,
      ci: daysAgo(1),
      co: daysFromNow(2),
      cents: 48000,
      status: "CHECKED_IN",
      pay: "CAPTURED",
      i: 2,
    },
    {
      ref: "GPI-2025-028",
      g: hans,
      ci: daysAgo(1),
      co: daysFromNow(4),
      cents: 90000,
      status: "CHECKED_IN",
      pay: "CAPTURED",
      i: 3,
    },
    {
      ref: "GPI-2025-029",
      g: omar,
      ci: daysAgo(3),
      co: daysFromNow(1),
      cents: 86000,
      status: "CHECKED_IN",
      pay: "CAPTURED",
      i: 0,
    },
    {
      ref: "GPI-2025-030",
      g: james,
      ci: daysFromNow(3),
      co: daysFromNow(6),
      cents: 52000,
      status: "CONFIRMED",
      pay: "CAPTURED",
      i: 1,
    },
    {
      ref: "GPI-2025-031",
      g: kenji,
      ci: daysFromNow(5),
      co: daysFromNow(12),
      cents: 140000,
      status: "CONFIRMED",
      pay: "CAPTURED",
      i: 2,
    },
    {
      ref: "GPI-2025-032",
      g: laura,
      ci: daysFromNow(7),
      co: daysFromNow(10),
      cents: 54000,
      status: "CONFIRMED",
      pay: "CAPTURED",
      i: 3,
    },
    {
      ref: "GPI-2025-033",
      g: michael,
      ci: daysFromNow(10),
      co: daysFromNow(14),
      cents: 68000,
      status: "CONFIRMED",
      pay: "CAPTURED",
      i: 0,
    },
    {
      ref: "GPI-2025-034",
      g: natalia,
      ci: daysFromNow(12),
      co: daysFromNow(15),
      cents: 58000,
      status: "CONFIRMED",
      pay: "PENDING",
      i: 1,
    },
    {
      ref: "GPI-2025-035",
      g: priya,
      ci: daysFromNow(14),
      co: daysFromNow(21),
      cents: 126000,
      status: "CONFIRMED",
      pay: "PENDING",
      i: 2,
    },
    {
      ref: "GPI-2025-036",
      g: rachel,
      ci: daysFromNow(18),
      co: daysFromNow(21),
      cents: 49000,
      status: "CONFIRMED",
      pay: "PENDING",
      i: 3,
    },
    {
      ref: "GPI-2025-037",
      g: stefan,
      ci: daysFromNow(21),
      co: daysFromNow(26),
      cents: 85000,
      status: "CONFIRMED",
      pay: "PENDING",
      i: 0,
    },
    {
      ref: "GPI-2025-038",
      g: tariq,
      ci: daysFromNow(25),
      co: daysFromNow(28),
      cents: 62000,
      status: "PENDING",
      pay: "PENDING",
      i: 1,
    },
    {
      ref: "GPI-2025-039",
      g: ursula,
      ci: daysFromNow(28),
      co: daysFromNow(32),
      cents: 72000,
      status: "PENDING",
      pay: "PENDING",
      i: 2,
    },
    {
      ref: "GPI-2025-040",
      g: alice,
      ci: daysFromNow(35),
      co: daysFromNow(42),
      cents: 150000,
      status: "PENDING",
      pay: "PENDING",
      i: 3,
    },
  ];

  for (const b of h1B) {
    const tax = Math.round(b.cents * 0.1);
    await ensureBooking(b.ref, {
      tenantId: tenant.id,
      hotelId: hotel1.id,
      guestId: b.g.id,
      bookingType: "ROOM",
      bookingRef: b.ref,
      status: b.status,
      checkIn: b.ci,
      checkOut: b.co,
      guestCount: 2,
      childCount: 0,
      subtotalCents: b.cents,
      taxCents: tax,
      feesCents: 0,
      discountCents: 0,
      totalCents: b.cents + tax,
      currency: "USD",
      paymentStatus: b.pay,
      metadata: {
        roomTypeId: h1RT(b.i).id,
        source:
          b.i % 3 === 0 ? "direct" : b.i % 3 === 1 ? "booking.com" : "expedia",
      },
    });
  }
  console.log(`\n  + ${h1B.length} Grand Palace bookings`);

  // ═══════════════════════════════════════════════════════════════════════════
  // BOOKINGS — Athens Boutique (30)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log(
    "\n── Bookings: Athens Boutique ────────────────────────────────",
  );

  const h2B: Array<{
    ref: string;
    g: typeof alice;
    ci: Date;
    co: Date;
    cents: number;
    status: BS;
    pay: PS;
    i: number;
  }> = [
    {
      ref: "ATH-2025-001",
      g: bob,
      ci: daysAgo(130),
      co: daysAgo(127),
      cents: 30000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 0,
    },
    {
      ref: "ATH-2025-002",
      g: claire,
      ci: daysAgo(120),
      co: daysAgo(115),
      cents: 49000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 1,
    },
    {
      ref: "ATH-2025-003",
      g: david,
      ci: daysAgo(110),
      co: daysAgo(107),
      cents: 33000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 2,
    },
    {
      ref: "ATH-2025-004",
      g: emma,
      ci: daysAgo(100),
      co: daysAgo(97),
      cents: 36000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 3,
    },
    {
      ref: "ATH-2025-005",
      g: giulia,
      ci: daysAgo(90),
      co: daysAgo(83),
      cents: 72000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 0,
    },
    {
      ref: "ATH-2025-006",
      g: hans,
      ci: daysAgo(80),
      co: daysAgo(77),
      cents: 31000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 1,
    },
    {
      ref: "ATH-2025-007",
      g: james,
      ci: daysAgo(75),
      co: daysAgo(71),
      cents: 42000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 2,
    },
    {
      ref: "ATH-2025-008",
      g: kenji,
      ci: daysAgo(70),
      co: daysAgo(64),
      cents: 65000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 3,
    },
    {
      ref: "ATH-2025-009",
      g: laura,
      ci: daysAgo(65),
      co: daysAgo(62),
      cents: 29000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 0,
    },
    {
      ref: "ATH-2025-010",
      g: michael,
      ci: daysAgo(60),
      co: daysAgo(57),
      cents: 34000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 1,
    },
    {
      ref: "ATH-2025-011",
      g: natalia,
      ci: daysAgo(55),
      co: daysAgo(50),
      cents: 52000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 2,
    },
    {
      ref: "ATH-2025-012",
      g: priya,
      ci: daysAgo(50),
      co: daysAgo(47),
      cents: 31000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 3,
    },
    {
      ref: "ATH-2025-013",
      g: rachel,
      ci: daysAgo(45),
      co: daysAgo(41),
      cents: 40000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 0,
    },
    {
      ref: "ATH-2025-014",
      g: stefan,
      ci: daysAgo(40),
      co: daysAgo(37),
      cents: 33000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 1,
    },
    {
      ref: "ATH-2025-015",
      g: tariq,
      ci: daysAgo(35),
      co: daysAgo(31),
      cents: 45000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 2,
    },
    {
      ref: "ATH-2025-016",
      g: ursula,
      ci: daysAgo(30),
      co: daysAgo(27),
      cents: 32000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 3,
    },
    {
      ref: "ATH-2025-017",
      g: alice,
      ci: daysAgo(25),
      co: daysAgo(22),
      cents: 35000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 0,
    },
    {
      ref: "ATH-2025-018",
      g: feng,
      ci: daysAgo(22),
      co: daysAgo(17),
      cents: 53000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 1,
    },
    {
      ref: "ATH-2025-019",
      g: isabella,
      ci: daysAgo(18),
      co: daysAgo(15),
      cents: 30000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 2,
    },
    {
      ref: "ATH-2025-020",
      g: omar,
      ci: daysAgo(12),
      co: daysAgo(9),
      cents: 37000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      i: 3,
    },
    {
      ref: "ATH-2025-021",
      g: laura,
      ci: daysAgo(2),
      co: daysFromNow(2),
      cents: 42000,
      status: "CHECKED_IN",
      pay: "CAPTURED",
      i: 0,
    },
    {
      ref: "ATH-2025-022",
      g: michael,
      ci: daysAgo(1),
      co: daysFromNow(3),
      cents: 40000,
      status: "CHECKED_IN",
      pay: "CAPTURED",
      i: 1,
    },
    {
      ref: "ATH-2025-023",
      g: natalia,
      ci: daysFromNow(2),
      co: daysFromNow(7),
      cents: 52000,
      status: "CONFIRMED",
      pay: "CAPTURED",
      i: 2,
    },
    {
      ref: "ATH-2025-024",
      g: priya,
      ci: daysFromNow(5),
      co: daysFromNow(9),
      cents: 44000,
      status: "CONFIRMED",
      pay: "CAPTURED",
      i: 3,
    },
    {
      ref: "ATH-2025-025",
      g: rachel,
      ci: daysFromNow(8),
      co: daysFromNow(11),
      cents: 33000,
      status: "CONFIRMED",
      pay: "PENDING",
      i: 0,
    },
    {
      ref: "ATH-2025-026",
      g: stefan,
      ci: daysFromNow(11),
      co: daysFromNow(18),
      cents: 77000,
      status: "CONFIRMED",
      pay: "PENDING",
      i: 1,
    },
    {
      ref: "ATH-2025-027",
      g: tariq,
      ci: daysFromNow(15),
      co: daysFromNow(18),
      cents: 36000,
      status: "CONFIRMED",
      pay: "PENDING",
      i: 2,
    },
    {
      ref: "ATH-2025-028",
      g: ursula,
      ci: daysFromNow(20),
      co: daysFromNow(24),
      cents: 44000,
      status: "PENDING",
      pay: "PENDING",
      i: 3,
    },
    {
      ref: "ATH-2025-029",
      g: giulia,
      ci: daysFromNow(25),
      co: daysFromNow(32),
      cents: 77000,
      status: "PENDING",
      pay: "PENDING",
      i: 0,
    },
    {
      ref: "ATH-2025-030",
      g: feng,
      ci: daysFromNow(30),
      co: daysFromNow(35),
      cents: 55000,
      status: "PENDING",
      pay: "PENDING",
      i: 1,
    },
  ];

  for (const b of h2B) {
    const tax = Math.round(b.cents * 0.1);
    await ensureBooking(b.ref, {
      tenantId: tenant.id,
      hotelId: hotel2.id,
      guestId: b.g.id,
      bookingType: "ROOM",
      bookingRef: b.ref,
      status: b.status,
      checkIn: b.ci,
      checkOut: b.co,
      guestCount: 2,
      childCount: 0,
      subtotalCents: b.cents,
      taxCents: tax,
      feesCents: 0,
      discountCents: 0,
      totalCents: b.cents + tax,
      currency: "EUR",
      paymentStatus: b.pay,
      metadata: {
        roomTypeId: h2RT(b.i).id,
        source: b.i % 2 === 0 ? "direct" : "booking.com",
      },
    });
  }
  console.log(`\n  + ${h2B.length} Athens Boutique bookings`);

  // ═══════════════════════════════════════════════════════════════════════════
  // REVIEWS — Grand Palace Istanbul (15)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log(
    "\n── Reviews: Grand Palace Istanbul ───────────────────────────",
  );

  const h1Reviews = [
    {
      g: alice,
      score: 5,
      title: "Exceptional stay with stunning views",
      text: "The Bosphorus view from our room was breathtaking. Staff were incredibly attentive and the breakfast spread was world-class.",
    },
    {
      g: bob,
      score: 4,
      title: "Great hotel, minor issues",
      text: "Beautiful property and excellent location. The room was luxurious but the AC was noisy at night.",
    },
    {
      g: claire,
      score: 5,
      title: "Perfect romantic getaway",
      text: "Everything was perfect — from the welcome champagne to the turndown service. Will definitely return.",
    },
    {
      g: david,
      score: 4,
      title: "Business traveller approved",
      text: "Excellent business facilities and fast WiFi. The executive lounge is a real perk. Slightly slow room service.",
    },
    {
      g: emma,
      score: 5,
      title: "A palace in every sense",
      text: "Jaw-dropping architecture and impeccable service. The hammam spa was the highlight of our Istanbul trip.",
    },
    {
      g: feng,
      score: 4,
      title: "Worth every penny",
      text: "High standards throughout. Would appreciate more Asian breakfast options but overall a superb experience.",
    },
    {
      g: giulia,
      score: 5,
      title: "Magnifico!",
      text: "Splendido hotel! Location perfect, rooms spacious, rooftop pool magical at sunset.",
    },
    {
      g: hans,
      score: 4,
      title: "Luxurious but loud",
      text: "Stunning interiors and superb food. Street-side rooms can be noisy on weekends — request a higher floor.",
    },
    {
      g: isabella,
      score: 5,
      title: "Unforgettable experience",
      text: "The personalized service made all the difference. Staff remembered our preferences from day one.",
    },
    {
      g: james,
      score: 3,
      title: "Good but overpriced",
      text: "Nice property but value has declined. Breakfast quality dropped and the pool was too crowded.",
    },
    {
      g: kenji,
      score: 5,
      title: "Best hotel in Istanbul",
      text: "Stayed 6 nights and regretted nothing. The sunset views from the bar are worth the trip alone.",
    },
    {
      g: laura,
      score: 4,
      title: "Lovely stay overall",
      text: "Gorgeous rooms and great service. The spa was fantastic. Parking situation was chaotic.",
    },
    {
      g: michael,
      score: 5,
      title: "Outstanding from start to finish",
      text: "Seamless check-in, beautiful suite, concierge arranged a private Bosphorus tour. 10/10.",
    },
    {
      g: natalia,
      score: 4,
      title: "Excellent choice for couples",
      text: "Romantic atmosphere and attentive staff. The couples spa package was a wonderful surprise.",
    },
    {
      g: omar,
      score: 5,
      title: "Grand in name and grand in reality",
      text: "A truly grand hotel. Every detail considered — pillow menu to the personalized welcome note.",
    },
  ];
  for (const r of h1Reviews) {
    await ensureReview(hotel1.id, r.g.id, r.title, {
      tenantId: tenant.id,
      hotelId: hotel1.id,
      guestId: r.g.id,
      overallScore: r.score,
      title: r.title,
      text: r.text,
      scores: { cleanliness: r.score, service: r.score, location: r.score },
      moderationStatus: "APPROVED",
    });
  }
  console.log(`\n  + ${h1Reviews.length} Grand Palace reviews`);

  // ── Reviews — Athens Boutique (12) ────────────────────────────────────────
  console.log(
    "\n── Reviews: Athens Boutique ─────────────────────────────────",
  );

  const h2Reviews = [
    {
      g: bob,
      score: 5,
      title: "Hidden gem in Athens",
      text: "Small enough to feel personal, luxurious enough to feel special. The Acropolis view at dawn is unforgettable.",
    },
    {
      g: claire,
      score: 4,
      title: "Charming and chic",
      text: "Beautifully designed rooms and a wonderful roof terrace. Breakfast is excellent. Slightly difficult to find by taxi.",
    },
    {
      g: david,
      score: 5,
      title: "Best boutique in Greece",
      text: "Impeccable taste. Staff arranged a private cooking class at last minute. Exceptional.",
    },
    {
      g: emma,
      score: 4,
      title: "Lovely but compact",
      text: "Rooms smaller than photos suggest but beautifully appointed. Perfect location for walking Athens.",
    },
    {
      g: giulia,
      score: 5,
      title: "Bellissimo! Athens at its best",
      text: "The Acropolis Suite is pure magic. Sipping coffee on the terrace with that view — absolutely perfect.",
    },
    {
      g: hans,
      score: 4,
      title: "Authentic Greek experience",
      text: "Great food, friendly staff, and an atmosphere that feels genuinely Greek rather than generic luxury.",
    },
    {
      g: kenji,
      score: 5,
      title: "Exceeded all expectations",
      text: "The attention to detail is remarkable. Greek products in the minibar, curated art on the walls, warmest welcome.",
    },
    {
      g: laura,
      score: 4,
      title: "Perfect solo travel base",
      text: "Safe, central, and staff who genuinely care. The rooftop dinners are a must. Only the gym is small.",
    },
    {
      g: michael,
      score: 5,
      title: "Athens's finest boutique",
      text: "We've stayed at many boutiques but this sets the standard. Every meal, view, interaction was exceptional.",
    },
    {
      g: priya,
      score: 4,
      title: "Cultural immersion with luxury",
      text: "The hotel arranges excellent cultural excursions. Guided Acropolis tour was outstanding. Room service slow.",
    },
    {
      g: rachel,
      score: 5,
      title: "Romantic Athens perfection",
      text: "My partner proposed on the rooftop terrace. The staff made it magical with champagne and flowers. Back every anniversary.",
    },
    {
      g: stefan,
      score: 3,
      title: "Good but not great value",
      text: "Nice hotel in great location but price has crept up. Classic rooms feel dated compared to the suites.",
    },
  ];
  for (const r of h2Reviews) {
    await ensureReview(hotel2.id, r.g.id, r.title, {
      tenantId: tenant.id,
      hotelId: hotel2.id,
      guestId: r.g.id,
      overallScore: r.score,
      title: r.title,
      text: r.text,
      scores: {
        cleanliness: r.score,
        service: r.score,
        location: Math.min(5, r.score + 1),
      },
      moderationStatus: "APPROVED",
    });
  }
  console.log(`\n  + ${h2Reviews.length} Athens Boutique reviews`);

  // ═══════════════════════════════════════════════════════════════════════════
  // SUPPORT CASES — Grand Palace Istanbul (15)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log(
    "\n── Support Cases: Grand Palace Istanbul ─────────────────────",
  );

  type Sev = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  type Stat = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  type Cat =
    | "ROOM_CLEANLINESS"
    | "ROOM_NOT_READY"
    | "NOISE_COMPLAINT"
    | "WIFI_ISSUE"
    | "AC_BROKEN"
    | "WRONG_ROOM"
    | "BILLING_ISSUE"
    | "STAFF_BEHAVIOR"
    | "SAFETY_CONCERN"
    | "FOOD_QUALITY"
    | "EVENT_ISSUE"
    | "AMENITY_MISSING"
    | "CHECK_IN_DELAY"
    | "OTHER";

  const h1Cases: Array<{
    ref: string;
    g: typeof alice;
    cat: Cat;
    sev: Sev;
    stat: Stat;
    title: string;
    desc: string;
  }> = [
    {
      ref: "CASE-GPI-001",
      g: alice,
      cat: "AC_BROKEN",
      sev: "MEDIUM",
      stat: "RESOLVED",
      title: "Room temperature too cold",
      desc: "AC in room 812 stuck on max cooling. Engineer called and thermostat replaced.",
    },
    {
      ref: "CASE-GPI-002",
      g: bob,
      cat: "AMENITY_MISSING",
      sev: "LOW",
      stat: "RESOLVED",
      title: "Missing toiletries",
      desc: "Shampoo and conditioner not restocked after first night. Housekeeping visited.",
    },
    {
      ref: "CASE-GPI-003",
      g: claire,
      cat: "NOISE_COMPLAINT",
      sev: "HIGH",
      stat: "RESOLVED",
      title: "Noisy neighbours",
      desc: "Room 915 complained about noise from adjacent room until 2am. Manager spoke to neighbours.",
    },
    {
      ref: "CASE-GPI-004",
      g: david,
      cat: "WIFI_ISSUE",
      sev: "HIGH",
      stat: "RESOLVED",
      title: "WiFi connectivity issues",
      desc: "Business guest unable to connect in meeting room 3. IT resolved within 30 minutes.",
    },
    {
      ref: "CASE-GPI-005",
      g: emma,
      cat: "EVENT_ISSUE",
      sev: "HIGH",
      stat: "RESOLVED",
      title: "Spa booking conflict",
      desc: "Double booking in couples hammam at 3pm Saturday. Resolved by upgrade to private suite.",
    },
    {
      ref: "CASE-GPI-006",
      g: feng,
      cat: "OTHER",
      sev: "LOW",
      stat: "CLOSED",
      title: "Late checkout request",
      desc: "Guest requesting 4pm checkout. Approved as room not booked same night.",
    },
    {
      ref: "CASE-GPI-007",
      g: giulia,
      cat: "BILLING_ISSUE",
      sev: "MEDIUM",
      stat: "CLOSED",
      title: "Mini bar item dispute",
      desc: "Guest disputed drink charges. CCTV confirmed items consumed. Explained to guest.",
    },
    {
      ref: "CASE-GPI-008",
      g: hans,
      cat: "SAFETY_CONCERN",
      sev: "CRITICAL",
      stat: "RESOLVED",
      title: "Elevator out — mobility concern",
      desc: "Guest with mobility issues on floor 14 impacted by elevator 2 failure. Transferred to lower floor immediately.",
    },
    {
      ref: "CASE-GPI-009",
      g: isabella,
      cat: "AMENITY_MISSING",
      sev: "MEDIUM",
      stat: "RESOLVED",
      title: "Room safe malfunction",
      desc: "Guest unable to access valuables. Maintenance opened safe within 15 minutes.",
    },
    {
      ref: "CASE-GPI-010",
      g: james,
      cat: "BILLING_ISSUE",
      sev: "MEDIUM",
      stat: "CLOSED",
      title: "Incorrect billing",
      desc: "Guest charged for breakfast plan despite dining only once. Credit issued.",
    },
    {
      ref: "CASE-GPI-011",
      g: kenji,
      cat: "AMENITY_MISSING",
      sev: "LOW",
      stat: "OPEN",
      title: "Pillow menu unavailable",
      desc: "Guest requested specific pillow type; item was out of stock. Procurement notified.",
    },
    {
      ref: "CASE-GPI-012",
      g: laura,
      cat: "AMENITY_MISSING",
      sev: "LOW",
      stat: "IN_PROGRESS",
      title: "Broken trouser press",
      desc: "Trouser press in room 1108 not working. Maintenance replacement scheduled.",
    },
    {
      ref: "CASE-GPI-013",
      g: michael,
      cat: "FOOD_QUALITY",
      sev: "CRITICAL",
      stat: "RESOLVED",
      title: "Dietary allergy — severe nut allergy",
      desc: "Guest has severe nut allergy. Kitchen flagged and dedicated utensils arranged for all meals.",
    },
    {
      ref: "CASE-GPI-014",
      g: natalia,
      cat: "OTHER",
      sev: "HIGH",
      stat: "CLOSED",
      title: "Airport transfer not arranged",
      desc: "Concierge failed to book return transfer. Taxi arranged urgently. Apology letter sent.",
    },
    {
      ref: "CASE-GPI-015",
      g: omar,
      cat: "OTHER",
      sev: "MEDIUM",
      stat: "CLOSED",
      title: "VIP anniversary decoration request",
      desc: "Returning VIP requested room decoration. Flowers, cake, and champagne arranged.",
    },
  ];

  for (const c of h1Cases) {
    await ensureCase(c.ref, {
      tenantId: tenant.id,
      hotelId: hotel1.id,
      guestId: c.g.id,
      assignedToId: h1FD?.id ?? null,
      caseRef: c.ref,
      category: c.cat,
      severity: c.sev,
      status: c.stat,
      title: c.title,
      description: c.desc,
    });
  }
  console.log(`\n  + ${h1Cases.length} Grand Palace support cases`);

  // ── Support Cases — Athens Boutique (10) ──────────────────────────────────
  console.log(
    "\n── Support Cases: Athens Boutique ───────────────────────────",
  );

  const h2Cases: Array<{
    ref: string;
    g: typeof alice;
    cat: Cat;
    sev: Sev;
    stat: Stat;
    title: string;
    desc: string;
  }> = [
    {
      ref: "CASE-ATH-001",
      g: bob,
      cat: "CHECK_IN_DELAY",
      sev: "MEDIUM",
      stat: "CLOSED",
      title: "Check-in delay",
      desc: "Room not ready at 3pm. Guest waited 45 minutes. Room upgrade offered.",
    },
    {
      ref: "CASE-ATH-002",
      g: claire,
      cat: "ROOM_CLEANLINESS",
      sev: "HIGH",
      stat: "RESOLVED",
      title: "Mosquito issue in room",
      desc: "Guest found mosquitoes in room 204. Pest control arranged same evening.",
    },
    {
      ref: "CASE-ATH-003",
      g: david,
      cat: "EVENT_ISSUE",
      sev: "LOW",
      stat: "OPEN",
      title: "Rooftop restaurant fully booked",
      desc: "Guest unable to get Saturday reservation. Waitlisted and alternative offered.",
    },
    {
      ref: "CASE-ATH-004",
      g: emma,
      cat: "OTHER",
      sev: "MEDIUM",
      stat: "RESOLVED",
      title: "Low water pressure in shower",
      desc: "Plumber attended room 312, pressure normalised within 2 hours.",
    },
    {
      ref: "CASE-ATH-005",
      g: giulia,
      cat: "SAFETY_CONCERN",
      sev: "CRITICAL",
      stat: "RESOLVED",
      title: "Terrace door lock broken",
      desc: "Security risk — terrace sliding door not locking. Repaired same day.",
    },
    {
      ref: "CASE-ATH-006",
      g: hans,
      cat: "NOISE_COMPLAINT",
      sev: "MEDIUM",
      stat: "CLOSED",
      title: "Noise from street",
      desc: "Room 101 affected by street noise late night. Earplugs provided, room move offered.",
    },
    {
      ref: "CASE-ATH-007",
      g: james,
      cat: "WRONG_ROOM",
      sev: "HIGH",
      stat: "CLOSED",
      title: "Incorrect room type assigned",
      desc: "Guest booked Acropolis View Suite but given Classic Double. Corrected at check-in.",
    },
    {
      ref: "CASE-ATH-008",
      g: kenji,
      cat: "FOOD_QUALITY",
      sev: "HIGH",
      stat: "CLOSED",
      title: "Dietary requirements ignored",
      desc: "Vegan guest served dairy at breakfast. Full apology and breakfast refund issued.",
    },
    {
      ref: "CASE-ATH-009",
      g: laura,
      cat: "OTHER",
      sev: "LOW",
      stat: "OPEN",
      title: "Lost property — cashmere scarf",
      desc: "Scarf left in room 206. Item found, held at reception for collection.",
    },
    {
      ref: "CASE-ATH-010",
      g: michael,
      cat: "AMENITY_MISSING",
      sev: "LOW",
      stat: "CLOSED",
      title: "TV remote battery dead",
      desc: "New batteries provided within 10 minutes.",
    },
  ];

  for (const c of h2Cases) {
    await ensureCase(c.ref, {
      tenantId: tenant.id,
      hotelId: hotel2.id,
      guestId: c.g.id,
      assignedToId: h2FD?.id ?? null,
      caseRef: c.ref,
      category: c.cat,
      severity: c.sev,
      status: c.stat,
      title: c.title,
      description: c.desc,
    });
  }
  console.log(`\n  + ${h2Cases.length} Athens Boutique support cases`);

  // ═══════════════════════════════════════════════════════════════════════════
  // EVENTS (7)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log(
    "\n── Events ───────────────────────────────────────────────────",
  );

  // EventRequest model: eventType, title, description, eventDate, guestCount, budgetCents, status, requesterId
  const eventDefs = [
    {
      hotelId: hotel1.id,
      reqId: alice.id,
      title: "Istanbul Tech Summit — Gala Dinner",
      desc: "Annual gala for 200 tech executives. Black-tie, live music, 5-course menu.",
      type: "GALA_DINNER",
      status: "CONFIRMED",
      date: daysFromNow(45),
      guests: 200,
      budget: 4800000,
    },
    {
      hotelId: hotel1.id,
      reqId: bob.id,
      title: "Bosphorus Corporate Retreat",
      desc: "2-day corporate retreat for 50 executives. Team-building and strategic planning.",
      type: "CONFERENCE",
      status: "CONFIRMED",
      date: daysFromNow(60),
      guests: 50,
      budget: 2200000,
    },
    {
      hotelId: hotel1.id,
      reqId: claire.id,
      title: "Royal Wedding — Yıldız & Mehmet",
      desc: "Luxury wedding reception for 120 guests with Ottoman ceremony elements.",
      type: "WEDDING",
      status: "CONFIRMED",
      date: daysFromNow(90),
      guests: 120,
      budget: 8500000,
    },
    {
      hotelId: hotel1.id,
      reqId: david.id,
      title: "Fashion Week After-Party",
      desc: "Exclusive after-party for Istanbul Fashion Week. Cocktails and canapés.",
      type: "GALA_DINNER",
      status: "INQUIRY",
      date: daysFromNow(120),
      guests: 80,
      budget: 1800000,
    },
    {
      hotelId: hotel2.id,
      reqId: emma.id,
      title: "Greek Mythology Cultural Evening",
      desc: "Intimate evening for 30 guests: storytelling, music, Greek mezze.",
      type: "WORKSHOP",
      status: "CONFIRMED",
      date: daysFromNow(14),
      guests: 30,
      budget: 450000,
    },
    {
      hotelId: hotel2.id,
      reqId: giulia.id,
      title: "Aegean Wine & Gastronomy Summit",
      desc: "2-day tasting event showcasing Greek regional wines and cuisine.",
      type: "CONFERENCE",
      status: "CONFIRMED",
      date: daysFromNow(55),
      guests: 60,
      budget: 1200000,
    },
    {
      hotelId: hotel2.id,
      reqId: hans.id,
      title: "Acropolis Sunrise Wedding — Elena & Dmitri",
      desc: "Intimate sunrise wedding for 40 guests with Acropolis backdrop.",
      type: "WEDDING",
      status: "INQUIRY",
      date: daysFromNow(100),
      guests: 40,
      budget: 2800000,
    },
  ];

  for (const ev of eventDefs) {
    const ex = await db.eventRequest.findFirst({
      where: { hotelId: ev.hotelId, title: ev.title },
    });
    if (ex) {
      console.log(`  skip event "${ev.title}"`);
      continue;
    }
    await db.eventRequest.create({
      data: {
        tenantId: tenant.id,
        hotelId: ev.hotelId,
        requesterId: ev.reqId,
        title: ev.title,
        description: ev.desc,
        eventType: ev.type as any,
        status: ev.status as any,
        eventDate: ev.date,
        guestCount: ev.guests,
        budgetCents: ev.budget,
        requirements: {},
      },
    });
    console.log(`  + event "${ev.title}"`);
  }

  // ─── Final summary ─────────────────────────────────────────────────────────
  const [totalB, totalR, totalC, totalE, totalG] = await Promise.all([
    db.booking.count({ where: { tenantId: tenant.id } }),
    db.review.count({ where: { tenantId: tenant.id } }),
    db.supportCase.count({ where: { tenantId: tenant.id } }),
    db.eventRequest.count({ where: { tenantId: tenant.id } }),
    db.user.count({ where: { tenantId: tenant.id, role: "GUEST" } }),
  ]);

  console.log("\n=== seed-massive.ts done ===");
  console.log(`  Bookings      : ${totalB}`);
  console.log(`  Reviews       : ${totalR}`);
  console.log(`  Support Cases : ${totalC}`);
  console.log(`  Events        : ${totalE}`);
  console.log(`  Guests        : ${totalG}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
