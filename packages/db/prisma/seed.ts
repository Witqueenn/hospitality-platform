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

  // ── Additional hotel staff roles
  const hotelMgr = await db.user.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: "hotelmgr@grandpalace.com",
      },
    },
    create: {
      tenantId: tenant.id,
      hotelId: hotel1.id,
      email: "hotelmgr@grandpalace.com",
      name: "Serkan Arslan",
      passwordHash: staffPw,
      role: "HOTEL_MANAGER",
    },
    update: {},
  });

  const guestRelations = await db.user.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: "guestrel@grandpalace.com",
      },
    },
    create: {
      tenantId: tenant.id,
      hotelId: hotel1.id,
      email: "guestrel@grandpalace.com",
      name: "Selin Çelik",
      passwordHash: staffPw,
      role: "GUEST_RELATIONS",
    },
    update: {},
  });

  const opsManager = await db.user.upsert({
    where: {
      tenantId_email: { tenantId: tenant.id, email: "ops@grandpalace.com" },
    },
    create: {
      tenantId: tenant.id,
      hotelId: hotel1.id,
      email: "ops@grandpalace.com",
      name: "Burak Doğan",
      passwordHash: staffPw,
      role: "OPERATIONS_MANAGER",
    },
    update: {},
  });

  const financeUser = await db.user.upsert({
    where: {
      tenantId_email: { tenantId: tenant.id, email: "finance@grandpalace.com" },
    },
    create: {
      tenantId: tenant.id,
      hotelId: hotel1.id,
      email: "finance@grandpalace.com",
      name: "Hande Şahin",
      passwordHash: staffPw,
      role: "FINANCE_APPROVER",
    },
    update: {},
  });

  const eventsManager = await db.user.upsert({
    where: {
      tenantId_email: { tenantId: tenant.id, email: "events@grandpalace.com" },
    },
    create: {
      tenantId: tenant.id,
      hotelId: hotel1.id,
      email: "events@grandpalace.com",
      name: "Tolga Yıldız",
      passwordHash: staffPw,
      role: "EVENTS_MANAGER",
    },
    update: {},
  });

  const fbManager = await db.user.upsert({
    where: {
      tenantId_email: { tenantId: tenant.id, email: "fb@grandpalace.com" },
    },
    create: {
      tenantId: tenant.id,
      hotelId: hotel1.id,
      email: "fb@grandpalace.com",
      name: "Zeynep Aydın",
      passwordHash: staffPw,
      role: "FB_MANAGER",
    },
    update: {},
  });

  const resvManager = await db.user.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: "reservations@grandpalace.com",
      },
    },
    create: {
      tenantId: tenant.id,
      hotelId: hotel1.id,
      email: "reservations@grandpalace.com",
      name: "Kaan Öztürk",
      passwordHash: staffPw,
      role: "RESERVATIONS_MANAGER",
    },
    update: {},
  });

  // ── Platform Ops (Admin portal access)
  await db.user.upsert({
    where: {
      tenantId_email: { tenantId: tenant.id, email: "ops@platform.heo" },
    },
    create: {
      tenantId: tenant.id,
      email: "ops@platform.heo",
      name: "Platform Ops",
      passwordHash: await bcrypt.hash("platform123456", 12),
      role: "PLATFORM_OPS",
    },
    update: {},
  });

  // ── Extra guest accounts
  await db.user.upsert({
    where: {
      tenantId_email: { tenantId: tenant.id, email: "guest2@example.com" },
    },
    create: {
      tenantId: tenant.id,
      email: "guest2@example.com",
      name: "James Miller",
      passwordHash: await bcrypt.hash("guest123456", 12),
      role: "GUEST",
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
  await db.user.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: "admin@boutiqueathens.com",
      },
    },
    create: {
      tenantId: tenant.id,
      hotelId: hotel2.id,
      email: "admin@boutiqueathens.com",
      name: "Nikos Papadopoulos",
      passwordHash: staffPw,
      role: "HOTEL_ADMIN",
    },
    update: {},
  });

  await db.user.upsert({
    where: {
      tenantId_email: { tenantId: tenant.id, email: "desk@boutiqueathens.com" },
    },
    create: {
      tenantId: tenant.id,
      hotelId: hotel2.id,
      email: "desk@boutiqueathens.com",
      name: "Maria Georgiou",
      passwordHash: staffPw,
      role: "FRONT_DESK",
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

  // ─── Wi-Fi Credentials ────────────────────────
  await db.hotelWifiCredential.upsert({
    where: { id: "00000000-0000-0000-0010-000000000001" },
    create: {
      id: "00000000-0000-0000-0010-000000000001",
      tenantId: tenant.id,
      hotelId: hotel1.id,
      networkName: "GrandPalace_Guest",
      password: "welcome2026",
      zone: "All Areas",
      description: "Available in all rooms and public areas",
      isActive: true,
    },
    update: {},
  });

  await db.hotelWifiCredential.upsert({
    where: { id: "00000000-0000-0000-0010-000000000002" },
    create: {
      id: "00000000-0000-0000-0010-000000000002",
      tenantId: tenant.id,
      hotelId: hotel1.id,
      networkName: "GrandPalace_Premium",
      password: "vip2026gp",
      zone: "Suites",
      description: "Suite guests and loyalty members only",
      isActive: true,
    },
    update: {},
  });
  console.log("✓ Wi-Fi credentials created");

  // ─── Hotel Menus ──────────────────────────────
  await db.hotelVenueMenu.upsert({
    where: { id: "00000000-0000-0000-0011-000000000001" },
    create: {
      id: "00000000-0000-0000-0011-000000000001",
      tenantId: tenant.id,
      hotelId: hotel1.id,
      name: "Room Service Menu",
      menuType: "ROOM_SERVICE",
      description: "Available 24/7 — delivered to your room",
      isActive: true,
      content: {
        sections: [
          {
            title: "Starters",
            items: [
              {
                name: "Hummus & Pita",
                description: "House-made hummus with warm pita bread",
                price: 12,
              },
              {
                name: "Seasonal Soup",
                description: "Chef's soup of the day",
                price: 10,
              },
            ],
          },
          {
            title: "Mains",
            items: [
              {
                name: "Grilled Sea Bass",
                description:
                  "Mediterranean herbs, lemon butter sauce, seasonal vegetables",
                price: 38,
              },
              {
                name: "Ottoman Lamb Chops",
                description: "Marinated lamb, pomegranate glaze, bulgur pilaf",
                price: 45,
              },
              {
                name: "Mushroom Risotto",
                description: "Porcini & truffle, parmesan cream (V)",
                price: 28,
              },
            ],
          },
          {
            title: "Desserts",
            items: [
              {
                name: "Baklava Selection",
                description: "Pistachio & walnut baklava, clotted cream",
                price: 14,
              },
              {
                name: "Chocolate Fondant",
                description: "Warm dark chocolate cake, vanilla gelato",
                price: 16,
              },
            ],
          },
        ],
      },
    },
    update: {},
  });

  await db.hotelVenueMenu.upsert({
    where: { id: "00000000-0000-0000-0011-000000000002" },
    create: {
      id: "00000000-0000-0000-0011-000000000002",
      tenantId: tenant.id,
      hotelId: hotel1.id,
      name: "Minibar",
      menuType: "BAR",
      description: "Items from your in-room minibar",
      isActive: true,
      content: {
        sections: [
          {
            title: "Beverages",
            items: [
              { name: "Still Water 500ml", price: 5 },
              { name: "Sparkling Water 500ml", price: 6 },
              {
                name: "Soft Drinks",
                description: "Cola, lemonade, orange juice",
                price: 7,
              },
              { name: "Local Beer", price: 9 },
            ],
          },
          {
            title: "Snacks",
            items: [
              { name: "Mixed Nuts", price: 8 },
              { name: "Dark Chocolate Bar", price: 6 },
              { name: "Turkish Delight", price: 7 },
            ],
          },
        ],
      },
    },
    update: {},
  });
  console.log("✓ Hotel menus created");

  // ─── Guest Stay Session ───────────────────────
  const stay = await db.guestStaySession.upsert({
    where: { id: "00000000-0000-0000-0012-000000000001" },
    create: {
      id: "00000000-0000-0000-0012-000000000001",
      tenantId: tenant.id,
      hotelId: hotel1.id,
      guestId: guest.id,
      bookingId: booking2.id,
      roomNumber: "412",
      checkInAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      checkOutAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: "ACTIVE",
    },
    update: {},
  });
  console.log("✓ Guest stay session created");

  // ─── In-Stay Messages ─────────────────────────
  await db.inStayMessage.createMany({
    skipDuplicates: true,
    data: [
      {
        id: "00000000-0000-0000-0013-000000000001",
        tenantId: tenant.id,
        stayId: stay.id,
        guestId: guest.id,
        hotelId: hotel1.id,
        category: "WELCOME",
        body: "Welcome to Grand Palace Istanbul, Alice! We hope you have a wonderful stay. Please don't hesitate to reach out if you need anything.",
        readAt: new Date(),
        sentAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
      },
      {
        id: "00000000-0000-0000-0013-000000000002",
        tenantId: tenant.id,
        stayId: stay.id,
        guestId: guest.id,
        hotelId: hotel1.id,
        category: "SERVICE_UPDATE",
        body: "Thank you! Could you arrange a late checkout if possible?",
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    ],
  });
  console.log("✓ In-stay messages created");

  // ─── Service Requests ─────────────────────────
  await db.guestServiceRequest.upsert({
    where: { requestRef: "SRQ-SEED0001" },
    create: {
      tenantId: tenant.id,
      hotelId: hotel1.id,
      stayId: stay.id,
      guestId: guest.id,
      requestRef: "SRQ-SEED0001",
      requestType: "EXTRA_TOWELS",
      priority: "NORMAL",
      status: "PENDING",
      description: "Please bring 2 extra bath towels",
    },
    update: {},
  });

  await db.guestServiceRequest.upsert({
    where: { requestRef: "SRQ-SEED0002" },
    create: {
      tenantId: tenant.id,
      hotelId: hotel1.id,
      stayId: stay.id,
      guestId: guest.id,
      requestRef: "SRQ-SEED0002",
      requestType: "ROOM_CLEANING",
      priority: "HIGH",
      status: "IN_PROGRESS",
      description: "Room cleaning needed — checked out for the day",
    },
    update: {},
  });
  console.log("✓ Service requests created");

  // ─── Service Incidents ────────────────────────
  await db.serviceIncident.upsert({
    where: { incidentRef: "INC-SEED0001" },
    create: {
      tenantId: tenant.id,
      hotelId: hotel1.id,
      stayId: stay.id,
      guestId: guest.id,
      bookingId: booking2.id,
      incidentRef: "INC-SEED0001",
      category: "FACILITY_ISSUE",
      severity: "HIGH",
      status: "OPEN",
      title: "Air conditioning not working",
      description:
        "AC unit in room 412 has stopped working. Room is getting warm.",
      dueAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
    },
    update: {},
  });
  console.log("✓ Incidents created");

  // ─── Lost & Found Items ───────────────────────
  await db.lostFoundItem.upsert({
    where: { itemRef: "LF-SEED0001" },
    create: {
      tenantId: tenant.id,
      hotelId: hotel1.id,
      itemRef: "LF-SEED0001",
      description: "Black leather wallet with initials A.J.",
      foundLocation: "Room 412 — under the bed",
      category: "Accessories",
      storageLocation: "Front desk safe — box #3",
      status: "STORED",
      foundAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      loggedById: frontDesk.id,
    },
    update: {},
  });
  console.log("✓ Lost & found items created");

  // ─── Staff Profiles ───────────────────────────
  const conciergeProfile = await db.staffProfile.upsert({
    where: { id: "00000000-0000-0000-0014-000000000001" },
    create: {
      id: "00000000-0000-0000-0014-000000000001",
      tenantId: tenant.id,
      hotelId: hotel1.id,
      userId: frontDesk.id,
      name: "Elif Kaya",
      slug: "elif-kaya-grandpalace",
      role: "Senior Front Desk Agent",
      department: "FRONT_DESK",
      bio: "5 years at Grand Palace Istanbul. Passionate about creating memorable guest experiences.",
      languages: ["Turkish", "English", "Arabic"],
      isPublic: true,
      tipEnabled: true,
      avgRating: 4.8,
      reviewCount: 24,
    },
    update: {},
  });

  const chefProfile = await db.staffProfile.upsert({
    where: { id: "00000000-0000-0000-0014-000000000002" },
    create: {
      id: "00000000-0000-0000-0014-000000000002",
      tenantId: tenant.id,
      hotelId: hotel1.id,
      userId: hotelManager.id,
      name: "Mehmet Yilmaz",
      slug: "mehmet-yilmaz-grandpalace",
      role: "Hotel Manager",
      department: "MANAGEMENT",
      bio: "10+ years in luxury hospitality across Istanbul, Dubai, and London.",
      languages: ["Turkish", "English", "French"],
      isPublic: true,
      tipEnabled: false,
      avgRating: 4.9,
      reviewCount: 12,
    },
    update: {},
  });

  const spaProfile = await db.staffProfile.upsert({
    where: { id: "00000000-0000-0000-0014-000000000003" },
    create: {
      id: "00000000-0000-0000-0014-000000000003",
      tenantId: tenant.id,
      hotelId: hotel1.id,
      name: "Aylin Demir",
      slug: "aylin-demir-grandpalace",
      role: "Head Spa Therapist",
      department: "SPA",
      bio: "Certified aromatherapy and hot stone specialist with 7 years of experience.",
      languages: ["Turkish", "English"],
      isPublic: true,
      tipEnabled: true,
      avgRating: 4.95,
      reviewCount: 38,
    },
    update: {},
  });
  console.log("✓ Staff profiles created");

  // ─── Staff Badges ─────────────────────────────
  await db.staffBadge.createMany({
    skipDuplicates: true,
    data: [
      {
        id: "00000000-0000-0000-0015-000000000001",
        tenantId: tenant.id,
        staffProfileId: conciergeProfile.id,
        badgeType: "GUEST_FAVORITE",
        awardedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        id: "00000000-0000-0000-0015-000000000002",
        tenantId: tenant.id,
        staffProfileId: spaProfile.id,
        badgeType: "SERVICE_EXCELLENCE",
        awardedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        id: "00000000-0000-0000-0015-000000000003",
        tenantId: tenant.id,
        staffProfileId: conciergeProfile.id,
        badgeType: "FAST_RESPONDER",
        awardedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ],
  });
  console.log("✓ Staff badges created");

  // ─── Staff Reviews + Gratitude Wall ──────────
  const staffReview1 = await db.staffGuestReview.upsert({
    where: { id: "00000000-0000-0000-0016-000000000001" },
    create: {
      id: "00000000-0000-0000-0016-000000000001",
      tenantId: tenant.id,
      staffProfileId: conciergeProfile.id,
      guestId: guest.id,
      reviewType: "CONCIERGE",
      rating: 5,
      title: "Elif made our stay unforgettable",
      body: "Elif went above and beyond at every turn — from arranging a surprise anniversary setup to recommending the most amazing local restaurant. Truly exceptional hospitality.",
      moderationStatus: "APPROVED",
      isGratitudeWall: true,
      moderatedAt: new Date(),
    },
    update: {},
  });

  const staffReview2 = await db.staffGuestReview.upsert({
    where: { id: "00000000-0000-0000-0016-000000000002" },
    create: {
      id: "00000000-0000-0000-0016-000000000002",
      tenantId: tenant.id,
      staffProfileId: spaProfile.id,
      guestId: guest.id,
      reviewType: "MANAGEMENT",
      rating: 5,
      title: "Best spa experience I've ever had",
      body: "Aylin's hot stone massage was absolutely divine. She was professional, attentive, and made me feel completely at ease. Already booked again for tomorrow!",
      moderationStatus: "APPROVED",
      isGratitudeWall: true,
      moderatedAt: new Date(),
    },
    update: {},
  });

  await db.staffGuestReview.upsert({
    where: { id: "00000000-0000-0000-0016-000000000003" },
    create: {
      id: "00000000-0000-0000-0016-000000000003",
      tenantId: tenant.id,
      staffProfileId: conciergeProfile.id,
      guestId: guest.id,
      reviewType: "CONCIERGE",
      rating: 4,
      title: "Very helpful during check-in",
      body: "Fast and friendly check-in process. Elif explained all hotel facilities clearly.",
      moderationStatus: "PENDING",
    },
    update: {},
  });

  // Gratitude wall entries
  await db.gratitudeWallEntry.createMany({
    skipDuplicates: true,
    data: [
      {
        id: "00000000-0000-0000-0017-000000000001",
        tenantId: tenant.id,
        hotelId: hotel1.id,
        reviewId: staffReview1.id,
        staffProfileId: conciergeProfile.id,
        isActive: true,
      },
      {
        id: "00000000-0000-0000-0017-000000000002",
        tenantId: tenant.id,
        hotelId: hotel1.id,
        reviewId: staffReview2.id,
        staffProfileId: spaProfile.id,
        isActive: true,
      },
    ],
  });
  console.log("✓ Staff reviews & gratitude wall created");

  // ─── Job Postings ─────────────────────────────
  const job1 = await db.jobPosting.upsert({
    where: { id: "00000000-0000-0000-0018-000000000001" },
    create: {
      id: "00000000-0000-0000-0018-000000000001",
      tenantId: tenant.id,
      hotelId: hotel1.id,
      title: "Front Desk Agent",
      slug: "front-desk-agent-grandpalace-2026",
      department: "FRONT_DESK",
      employmentType: "FULL_TIME",
      experienceLevel: "JUNIOR",
      city: "Istanbul",
      country: "Turkey",
      description:
        "Join our award-winning front desk team at Grand Palace Istanbul. You'll be the first point of contact for our guests, ensuring a seamless check-in/check-out experience and handling guest inquiries with warmth and professionalism.\n\nWe're looking for someone who loves people, speaks excellent English, and thrives in a fast-paced luxury environment.",
      accommodationIncluded: true,
      mealsIncluded: true,
      visaSupport: false,
      isFeatured: true,
      salaryMinCents: 2400000,
      salaryMaxCents: 3200000,
      currency: "TRY",
      status: "PUBLISHED",
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      tags: {
        create: [{ tag: "luxury" }, { tag: "5-star" }, { tag: "istanbul" }],
      },
      requirements: {
        create: [
          { label: "Fluent English (written & spoken)", isRequired: true },
          {
            label: "1+ year front desk or hospitality experience",
            isRequired: true,
          },
          {
            label: "Opera PMS or similar system experience",
            isRequired: false,
          },
          {
            label: "Second language (Arabic, Russian, or German)",
            isRequired: false,
          },
        ],
      },
      benefits: {
        create: [
          { label: "Health insurance" },
          { label: "Uniform provided" },
          { label: "Staff meal allowance" },
          { label: "Annual bonus" },
          { label: "Career development program" },
        ],
      },
    },
    update: {},
  });

  const job2 = await db.jobPosting.upsert({
    where: { id: "00000000-0000-0000-0018-000000000002" },
    create: {
      id: "00000000-0000-0000-0018-000000000002",
      tenantId: tenant.id,
      hotelId: hotel1.id,
      title: "Spa Therapist — Seasonal",
      slug: "spa-therapist-seasonal-grandpalace-2026",
      department: "SPA",
      employmentType: "SEASONAL",
      experienceLevel: "MID",
      city: "Istanbul",
      country: "Turkey",
      description:
        "We're looking for a skilled and passionate Spa Therapist to join our team for the summer season (May–October 2026). You'll deliver a range of treatments in our award-winning spa with a focus on exceptional guest experience.",
      accommodationIncluded: true,
      mealsIncluded: true,
      visaSupport: true,
      isFeatured: false,
      salaryMinCents: 180000,
      salaryMaxCents: 240000,
      currency: "USD",
      status: "PUBLISHED",
      deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      tags: {
        create: [{ tag: "spa" }, { tag: "seasonal" }, { tag: "visa-support" }],
      },
      requirements: {
        create: [
          {
            label: "Certified massage therapist (Level 3 or equivalent)",
            isRequired: true,
          },
          {
            label: "2+ years spa experience in hotel environment",
            isRequired: true,
          },
          {
            label: "Hot stone & aromatherapy certification",
            isRequired: false,
          },
        ],
      },
      benefits: {
        create: [
          { label: "Staff accommodation included" },
          { label: "3 meals per day" },
          { label: "Visa & work permit processing" },
          { label: "End-of-season bonus" },
        ],
      },
    },
    update: {},
  });

  const job3 = await db.jobPosting.upsert({
    where: { id: "00000000-0000-0000-0018-000000000003" },
    create: {
      id: "00000000-0000-0000-0018-000000000003",
      tenantId: tenant.id,
      hotelId: hotel1.id,
      title: "Housekeeping Supervisor",
      slug: "housekeeping-supervisor-grandpalace-2026",
      department: "HOUSEKEEPING",
      employmentType: "FULL_TIME",
      experienceLevel: "SENIOR",
      city: "Istanbul",
      country: "Turkey",
      description:
        "Lead our housekeeping team of 20+ staff to maintain Grand Palace Istanbul's exceptionally high cleanliness standards. You will manage shift scheduling, training, quality inspections, and guest request coordination.",
      accommodationIncluded: false,
      mealsIncluded: true,
      visaSupport: false,
      isFeatured: false,
      salaryMinCents: 3600000,
      salaryMaxCents: 4800000,
      currency: "TRY",
      status: "DRAFT",
      tags: {
        create: [{ tag: "management" }, { tag: "housekeeping" }],
      },
      requirements: {
        create: [
          {
            label: "5+ years housekeeping experience in 4-5 star hotel",
            isRequired: true,
          },
          {
            label: "Previous supervisory/team lead experience",
            isRequired: true,
          },
          { label: "Fluent Turkish; conversational English", isRequired: true },
        ],
      },
      benefits: {
        create: [
          { label: "Supervisory pay grade" },
          { label: "Staff meal allowance" },
          { label: "Quarterly performance bonus" },
        ],
      },
    },
    update: {},
  });
  console.log("✓ Job postings created");

  // ─── Job Applications ─────────────────────────
  await db.jobApplication.upsert({
    where: {
      postingId_applicantId: { postingId: job1.id, applicantId: guest.id },
    },
    create: {
      tenantId: tenant.id,
      postingId: job1.id,
      applicantId: guest.id,
      appType: "OPEN_MARKET",
      status: "SHORTLISTED",
      coverLetter:
        "I have been passionate about hospitality since my first hotel stay at age 12. With my background in customer service and fluency in three languages, I believe I would be a valuable addition to your front desk team.",
    },
    update: {},
  });
  console.log("✓ Job applications created");

  console.log("\n✅ Seed complete!");
  console.log(
    "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
  );
  console.log("📋 DEMO CREDENTIALS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n🌐 ADMIN PORTAL  →  /admin");
  console.log("   SUPER_ADMIN    admin@grandhot.com          / admin123456");
  console.log("   PLATFORM_OPS   ops@platform.heo            / platform123456");
  console.log("\n🏨 HOTEL PORTAL  →  /hotel  (Grand Palace Istanbul)");
  console.log("   HOTEL_ADMIN    manager@grandpalace.com     / staff123456");
  console.log("   HOTEL_MANAGER  hotelmgr@grandpalace.com    / staff123456");
  console.log("   FRONT_DESK     frontdesk@grandpalace.com   / staff123456");
  console.log("   GUEST_RELATIONS  guestrel@grandpalace.com  / staff123456");
  console.log("   OPERATIONS_MGR   ops@grandpalace.com       / staff123456");
  console.log("   FINANCE        finance@grandpalace.com     / staff123456");
  console.log("   EVENTS_MANAGER events@grandpalace.com      / staff123456");
  console.log("   FB_MANAGER     fb@grandpalace.com          / staff123456");
  console.log("   RESERVATIONS   reservations@grandpalace.com / staff123456");
  console.log("\n🏨 HOTEL PORTAL  →  /hotel  (The Athens Boutique)");
  console.log("   HOTEL_ADMIN    admin@boutiqueathens.com    / staff123456");
  console.log("   FRONT_DESK     desk@boutiqueathens.com     / staff123456");
  console.log("\n👤 GUEST PORTAL  →  /  (login at /login)");
  console.log(
    "   GUEST          guest@example.com           / guest123456   (Alice Johnson — active stay)",
  );
  console.log(
    "   GUEST          guest2@example.com          / guest123456   (James Miller)",
  );
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
