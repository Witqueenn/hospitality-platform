import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Tenant ────────────────────────────────
  const tenant = await db.tenant.upsert({
    where: { slug: "grand-hotels" },
    create: {
      name: "Grand Hotels Group",
      slug: "grand-hotels",
      billingPlan: "enterprise",
      status: "ACTIVE",
      settings: { maxHotels: 10 },
    },
    update: {},
  });
  console.log("✓ Tenant:", tenant.name);

  // ─── Admin User ─────────────────────────────
  const adminPw = await bcrypt.hash("admin123456", 12);
  const admin = await db.user.upsert({
    where: {
      tenantId_email: { tenantId: tenant.id, email: "admin@grandhot.com" },
    },
    create: {
      tenantId: tenant.id,
      email: "admin@grandhot.com",
      name: "Platform Admin",
      passwordHash: adminPw,
      role: "SUPER_ADMIN",
    },
    update: {},
  });

  const guestPw = await bcrypt.hash("guest123456", 12);
  const guest = await db.user.upsert({
    where: {
      tenantId_email: { tenantId: tenant.id, email: "guest@example.com" },
    },
    create: {
      tenantId: tenant.id,
      email: "guest@example.com",
      name: "Alice Johnson",
      passwordHash: guestPw,
      role: "GUEST",
      preferences: { requiresGoodWifi: true, noiseSensitive: false },
    },
    update: {},
  });
  console.log("✓ Users created");

  // ─── Hotel 1 ────────────────────────────────
  const hotel1 = await db.hotel.upsert({
    where: {
      tenantId_slug: { tenantId: tenant.id, slug: "grand-palace-istanbul" },
    },
    create: {
      tenantId: tenant.id,
      name: "Grand Palace Istanbul",
      slug: "grand-palace-istanbul",
      description:
        "A luxurious 5-star hotel overlooking the Bosphorus strait with world-class amenities and exceptional service.",
      shortDescription: "5-star luxury hotel with Bosphorus views",
      starRating: 5,
      address: {
        street: "Çırağan Caddesi 32",
        city: "Istanbul",
        country: "Turkey",
        postalCode: "34349",
        lat: 41.0479,
        lng: 29.0394,
      },
      contactInfo: {
        phone: "+90 212 326 4646",
        email: "reservations@grandpalace.com",
      },
      policies: {
        checkIn: "15:00",
        checkOut: "12:00",
        cancellation: "48h free cancellation",
        children: "Welcome",
        pets: "Not allowed",
        smoking: "Designated areas only",
      },
      amenities: [
        "pool",
        "spa",
        "gym",
        "restaurant",
        "bar",
        "conference_room",
        "ballroom",
        "parking",
        "concierge",
        "room_service",
      ],
      tags: ["luxury", "bosphorus-view", "business", "romantic"],
      wifiQuality: "excellent",
      noiseNotes:
        "Rooms on Bosphorus side may have light boat noise in the morning.",
      status: "ACTIVE",
      timezone: "Europe/Istanbul",
      currency: "USD",
      verifiedFields: {
        photos: true,
        amenities: true,
        policies: true,
        starRating: true,
      },
    },
    update: {},
  });

  // Hotel 1 staff
  const staffPw = await bcrypt.hash("staff123456", 12);
  const hotelManager = await db.user.upsert({
    where: {
      tenantId_email: { tenantId: tenant.id, email: "manager@grandpalace.com" },
    },
    create: {
      tenantId: tenant.id,
      hotelId: hotel1.id,
      email: "manager@grandpalace.com",
      name: "Mehmet Yilmaz",
      passwordHash: staffPw,
      role: "HOTEL_ADMIN",
    },
    update: {},
  });

  const frontDesk = await db.user.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: "frontdesk@grandpalace.com",
      },
    },
    create: {
      tenantId: tenant.id,
      hotelId: hotel1.id,
      email: "frontdesk@grandpalace.com",
      name: "Elif Kaya",
      passwordHash: staffPw,
      role: "FRONT_DESK",
    },
    update: {},
  });
  console.log("✓ Hotel 1:", hotel1.name);

  // ─── Hotel 2 ────────────────────────────────
  const hotel2 = await db.hotel.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: "boutique-athens" } },
    create: {
      tenantId: tenant.id,
      name: "The Athens Boutique",
      slug: "boutique-athens",
      description:
        "A charming boutique hotel in the heart of Athens, steps from the Acropolis.",
      shortDescription: "Boutique hotel near Acropolis",
      starRating: 4,
      address: {
        street: "Dionysiou Areopagitou 15",
        city: "Athens",
        country: "Greece",
        postalCode: "11742",
        lat: 37.9715,
        lng: 23.7267,
      },
      policies: {
        checkIn: "14:00",
        checkOut: "11:00",
        cancellation: "24h free cancellation",
        children: "Welcome",
        pets: "Small pets allowed",
        smoking: "Not allowed",
      },
      amenities: ["restaurant", "bar", "rooftop", "gym", "conference_room"],
      tags: ["boutique", "historic", "romantic", "family"],
      wifiQuality: "good",
      status: "ACTIVE",
      timezone: "Europe/Athens",
      currency: "EUR",
    },
    update: {},
  });
  console.log("✓ Hotel 2:", hotel2.name);

  // ─── Room Types Hotel 1 ──────────────────────
  const deluxeKing = await db.roomType.upsert({
    where: { id: "00000000-0000-0000-0001-000000000001" },
    create: {
      id: "00000000-0000-0000-0001-000000000001",
      hotelId: hotel1.id,
      tenantId: tenant.id,
      name: "Deluxe King — Bosphorus View",
      description: "Spacious room with king bed and stunning Bosphorus views.",
      capacity: 2,
      bedType: "king",
      sizeSqm: 38,
      floor: "Floors 4-8",
      features: ["bosphorus-view", "minibar", "bathtub", "balcony"],
      sortOrder: 1,
    },
    update: {},
  });

  const juniorSuite = await db.roomType.upsert({
    where: { id: "00000000-0000-0000-0001-000000000002" },
    create: {
      id: "00000000-0000-0000-0001-000000000002",
      hotelId: hotel1.id,
      tenantId: tenant.id,
      name: "Junior Suite",
      description: "Junior suite with separate living area and city views.",
      capacity: 3,
      bedType: "king",
      sizeSqm: 55,
      floor: "Floors 9-12",
      features: ["city-view", "minibar", "sofa-bed", "premium-amenities"],
      sortOrder: 2,
    },
    update: {},
  });
  console.log("✓ Room types created");

  // ─── Room Inventory (next 30 days) ──────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 30; i++) {
    const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);

    await db.roomInventory.upsert({
      where: { roomTypeId_date: { roomTypeId: deluxeKing.id, date } },
      create: {
        roomTypeId: deluxeKing.id,
        tenantId: tenant.id,
        date,
        totalCount: 8,
        availableCount: i % 5 === 0 ? 2 : 6,
        pricePerNight: 18900, // $189
        minStay: 1,
      },
      update: {},
    });

    await db.roomInventory.upsert({
      where: { roomTypeId_date: { roomTypeId: juniorSuite.id, date } },
      create: {
        roomTypeId: juniorSuite.id,
        tenantId: tenant.id,
        date,
        totalCount: 4,
        availableCount: i % 7 === 0 ? 1 : 3,
        pricePerNight: 28900, // $289
        minStay: 1,
      },
      update: {},
    });
  }
  console.log("✓ Room inventory: 30 days");

  // ─── Venue ──────────────────────────────────
  const venue = await db.venue.upsert({
    where: { id: "00000000-0000-0000-0002-000000000001" },
    create: {
      id: "00000000-0000-0000-0002-000000000001",
      hotelId: hotel1.id,
      tenantId: tenant.id,
      name: "Grand Ballroom",
      description:
        "Magnificent ballroom with panoramic Bosphorus views. Perfect for weddings and galas.",
      floorLevel: "Mezzanine",
      sizeSquareMeters: 800,
      capacities: {
        THEATER: 500,
        CLASSROOM: 300,
        BANQUET_ROUND: 400,
        COCKTAIL: 600,
      },
      defaultLayout: "BANQUET_ROUND",
      availableLayouts: [
        "THEATER",
        "CLASSROOM",
        "BANQUET_ROUND",
        "COCKTAIL",
        "HOLLOW_SQUARE",
      ],
      features: [
        "natural_light",
        "av_equipment",
        "private_bar",
        "bosphorus_view",
        "stage",
      ],
      avEquipment: [
        "projector",
        "screen",
        "microphone",
        "PA_system",
        "LED_lighting",
      ],
      ratePerHour: 50000,
      ratePerDay: 300000,
    },
    update: {},
  });

  const meetingRoom = await db.venue.upsert({
    where: { id: "00000000-0000-0000-0002-000000000002" },
    create: {
      id: "00000000-0000-0000-0002-000000000002",
      hotelId: hotel1.id,
      tenantId: tenant.id,
      name: "Bosphorus Meeting Room",
      floorLevel: "Floor 3",
      sizeSquareMeters: 80,
      capacities: { BOARDROOM: 20, CLASSROOM: 30, U_SHAPE: 18 },
      defaultLayout: "BOARDROOM",
      availableLayouts: ["BOARDROOM", "CLASSROOM", "U_SHAPE"],
      features: ["natural_light", "av_equipment"],
      ratePerHour: 15000,
    },
    update: {},
  });
  console.log("✓ Venues created");

  // ─── Dining Experience ────────────────────────
  const restaurant = await db.diningExperience.upsert({
    where: { id: "00000000-0000-0000-0003-000000000001" },
    create: {
      id: "00000000-0000-0000-0003-000000000001",
      hotelId: hotel1.id,
      tenantId: tenant.id,
      name: "The Bosphorus Restaurant",
      diningType: "RESTAURANT",
      description:
        "Award-winning restaurant with Ottoman-Mediterranean cuisine and stunning water views.",
      cuisine: ["Mediterranean", "Ottoman", "Turkish"],
      openHours: {
        mon: "07:00-23:00",
        tue: "07:00-23:00",
        wed: "07:00-23:00",
        thu: "07:00-23:00",
        fri: "07:00-00:00",
        sat: "07:00-00:00",
        sun: "07:00-23:00",
      },
      capacity: 120,
      priceRange: "$$$",
      menuHighlights: ["Grilled Sea Bass", "Ottoman Lamb", "Baklava"],
    },
    update: {},
  });
  console.log("✓ Dining created");

  // ─── Sample Bookings ──────────────────────────
  const bookingRef1 = `HEO-${new Date().getFullYear()}-SEED1`;
  const booking1 = await db.booking.upsert({
    where: { bookingRef: bookingRef1 },
    create: {
      tenantId: tenant.id,
      hotelId: hotel1.id,
      guestId: guest.id,
      bookingType: "ROOM",
      bookingRef: bookingRef1,
      status: "CONFIRMED",
      checkIn: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      checkOut: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      guestCount: 2,
      subtotalCents: 56700,
      taxCents: 5670,
      totalCents: 62370,
      paymentStatus: "CAPTURED",
      specialRequests: "High floor preferred, quiet room",
    },
    update: {},
  });

  const bookingRef2 = `HEO-${new Date().getFullYear()}-SEED2`;
  const booking2 = await db.booking.upsert({
    where: { bookingRef: bookingRef2 },
    create: {
      tenantId: tenant.id,
      hotelId: hotel1.id,
      guestId: guest.id,
      bookingType: "ROOM",
      bookingRef: bookingRef2,
      status: "CHECKED_IN",
      checkIn: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      checkOut: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      guestCount: 1,
      subtotalCents: 28900,
      taxCents: 2890,
      totalCents: 31790,
      paymentStatus: "CAPTURED",
      checkedInAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    update: {},
  });
  console.log("✓ Bookings created");

  // ─── Support Cases ────────────────────────────
  const case1 = await db.supportCase.upsert({
    where: { caseRef: "CASE-SEED01" },
    create: {
      tenantId: tenant.id,
      hotelId: hotel1.id,
      guestId: guest.id,
      bookingId: booking2.id,
      caseRef: "CASE-SEED01",
      category: "AC_BROKEN",
      severity: "HIGH",
      status: "IN_PROGRESS",
      title: "Air conditioning not working in room 412",
      description:
        "The air conditioning unit in my room has not been functioning for the past 12 hours. Room temperature is uncomfortable.",
      roomNumber: "412",
      responseDeadline: new Date(Date.now() + 30 * 60 * 1000),
      resolutionDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000),
      assignedToId: frontDesk.id,
      timeline: {
        create: [
          {
            tenantId: tenant.id,
            actorType: "guest",
            actorId: guest.id,
            actorName: "Alice Johnson",
            eventType: "message",
            content:
              "The AC has been broken since last night. Please fix ASAP.",
          },
          {
            tenantId: tenant.id,
            actorType: "staff",
            actorId: frontDesk.id,
            actorName: "Elif Kaya",
            eventType: "status_change",
            content:
              "Case assigned to maintenance team. Technician dispatched.",
            metadata: { from: "OPEN", to: "IN_PROGRESS" },
          },
        ],
      },
      compensations: {
        create: {
          tenantId: tenant.id,
          compensationType: "AMENITY_CREDIT",
          description: "Complimentary amenity credit for inconvenience",
          valueCents: 2500,
          status: "APPROVED",
          requiresApproval: false,
          reasoning: "HIGH severity AC issue warrants amenity credit",
          executedAt: new Date(),
        },
      },
    },
    update: {},
  });

  const case2 = await db.supportCase.upsert({
    where: { caseRef: "CASE-SEED02" },
    create: {
      tenantId: tenant.id,
      hotelId: hotel1.id,
      guestId: guest.id,
      bookingId: booking1.id,
      caseRef: "CASE-SEED02",
      category: "WIFI_ISSUE",
      severity: "LOW",
      status: "AWAITING_APPROVAL",
      title: "Wi-Fi connection dropping frequently",
      description:
        "The Wi-Fi connection in my room keeps dropping every 20-30 minutes. I need stable internet for work.",
      roomNumber: "815",
      responseDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      resolutionDeadline: new Date(Date.now() + 72 * 60 * 60 * 1000),
      compensations: {
        create: {
          tenantId: tenant.id,
          compensationType: "PARTIAL_REFUND",
          description: "10% refund for Wi-Fi issues during business stay",
          valueCents: 6237,
          status: "PENDING_APPROVAL",
          requiresApproval: true,
          reasoning:
            "LOW severity but guest is business traveler; partial refund proposed pending approval",
        },
      },
    },
    update: {},
  });
  console.log("✓ Support cases created");

  // ─── Event Request ────────────────────────────
  const eventReq = await db.eventRequest.upsert({
    where: { id: "00000000-0000-0000-0004-000000000001" },
    create: {
      id: "00000000-0000-0000-0004-000000000001",
      tenantId: tenant.id,
      hotelId: hotel1.id,
      requesterId: guest.id,
      eventType: "CORPORATE_RETREAT",
      title: "Annual Tech Summit 2026",
      description:
        "Full-day technology conference with keynote speakers, breakout sessions, and gala dinner.",
      eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      startTime: "09:00",
      endTime: "22:00",
      guestCount: 250,
      budgetCents: 5000000,
      requirements: {
        dietary: true,
        av_equipment: true,
        simultaneous_translation: false,
        gala_dinner: true,
      },
      status: "CONFIRMED",
      confirmedAt: new Date(),
      eventBooking: {
        create: {
          tenantId: tenant.id,
          venueId: venue.id,
          layout: "BANQUET_ROUND",
          setupTime: "07:00",
          breakdownTime: "23:00",
          contractedPax: 250,
          guaranteedPax: 220,
          totalCents: 4500000,
          depositCents: 900000,
        },
      },
      beo: {
        create: {
          tenantId: tenant.id,
          status: "PENDING_REVIEW",
          title: "BEO — Annual Tech Summit 2026",
          content: {
            eventName: "Annual Tech Summit 2026",
            venue: "Grand Ballroom",
            date: "Mar 26, 2026",
            guestCount: 250,
          },
          runOfShow: [
            {
              time: "07:00",
              activity: "Setup & decoration",
              responsible: "Operations",
            },
            {
              time: "08:30",
              activity: "Registration open",
              responsible: "Front desk",
            },
            {
              time: "09:00",
              activity: "Opening keynote",
              responsible: "Event manager",
            },
            { time: "13:00", activity: "Lunch buffet", responsible: "F&B" },
            {
              time: "14:00",
              activity: "Breakout sessions",
              responsible: "Operations",
            },
            {
              time: "19:00",
              activity: "Gala dinner setup",
              responsible: "F&B",
            },
            {
              time: "20:00",
              activity: "Gala dinner begins",
              responsible: "All",
            },
            {
              time: "22:00",
              activity: "Event concludes",
              responsible: "Operations",
            },
          ],
          fbRequirements: {
            breakfast: false,
            lunch: { style: "buffet", dietary: ["vegetarian", "gluten-free"] },
            dinner: { style: "plated", courses: 3 },
            breaks: { morning: true, afternoon: true },
          },
          staffingPlan: [
            { role: "Event Coordinator", count: 2 },
            { role: "F&B Staff", count: 15 },
            { role: "AV Technician", count: 3 },
            { role: "Security", count: 4 },
          ],
        },
      },
    },
    update: {},
  });
  console.log("✓ Event request created");

  // ─── Reviews ──────────────────────────────────
  await db.review.upsert({
    where: { id: "00000000-0000-0000-0005-000000000001" },
    create: {
      id: "00000000-0000-0000-0005-000000000001",
      tenantId: tenant.id,
      hotelId: hotel1.id,
      guestId: guest.id,
      overallScore: 9,
      scores: {
        cleanliness: 9,
        staff: 10,
        wifi: 7,
        dining: 9,
        noise: 8,
        roomAccuracy: 9,
      },
      title: "Exceptional experience with stunning views",
      text: "The Bosphorus views from our room were absolutely breathtaking. Staff was incredibly attentive and professional. The only minor issue was the Wi-Fi dropping occasionally, but it was resolved quickly.",
      sentiment: "positive",
      sentimentScore: 0.88,
      moderationStatus: "APPROVED",
      hotelResponse:
        "Thank you so much for your wonderful review, Alice! We're thrilled you enjoyed your stay and we'll work on improving our Wi-Fi reliability.",
      respondedAt: new Date(),
    },
    update: {},
  });
  console.log("✓ Reviews created");

  // ─── Hotel Insights ───────────────────────────
  await db.hotelInsight.create({
    data: {
      tenantId: tenant.id,
      hotelId: hotel1.id,
      insightType: "recurring_issue",
      category: "WIFI_ISSUE",
      title: "Wi-Fi complaints trending upward",
      description:
        "5 Wi-Fi related support cases this month from rooms 301-320. Recommend network infrastructure review.",
      severity: "warning",
      isActionable: true,
      data: { caseCount: 5, affectedRooms: ["301-320"], monthlyTrend: "+40%" },
    },
  });
  console.log("✓ Hotel insights created");

  // ─── Tenant Policies ──────────────────────────
  await db.tenantPolicy.upsert({
    where: {
      tenantId_policyKey: {
        tenantId: tenant.id,
        policyKey: "compensation.auto_approve_max_cents",
      },
    },
    create: {
      tenantId: tenant.id,
      policyKey: "compensation.auto_approve_max_cents",
      policyValue: 2500,
      description:
        "Maximum compensation that agents can auto-approve without human review",
    },
    update: {},
  });

  await db.tenantPolicy.upsert({
    where: {
      tenantId_policyKey: {
        tenantId: tenant.id,
        policyKey: "sla.critical_response_minutes",
      },
    },
    create: {
      tenantId: tenant.id,
      policyKey: "sla.critical_response_minutes",
      policyValue: 15,
      description: "Minutes to respond to CRITICAL severity cases",
    },
    update: {},
  });
  console.log("✓ Tenant policies created");

  console.log("\n✅ Seed complete!");
  console.log("\n📋 Demo credentials:");
  console.log("  Admin:     admin@grandhot.com / admin123456");
  console.log("  Hotel Mgr: manager@grandpalace.com / staff123456");
  console.log("  Front Desk: frontdesk@grandpalace.com / staff123456");
  console.log("  Guest:     guest@example.com / guest123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
