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
  // 5b. CITY GUIDE — ATHENS + MORE EXPERIENCES
  // ═══════════════════════════════════════════════════════════════
  const athensGuide = await db.cityGuide.upsert({
    where: {
      tenantId_cityCode_languageCode: {
        tenantId: tenant.id,
        cityCode: "ATH",
        languageCode: "en",
      },
    },
    create: {
      tenantId: tenant.id,
      cityCode: "ATH",
      cityName: "Athens",
      countryCode: "GR",
      languageCode: "en",
      summary:
        "Athens — the cradle of Western civilisation. Ancient ruins meet vibrant street art, rooftop bars, and some of the best seafood in the Mediterranean.",
      safetyNotes:
        "Athens is generally safe for tourists. Exercise normal caution in Omonia Square and keep valuables secure on public transport.",
      transportTips:
        "The Athens Metro is clean, fast, and affordable. Taxis should use the meter. Uber and Beat are available. The port of Piraeus is a short metro ride away.",
      emergencyInfo: {
        police: "100",
        ambulance: "166",
        tourist_police: "+30 210 920 0724",
      } as any,
      usefulApps: ["Beat", "Google Maps", "TheFork", "Wolt"] as any,
    },
    update: {},
  });

  const athSections = [
    {
      sectionKey: "must_see",
      title: "Must-See Sights",
      body: "The Acropolis and Parthenon are unmissable — go at sunrise to beat the crowds. The Ancient Agora, Temple of Hephaestus, and the Panathenaic Stadium (venue of the first modern Olympics) are within easy walking distance. Spend an afternoon in the National Archaeological Museum.",
      sortOrder: 1,
    },
    {
      sectionKey: "food_scene",
      title: "Food & Dining",
      body: "Athens has undergone a culinary renaissance. Monastiraki and Psyrri are packed with tavernas serving fresh mezedes. For upscale dining, try the rooftop restaurants around Lycabettus Hill. Don't miss spanakopita from a street bakery, or fresh loukoumades (Greek doughnuts) drizzled with honey.",
      sortOrder: 2,
    },
    {
      sectionKey: "day_trips",
      title: "Day Trips",
      body: "Cape Sounion (70 km south) has the dramatic Temple of Poseidon overlooking the Aegean — spectacular at sunset. The island of Aegina is a 40-minute ferry ride and famous for pistachio nuts and Byzantine churches.",
      sortOrder: 3,
    },
  ];

  for (const s of athSections) {
    const existing = await db.cityGuideSection.findFirst({
      where: {
        tenantId: tenant.id,
        cityGuideId: athensGuide.id,
        sectionKey: s.sectionKey,
        persona: null,
      },
    });
    if (!existing) {
      await db.cityGuideSection.create({
        data: { tenantId: tenant.id, cityGuideId: athensGuide.id, ...s },
      });
    }
  }

  // Athens experiences
  const athExperiences = [
    {
      slug: "acropolis-sunrise-walk",
      name: "Acropolis Sunrise Walk",
      category: "CULTURAL" as const,
      description:
        "Beat the heat and the crowds with an exclusive early-morning guided walk of the Acropolis. Watch the sun rise over the Parthenon while your expert archaeologist guide brings 2,500 years of history to life.",
      durationMinutes: 120,
      city: "Athens",
      meetingPoint: {
        address: "Acropolis South Entrance, Dionysiou Areopagitou",
      },
      priceCents: 7500,
      maxGuests: 8,
      languages: ["en", "gr"],
      tags: ["acropolis", "history", "sunrise", "culture"],
    },
    {
      slug: "athens-street-food-tour",
      name: "Athens Street Food Tour",
      category: "FOOD_TOUR" as const,
      description:
        "Wander through Monastiraki, Psyrri, and the Central Market with a local foodie guide. Sample spanakopita, loukoumades, souvlaki, fresh olives, and local cheeses. Finish with Greek coffee and a sweet baklava at a century-old pastry shop.",
      durationMinutes: 180,
      city: "Athens",
      meetingPoint: { address: "Monastiraki Metro Station, Exit 1" },
      priceCents: 5500,
      maxGuests: 10,
      languages: ["en", "gr"],
      tags: ["food", "street_food", "culture", "monastiraki"],
    },
    {
      slug: "aegean-sailing-day-trip",
      name: "Aegean Sailing Day Trip",
      category: "OTHER" as const,
      description:
        "Set sail on a private catamaran from the Athens Riviera for a full-day Aegean adventure. Snorkel in crystal waters, visit a secluded beach, enjoy a fresh seafood lunch on board, and watch the sun dip toward the horizon as you return to port.",
      durationMinutes: 480,
      city: "Athens",
      meetingPoint: { address: "Alimos Marina, Gate 3, Athens Riviera" },
      priceCents: 19500,
      maxGuests: 10,
      languages: ["en"],
      tags: ["sailing", "beach", "sea", "adventure"],
    },
    {
      slug: "greek-cooking-class",
      name: "Greek Cooking Masterclass",
      category: "FOOD_TOUR" as const,
      description:
        "Learn to cook five classic Greek dishes in a beautiful Athenian kitchen. Hands-on session covering moussaka, tzatziki, tiropita, slow-roasted lamb, and galaktoboureko dessert. Enjoy what you cook over a communal lunch with local wine.",
      durationMinutes: 210,
      city: "Athens",
      meetingPoint: {
        address: "Kolonaki Quarter — address confirmed on booking",
      },
      priceCents: 9500,
      maxGuests: 8,
      languages: ["en", "gr"],
      tags: ["cooking", "food", "culture", "hands-on"],
    },
    {
      slug: "cape-sounion-sunset",
      name: "Cape Sounion Sunset Experience",
      category: "CULTURAL" as const,
      description:
        "Private minibus transfer to the dramatic Cape Sounion headland, home of the Temple of Poseidon. Arrive before sunset to explore the ancient site with a guide, then watch the sun sink into the Aegean — one of Greece's most iconic views. Wine and mezedes included.",
      durationMinutes: 300,
      city: "Athens",
      meetingPoint: { address: "Hotel lobby, Boutique Athens" },
      priceCents: 12500,
      maxGuests: 12,
      languages: ["en"],
      tags: ["sunset", "ancient", "temple", "scenic"],
    },
  ];

  for (const exp of athExperiences) {
    const e = await db.localExperience.upsert({
      where: { tenantId_slug: { tenantId: tenant.id, slug: exp.slug } },
      create: {
        tenantId: tenant.id,
        hotelId: hotel2.id,
        cityGuideId: athensGuide.id,
        ...exp,
        meetingPoint: exp.meetingPoint as any,
        languages: exp.languages as any,
        tags: exp.tags as any,
      },
      update: {},
    });

    // Slots for next 14 days
    for (let i = 1; i <= 14; i++) {
      if (i % 4 === 0) continue;
      const startsAt = days(i);
      startsAt.setHours(
        exp.slug.includes("sunset") || exp.slug.includes("sailing") ? 16 : 9,
        0,
        0,
        0,
      );
      const endsAt = new Date(
        startsAt.getTime() + (exp.durationMinutes ?? 120) * 60_000,
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

  // Istanbul extra experiences
  const istExtraExperiences = [
    {
      slug: "turkish-cooking-class",
      name: "Turkish Cooking Masterclass",
      category: "FOOD_TOUR" as const,
      description:
        "Join a professional Turkish chef in her family kitchen in Beyoğlu for a 3-hour cooking experience. Learn to make meze, slow-cooked lamb, and classic baklava from scratch. Includes a full meal with Turkish tea and wine.",
      durationMinutes: 180,
      city: "Istanbul",
      meetingPoint: { address: "Beyoğlu — confirmed address sent on booking" },
      priceCents: 8500,
      maxGuests: 6,
      languages: ["en", "tr"],
      tags: ["cooking", "food", "culture", "beyoglu"],
    },
    {
      slug: "princes-island-bicycle-tour",
      name: "Princes Island Bicycle Tour",
      category: "OTHER" as const,
      description:
        "Take the ferry from Kabataş to car-free Büyükada — the largest of Istanbul's Princes' Islands. Rent bicycles and pedal past Victorian villas, pine forests, and monasteries. Enjoy a seafood lunch by the water before returning to the city.",
      durationMinutes: 360,
      city: "Istanbul",
      meetingPoint: { address: "Kabataş Ferry Terminal, Istanbul" },
      priceCents: 6500,
      maxGuests: 10,
      languages: ["en", "tr", "de"],
      tags: ["cycling", "island", "nature", "day_trip"],
    },
  ];

  for (const exp of istExtraExperiences) {
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

    for (let i = 1; i <= 14; i++) {
      if (i % 3 === 0) continue;
      const startsAt = days(i);
      startsAt.setHours(9, 0, 0, 0);
      const endsAt = new Date(
        startsAt.getTime() + (exp.durationMinutes ?? 120) * 60_000,
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

  console.log(
    "✓ City guide: Athens + 5 experiences + 2 extra Istanbul experiences",
  );

  // ═══════════════════════════════════════════════════════════════
  // 4b. MORE TRUSTED STAY UNITS
  // ═══════════════════════════════════════════════════════════════
  const host3 = await db.trustedStayHost.upsert({
    where: { id: "00000000-0000-0000-0010-000000000003" },
    create: {
      id: "00000000-0000-0000-0010-000000000003",
      tenantId: tenant.id,
      displayName: "Elena Stavros",
      legalName: "Stavros Premium Rentals",
      email: "elena@stavrosrentals.gr",
      phone: "+30 694 333 4455",
      hostType: "PROFESSIONAL" as const,
      verificationStatus: "VERIFIED" as const,
    },
    update: {},
  });

  const extraUnits = [
    {
      id: "00000000-0000-0000-0011-000000000004",
      hostId: host2.id,
      hotelId: hotel2.id,
      slug: "athens-stone-villa",
      name: "Athens Stone Villa",
      trustedStayType: "VILLA" as const,
      stayTerm: "WEEKLY" as const,
      description:
        "Stunning traditional stone villa in the Athens foothills with panoramic city views, private pool, and olive grove garden. Sleeps 8 in 4 spacious bedrooms — perfect for group getaways.",
      address: {
        street: "Kifisias Avenue 42",
        city: "Athens",
        country: "Greece",
      },
      geo: { lat: 38.0034, lng: 23.7534 },
      roomCount: 4,
      guestCapacity: 8,
      bathroomCount: 4,
      amenities: [
        "Private Pool",
        "WiFi",
        "Kitchen",
        "Garden",
        "Parking",
        "BBQ",
        "Air Conditioning",
      ],
      photos: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800",
        "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800",
      ],
      verificationStatus: "VERIFIED" as const,
      nightlyRate: 48000,
    },
    {
      id: "00000000-0000-0000-0011-000000000005",
      hostId: host3.id,
      hotelId: hotel2.id,
      slug: "aegean-sea-view-apartment",
      name: "Aegean Sea View Apartment",
      trustedStayType: "APARTMENT" as const,
      stayTerm: "DAILY" as const,
      description:
        "Beautifully designed 2-bedroom apartment perched on the Athens Riviera with breathtaking Aegean sea views. Modern interiors, private balcony, and direct access to Glyfada beach.",
      address: { street: "Poseidonos 15", city: "Glyfada", country: "Greece" },
      geo: { lat: 37.8687, lng: 23.7503 },
      roomCount: 2,
      guestCapacity: 4,
      bathroomCount: 2,
      amenities: [
        "Sea View",
        "WiFi",
        "Kitchen",
        "Balcony",
        "Air Conditioning",
        "Beach Access",
      ],
      photos: [
        "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800",
        "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800",
      ],
      verificationStatus: "VERIFIED" as const,
      nightlyRate: 22000,
    },
    {
      id: "00000000-0000-0000-0011-000000000006",
      hostId: host1.id,
      hotelId: hotel1.id,
      slug: "sultanahmet-historic-apartment",
      name: "Sultanahmet Historic Apartment",
      trustedStayType: "APARTMENT" as const,
      stayTerm: "DAILY" as const,
      description:
        "Charming 1-bedroom apartment in a lovingly restored 19th-century Ottoman building in the heart of Sultanahmet. Steps from the Blue Mosque, Hagia Sophia, and the Grand Bazaar. Original wooden ceilings, kilim rugs, and modern comforts.",
      address: {
        street: "Akbıyık Caddesi 12",
        city: "Istanbul",
        country: "Turkey",
      },
      geo: { lat: 41.0048, lng: 28.9781 },
      roomCount: 1,
      guestCapacity: 2,
      bathroomCount: 1,
      amenities: [
        "WiFi",
        "Kitchen",
        "Air Conditioning",
        "Ottoman Decor",
        "Rooftop Terrace",
      ],
      photos: [
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
        "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800",
      ],
      verificationStatus: "VERIFIED" as const,
      nightlyRate: 13500,
    },
    {
      id: "00000000-0000-0000-0011-000000000007",
      hostId: host1.id,
      hotelId: hotel1.id,
      slug: "karakoy-design-loft",
      name: "Karaköy Design Loft",
      trustedStayType: "OTHER" as const,
      stayTerm: "DAILY" as const,
      description:
        "A curated studio loft in Karaköy — Istanbul's most stylish neighbourhood. Industrial-chic interiors with exposed brick, art prints, and floor-to-ceiling windows overlooking the Golden Horn. Walking distance to the best coffee shops, galleries, and restaurants in the city.",
      address: {
        street: "Kemeraltı Caddesi 5",
        city: "Istanbul",
        country: "Turkey",
      },
      geo: { lat: 41.0251, lng: 28.9742 },
      roomCount: 1,
      guestCapacity: 2,
      bathroomCount: 1,
      amenities: [
        "WiFi",
        "Espresso Machine",
        "Smart TV",
        "Air Conditioning",
        "Rooftop Access",
        "Concierge",
      ],
      photos: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
      ],
      verificationStatus: "VERIFIED" as const,
      nightlyRate: 16500,
    },
  ] as const;

  for (const u of extraUnits) {
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
        geo: u.geo as any,
        roomCount: u.roomCount,
        guestCapacity: u.guestCapacity,
        bathroomCount: u.bathroomCount,
        amenities: u.amenities as any,
        photos: u.photos as any,
        verificationStatus: u.verificationStatus as any,
      },
      update: {},
    });

    const nr = (u as any).nightlyRate as number;
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
        nightlyPriceCents: nr,
        weeklyPriceCents: nr * 6,
        monthlyPriceCents: nr * 25,
        depositCents: nr * 2,
        cancellationPolicy: { freeCancelBefore: "48h", penaltyPercent: 50 },
      },
      update: {},
    });

    for (let i = 0; i < 60; i++) {
      const date = days(i);
      date.setHours(0, 0, 0, 0);
      await db.trustedStayAvailability.upsert({
        where: { trustedStayUnitId_date: { trustedStayUnitId: unit.id, date } },
        create: {
          tenantId: tenant.id,
          trustedStayUnitId: unit.id,
          date,
          isAvailable: i % 7 !== 0,
          minNights: 2,
          maxNights: 30,
          priceCents: nr,
          cleaningFeeCents: 5000,
        },
        update: {},
      });
    }
  }

  console.log("✓ 4 extra Trusted Stay units");

  // ═══════════════════════════════════════════════════════════════
  // 4c. MORE MOBILITY PRODUCTS
  // ═══════════════════════════════════════════════════════════════
  const mobilityProvider3 = await db.mobilityProvider.upsert({
    where: { id: "00000000-0000-0000-0020-000000000003" },
    create: {
      id: "00000000-0000-0000-0020-000000000003",
      tenantId: tenant.id,
      name: "Athens Drive Co.",
      mobilityType: "RENTAL_CAR",
      cities: ["Athens"] as any,
      serviceAreas: [
        "ATH Airport",
        "City Center",
        "Piraeus",
        "Athens Riviera",
      ] as any,
      contactInfo: {
        email: "info@athensdrive.gr",
        phone: "+30 210 777 8899",
      } as any,
      verificationStatus: "VERIFIED" as const,
      ratingAggregate: 4.6,
    },
    update: {},
  });

  const extraMobilityProducts = [
    {
      code: "ATH_AIRPORT_FULL_TRANSFER",
      name: "Athens Airport — Full-Size Transfer",
      mobilityProviderId: mobilityProvider2.id,
      hotelId: hotel2.id,
      mobilityType: "AIRPORT_TRANSFER" as const,
      vehicleClass: "Mercedes V-Class",
      capacity: 6,
      baggageCapacity: 6,
      city: "Athens",
      description:
        "Spacious V-Class van transfer for families and groups between Athens International Airport (ATH) and your accommodation. Meet & greet included.",
      pricingConfig: { flatRate: 9500, currency: "EUR" },
    },
    {
      code: "ATH_CITY_CHAUFFEUR",
      name: "Athens City Tour Chauffeur",
      mobilityProviderId: mobilityProvider2.id,
      hotelId: hotel2.id,
      mobilityType: "HOURLY_DRIVER" as const,
      vehicleClass: "BMW 5 Series",
      capacity: 4,
      baggageCapacity: 4,
      city: "Athens",
      description:
        "Hire a professional chauffeur by the hour to explore Athens at your own pace — Acropolis, Plaka, Piraeus port, and beyond.",
      pricingConfig: { hourlyRate: 8500, minimumHours: 3, currency: "EUR" },
    },
    {
      code: "IST_BOSPHORUS_DRIVE",
      name: "Istanbul Bosphorus Scenic Drive",
      mobilityProviderId: mobilityProvider1.id,
      hotelId: hotel1.id,
      mobilityType: "CITY_TRANSFER" as const,
      vehicleClass: "Luxury Sedan",
      capacity: 4,
      baggageCapacity: 2,
      city: "Istanbul",
      description:
        "A scenic point-to-point transfer along the entire European Bosphorus shore — from Sultanahmet through Beşiktaş, Ortaköy, Bebek, and up to Sarıyer. Breathtaking views throughout.",
      pricingConfig: { flatRate: 8500, currency: "USD" },
    },
    {
      code: "IST_VIP_SUV",
      name: "Istanbul VIP SUV — Hourly",
      mobilityProviderId: mobilityProvider1.id,
      hotelId: hotel1.id,
      mobilityType: "HOURLY_DRIVER" as const,
      vehicleClass: "Range Rover Sport",
      capacity: 5,
      baggageCapacity: 4,
      city: "Istanbul",
      description:
        "Travel Istanbul in style with our flagship Range Rover Sport and uniformed chauffeur. Complimentary water, WiFi hotspot, and daily newspapers on board.",
      pricingConfig: { hourlyRate: 22000, minimumHours: 2, currency: "USD" },
    },
    {
      code: "ATH_RENTAL_ECONOMY",
      name: "Athens Rental Car — Economy",
      mobilityProviderId: mobilityProvider3.id,
      hotelId: hotel2.id,
      mobilityType: "RENTAL_CAR" as const,
      vehicleClass: "Economy (Toyota Yaris or similar)",
      capacity: 4,
      baggageCapacity: 2,
      city: "Athens",
      description:
        "Flexible daily car rental from our Athens depot. Full insurance, unlimited mileage, and 24/7 roadside assistance included. Ideal for day trips to Cape Sounion or the Peloponnese.",
      pricingConfig: {
        dailyRate: 4500,
        currency: "EUR",
        insuranceIncluded: true,
      },
    },
    {
      code: "ATH_RENTAL_LUXURY",
      name: "Athens Rental Car — Luxury",
      mobilityProviderId: mobilityProvider3.id,
      hotelId: hotel2.id,
      mobilityType: "RENTAL_CAR" as const,
      vehicleClass: "Luxury SUV (BMW X5 or similar)",
      capacity: 5,
      baggageCapacity: 4,
      city: "Athens",
      description:
        "Drive through Greece in a premium BMW X5 or Audi Q7. Full insurance, GPS navigation, child seat option, and 24/7 concierge included.",
      pricingConfig: {
        dailyRate: 14500,
        currency: "EUR",
        insuranceIncluded: true,
      },
    },
  ] as const;

  for (const mp of extraMobilityProducts) {
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
        baggageCapacity: mp.baggageCapacity,
        city: mp.city,
        description: mp.description,
        pricingConfig: mp.pricingConfig as any,
      },
      update: {},
    });
  }

  console.log("✓ 6 extra mobility products");

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
      startsAt: new Date("2026-01-01"),
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
      startsAt: new Date("2026-01-01"),
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
      startsAt: new Date("2026-01-01"),
      endsAt: new Date("2026-10-31"),
      items: [
        {
          itemType: "ROOM_NIGHTS",
          quantity: 2,
          unitCents: 12900,
          sortOrder: 1,
          itemLabel: "2 Nights Accommodation",
        },
        {
          itemType: "TRANSFER",
          quantity: 1,
          unitCents: 6500,
          sortOrder: 2,
          itemLabel: "Airport Transfer",
        },
        {
          itemType: "LOCAL_EXPERIENCE",
          quantity: 1,
          unitCents: 9000,
          sortOrder: 3,
          itemLabel: "Private Acropolis Tour",
        },
      ],
    },
    {
      code: "ATHENS_CULTURE_WEEKEND",
      name: "Athens Culture Weekend",
      description:
        "A 3-day deep dive into ancient Athens. Includes 2 nights accommodation, the Acropolis Sunrise Walk, Athens Street Food Tour, and a Cape Sounion sunset transfer. The perfect cultural weekend escape.",
      bundleType: "ACTIVITY_PACK",
      pricingMode: "BUNDLED",
      totalCents: 58000,
      subtotalCents: 68500,
      hotelId: hotel2.id,
      isVipOnly: false,
      startsAt: new Date("2026-01-01"),
      endsAt: new Date("2026-11-30"),
      items: [
        {
          itemType: "ROOM_NIGHTS",
          quantity: 2,
          unitCents: 12900,
          sortOrder: 1,
          itemLabel: "2 Nights at Boutique Athens",
        },
        {
          itemType: "LOCAL_EXPERIENCE",
          quantity: 1,
          unitCents: 7500,
          sortOrder: 2,
          itemLabel: "Acropolis Sunrise Walk",
        },
        {
          itemType: "LOCAL_EXPERIENCE",
          quantity: 1,
          unitCents: 5500,
          sortOrder: 3,
          itemLabel: "Athens Street Food Tour",
        },
        {
          itemType: "LOCAL_EXPERIENCE",
          quantity: 1,
          unitCents: 12500,
          sortOrder: 4,
          itemLabel: "Cape Sounion Sunset Experience",
        },
        {
          itemType: "TRANSFER",
          quantity: 1,
          unitCents: 6500,
          sortOrder: 5,
          itemLabel: "Athens Airport Transfer",
        },
      ],
    },
    {
      code: "HONEYMOON_SUITE",
      name: "Honeymoon Suite Package",
      description:
        "Everything you need for the perfect romantic escape. Suite upgrade guaranteed, rose petal turndown, couples' spa session, Bosphorus sunset yacht cruise, and a private candlelit dinner on the terrace.",
      bundleType: "CURATED",
      pricingMode: "BUNDLED",
      totalCents: 95000,
      subtotalCents: 118000,
      hotelId: hotel1.id,
      isVipOnly: false,
      startsAt: new Date("2026-03-25"),
      endsAt: new Date("2026-12-31"),
      items: [
        {
          itemType: "ROOM_NIGHTS",
          quantity: 3,
          unitCents: 28900,
          sortOrder: 1,
          itemLabel: "3 Nights Suite Accommodation",
        },
        {
          itemType: "AMENITY_PASS",
          quantity: 2,
          unitCents: 4500,
          sortOrder: 2,
          itemLabel: "Couples' Spa Session",
        },
        {
          itemType: "LOCAL_EXPERIENCE",
          quantity: 1,
          unitCents: 8500,
          sortOrder: 3,
          itemLabel: "Bosphorus Sunset Cruise",
        },
        {
          itemType: "DINING_CREDIT",
          quantity: 1,
          unitCents: 15000,
          sortOrder: 4,
          itemLabel: "Private Candlelit Dinner",
        },
        {
          itemType: "TRANSFER",
          quantity: 1,
          unitCents: 5500,
          sortOrder: 5,
          itemLabel: "Airport Transfer",
        },
        {
          itemType: "ROOM_EXTRA",
          quantity: 1,
          unitCents: 0,
          sortOrder: 6,
          itemLabel: "Rose Petal Turndown & Champagne",
        },
      ],
    },
    {
      code: "BUSINESS_TRAVELER_BUNDLE",
      name: "Business Traveler Bundle",
      description:
        "Designed for the discerning corporate guest. Includes executive room, express airport transfer, daily dry cleaning, business lounge access, and a restaurant dining credit.",
      bundleType: "CURATED",
      pricingMode: "BUNDLED",
      totalCents: 38500,
      subtotalCents: 46000,
      hotelId: hotel1.id,
      isVipOnly: false,
      startsAt: new Date("2026-03-25"),
      endsAt: new Date("2026-12-31"),
      items: [
        {
          itemType: "ROOM_NIGHTS",
          quantity: 2,
          unitCents: 18900,
          sortOrder: 1,
          itemLabel: "2 Nights Executive Room",
        },
        {
          itemType: "TRANSFER",
          quantity: 2,
          unitCents: 5500,
          sortOrder: 2,
          itemLabel: "Airport Transfers (both ways)",
        },
        {
          itemType: "AMENITY_PASS",
          quantity: 2,
          unitCents: 0,
          sortOrder: 3,
          itemLabel: "Business Lounge Access",
        },
        {
          itemType: "DINING_CREDIT",
          quantity: 1,
          unitCents: 5000,
          sortOrder: 4,
          itemLabel: "Restaurant Dining Credit",
        },
        {
          itemType: "ROOM_EXTRA",
          quantity: 1,
          unitCents: 0,
          sortOrder: 5,
          itemLabel: "Daily Dry Cleaning (3 items)",
        },
      ],
    },
    {
      code: "FAMILY_SUMMER_PACKAGE",
      name: "Family Summer Package",
      description:
        "The ultimate family holiday. Spacious interconnecting rooms, kids' activities, family boat tour on the Aegean, beach transfers, and complimentary children's meals. Ages 3–12 welcome.",
      bundleType: "ACTIVITY_PACK",
      pricingMode: "BUNDLED",
      totalCents: 68000,
      subtotalCents: 82000,
      hotelId: hotel2.id,
      isVipOnly: false,
      startsAt: new Date("2026-01-01"),
      endsAt: new Date("2026-09-15"),
      items: [
        {
          itemType: "ROOM_NIGHTS",
          quantity: 5,
          unitCents: 12900,
          sortOrder: 1,
          itemLabel: "5 Nights Family Room",
        },
        {
          itemType: "LOCAL_EXPERIENCE",
          quantity: 1,
          unitCents: 19500,
          sortOrder: 2,
          itemLabel: "Aegean Sailing Day Trip (family)",
        },
        {
          itemType: "LOCAL_EXPERIENCE",
          quantity: 1,
          unitCents: 9500,
          sortOrder: 3,
          itemLabel: "Greek Cooking Masterclass",
        },
        {
          itemType: "TRANSFER",
          quantity: 2,
          unitCents: 9500,
          sortOrder: 4,
          itemLabel: "Airport Transfers (both ways)",
        },
        {
          itemType: "ROOM_EXTRA",
          quantity: 1,
          unitCents: 0,
          sortOrder: 5,
          itemLabel: "Children's Meals (complimentary)",
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
        const { itemLabel, ...itemData } = item as any;
        await db.bundleItem.create({
          data: {
            tenantId: tenant.id,
            bundleOfferId: bundle.id,
            ...itemData,
            metadata: itemLabel ? { itemLabel } : ({} as any),
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
          availableCount: invToday.availableCount ?? 1,
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
          startsAt: new Date("2026-01-01"),
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
