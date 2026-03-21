/**
 * seed-supplementary.ts
 * ──────────────────────────────────────────────────────────────────
 * Fills all new modules with realistic demo data so every new page
 * has something to show. Run AFTER seed.ts:
 *
 *   pnpm --filter @repo/db db:seed           (base)
 *   pnpm --filter @repo/db db:seed:sup       (this file)
 *
 * Or add to package.json "db:seed:sup": "ts-node prisma/seed-supplementary.ts"
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// ── helpers ──────────────────────────────────────────────────────
const days = (n: number) => new Date(Date.now() + n * 86_400_000);
const pastDays = (n: number) => new Date(Date.now() - n * 86_400_000);

async function main() {
  console.log("🌱 Seeding supplementary data…");

  // ── Resolve tenant + hotel from base seed ────────────────────
  const tenant = await db.tenant.findFirstOrThrow({
    where: { slug: "grand-hotels" },
  });
  const hotel1 = await db.hotel.findFirstOrThrow({
    where: { slug: "grand-palace-istanbul", tenantId: tenant.id },
  });
  const hotel2 = await db.hotel.findFirstOrThrow({
    where: { slug: "boutique-athens", tenantId: tenant.id },
  });
  const guest = await db.user.findFirstOrThrow({
    where: { email: "guest@example.com", tenantId: tenant.id },
  });
  const deluxeKing = await db.roomType.findFirstOrThrow({
    where: { hotelId: hotel1.id, name: { contains: "Deluxe" } },
  });

  // ═══════════════════════════════════════════════════════════════
  // 1. VIP PLANS & BENEFITS
  // ═══════════════════════════════════════════════════════════════
  const goldPlan = await db.vipPlan.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: "GOLD" } },
    create: {
      tenantId: tenant.id,
      code: "GOLD",
      name: "Gold Membership",
      tier: "COMFORT",
      description:
        "Priority service, exclusive lounge access, and room upgrades.",
      monthlyPriceCents: 4900,
      yearlyPriceCents: 49900,
      benefitConfig: {
        earlyCheckIn: true,
        lateCheckOut: true,
        loungeAccess: true,
      },
    },
    update: {},
  });

  const platinumPlan = await db.vipPlan.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: "PLATINUM" } },
    create: {
      tenantId: tenant.id,
      code: "PLATINUM",
      name: "Platinum Membership",
      tier: "SIGNATURE",
      description:
        "Butler service, suite guarantees, and unlimited spa access.",
      monthlyPriceCents: 9900,
      yearlyPriceCents: 99900,
      benefitConfig: {
        butlerService: true,
        suiteUpgrade: true,
        spaUnlimited: true,
      },
    },
    update: {},
  });

  const goldBenefits = [
    {
      code: "EARLY_CHECKIN",
      name: "Early Check-in",
      description: "Check in from 10:00 AM",
      config: { from: "10:00" },
    },
    {
      code: "LATE_CHECKOUT",
      name: "Late Check-out",
      description: "Check out until 2:00 PM",
      config: { until: "14:00" },
    },
    {
      code: "LOUNGE_ACCESS",
      name: "Executive Lounge",
      description: "Complimentary lounge access daily",
      config: { daily: true },
    },
    {
      code: "SPA_DISCOUNT",
      name: "20% Spa Discount",
      description: "20% off all spa treatments",
      config: { discountPercent: 20 },
    },
    {
      code: "WELCOME_DRINK",
      name: "Welcome Drink",
      description: "Complimentary welcome drink on arrival",
      config: { perStay: 1 },
    },
  ];

  for (const b of goldBenefits) {
    await db.vipBenefit.upsert({
      where: {
        tenantId_vipPlanId_code: {
          tenantId: tenant.id,
          vipPlanId: goldPlan.id,
          code: b.code,
        },
      },
      create: {
        tenantId: tenant.id,
        vipPlanId: goldPlan.id,
        ...b,
        config: b.config,
      },
      update: {},
    });
  }

  const platBenefits = [
    {
      code: "BUTLER",
      name: "Dedicated Butler",
      description: "24/7 personal butler service",
      config: { available247: true },
    },
    {
      code: "SUITE_UPGRADE",
      name: "Suite Upgrade",
      description: "Guaranteed suite upgrade at check-in",
      config: { guaranteed: true },
    },
    {
      code: "SPA_UNLIMITED",
      name: "Unlimited Spa",
      description: "Unlimited spa access throughout your stay",
      config: { unlimited: true },
    },
    {
      code: "AIRPORT_TRANSFER",
      name: "Free Airport Transfer",
      description: "Complimentary private airport transfer",
      config: { perStay: 2 },
    },
    {
      code: "MINIBAR",
      name: "Stocked Minibar",
      description: "Daily restocked minibar included",
      config: { daily: true },
    },
    {
      code: "LAUNDRY",
      name: "Complimentary Laundry",
      description: "Up to 5 items per day laundered free",
      config: { itemsPerDay: 5 },
    },
  ];

  for (const b of platBenefits) {
    await db.vipBenefit.upsert({
      where: {
        tenantId_vipPlanId_code: {
          tenantId: tenant.id,
          vipPlanId: platinumPlan.id,
          code: b.code,
        },
      },
      create: {
        tenantId: tenant.id,
        vipPlanId: platinumPlan.id,
        ...b,
        config: b.config,
      },
      update: {},
    });
  }

  // VIP membership for guest
  await db.userVipMembership.upsert({
    where: {
      tenantId_userId_vipPlanId_startsAt: {
        tenantId: tenant.id,
        userId: guest.id,
        vipPlanId: goldPlan.id,
        startsAt: new Date("2026-01-01"),
      },
    },
    create: {
      tenantId: tenant.id,
      userId: guest.id,
      vipPlanId: goldPlan.id,
      status: "ACTIVE",
      startsAt: new Date("2026-01-01"),
      endsAt: new Date("2027-01-01"),
      autoRenew: true,
      source: "purchase",
    },
    update: {},
  });

  console.log("✓ VIP plans & benefits");

  // ═══════════════════════════════════════════════════════════════
  // 2. AMENITY ASSETS (Spa, Gym, Pool, Rooftop)
  // ═══════════════════════════════════════════════════════════════
  const amenities = [
    {
      code: "SPA_MAIN",
      name: "Çırağan Spa & Wellness",
      amenityType: "SPA" as const,
      description:
        "Award-winning spa featuring hammam, massage suites, and hydrotherapy pools overlooking the Bosphorus.",
      locationLabel: "Lower Ground Floor",
      isExternalAccessOpen: true,
      photos: [
        "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800",
        "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800",
      ],
      features: [
        "hammam",
        "hydrotherapy",
        "sauna",
        "couples_suite",
        "bosphorus_view",
      ],
    },
    {
      code: "GYM_MAIN",
      name: "Fitness Centre",
      amenityType: "GYM",
      description:
        "State-of-the-art fitness centre with Technogym equipment, personal trainers, and yoga studio.",
      locationLabel: "Floor 2",
      isExternalAccessOpen: false,
      photos: [
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800",
      ],
      features: [
        "personal_trainer",
        "yoga_studio",
        "cardio",
        "weights",
        "towel_service",
      ],
    },
    {
      code: "POOL_INDOOR",
      name: "Indoor Infinity Pool",
      amenityType: "POOL",
      description:
        "Heated 25m indoor pool with panoramic Bosphorus views and poolside bar.",
      locationLabel: "Floor 3",
      isExternalAccessOpen: true,
      photos: [
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
      ],
      features: ["heated", "infinity", "poolside_bar", "towel_service"],
    },
    {
      code: "ROOFTOP_BAR",
      name: "Sky Terrace & Bar",
      amenityType: "OTHER",
      description:
        "Panoramic 360° rooftop terrace with cocktail bar, live DJ on weekends.",
      locationLabel: "Top Floor",
      isExternalAccessOpen: true,
      photos: [
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
      ],
      features: [
        "cocktail_bar",
        "dj_weekends",
        "panoramic_view",
        "heated_terrace",
      ],
    },
  ] as const;

  const amenityAssets: Record<string, any> = {};

  for (const a of amenities) {
    const asset = await db.amenityAsset.upsert({
      where: {
        tenantId_hotelId_code: {
          tenantId: tenant.id,
          hotelId: hotel1.id,
          code: a.code,
        },
      },
      create: {
        tenantId: tenant.id,
        hotelId: hotel1.id,
        code: a.code,
        name: a.name,
        amenityType: a.amenityType as any,
        description: a.description,
        locationLabel: a.locationLabel,
        isExternalAccessOpen: a.isExternalAccessOpen,
        photos: a.photos as any,
        features: a.features as any,
      },
      update: {},
    });
    amenityAssets[a.code] = asset;

    // Schedules (Mon–Sun)
    for (let day = 0; day <= 6; day++) {
      const isClosed = false;
      const opens = a.amenityType === "ROOFTOP" ? "17:00" : "07:00";
      const closes = a.amenityType === "ROOFTOP" ? "02:00" : "22:00";
      const existing = await db.amenitySchedule.findFirst({
        where: {
          amenityAssetId: asset.id,
          dayOfWeek: day,
          tenantId: tenant.id,
        },
      });
      if (!existing) {
        await db.amenitySchedule.create({
          data: {
            tenantId: tenant.id,
            amenityAssetId: asset.id,
            dayOfWeek: day,
            opensAt: opens,
            closesAt: closes,
            slotDurationMinutes: a.amenityType === "SPA" ? 60 : 30,
            capacityPerSlot:
              a.amenityType === "POOL" ? 20 : a.amenityType === "GYM" ? 15 : 8,
          },
        });
      }
    }

    // Pass plans
    const passPlansData =
      a.amenityType === "SPA"
        ? [
            {
              code: "SPA_DAY",
              name: "Day Pass",
              accessUnit: "DAILY" as const,
              priceCents: 8500,
              vipDiscountPercent: 20,
            },
            {
              code: "SPA_SESSION",
              name: "Single Session",
              accessUnit: "HOURLY" as const,
              priceCents: 4500,
              vipDiscountPercent: 20,
            },
          ]
        : a.amenityType === "GYM"
          ? [
              {
                code: "GYM_DAY",
                name: "Day Pass",
                accessUnit: "DAILY" as const,
                priceCents: 2500,
                vipDiscountPercent: 15,
              },
              {
                code: "GYM_WEEK",
                name: "Week Pass",
                accessUnit: "WEEKLY" as const,
                priceCents: 9900,
                vipDiscountPercent: 15,
              },
            ]
          : a.amenityType === "POOL"
            ? [
                {
                  code: "POOL_DAY",
                  name: "Day Access",
                  accessUnit: "DAILY" as const,
                  priceCents: 3500,
                  vipDiscountPercent: 20,
                },
              ]
            : [
                {
                  code: "ROOFTOP_ENTRY",
                  name: "Entry",
                  accessUnit: "HOURLY" as const,
                  priceCents: 0,
                  vipDiscountPercent: 0,
                },
              ];

    for (const pp of passPlansData) {
      await db.amenityPassPlan.upsert({
        where: {
          tenantId_amenityAssetId_code: {
            tenantId: tenant.id,
            amenityAssetId: asset.id,
            code: pp.code,
          },
        },
        create: {
          tenantId: tenant.id,
          amenityAssetId: asset.id,
          code: pp.code,
          name: pp.name,
          accessUnit: pp.accessUnit,
          durationCount: 1,
          priceCents: pp.priceCents,
          vipDiscountPercent: pp.vipDiscountPercent || undefined,
        },
        update: {},
      });
    }
  }

  console.log("✓ Amenity assets, schedules & pass plans");

  // ═══════════════════════════════════════════════════════════════
  // 3. TRUSTED STAY HOSTS & UNITS
  // ═══════════════════════════════════════════════════════════════
  const host1 = await db.trustedStayHost.upsert({
    where: { id: "00000000-0000-0000-0010-000000000001" },
    create: {
      id: "00000000-0000-0000-0010-000000000001",
      tenantId: tenant.id,
      displayName: "Ayşe & Murat Öztürk",
      legalName: "A&M Property Management",
      email: "host@ozturrental.com",
      phone: "+90 532 111 2233",
      hostType: "PROFESSIONAL",
      verificationStatus: "VERIFIED",
    },
    update: {},
  });

  const host2 = await db.trustedStayHost.upsert({
    where: { id: "00000000-0000-0000-0010-000000000002" },
    create: {
      id: "00000000-0000-0000-0010-000000000002",
      tenantId: tenant.id,
      displayName: "Nikos Papadopoulos",
      email: "nikos@athensflats.gr",
      phone: "+30 210 555 6677",
      hostType: "INDIVIDUAL",
      verificationStatus: "VERIFIED",
    },
    update: {},
  });

  const units = [
    {
      id: "00000000-0000-0000-0011-000000000001",
      hostId: host1.id,
      hotelId: hotel1.id,
      slug: "bosphorus-terrace-apartment",
      name: "Bosphorus Terrace Apartment",
      trustedStayType: "APARTMENT",
      stayTerm: "DAILY",
      description:
        "Stunning 2-bedroom apartment with private terrace directly overlooking the Bosphorus strait. Walking distance to Grand Palace Istanbul.",
      address: {
        street: "Çırağan Caddesi 18",
        city: "Istanbul",
        country: "Turkey",
      },
      geo: { lat: 41.0481, lng: 29.0399 },
      roomCount: 2,
      guestCapacity: 4,
      bathroomCount: 2,
      wifiQuality: "excellent",
      amenities: [
        "WiFi",
        "Kitchen",
        "Terrace",
        "Air Conditioning",
        "Washing Machine",
        "Dishwasher",
        "Smart TV",
      ],
      photos: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
      ],
      verificationStatus: "VERIFIED",
    },
    {
      id: "00000000-0000-0000-0011-000000000002",
      hostId: host1.id,
      hotelId: hotel1.id,
      slug: "sultanahmet-heritage-suite",
      name: "Sultanahmet Heritage Suite",
      trustedStayType: "APARTMENT",
      stayTerm: "MONTHLY" as const,
      description:
        "Elegantly restored Ottoman-era apartment in the heart of Sultanahmet, 5 min walk to the Blue Mosque.",
      address: { street: "Torun Sokak 7", city: "Istanbul", country: "Turkey" },
      roomCount: 1,
      guestCapacity: 2,
      bathroomCount: 1,
      amenities: ["WiFi", "Kitchen", "Air Conditioning", "Rooftop Access"],
      photos: [
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
        "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800",
      ],
      verificationStatus: "VERIFIED",
    },
    {
      id: "00000000-0000-0000-0011-000000000003",
      hostId: host2.id,
      hotelId: hotel2.id,
      slug: "acropolis-view-villa",
      name: "Acropolis View Villa",
      trustedStayType: "VILLA",
      stayTerm: "WEEKLY" as const,
      description:
        "Breathtaking villa with direct Acropolis views from the rooftop garden, private pool, and concierge service.",
      address: {
        street: "Apostolou Pavlou 9",
        city: "Athens",
        country: "Greece",
      },
      geo: { lat: 37.9716, lng: 23.7259 },
      roomCount: 3,
      guestCapacity: 6,
      bathroomCount: 3,
      amenities: [
        "Private Pool",
        "WiFi",
        "Kitchen",
        "Rooftop Garden",
        "Concierge",
        "Air Conditioning",
        "Parking",
      ],
      photos: [
        "https://images.unsplash.com/photo-1570213489059-0aac6626cade?w=800",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
        "https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=800",
      ],
      verificationStatus: "VERIFIED",
    },
  ] as const;

  const createdUnits: Record<string, any> = {};
  for (const u of units) {
    const unit = await db.trustedStayUnit.upsert({
      where: { tenantId_slug: { tenantId: tenant.id, slug: u.slug } },
      create: {
        id: u.id,
        tenantId: tenant.id,
        hostId: u.hostId,
        hotelId: u.hotelId,
        slug: u.slug,
        name: u.name,
        trustedStayType: u.trustedStayType as any,
        stayTerm: u.stayTerm as any,
        description: u.description,
        address: u.address as any,
        geo: (u as any).geo ?? null,
        roomCount: u.roomCount,
        guestCapacity: u.guestCapacity,
        bathroomCount: u.bathroomCount ?? undefined,
        amenities: u.amenities as any,
        photos: u.photos as any,
        verificationStatus: u.verificationStatus as any,
      },
      update: {},
    });
    createdUnits[u.slug] = unit;

    // Rate plans
    const nightlyRate =
      u.trustedStayType === "VILLA"
        ? 35000
        : u.trustedStayType === "APARTMENT" && u.roomCount === 2
          ? 18000
          : 9500;
    await db.trustedStayRatePlan.upsert({
      where: {
        tenantId_trustedStayUnitId_code: {
          tenantId: tenant.id,
          trustedStayUnitId: unit.id,
          code: "STANDARD",
        },
      },
      create: {
        tenantId: tenant.id,
        trustedStayUnitId: unit.id,
        code: "STANDARD",
        name: "Standard Rate",
        stayTerm: u.stayTerm as any,
        nightlyPriceCents: nightlyRate,
        weeklyPriceCents: nightlyRate * 6,
        monthlyPriceCents: nightlyRate * 25,
        depositCents: nightlyRate * 2,
        cancellationPolicy: { freeCancelBefore: "48h", penaltyPercent: 50 },
      },
      update: {},
    });

    // Availability (next 60 days)
    for (let i = 0; i < 60; i++) {
      const date = days(i);
      date.setHours(0, 0, 0, 0);
      await db.trustedStayAvailability.upsert({
        where: { trustedStayUnitId_date: { trustedStayUnitId: unit.id, date } },
        create: {
          tenantId: tenant.id,
          trustedStayUnitId: unit.id,
          date,
          isAvailable: i % 9 !== 0,
          minNights: 2,
          maxNights: 30,
          priceCents: nightlyRate,
          cleaningFeeCents: 5000,
        },
        update: {},
      });
    }
  }

  // Verification request
  await db.trustedStayVerification.upsert({
    where: { id: "00000000-0000-0000-0012-000000000001" },
    create: {
      id: "00000000-0000-0000-0012-000000000001",
      tenantId: tenant.id,
      hostId: host1.id,
      trustedStayUnitId: createdUnits["bosphorus-terrace-apartment"].id,
      verificationType: "IDENTITY",
      status: "PENDING",
      notes: "Passport and utility bill submitted. Awaiting review.",
    },
    update: {},
  });

  console.log("✓ Trusted Stay hosts, units & availability");

  // ═══════════════════════════════════════════════════════════════
  // 4. MOBILITY PROVIDERS & PRODUCTS
  // ═══════════════════════════════════════════════════════════════
  const mobilityProvider1 = await db.mobilityProvider.upsert({
    where: { id: "00000000-0000-0000-0020-000000000001" },
    create: {
      id: "00000000-0000-0000-0020-000000000001",
      tenantId: tenant.id,
      name: "Istanbul VIP Transfers",
      mobilityType: "AIRPORT_TRANSFER",
      cities: ["Istanbul"] as any,
      serviceAreas: [
        "IST Airport",
        "SAW Airport",
        "City Center",
        "Bosphorus Hotels",
      ] as any,
      contactInfo: {
        email: "ops@istanbulvip.com",
        phone: "+90 212 444 5566",
      } as any,
      verificationStatus: "VERIFIED",
      ratingAggregate: 4.8,
    },
    update: {},
  });

  const mobilityProvider2 = await db.mobilityProvider.upsert({
    where: { id: "00000000-0000-0000-0020-000000000002" },
    create: {
      id: "00000000-0000-0000-0020-000000000002",
      tenantId: tenant.id,
      name: "Athens Luxury Wheels",
      mobilityType: "HOURLY_DRIVER",
      cities: ["Athens"] as any,
      serviceAreas: ["ATH Airport", "Acropolis Area", "Piraeus Port"] as any,
      contactInfo: {
        email: "info@athenswheels.gr",
        phone: "+30 210 999 1122",
      } as any,
      verificationStatus: "VERIFIED",
      ratingAggregate: 4.7,
    },
    update: {},
  });

  const mobilityProducts = [
    {
      code: "IST_AIRPORT_SEDAN",
      name: "Airport Transfer — Sedan",
      mobilityProviderId: mobilityProvider1.id,
      hotelId: hotel1.id,
      mobilityType: "AIRPORT_TRANSFER",
      vehicleClass: "Business Sedan",
      capacity: 3,
      description:
        "Comfortable sedan transfer between Istanbul Airport (IST) and your hotel.",
      pricingConfig: { flatRate: 5500, currency: "USD" },
    },
    {
      code: "IST_AIRPORT_VAN",
      name: "Airport Transfer — Van",
      mobilityProviderId: mobilityProvider1.id,
      hotelId: hotel1.id,
      mobilityType: "AIRPORT_TRANSFER",
      vehicleClass: "Mercedes Vito",
      capacity: 7,
      description:
        "Spacious van transfer, ideal for groups and families with luggage.",
      pricingConfig: { flatRate: 7500, currency: "USD" },
    },
    {
      code: "IST_CITY_TOUR",
      name: "Private City Tour",
      mobilityProviderId: mobilityProvider1.id,
      hotelId: hotel1.id,
      mobilityType: "HOURLY_DRIVER",
      vehicleClass: "Luxury SUV",
      capacity: 4,
      description:
        "Full-day private chauffeur for city sightseeing — Sultanahmet, Grand Bazaar, Galata.",
      pricingConfig: {
        halfDayRate: 15000,
        fullDayRate: 25000,
        currency: "USD",
      },
    },
    {
      code: "ATH_AIRPORT_SEDAN",
      name: "Athens Airport — Sedan",
      mobilityProviderId: mobilityProvider2.id,
      hotelId: hotel2.id,
      mobilityType: "AIRPORT_TRANSFER",
      vehicleClass: "Mercedes E-Class",
      capacity: 3,
      description:
        "Premium sedan transfer between Athens International Airport and your hotel.",
      pricingConfig: { flatRate: 6500, currency: "EUR" },
    },
    {
      code: "ATH_ACROPOLIS_TOUR",
      name: "Acropolis & Athens Tour",
      mobilityProviderId: mobilityProvider2.id,
      hotelId: hotel2.id,
      mobilityType: "HOURLY_DRIVER",
      vehicleClass: "Luxury Sedan",
      capacity: 4,
      description:
        "Half-day private tour: Acropolis, Parthenon, Plaka, Monastiraki.",
      pricingConfig: { halfDayRate: 18000, currency: "EUR" },
    },
  ] as const;

  for (const mp of mobilityProducts) {
    await db.mobilityProduct.upsert({
      where: {
        tenantId_mobilityProviderId_code: {
          tenantId: tenant.id,
          mobilityProviderId: mp.mobilityProviderId,
          code: mp.code,
        },
      },
      create: {
        tenantId: tenant.id,
        mobilityProviderId: mp.mobilityProviderId,
        hotelId: mp.hotelId,
        code: mp.code,
        name: mp.name,
        mobilityType: mp.mobilityType as any,
        vehicleClass: mp.vehicleClass,
        capacity: mp.capacity,
        description: mp.description,
        pricingConfig: mp.pricingConfig as any,
      },
      update: {},
    });
  }

  console.log("✓ Mobility providers & products");

  // ═══════════════════════════════════════════════════════════════
  // 5. CITY GUIDE — ISTANBUL
  // ═══════════════════════════════════════════════════════════════
  const istanbulGuide = await db.cityGuide.upsert({
    where: {
      tenantId_cityCode_languageCode: {
        tenantId: tenant.id,
        cityCode: "IST",
        languageCode: "en",
      },
    },
    create: {
      tenantId: tenant.id,
      cityCode: "IST",
      cityName: "Istanbul",
      countryCode: "TR",
      languageCode: "en",
      summary:
        "Istanbul — where Europe meets Asia. A city of minarets, bazaars, Bosphorus sunsets, and world-class cuisine spanning 2,500 years of history.",
      safetyNotes:
        "Istanbul is generally very safe for tourists. Keep an eye on your belongings in busy bazaars and transport hubs.",
      transportTips:
        "Use the Istanbulkart (city transit card) for trams, metro, and ferries. Taxis should use meters — ride-share apps (BiTaksi, Uber) are also reliable.",
      emergencyInfo: {
        police: "155",
        ambulance: "112",
        tourist_police: "+90 212 527 4503",
      } as any,
      usefulApps: ["BiTaksi", "Moovit", "Zomato", "Google Translate"] as any,
    },
    update: {},
  });

  const istSections = [
    {
      sectionKey: "must_see",
      title: "Must-See Sights",
      body: "Start with the Sultanahmet district: the Blue Mosque (Sultan Ahmed Camii) and Hagia Sophia are steps apart. The Topkapı Palace gives you 400 years of Ottoman history. Don't skip Dolmabahçe Palace on the Bosphorus shore.",
      sortOrder: 1,
    },
    {
      sectionKey: "food_scene",
      title: "Food & Dining",
      body: "Istanbul's food scene is extraordinary. Start your morning with a classic kahvaltı (Turkish breakfast) in Karaköy. For lunch, explore the Spice Bazaar. Evenings: meyhane restaurants in Beyoğlu for meze and rakı. Don't leave without trying a proper balık ekmek (fish sandwich) by the Galata Bridge.",
      sortOrder: 2,
    },
    {
      sectionKey: "nightlife",
      title: "Nightlife",
      body: "Beyoğlu (İstiklal Avenue) is the heart of nightlife. Karaköy has craft cocktail bars. For clubs on the Bosphorus, head to Ortaköy and Kuruçeşme — venues like Sortie and Reina are legendary summer spots.",
      sortOrder: 3,
    },
    {
      sectionKey: "shopping",
      title: "Shopping",
      body: "The Grand Bazaar has 4,000 shops — great for carpets, ceramics, and spices. For designer brands, Nişantaşı is Istanbul's answer to Milan's Via Montenapoleone. Kapalıçarşı is the go-to for gold jewellery.",
      sortOrder: 4,
    },
    {
      sectionKey: "day_trips",
      title: "Day Trips",
      body: "Take a Bosphorus cruise to the Princes' Islands — car-free islands with Victorian mansions and horse-drawn carriages. Or head to Büyükada for cycling and fresh fish by the sea.",
      sortOrder: 5,
    },
  ];

  for (const s of istSections) {
    const existing = await db.cityGuideSection.findFirst({
      where: {
        tenantId: tenant.id,
        cityGuideId: istanbulGuide.id,
        sectionKey: s.sectionKey,
        persona: null,
      },
    });
    if (!existing) {
      await db.cityGuideSection.create({
        data: { tenantId: tenant.id, cityGuideId: istanbulGuide.id, ...s },
      });
    }
  }

  // Local Experiences (Istanbul)
  const istExperiences = [
    {
      slug: "bosphorus-sunset-cruise",
      name: "Bosphorus Sunset Cruise",
      category: "CULTURAL",
      description:
        "Private yacht cruise along the Bosphorus at golden hour, passing palaces, fortresses, and the iconic bridges. Includes light meze and welcome drinks.",
      durationMinutes: 150,
      city: "Istanbul",
      meetingPoint: { address: "Hotel lobby, Grand Palace Istanbul" },
      priceCents: 8500,
      maxGuests: 12,
      languages: ["en", "tr"],
      tags: ["sunset", "yacht", "romantic", "bosphorus"],
    },
    {
      slug: "grand-bazaar-food-tour",
      name: "Grand Bazaar & Spice Market Food Tour",
      category: "FOOD_TOUR",
      description:
        "Walk through the world's oldest shopping mall with a local guide, tasting Turkish delight, fresh spices, simit, and finishing with çay in a traditional çay bahçesi.",
      durationMinutes: 180,
      city: "Istanbul",
      meetingPoint: { address: "Grand Bazaar, Gate 1 (Nuruosmaniye Gate)" },
      priceCents: 4500,
      maxGuests: 8,
      languages: ["en", "tr", "de"],
      tags: ["food", "history", "culture", "bazaar"],
    },
    {
      slug: "turkish-hammam-experience",
      name: "Traditional Hammam Experience",
      category: "OTHER",
      description:
        "Authentic Ottoman hammam experience at Çemberlitaş Hamamı (1584 AD). Full treatment: kese scrub, foam massage, oil massage.",
      durationMinutes: 90,
      city: "Istanbul",
      meetingPoint: {
        address: "Çemberlitaş Hamamı, Vezirhan Cad. No:8, Sultanahmet",
      },
      priceCents: 6500,
      maxGuests: 6,
      languages: ["en", "tr"],
      tags: ["wellness", "hammam", "relaxation", "ottoman"],
    },
    {
      slug: "istanbul-by-night-photography",
      name: "Istanbul by Night — Photography Walk",
      category: "NIGHT_TOUR",
      description:
        "Join a professional photographer for a 2-hour twilight walk through Galata and Karaköy capturing the city's most photogenic spots after dark.",
      durationMinutes: 120,
      city: "Istanbul",
      meetingPoint: { address: "Galata Tower, ground level" },
      priceCents: 5500,
      maxGuests: 6,
      languages: ["en"],
      isFree: false,
      tags: ["photography", "night", "galata", "art"],
    },
    {
      slug: "whirling-dervish-ceremony",
      name: "Whirling Dervish Ceremony",
      category: "CULTURAL",
      description:
        "Witness the mesmerising Sema ceremony — a UNESCO-listed Sufi ritual of the Mevlevi Order. Private seating with cultural briefing.",
      durationMinutes: 75,
      city: "Istanbul",
      meetingPoint: {
        address: "Hodjapasha Culture Center, Ankara Cad. No.3/B, Sirkeci",
      },
      priceCents: 4000,
      maxGuests: 20,
      languages: ["en", "tr", "fr"],
      tags: ["sufi", "culture", "spiritual", "ceremony"],
    },
  ];

  const createdExperiences: Record<string, any> = {};
  for (const exp of istExperiences) {
    const e = await db.localExperience.upsert({
      where: { tenantId_slug: { tenantId: tenant.id, slug: exp.slug } },
      create: {
        tenantId: tenant.id,
        hotelId: hotel1.id,
        cityGuideId: istanbulGuide.id,
        ...exp,
        meetingPoint: exp.meetingPoint as any,
        languages: exp.languages as any,
        tags: exp.tags as any,
      },
      update: {},
    });
    createdExperiences[exp.slug] = e;

    // Add slots for next 14 days
    for (let i = 1; i <= 14; i++) {
      if (i % 3 === 0) continue; // some days unavailable
      const startsAt = days(i);
      startsAt.setHours(
        exp.slug.includes("night") || exp.slug.includes("sunset") ? 19 : 10,
        0,
        0,
        0,
      );
      const endsAt = new Date(
        startsAt.getTime() + (exp.durationMinutes ?? 60) * 60_000,
      );
      const existing = await db.localExperienceSlot.findFirst({
        where: { localExperienceId: e.id, startsAt },
      });
      if (!existing) {
        await db.localExperienceSlot.create({
          data: {
            tenantId: tenant.id,
            localExperienceId: e.id,
            startsAt,
            endsAt,
            capacity: exp.maxGuests,
            availableCount: exp.maxGuests,
          },
        });
      }
    }
  }

  console.log("✓ City guide: Istanbul + 5 experiences + slots");

  // ═══════════════════════════════════════════════════════════════
  // 6. BUNDLE OFFERS
  // ═══════════════════════════════════════════════════════════════
  const bundles = [
    {
      code: "ISTANBUL_GETAWAY",
      name: "Istanbul Romance Getaway",
      description:
        "2-night stay + Bosphorus sunset cruise + couples' spa session + airport transfer. Everything taken care of.",
      bundleType: "CURATED",
      pricingMode: "BUNDLED",
      totalCents: 45000,
      subtotalCents: 52000,
      hotelId: hotel1.id,
      isVipOnly: false,
      startsAt: new Date("2026-04-01"),
      endsAt: new Date("2026-09-30"),
      items: [
        {
          itemType: "ROOM_NIGHTS",
          quantity: 2,
          unitCents: 18900,
          sortOrder: 1,
        },
        {
          itemType: "LOCAL_EXPERIENCE",
          quantity: 1,
          unitCents: 8500,
          sortOrder: 2,
        },
        {
          itemType: "AMENITY_PASS",
          quantity: 2,
          unitCents: 4500,
          sortOrder: 3,
        },
        { itemType: "TRANSFER", quantity: 1, unitCents: 5500, sortOrder: 4 },
      ],
    },
    {
      code: "VIP_WELLNESS_WEEK",
      name: "VIP Wellness Week",
      description:
        "7 nights in our Deluxe Suite, unlimited spa access, daily yoga, private nutrition consultation, and healthy dining credit.",
      bundleType: "VIP_EXCLUSIVE",
      pricingMode: "BUNDLED",
      totalCents: 320000,
      subtotalCents: 390000,
      hotelId: hotel1.id,
      isVipOnly: true,
      startsAt: new Date("2026-04-01"),
      endsAt: new Date("2026-12-31"),
      items: [
        {
          itemType: "ROOM_NIGHTS",
          quantity: 7,
          unitCents: 28900,
          sortOrder: 1,
        },
        {
          itemType: "AMENITY_PASS",
          quantity: 7,
          unitCents: 8500,
          sortOrder: 2,
        },
        {
          itemType: "DINING_CREDIT",
          quantity: 1,
          unitCents: 25000,
          sortOrder: 3,
        },
      ],
    },
    {
      code: "CITY_EXPLORER_ISTANBUL",
      name: "Istanbul City Explorer",
      description:
        "3 nights in the heart of Istanbul + 3 local experiences (food tour, hammam, Bosphorus cruise) + city transport card.",
      bundleType: "ACTIVITY_PACK",
      pricingMode: "BUNDLED",
      totalCents: 75000,
      subtotalCents: 88000,
      hotelId: hotel1.id,
      isVipOnly: false,
      startsAt: new Date("2026-03-25"),
      endsAt: new Date("2026-11-30"),
      items: [
        {
          itemType: "ROOM_NIGHTS",
          quantity: 3,
          unitCents: 18900,
          sortOrder: 1,
        },
        {
          itemType: "LOCAL_EXPERIENCE",
          quantity: 1,
          unitCents: 4500,
          sortOrder: 2,
        },
        {
          itemType: "LOCAL_EXPERIENCE",
          quantity: 1,
          unitCents: 6500,
          sortOrder: 3,
        },
        {
          itemType: "LOCAL_EXPERIENCE",
          quantity: 1,
          unitCents: 8500,
          sortOrder: 4,
        },
      ],
    },
    {
      code: "ATHENS_ESCAPE",
      name: "Athens Heritage Escape",
      description:
        "2 nights at The Athens Boutique + private Acropolis tour + Greek meze cooking class.",
      bundleType: "CURATED",
      pricingMode: "BUNDLED",
      totalCents: 42000,
      subtotalCents: 49000,
      hotelId: hotel2.id,
      isVipOnly: false,
      startsAt: new Date("2026-04-01"),
      endsAt: new Date("2026-10-31"),
      items: [
        {
          itemType: "ROOM_NIGHTS",
          quantity: 2,
          unitCents: 12900,
          sortOrder: 1,
        },
        { itemType: "TRANSFER", quantity: 1, unitCents: 6500, sortOrder: 2 },
        {
          itemType: "LOCAL_EXPERIENCE",
          quantity: 1,
          unitCents: 9000,
          sortOrder: 3,
        },
      ],
    },
  ];

  for (const b of bundles) {
    const { items, ...bundleData } = b;
    const existing = await db.bundleOffer.findFirst({
      where: { tenantId: tenant.id, code: bundleData.code },
    });
    if (!existing) {
      const bundle = await db.bundleOffer.create({
        data: {
          tenantId: tenant.id,
          ...bundleData,
          rules: {} as any,
        },
      });
      for (const item of items) {
        await db.bundleItem.create({
          data: {
            tenantId: tenant.id,
            bundleOfferId: bundle.id,
            ...item,
            metadata: {} as any,
          },
        });
      }
    }
  }

  console.log("✓ Bundle offers");

  // ═══════════════════════════════════════════════════════════════
  // 7. PARTNERS & COMMISSION RULES
  // ═══════════════════════════════════════════════════════════════
  const partners = [
    {
      name: "Istanbul VIP Transfers",
      slug: "istanbul-vip-transfers",
      partnerType: "MOBILITY",
      contactInfo: { name: "Operations Team", email: "ops@istanbulvip.com" },
      isActive: true,
      verificationStatus: "VERIFIED",
      commission: 15,
    },
    {
      name: "Athens Luxury Wheels",
      slug: "athens-luxury-wheels",
      partnerType: "MOBILITY",
      contactInfo: {
        name: "Konstantinos Alexiou",
        email: "info@athenswheels.gr",
      },
      isActive: true,
      verificationStatus: "VERIFIED",
      commission: 15,
    },
    {
      name: "Çırağan Wellness Co.",
      slug: "ciragan-wellness",
      partnerType: "AMENITY",
      contactInfo: { name: "Spa Director", email: "spa@grandpalace.com" },
      isActive: true,
      verificationStatus: "VERIFIED",
      commission: 20,
    },
    {
      name: "A&M Property Management",
      slug: "am-property-mgmt",
      partnerType: "TRUSTED_STAY_HOST",
      contactInfo: { name: "Ayşe Öztürk", email: "host@ozturrental.com" },
      isActive: true,
      verificationStatus: "VERIFIED",
      commission: 12,
    },
    {
      name: "Local Lens Tours",
      slug: "local-lens-tours",
      partnerType: "EXPERIENCE",
      contactInfo: { name: "Tour Manager", email: "info@locallens.com" },
      isActive: false,
      verificationStatus: "PENDING",
      commission: 18,
    },
  ];

  for (const p of partners) {
    const { commission, ...partnerData } = p;
    let partner = await db.partner.findFirst({
      where: { tenantId: tenant.id, slug: p.slug },
    });
    if (!partner) {
      partner = await db.partner.create({
        data: {
          tenantId: tenant.id,
          ...partnerData,
          verificationStatus: partnerData.verificationStatus as any,
          partnerType: partnerData.partnerType as any,
          contactInfo: partnerData.contactInfo as any,
          contractMetadata: {} as any,
        },
      });
    }

    // Commission rule
    const existingRule = await db.commissionRule.findFirst({
      where: { tenantId: tenant.id, partnerId: partner.id },
    });
    if (!existingRule) {
      await db.commissionRule.create({
        data: {
          tenantId: tenant.id,
          partnerId: partner.id,
          moduleKey: partnerData.partnerType.toLowerCase(),
          ruleType: "PERCENT",
          value: commission,
        },
      });
    }
  }

  console.log("✓ Partners & commission rules");

  // ═══════════════════════════════════════════════════════════════
  // 8. FLASH INVENTORY WINDOWS (Tonight Deals)
  // ═══════════════════════════════════════════════════════════════
  const tonight = new Date();
  tonight.setHours(14, 0, 0, 0);

  const tonightEnd = new Date();
  tonightEnd.setHours(23, 59, 0, 0);

  const existingFlash = await db.inventoryFlashWindow.findFirst({
    where: {
      tenantId: tenant.id,
      hotelId: hotel1.id,
      roomTypeId: deluxeKing.id,
    },
  });

  if (!existingFlash) {
    const flashWindow = await db.inventoryFlashWindow.create({
      data: {
        tenantId: tenant.id,
        hotelId: hotel1.id,
        roomTypeId: deluxeKing.id,
        name: "Tonight's Flash Deal — Bosphorus View",
        startsAt: tonight,
        endsAt: tonightEnd,
        status: "ACTIVE",
        isVipEarlyAccess: false,
        visibilityRule: { minBookingHour: 14 } as any,
        pricingRule: { discountPercent: 35, minStay: 1 } as any,
      },
    });

    // Rate snapshots for the next 3 days
    const invToday = await db.roomInventory.findFirst({
      where: { roomTypeId: deluxeKing.id, date: { gte: tonight } },
    });
    if (invToday) {
      await db.flashRateSnapshot.create({
        data: {
          tenantId: tenant.id,
          inventoryFlashWindowId: flashWindow.id,
          roomInventoryId: invToday.id,
          inventoryDate: invToday.date,
          originalPriceCents: invToday.pricePerNight,
          flashPriceCents: Math.round(invToday.pricePerNight * 0.65),
          currency: "USD",
        },
      });
    }
  }

  console.log("✓ Flash inventory window (Tonight Deal)");

  // ═══════════════════════════════════════════════════════════════
  // 9. VIP OFFERS
  // ═══════════════════════════════════════════════════════════════
  const goldBenefit = await db.vipBenefit.findFirst({
    where: { vipPlanId: goldPlan.id, code: "LOUNGE_ACCESS" },
  });

  if (goldBenefit) {
    const existingOffer = await db.vipOffer.findFirst({
      where: {
        tenantId: tenant.id,
        title: "Spring Upgrade: Try Platinum Free",
      },
    });
    if (!existingOffer) {
      await db.vipOffer.create({
        data: {
          tenantId: tenant.id,
          vipPlanId: goldPlan.id,
          title: "Spring Upgrade: Try Platinum Free",
          description:
            "Gold members: enjoy a 7-day Platinum trial at no extra charge. Butler service, suite upgrade, and unlimited spa.",
          offerType: "UPGRADE_TRIAL",
          startsAt: new Date("2026-04-01"),
          endsAt: new Date("2026-06-30"),
          config: { trialDays: 7, autoUpgrade: false } as any,
        },
      });
    }
  }

  console.log("✓ VIP offers");

  // ═══════════════════════════════════════════════════════════════
  // 10. SETTLEMENT BATCH (demo finance data)
  // ═══════════════════════════════════════════════════════════════
  const existingBatch = await db.settlementBatch.findFirst({
    where: { batchRef: "BATCH-2026-03" },
  });
  if (!existingBatch) {
    const batch = await db.settlementBatch.create({
      data: {
        tenantId: tenant.id,
        batchRef: "BATCH-2026-03",
        periodStart: new Date("2026-03-01"),
        periodEnd: new Date("2026-03-31"),
        status: "READY",
        totalGrossCents: 158700,
        totalCommissionCents: 23805,
        totalNetCents: 134895,
        currency: "USD",
      },
    });

    const mobilityPartner = await db.partner.findFirst({
      where: { tenantId: tenant.id, slug: "istanbul-vip-transfers" },
    });
    if (mobilityPartner) {
      await db.settlementLine.create({
        data: {
          tenantId: tenant.id,
          settlementBatchId: batch.id,
          partnerId: mobilityPartner.id,
          moduleKey: "mobility",
          grossCents: 55000,
          commissionCents: 8250,
          netCents: 46750,
          currency: "USD",
          metadata: { transactionCount: 10 } as any,
        },
      });
    }

    const amenityPartner = await db.partner.findFirst({
      where: { tenantId: tenant.id, slug: "ciragan-wellness" },
    });
    if (amenityPartner) {
      await db.settlementLine.create({
        data: {
          tenantId: tenant.id,
          settlementBatchId: batch.id,
          partnerId: amenityPartner.id,
          moduleKey: "amenity",
          grossCents: 42000,
          commissionCents: 8400,
          netCents: 33600,
          currency: "USD",
          metadata: { transactionCount: 15 } as any,
        },
      });
    }
  }

  console.log("✓ Settlement batch & lines");

  // ═══════════════════════════════════════════════════════════════
  // DONE
  // ═══════════════════════════════════════════════════════════════
  console.log("\n✅ Supplementary seed complete!");
  console.log("\n🔗 Pages now populated:");
  console.log("  /homes                 → 3 Trusted Stay units");
  console.log(
    "  /homes/bosphorus-terrace-apartment → full detail + availability",
  );
  console.log("  /mobility              → 5 products (Istanbul + Athens)");
  console.log("  /guides/IST            → Istanbul city guide + 5 experiences");
  console.log("  /experiences/[slug]    → detail pages with slots");
  console.log("  /offers                → 4 bundle offers");
  console.log(
    "  /vip/benefits          → Gold + Platinum plans with full benefit lists",
  );
  console.log(
    "  /amenities/[id]        → Spa, Gym, Pool, Rooftop with pass plans",
  );
  console.log("  /tonight               → Flash deal on Deluxe King room");
  console.log("  /hotel/amenities       → 4 amenity assets");
  console.log("  /hotel/partners/mobility → mobility products linked to hotel");
  console.log("  /admin/trusted-stays   → 1 pending verification");
  console.log(
    "  /admin/partner-verification → 4 verified + 1 pending partners",
  );
  console.log("  /admin/settlements     → 1 READY batch with 2 lines");
  console.log("  /admin/marketplace-moderation → 4 active bundles");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
