/**
 * seed-guest-portal.ts
 * Seeds all guest-facing portal pages:
 * - VIP plans & benefits
 * - Flash inventory deals (tonight page)
 * - Trusted stay units (homes page)
 * - Amenity marketplace
 * - Bundle offers
 * - Mobility products
 * - Local experiences with slots
 * - City guides
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Guest portal seed başlıyor...\n");

  // ─── Tenant & hotels ─────────────────────────────────────────────
  const tenant = await db.tenant.findFirst({ where: { slug: "grand-hotels" } });
  if (!tenant) throw new Error("Tenant bulunamadı — önce seed.ts çalıştır");

  const hotels = await db.hotel.findMany({
    where: { tenantId: tenant.id },
    include: { roomTypes: { include: { inventory: { take: 1 } } } },
  });
  if (hotels.length === 0)
    throw new Error("Otel bulunamadı — önce seed.ts çalıştır");

  const hotel1 = hotels[0];
  const hotel2 = hotels[1] ?? hotel1;
  const hotel3 = hotels[2] ?? hotel1;

  console.log(
    `✓ ${hotels.length} otel bulundu: ${hotels.map((h) => h.name).join(", ")}`,
  );

  // ─── Guest user ──────────────────────────────────────────────────
  const guestUser = await db.user.findFirst({
    where: { tenantId: tenant.id, role: "GUEST" },
  });

  // ═══════════════════════════════════════════════════════════════
  // VIP PLANS
  // ═══════════════════════════════════════════════════════════════
  console.log("\n📋 VIP planları oluşturuluyor...");

  const vipCore = await db.vipPlan.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: "VIP-CORE" } },
    create: {
      tenantId: tenant.id,
      code: "VIP-CORE",
      name: "Core",
      tier: "CORE",
      description:
        "Temel VIP üyelik — erken check-in, geç check-out ve özel indirimler.",
      monthlyPriceCents: 2900,
      yearlyPriceCents: 29900,
      currency: "USD",
      isActive: true,
    },
    update: {},
  });

  await db.vipBenefit.createMany({
    skipDuplicates: true,
    data: [
      {
        tenantId: tenant.id,
        vipPlanId: vipCore.id,
        name: "Early check-in (12:00)",
        isActive: true,
      },
      {
        tenantId: tenant.id,
        vipPlanId: vipCore.id,
        name: "Late check-out (14:00)",
        isActive: true,
      },
      {
        tenantId: tenant.id,
        vipPlanId: vipCore.id,
        name: "10% F&B indirim",
        isActive: true,
      },
      {
        tenantId: tenant.id,
        vipPlanId: vipCore.id,
        name: "Ücretsiz WiFi yükseltme",
        isActive: true,
      },
    ],
  });

  const vipComfort = await db.vipPlan.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: "VIP-COMFORT" } },
    create: {
      tenantId: tenant.id,
      code: "VIP-COMFORT",
      name: "Comfort",
      tier: "COMFORT",
      description:
        "Konfor odaklı VIP — oda yükseltmeleri, spa kredileri ve özel hizmet.",
      monthlyPriceCents: 5900,
      yearlyPriceCents: 59900,
      currency: "USD",
      isActive: true,
    },
    update: {},
  });

  await db.vipBenefit.createMany({
    skipDuplicates: true,
    data: [
      {
        tenantId: tenant.id,
        vipPlanId: vipComfort.id,
        name: "Ücretsiz oda yükseltme (müsaitliğe göre)",
        isActive: true,
      },
      {
        tenantId: tenant.id,
        vipPlanId: vipComfort.id,
        name: "Early check-in (10:00)",
        isActive: true,
      },
      {
        tenantId: tenant.id,
        vipPlanId: vipComfort.id,
        name: "Late check-out (16:00)",
        isActive: true,
      },
      {
        tenantId: tenant.id,
        vipPlanId: vipComfort.id,
        name: "Aylık $50 spa kredisi",
        isActive: true,
      },
      {
        tenantId: tenant.id,
        vipPlanId: vipComfort.id,
        name: "20% F&B indirim",
        isActive: true,
      },
      {
        tenantId: tenant.id,
        vipPlanId: vipComfort.id,
        name: "Karşılama hediyesi",
        isActive: true,
      },
    ],
  });

  const vipSignature = await db.vipPlan.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: "VIP-SIGNATURE" } },
    create: {
      tenantId: tenant.id,
      code: "VIP-SIGNATURE",
      name: "Signature",
      tier: "SIGNATURE",
      description:
        "En üst düzey VIP deneyim — özel concierge, suite garantisi ve sınırsız ayrıcalıklar.",
      monthlyPriceCents: 12900,
      yearlyPriceCents: 129900,
      currency: "USD",
      isActive: true,
    },
    update: {},
  });

  await db.vipBenefit.createMany({
    skipDuplicates: true,
    data: [
      {
        tenantId: tenant.id,
        vipPlanId: vipSignature.id,
        name: "Suite garantisi",
        isActive: true,
      },
      {
        tenantId: tenant.id,
        vipPlanId: vipSignature.id,
        name: "Kişisel concierge",
        isActive: true,
      },
      {
        tenantId: tenant.id,
        vipPlanId: vipSignature.id,
        name: "Havalimanı transferi (ücretsiz)",
        isActive: true,
      },
      {
        tenantId: tenant.id,
        vipPlanId: vipSignature.id,
        name: "Sınırsız spa erişimi",
        isActive: true,
      },
      {
        tenantId: tenant.id,
        vipPlanId: vipSignature.id,
        name: "30% tüm hizmetlerde indirim",
        isActive: true,
      },
      {
        tenantId: tenant.id,
        vipPlanId: vipSignature.id,
        name: "VIP lounge erişimi",
        isActive: true,
      },
      {
        tenantId: tenant.id,
        vipPlanId: vipSignature.id,
        name: "Flash deal öncelikli erişim",
        isActive: true,
      },
      {
        tenantId: tenant.id,
        vipPlanId: vipSignature.id,
        name: "Özel şarap & meyve sepeti",
        isActive: true,
      },
    ],
  });

  console.log("  ✓ VIP planları: Core, Comfort, Signature");

  // ═══════════════════════════════════════════════════════════════
  // FLASH INVENTORY (Tonight)
  // ═══════════════════════════════════════════════════════════════
  console.log("\n⚡ Flash inventory oluşturuluyor...");

  const now = new Date();
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  for (const hotel of hotels.slice(0, 3)) {
    const roomTypes = hotel.roomTypes.filter((rt) => rt.inventory.length > 0);
    if (roomTypes.length === 0) continue;

    for (let i = 0; i < Math.min(2, roomTypes.length); i++) {
      const rt = roomTypes[i];
      const inventory = rt.inventory[0];
      if (!inventory) continue;

      const startsAt = new Date(now);
      startsAt.setHours(now.getHours() - 1);

      const windowCode = `FLASH-${hotel.id.slice(0, 8)}-${rt.id.slice(0, 8)}`;

      // Check if already exists
      const existing = await db.inventoryFlashWindow.findFirst({
        where: {
          tenantId: tenant.id,
          hotelId: hotel.id,
          roomTypeId: rt.id,
          status: "ACTIVE",
        },
      });
      if (existing) continue;

      const flashWindow = await db.inventoryFlashWindow.create({
        data: {
          tenantId: tenant.id,
          hotelId: hotel.id,
          roomTypeId: rt.id,
          name: `${hotel.name} — ${rt.name} Flash Deal`,
          status: "ACTIVE",
          startsAt,
          endsAt: todayEnd,
          isVipEarlyAccess: i === 0,
          visibilityRule: { allUsers: true },
          pricingRule: { discountPercent: 25 + i * 10 },
        },
      });

      const originalPrice = inventory.pricePerNight;
      const discountPct = 0.25 + i * 0.1;
      const flashPrice = Math.round(originalPrice * (1 - discountPct));

      await db.flashRateSnapshot.create({
        data: {
          tenantId: tenant.id,
          inventoryFlashWindowId: flashWindow.id,
          roomInventoryId: inventory.id,
          inventoryDate: new Date(now.toISOString().split("T")[0]),
          originalPriceCents: originalPrice,
          flashPriceCents: flashPrice,
          availableCount: 3,
          bookingTypeTarget: i === 0 ? "SAME_NIGHT" : "ROOM",
        },
      });
    }
  }

  const flashCount = await db.inventoryFlashWindow.count({
    where: { tenantId: tenant.id },
  });
  console.log(`  ✓ ${flashCount} flash window oluşturuldu`);

  // ═══════════════════════════════════════════════════════════════
  // TRUSTED STAY (Homes)
  // ═══════════════════════════════════════════════════════════════
  console.log("\n🏠 Trusted stay units oluşturuluyor...");

  const hostDefs = [
    {
      displayName: "Ayşe & Mehmet Yılmaz",
      email: "aysemehmet@example.com",
      hostType: "PRIVATE",
    },
    {
      displayName: "Istanbul Stays Co.",
      email: "hello@istanbulstays.com",
      hostType: "PROFESSIONAL",
    },
    {
      displayName: "Kapadokya Cave Homes",
      email: "info@kapadokyacave.com",
      hostType: "PROFESSIONAL",
    },
    {
      displayName: "Bodrum Blue Villas",
      email: "info@bodrumblue.com",
      hostType: "PROFESSIONAL",
    },
  ];

  const hosts: any[] = [];
  for (const def of hostDefs) {
    const host = await db.trustedStayHost.create({
      data: {
        tenantId: tenant.id,
        displayName: def.displayName,
        email: def.email,
        hostType: def.hostType,
        verificationStatus: "VERIFIED",
      },
    });
    hosts.push(host);
  }

  const unitDefs = [
    {
      slug: "ts-istanbul-bosphorus-apt",
      name: "Boğaz Manzaralı Lüks Daire",
      trustedStayType: "APARTMENT" as const,
      stayTerm: "DAILY" as const,
      city: "İstanbul",
      address: { street: "Beşiktaş Cad. 12", city: "İstanbul", country: "TR" },
      guestCapacity: 4,
      roomCount: 2,
      ratingAggregate: 4.9,
      photos: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
      ],
      nightlyPrice: 18000,
      hostIdx: 0,
    },
    {
      slug: "ts-istanbul-sultanahmet-studio",
      name: "Sultanahmet Tarihi Studio",
      trustedStayType: "STUDIO" as const,
      stayTerm: "DAILY" as const,
      city: "İstanbul",
      address: {
        street: "Sultanahmet Mah. 5",
        city: "İstanbul",
        country: "TR",
      },
      guestCapacity: 2,
      roomCount: 1,
      ratingAggregate: 4.7,
      photos: [
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
      ],
      nightlyPrice: 9500,
      hostIdx: 0,
    },
    {
      slug: "ts-kapadokya-cave-suite",
      name: "Kapadokya Mağara Suite",
      trustedStayType: "VILLA" as const,
      stayTerm: "DAILY" as const,
      city: "Kapadokya",
      address: {
        street: "Ürgüp Mah. Kayabaşı",
        city: "Nevşehir",
        country: "TR",
      },
      guestCapacity: 4,
      roomCount: 2,
      ratingAggregate: 5.0,
      photos: [
        "https://images.unsplash.com/photo-1626254437762-c44ded149174?w=800&q=80",
        "https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=800&q=80",
      ],
      nightlyPrice: 25000,
      hostIdx: 2,
    },
    {
      slug: "ts-bodrum-villa-with-pool",
      name: "Bodrum Özel Havuzlu Villa",
      trustedStayType: "VILLA" as const,
      stayTerm: "WEEKLY" as const,
      city: "Bodrum",
      address: { street: "Gümüşlük Mah.", city: "Bodrum", country: "TR" },
      guestCapacity: 8,
      roomCount: 4,
      ratingAggregate: 4.8,
      photos: [
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
      ],
      nightlyPrice: 65000,
      hostIdx: 3,
    },
    {
      slug: "ts-istanbul-nisantasi-apt",
      name: "Nişantaşı Modern Daire",
      trustedStayType: "APARTMENT" as const,
      stayTerm: "MONTHLY" as const,
      city: "İstanbul",
      address: { street: "Teşvikiye Cad. 88", city: "İstanbul", country: "TR" },
      guestCapacity: 3,
      roomCount: 2,
      ratingAggregate: 4.6,
      photos: [
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
      ],
      nightlyPrice: 8000,
      monthlyPrice: 180000,
      hostIdx: 1,
    },
    {
      slug: "ts-antalya-beachfront-apt",
      name: "Antalya Sahil Kenarı Daire",
      trustedStayType: "SERVICED_APARTMENT" as const,
      stayTerm: "DAILY" as const,
      city: "Antalya",
      address: { street: "Lara Cad. 12", city: "Antalya", country: "TR" },
      guestCapacity: 6,
      roomCount: 3,
      ratingAggregate: 4.5,
      photos: [
        "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80",
      ],
      nightlyPrice: 14000,
      hostIdx: 1,
    },
  ];

  for (const def of unitDefs) {
    const existing = await db.trustedStayUnit.findFirst({
      where: { tenantId: tenant.id, slug: def.slug },
    });
    if (existing) continue;

    const unit = await db.trustedStayUnit.create({
      data: {
        tenantId: tenant.id,
        hostId: hosts[def.hostIdx].id,
        slug: def.slug,
        name: def.name,
        trustedStayType: def.trustedStayType,
        stayTerm: def.stayTerm,
        city: def.city,
        address: def.address,
        guestCapacity: def.guestCapacity,
        roomCount: def.roomCount,
        ratingAggregate: def.ratingAggregate,
        photos: def.photos,
        amenities: ["wifi", "air_conditioning", "kitchen", "parking"],
        houseRules: {
          checkIn: "15:00",
          checkOut: "11:00",
          noSmoking: true,
          noPets: false,
        },
        isActive: true,
        verificationStatus: "VERIFIED",
      },
    });

    await db.trustedStayRatePlan.create({
      data: {
        tenantId: tenant.id,
        trustedStayUnitId: unit.id,
        code: `RP-${unit.id.slice(0, 8)}`,
        name: "Standart Plan",
        stayTerm: def.stayTerm,
        nightlyPriceCents: def.nightlyPrice,
        monthlyPriceCents: (def as any).monthlyPrice ?? def.nightlyPrice * 25,
        baseRateCents: def.nightlyPrice,
        depositCents: def.nightlyPrice * 2,
        cancellationPolicy: { freeCancellationHours: 48 },
        isActive: true,
      },
    });

    // Next 30 days availability
    for (let d = 0; d < 30; d++) {
      const date = new Date();
      date.setDate(date.getDate() + d);
      const dateStr = date.toISOString().split("T")[0];
      await db.trustedStayAvailability.upsert({
        where: {
          trustedStayUnitId_date: {
            trustedStayUnitId: unit.id,
            date: new Date(dateStr),
          },
        },
        create: {
          tenantId: tenant.id,
          trustedStayUnitId: unit.id,
          date: new Date(dateStr),
          isAvailable: d % 7 !== 0, // sundays blocked
          priceCents: def.nightlyPrice,
        },
        update: {},
      });
    }
  }

  const unitCount = await db.trustedStayUnit.count({
    where: { tenantId: tenant.id },
  });
  console.log(`  ✓ ${unitCount} trusted stay unit oluşturuldu`);

  // ═══════════════════════════════════════════════════════════════
  // AMENITY MARKETPLACE
  // ═══════════════════════════════════════════════════════════════
  console.log("\n🏊 Amenity assets oluşturuluyor...");

  const amenityDefs = [
    {
      hotelIdx: 0,
      code: "AMN-SPA-001",
      name: "Lüks Spa & Wellness Center",
      amenityType: "SPA" as const,
      description:
        "8 özel kabinli full-service spa. Masaj, hamam, aromaterapi ve daha fazlası.",
      locationLabel: "3. Kat, Batı Kanadı",
      capacity: 20,
      isExternalAccessOpen: true,
      plans: [
        {
          code: "SPA-DAILY",
          name: "Günlük Giriş",
          accessUnit: "DAILY" as const,
          priceCents: 8000,
        },
        {
          code: "SPA-WEEKLY",
          name: "Haftalık Pass",
          accessUnit: "WEEKLY" as const,
          priceCents: 40000,
          vipDiscount: 20,
        },
      ],
      schedules: [
        { day: 0, opens: "09:00", closes: "21:00" },
        { day: 1, opens: "09:00", closes: "21:00" },
        { day: 2, opens: "09:00", closes: "21:00" },
        { day: 3, opens: "09:00", closes: "21:00" },
        { day: 4, opens: "09:00", closes: "21:00" },
        { day: 5, opens: "09:00", closes: "22:00" },
        { day: 6, opens: "10:00", closes: "22:00" },
      ],
    },
    {
      hotelIdx: 0,
      code: "AMN-POOL-001",
      name: "Sonsuzluk Havuzu",
      amenityType: "POOL" as const,
      description:
        "Boğaz manzaralı sonsuzluk havuzu. Güneş terası ve bar hizmeti.",
      locationLabel: "Rooftop — 12. Kat",
      capacity: 50,
      isExternalAccessOpen: true,
      plans: [
        {
          code: "POOL-DAILY",
          name: "Günlük Havuz Erişimi",
          accessUnit: "DAILY" as const,
          priceCents: 5000,
        },
        {
          code: "POOL-MONTHLY",
          name: "Aylık Üyelik",
          accessUnit: "MONTHLY" as const,
          priceCents: 80000,
          vipDiscount: 25,
        },
      ],
      schedules: [
        { day: 0, opens: "07:00", closes: "22:00" },
        { day: 1, opens: "07:00", closes: "22:00" },
        { day: 2, opens: "07:00", closes: "22:00" },
        { day: 3, opens: "07:00", closes: "22:00" },
        { day: 4, opens: "07:00", closes: "22:00" },
        { day: 5, opens: "07:00", closes: "23:00" },
        { day: 6, opens: "07:00", closes: "23:00" },
      ],
    },
    {
      hotelIdx: 0,
      code: "AMN-GYM-001",
      name: "Elite Fitness Center",
      amenityType: "GYM" as const,
      description:
        "2000 m² fitness merkezi. Cardio, ağırlık, kişisel antrenör.",
      locationLabel: "Bodrum Kat",
      capacity: 30,
      isExternalAccessOpen: true,
      plans: [
        {
          code: "GYM-HOURLY",
          name: "Saatlik Giriş",
          accessUnit: "HOURLY" as const,
          priceCents: 2500,
        },
        {
          code: "GYM-MONTHLY",
          name: "Aylık Üyelik",
          accessUnit: "MONTHLY" as const,
          priceCents: 120000,
          vipDiscount: 30,
        },
      ],
      schedules: [
        { day: 0, opens: "06:00", closes: "23:00" },
        { day: 1, opens: "06:00", closes: "23:00" },
        { day: 2, opens: "06:00", closes: "23:00" },
        { day: 3, opens: "06:00", closes: "23:00" },
        { day: 4, opens: "06:00", closes: "23:00" },
        { day: 5, opens: "06:00", closes: "23:00" },
        { day: 6, opens: "08:00", closes: "22:00" },
      ],
    },
    {
      hotelIdx: 1,
      code: "AMN-BEACH-001",
      name: "Özel Plaj Kulübü",
      amenityType: "BEACH_ACCESS" as const,
      description:
        "VIP plaj şezlongu ve şemsiye, plaj barı ve kanoların ücretsiz kullanımı.",
      locationLabel: "Otel önü, Sahil",
      capacity: 60,
      isExternalAccessOpen: false,
      plans: [
        {
          code: "BEACH-DAILY",
          name: "Günlük Plaj Paketi",
          accessUnit: "DAILY" as const,
          priceCents: 12000,
          vipDiscount: 20,
        },
        {
          code: "BEACH-WEEKLY",
          name: "Haftalık Plaj Paketi",
          accessUnit: "WEEKLY" as const,
          priceCents: 70000,
          vipDiscount: 30,
        },
      ],
      schedules: [
        { day: 0, opens: "08:00", closes: "20:00" },
        { day: 1, opens: "08:00", closes: "20:00" },
        { day: 2, opens: "08:00", closes: "20:00" },
        { day: 3, opens: "08:00", closes: "20:00" },
        { day: 4, opens: "08:00", closes: "20:00" },
        { day: 5, opens: "08:00", closes: "21:00" },
        { day: 6, opens: "08:00", closes: "21:00" },
      ],
    },
    {
      hotelIdx: 1,
      code: "AMN-SAUNA-001",
      name: "Finnish Sauna & Hammam",
      amenityType: "SAUNA" as const,
      description:
        "Geleneksel Fin sauna ve Türk hamamı. Ayrı bay/bayan bölümleri.",
      locationLabel: "SPA Katı — 2. Kat",
      capacity: 15,
      isExternalAccessOpen: false,
      plans: [
        {
          code: "SAUNA-HOURLY",
          name: "Saatlik Kullanım",
          accessUnit: "HOURLY" as const,
          priceCents: 4000,
        },
      ],
      schedules: [
        { day: 0, opens: "10:00", closes: "22:00" },
        { day: 1, opens: "10:00", closes: "22:00" },
        { day: 2, opens: "10:00", closes: "22:00" },
        { day: 3, opens: "10:00", closes: "22:00" },
        { day: 4, opens: "10:00", closes: "22:00" },
        { day: 5, opens: "10:00", closes: "23:00" },
        { day: 6, opens: "10:00", closes: "23:00" },
      ],
    },
    {
      hotelIdx: 2,
      code: "AMN-COWORK-001",
      name: "Executive Co-Working Lounge",
      amenityType: "CO_WORKING" as const,
      description:
        "5 özel kabinli iş odası, hızlı fiber internet, yazıcı ve konferans ekipmanları.",
      locationLabel: "Lobi Katı",
      capacity: 25,
      isExternalAccessOpen: true,
      plans: [
        {
          code: "COWORK-DAILY",
          name: "Günlük Çalışma Alanı",
          accessUnit: "DAILY" as const,
          priceCents: 6000,
        },
        {
          code: "COWORK-MONTHLY",
          name: "Aylık Üyelik",
          accessUnit: "MONTHLY" as const,
          priceCents: 90000,
        },
      ],
      schedules: [
        { day: 0, opens: "08:00", closes: "20:00" },
        { day: 1, opens: "07:00", closes: "22:00" },
        { day: 2, opens: "07:00", closes: "22:00" },
        { day: 3, opens: "07:00", closes: "22:00" },
        { day: 4, opens: "07:00", closes: "22:00" },
        { day: 5, opens: "07:00", closes: "20:00" },
        { day: 6, opens: "09:00", closes: "18:00" },
      ],
    },
  ];

  for (const def of amenityDefs) {
    const hotel = hotels[def.hotelIdx] ?? hotel1;
    const existing = await db.amenityAsset.findFirst({
      where: { tenantId: tenant.id, code: def.code },
    });
    if (existing) continue;

    const asset = await db.amenityAsset.create({
      data: {
        tenantId: tenant.id,
        hotelId: hotel.id,
        code: def.code,
        name: def.name,
        amenityType: def.amenityType,
        description: def.description,
        locationLabel: def.locationLabel,
        capacity: def.capacity,
        isExternalAccessOpen: def.isExternalAccessOpen,
        isVipOnly: false,
        isActive: true,
        photos: [],
        features: [],
        rules: {},
      },
    });

    for (const plan of def.plans) {
      await db.amenityPassPlan.create({
        data: {
          tenantId: tenant.id,
          amenityAssetId: asset.id,
          code: plan.code,
          name: plan.name,
          accessUnit: plan.accessUnit,
          durationCount: 1,
          priceCents: plan.priceCents,
          currency: "TRY",
          vipDiscountPercent: (plan as any).vipDiscount ?? null,
          isActive: true,
          rules: {},
        },
      });
    }

    for (const sched of def.schedules) {
      await db.amenitySchedule.create({
        data: {
          tenantId: tenant.id,
          amenityAssetId: asset.id,
          dayOfWeek: sched.day,
          opensAt: sched.opens,
          closesAt: sched.closes,
          isActive: true,
        },
      });
    }
  }

  const amenityCount = await db.amenityAsset.count({
    where: { tenantId: tenant.id },
  });
  console.log(`  ✓ ${amenityCount} amenity asset oluşturuldu`);

  // ═══════════════════════════════════════════════════════════════
  // BUNDLE OFFERS
  // ═══════════════════════════════════════════════════════════════
  console.log("\n🎁 Bundle offers oluşturuluyor...");

  const bundleDefs = [
    {
      hotelIdx: 0,
      code: "BUNDLE-ROMANCE-001",
      name: "Romantik Kaçamak Paketi",
      description:
        "2 gece konaklama + özel akşam yemeği + spa çifti + gül yapraklı oda dekorasyonu.",
      bundleType: "CURATED",
      totalCents: 85000,
      subtotalCents: 120000,
      currency: "TRY",
      isVipOnly: false,
      endsAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      items: [
        {
          itemType: "ROOM",
          itemLabel: "2 Gece Superior Oda",
          unitCents: 60000,
          sortOrder: 0,
        },
        {
          itemType: "DINING",
          itemLabel: "Romantik Akşam Yemeği (2 Kişi)",
          unitCents: 30000,
          sortOrder: 1,
        },
        {
          itemType: "SPA",
          itemLabel: "Çift Masajı (60 dk)",
          unitCents: 20000,
          sortOrder: 2,
        },
        {
          itemType: "DECORATION",
          itemLabel: "Oda Dekorasyonu",
          unitCents: 10000,
          sortOrder: 3,
        },
      ],
    },
    {
      hotelIdx: 0,
      code: "BUNDLE-BUSINESS-001",
      name: "İş Seyahati Paketi",
      description:
        "3 gece konaklama + günlük kahvaltı + co-working alanı + havalimanı transferi.",
      bundleType: "CURATED",
      totalCents: 120000,
      subtotalCents: 160000,
      currency: "TRY",
      isVipOnly: false,
      endsAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      items: [
        {
          itemType: "ROOM",
          itemLabel: "3 Gece Business Oda",
          unitCents: 90000,
          sortOrder: 0,
        },
        {
          itemType: "DINING",
          itemLabel: "3 Günlük Kahvaltı",
          unitCents: 18000,
          sortOrder: 1,
        },
        {
          itemType: "AMENITY",
          itemLabel: "Co-Working Alanı (3 Gün)",
          unitCents: 18000,
          sortOrder: 2,
        },
        {
          itemType: "TRANSFER",
          itemLabel: "Havalimanı Transferi",
          unitCents: 34000,
          sortOrder: 3,
        },
      ],
    },
    {
      hotelIdx: 1,
      code: "BUNDLE-FAMILY-001",
      name: "Aile Tatil Paketi",
      description:
        "5 gece aile odası + aquapark günlük girişleri + çocuk kulübü üyeliği + yarım pansiyon.",
      bundleType: "CURATED",
      totalCents: 280000,
      subtotalCents: 380000,
      currency: "TRY",
      isVipOnly: false,
      endsAt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      items: [
        {
          itemType: "ROOM",
          itemLabel: "5 Gece Aile Odası",
          unitCents: 200000,
          sortOrder: 0,
        },
        {
          itemType: "AMENITY",
          itemLabel: "Aquapark 5 Günlük Giriş (4 Kişi)",
          unitCents: 80000,
          sortOrder: 1,
        },
        {
          itemType: "KIDS",
          itemLabel: "Çocuk Kulübü Üyeliği",
          unitCents: 30000,
          sortOrder: 2,
        },
        {
          itemType: "DINING",
          itemLabel: "Yarım Pansiyon (5 Gün)",
          unitCents: 70000,
          sortOrder: 3,
        },
      ],
    },
    {
      hotelIdx: 0,
      code: "BUNDLE-VIP-ESCAPE",
      name: "VIP Lüks Kaçış",
      description:
        "Suite oda, private spa, şampanya ikramı, concierge hizmetleri.",
      bundleType: "VIP",
      totalCents: 350000,
      subtotalCents: 480000,
      currency: "TRY",
      isVipOnly: true,
      endsAt: null,
      items: [
        {
          itemType: "ROOM",
          itemLabel: "2 Gece Suite Oda",
          unitCents: 280000,
          sortOrder: 0,
        },
        {
          itemType: "SPA",
          itemLabel: "Private Spa Paketi",
          unitCents: 80000,
          sortOrder: 1,
        },
        {
          itemType: "DINING",
          itemLabel: "Şampanya & İkram Sepeti",
          unitCents: 60000,
          sortOrder: 2,
        },
        {
          itemType: "SERVICE",
          itemLabel: "Kişisel Concierge (2 Gün)",
          unitCents: 60000,
          sortOrder: 3,
        },
      ],
    },
  ];

  for (const def of bundleDefs) {
    const hotel = hotels[def.hotelIdx] ?? hotel1;
    const existing = await db.bundleOffer.findFirst({
      where: { tenantId: tenant.id, code: def.code },
    });
    if (existing) continue;

    const bundle = await db.bundleOffer.create({
      data: {
        tenantId: tenant.id,
        hotelId: hotel.id,
        name: def.name,
        code: def.code,
        description: def.description,
        bundleType: def.bundleType,
        pricingMode: "FIXED",
        totalCents: def.totalCents,
        subtotalCents: def.subtotalCents,
        currency: def.currency,
        endsAt: def.endsAt,
        isActive: true,
        isVipOnly: def.isVipOnly,
        rules: {},
      },
    });

    for (const item of def.items) {
      await db.bundleItem.create({
        data: {
          tenantId: tenant.id,
          bundleOfferId: bundle.id,
          itemType: item.itemType,
          quantity: 1,
          unitCents: item.unitCents,
          sortOrder: item.sortOrder,
          metadata: { itemLabel: item.itemLabel },
        },
      });
    }
  }

  const bundleCount = await db.bundleOffer.count({
    where: { tenantId: tenant.id },
  });
  console.log(`  ✓ ${bundleCount} bundle offer oluşturuldu`);

  // ═══════════════════════════════════════════════════════════════
  // MOBILITY
  // ═══════════════════════════════════════════════════════════════
  console.log("\n🚗 Mobility providers & products oluşturuluyor...");

  const providerDefs = [
    {
      name: "VIP Transfer İstanbul",
      mobilityType: "AIRPORT_TRANSFER" as const,
      cities: ["İstanbul"],
      serviceAreas: ["SAW", "IST", "Boğaz", "Anadolu Yakası"],
      ratingAggregate: 4.9,
      products: [
        {
          code: "VIP-SAW-TRANSFER",
          name: "Sabiha Gökçen → Otel Transfer",
          mobilityType: "AIRPORT_TRANSFER" as const,
          vehicleClass: "LUXURY_SEDAN",
          capacity: 3,
          baggageCapacity: 3,
          city: "İstanbul",
          priceCents: 45000,
          durationMinutes: 60,
          description:
            "Mercedes E-Serisi veya eşdeğeri araç ile kapıdan kapıya transfer.",
        },
        {
          code: "VIP-IST-TRANSFER",
          name: "İstanbul Havalimanı → Otel Transfer",
          mobilityType: "AIRPORT_TRANSFER" as const,
          vehicleClass: "LUXURY_SEDAN",
          capacity: 3,
          baggageCapacity: 3,
          city: "İstanbul",
          priceCents: 55000,
          durationMinutes: 45,
          description: "Yeni havalimanından 7/24 karşılama servisi.",
        },
        {
          code: "VIP-IST-VAN",
          name: "Grup Transfer (Van)",
          mobilityType: "AIRPORT_TRANSFER" as const,
          vehicleClass: "VAN",
          capacity: 7,
          baggageCapacity: 7,
          city: "İstanbul",
          priceCents: 85000,
          durationMinutes: 60,
          description: "7 kişiye kadar grup transferi.",
        },
      ],
    },
    {
      name: "Bosphorus Chauffeur",
      mobilityType: "CHAUFFEUR" as const,
      cities: ["İstanbul", "Bodrum", "Antalya"],
      serviceAreas: ["Şehir içi", "Şehirlerarası"],
      ratingAggregate: 4.8,
      products: [
        {
          code: "CHAUF-HOURLY-IST",
          name: "İstanbul Saatlik Şoförlü Araç",
          mobilityType: "CHAUFFEUR" as const,
          vehicleClass: "LUXURY_SEDAN",
          capacity: 3,
          city: "İstanbul",
          priceCents: 38000,
          durationMinutes: 60,
          description: "Minimum 3 saat. BMW 7 Serisi veya Mercedes S-Serisi.",
        },
        {
          code: "CHAUF-DAILY-IST",
          name: "İstanbul Günlük Şoförlü Araç",
          mobilityType: "CHAUFFEUR" as const,
          vehicleClass: "LUXURY_SUV",
          capacity: 4,
          city: "İstanbul",
          priceCents: 280000,
          durationMinutes: 480,
          description:
            "8 saatlik premium kullanım. Range Rover veya Mercedes GLE.",
        },
      ],
    },
    {
      name: "TurkeyRent Premium",
      mobilityType: "RENTAL_CAR" as const,
      cities: ["İstanbul", "Bodrum", "Antalya", "Kapadokya"],
      serviceAreas: ["Türkiye geneli"],
      ratingAggregate: 4.5,
      products: [
        {
          code: "RENTAL-ECONOMY",
          name: "Economy Araç Kiralama",
          mobilityType: "RENTAL_CAR" as const,
          vehicleClass: "ECONOMY",
          capacity: 5,
          baggageCapacity: 2,
          city: "İstanbul",
          priceCents: 25000,
          durationMinutes: 1440,
          description: "Günlük Volkswagen Polo veya benzeri. Sınırsız km.",
        },
        {
          code: "RENTAL-SUV",
          name: "SUV Araç Kiralama",
          mobilityType: "RENTAL_CAR" as const,
          vehicleClass: "SUV",
          capacity: 5,
          baggageCapacity: 4,
          city: "İstanbul",
          priceCents: 55000,
          durationMinutes: 1440,
          description: "Günlük Toyota RAV4 veya benzeri. Tam sigortalı.",
        },
      ],
    },
    {
      name: "İstanbul City Shuttle",
      mobilityType: "CITY_TRANSFER" as const,
      cities: ["İstanbul"],
      serviceAreas: ["Şehir içi hat"],
      ratingAggregate: 4.3,
      products: [
        {
          code: "SHUTTLE-CITY-TOUR",
          name: "Şehir Turu Shuttle",
          mobilityType: "CITY_TRANSFER" as const,
          vehicleClass: "MINIBUS",
          capacity: 15,
          city: "İstanbul",
          priceCents: 8000,
          durationMinutes: 180,
          description:
            "Sultanahmet, Kapalı Çarşı, Galata'yı kapsayan rehberli şehir turu.",
        },
        {
          code: "SHUTTLE-BOSPHORUS",
          name: "Boğaz Turu (Tekne + Shuttle)",
          mobilityType: "CITY_TRANSFER" as const,
          vehicleClass: "COMBO",
          capacity: 20,
          city: "İstanbul",
          priceCents: 15000,
          durationMinutes: 240,
          description: "Boğaz teknesi + şehir içi transfer kombini.",
        },
      ],
    },
  ];

  for (const provDef of providerDefs) {
    const existing = await db.mobilityProvider.findFirst({
      where: { tenantId: tenant.id, name: provDef.name },
    });
    let provider = existing;
    if (!provider) {
      provider = await db.mobilityProvider.create({
        data: {
          tenantId: tenant.id,
          name: provDef.name,
          mobilityType: provDef.mobilityType,
          cities: provDef.cities,
          serviceAreas: provDef.serviceAreas,
          ratingAggregate: provDef.ratingAggregate,
          isActive: true,
          contactInfo: {},
        },
      });
    }

    for (const prodDef of provDef.products) {
      const existingProd = await db.mobilityProduct.findFirst({
        where: { tenantId: tenant.id, code: prodDef.code },
      });
      if (existingProd) continue;

      await db.mobilityProduct.create({
        data: {
          tenantId: tenant.id,
          mobilityProviderId: provider.id,
          hotelId: hotel1.id,
          name: prodDef.name,
          code: prodDef.code,
          mobilityType: prodDef.mobilityType,
          description: prodDef.description,
          vehicleClass: prodDef.vehicleClass,
          capacity: prodDef.capacity,
          baggageCapacity: (prodDef as any).baggageCapacity ?? null,
          city: prodDef.city,
          currency: "TRY",
          priceCents: prodDef.priceCents,
          durationMinutes: prodDef.durationMinutes,
          isActive: true,
          pricingConfig: {},
        },
      });
    }
  }

  const mobilityCount = await db.mobilityProduct.count({
    where: { tenantId: tenant.id },
  });
  console.log(`  ✓ ${mobilityCount} mobility product oluşturuldu`);

  // ═══════════════════════════════════════════════════════════════
  // CITY GUIDES & LOCAL EXPERIENCES
  // ═══════════════════════════════════════════════════════════════
  console.log("\n🗺️  City guides & local experiences oluşturuluyor...");

  const cityDefs = [
    {
      cityCode: "IST",
      cityName: "İstanbul",
      countryCode: "TR",
      summary:
        "İki kıtayı birleştiren efsanevi şehir — tarih, kültür ve modern yaşamın mükemmel birlikteliği.",
      safetyNotes:
        "Genel olarak güvenli. Gece geç saatlerde İstiklal Caddesi kalabalık olabilir.",
      transportTips:
        "İstanbulkart ile metro, tramvay ve vapur kullanabilirsiniz. Uber ve BiTaksi mevcut.",
      experiences: [
        {
          slug: "ist-bosphorus-cruise-sunset",
          name: "Gün Batımı Boğaz Turu",
          category: "CITY_INTRO" as const,
          description:
            "Akşam güneşi altında özel tekne ile Boğaz'ı keşfedin. Şarap ikramı dahil.",
          durationMinutes: 120,
          city: "İstanbul",
          maxGuests: 20,
          priceCents: 15000,
          isFree: false,
          slotDays: [1, 3, 7, 10, 14],
        },
        {
          slug: "ist-grand-bazaar-tour",
          name: "Kapalı Çarşı Uzman Turu",
          category: "SHOPPING" as const,
          description:
            "Yerel uzman rehber ile 4000 dükkanlı Kapalı Çarşı'yı keşfedin. Gizli köşeler, pazarlık ipuçları.",
          durationMinutes: 150,
          city: "İstanbul",
          maxGuests: 8,
          priceCents: 8000,
          isFree: false,
          slotDays: [2, 5, 8, 12, 15],
        },
        {
          slug: "ist-turkish-cooking-class",
          name: "Türk Mutfağı Atölyesi",
          category: "FOOD_TOUR" as const,
          description:
            "Şef eşliğinde meze, dolma ve baklava yapımı öğrenin. Pişirme + yemek dahil.",
          durationMinutes: 180,
          city: "İstanbul",
          maxGuests: 12,
          priceCents: 20000,
          isFree: false,
          slotDays: [3, 6, 9, 13, 16],
        },
        {
          slug: "ist-nightlife-kadikoy",
          name: "Kadıköy Gece Turu",
          category: "NIGHT_TOUR" as const,
          description:
            "Anadolu yakasının alternatif gece hayatı — caz barlar, meyhaneler ve sokak müzisyenleri.",
          durationMinutes: 240,
          city: "İstanbul",
          maxGuests: 10,
          priceCents: 18000,
          isFree: false,
          isVipExclusive: false,
          slotDays: [4, 7, 11, 14],
        },
        {
          slug: "ist-hammam-experience",
          name: "Tarihi Hamam Deneyimi",
          category: "CULTURAL" as const,
          description:
            "400 yıllık tarihi hamamda geleneksel kese ve köpük masajı. Çay ikramı dahil.",
          durationMinutes: 90,
          city: "İstanbul",
          maxGuests: 15,
          priceCents: 12000,
          isFree: false,
          slotDays: [1, 3, 5, 7, 9, 11, 13],
        },
      ],
    },
    {
      cityCode: "KAP",
      cityName: "Kapadokya",
      countryCode: "TR",
      summary:
        "Peri bacaları, mağara otelleri ve sabah şafağında yükselen balonlarla büyülü bir dünya.",
      safetyNotes:
        "Güvenli bölge. Balonlar sertifikalı operatörlerle yapılmalı.",
      transportTips:
        "Kirala araç veya özel transfer önerilir. Nevşehir Kapadokya Havalimanı merkeze 40 dk.",
      experiences: [
        {
          slug: "kap-hot-air-balloon",
          name: "Şafak Balon Turu",
          category: "CITY_INTRO" as const,
          description:
            "Şafak sökerken vadilerin üzerinde 1 saatlik balon yolculuğu. Şampanya indirişi dahil.",
          durationMinutes: 60,
          city: "Kapadokya",
          maxGuests: 16,
          priceCents: 180000,
          isFree: false,
          slotDays: [1, 2, 3, 4, 5, 6, 7],
        },
        {
          slug: "kap-atv-valley-tour",
          name: "ATV Vadi Turu",
          category: "OTHER" as const,
          description:
            "Göreme ve Kızılçukur vadisini ATV ile keşfedin. Gün batımı manzarası.",
          durationMinutes: 120,
          city: "Kapadokya",
          maxGuests: 12,
          priceCents: 35000,
          isFree: false,
          slotDays: [1, 3, 5, 7, 10, 12],
        },
        {
          slug: "kap-pottery-workshop",
          name: "Çömlek Atölyesi",
          category: "CULTURAL" as const,
          description:
            "Avanos'ta çömlekçilik ustasından 2000 yıllık el sanatını öğrenin.",
          durationMinutes: 90,
          city: "Kapadokya",
          maxGuests: 8,
          priceCents: 15000,
          isFree: false,
          slotDays: [2, 4, 7, 9, 11, 14],
        },
      ],
    },
    {
      cityCode: "BOD",
      cityName: "Bodrum",
      countryCode: "TR",
      summary:
        "Ege'nin incisi — turkuaz koylar, masmavi gece hayatı ve antik kaleler.",
      safetyNotes:
        "Yaz aylarında kalabalık. Tekne turlarında güneş kremi şart.",
      transportTips:
        "Bodrum içinde dolmuş kullanın. Koyları görmek için tekne veya araç kiralayın.",
      experiences: [
        {
          slug: "bod-yacht-day-tour",
          name: "Yat ile Koy Turu",
          category: "CITY_INTRO" as const,
          description:
            "5 farklı koyu kapsayan tekne turu. Öğle yemeği ve şnorkeling dahil.",
          durationMinutes: 480,
          city: "Bodrum",
          maxGuests: 12,
          priceCents: 65000,
          isFree: false,
          slotDays: [1, 3, 5, 7, 9, 11, 13],
        },
        {
          slug: "bod-local-market",
          name: "Pazartesi Bodrum Pazarı",
          category: "SHOPPING" as const,
          description:
            "Yerel üreticilerin zeytinyağı, peynir ve el sanatlarını sunan haftalık pazar.",
          durationMinutes: 120,
          city: "Bodrum",
          maxGuests: 20,
          priceCents: 0,
          isFree: true,
          slotDays: [1, 8, 15, 22, 29],
        },
      ],
    },
  ];

  for (const cityDef of cityDefs) {
    let guide = await db.cityGuide.findFirst({
      where: { tenantId: tenant.id, cityCode: cityDef.cityCode },
    });

    if (!guide) {
      guide = await db.cityGuide.create({
        data: {
          tenantId: tenant.id,
          cityCode: cityDef.cityCode,
          cityName: cityDef.cityName,
          countryCode: cityDef.countryCode,
          languageCode: "tr",
          summary: cityDef.summary,
          safetyNotes: cityDef.safetyNotes,
          transportTips: cityDef.transportTips,
          isActive: true,
        },
      });
    }

    for (const expDef of cityDef.experiences) {
      let exp = await db.localExperience.findFirst({
        where: { tenantId: tenant.id, slug: expDef.slug },
      });

      if (!exp) {
        exp = await db.localExperience.create({
          data: {
            tenantId: tenant.id,
            cityGuideId: guide.id,
            hotelId: expDef.slug.startsWith("ist") ? hotel1.id : hotel2.id,
            slug: expDef.slug,
            name: expDef.name,
            category: expDef.category,
            description: expDef.description,
            durationMinutes: expDef.durationMinutes,
            city: expDef.city,
            maxGuests: expDef.maxGuests,
            priceCents: expDef.isFree ? 0 : expDef.priceCents,
            currency: "TRY",
            isFree: expDef.isFree,
            isVipExclusive: (expDef as any).isVipExclusive ?? false,
            isActive: true,
            languages: ["tr", "en"],
            tags: [],
          },
        });
      }

      // Create slots for the next 30 days
      for (const dayOffset of expDef.slotDays) {
        const slotDate = new Date();
        slotDate.setDate(slotDate.getDate() + dayOffset);
        slotDate.setHours(10, 0, 0, 0);
        const slotEnd = new Date(slotDate);
        slotEnd.setMinutes(slotEnd.getMinutes() + expDef.durationMinutes);

        const existingSlot = await db.localExperienceSlot.findFirst({
          where: {
            localExperienceId: exp.id,
            startsAt: slotDate,
          },
        });
        if (existingSlot) continue;

        await db.localExperienceSlot.create({
          data: {
            tenantId: tenant.id,
            localExperienceId: exp.id,
            startsAt: slotDate,
            endsAt: slotEnd,
            capacity: expDef.maxGuests,
            availableCount: expDef.maxGuests,
            isActive: true,
          },
        });
      }
    }
  }

  const expCount = await db.localExperience.count({
    where: { tenantId: tenant.id },
  });
  console.log(`  ✓ ${expCount} local experience oluşturuldu`);

  // ═══════════════════════════════════════════════════════════════
  // VIP OFFERS
  // ═══════════════════════════════════════════════════════════════
  console.log("\n👑 VIP offers oluşturuluyor...");

  const vipOfferDefs = [
    {
      title: "Signature Üyelere Özel Suite Yükseltme",
      offerType: "UPGRADE",
      description:
        "Signature üyeler için suite oda yükseltmesi (müsaite göre, check-in günü).",
      vipPlanId: vipSignature.id,
      hotelId: hotel1.id,
    },
    {
      title: "Comfort Üyelere %20 Spa İndirimi",
      offerType: "DISCOUNT",
      description:
        "Tüm spa hizmetlerinde Comfort ve üstü üyeler için geçerli indirim.",
      vipPlanId: vipComfort.id,
      hotelId: hotel1.id,
    },
  ];

  for (const offerDef of vipOfferDefs) {
    const existing = await db.vipOffer.findFirst({
      where: { tenantId: tenant.id, title: offerDef.title },
    });
    if (existing) continue;

    await db.vipOffer.create({
      data: {
        tenantId: tenant.id,
        hotelId: offerDef.hotelId,
        vipPlanId: offerDef.vipPlanId,
        title: offerDef.title,
        description: offerDef.description,
        offerType: offerDef.offerType,
        config: {},
        isActive: true,
      },
    });
  }

  console.log(`  ✓ ${vipOfferDefs.length} VIP offer oluşturuldu`);

  // ─── Summary ─────────────────────────────────────────────────────
  console.log("\n✅ Guest portal seed tamamlandı!");
  console.log("   VIP planları: Core, Comfort, Signature");
  const fc = await db.inventoryFlashWindow.count({
    where: { tenantId: tenant.id, status: "ACTIVE" },
  });
  console.log(`   Aktif flash deals: ${fc}`);
  console.log(`   Trusted stay units: ${unitCount}`);
  console.log(`   Amenity assets: ${amenityCount}`);
  console.log(`   Bundle offers: ${bundleCount}`);
  console.log(`   Mobility products: ${mobilityCount}`);
  console.log(`   Local experiences: ${expCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
