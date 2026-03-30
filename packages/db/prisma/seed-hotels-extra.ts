/**
 * seed-hotels-extra.ts
 * Adds 12 more diverse hotels (Turkey + Europe) for search testing.
 * Safe to run multiple times — skips if slug already exists.
 *
 * Run:
 *   cd "/Users/mira/Desktop/Hospitality Experience Orchestration"
 *   pnpm --filter db db:seed:hotels-extra
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const HOTELS = [
  {
    name: "Kapadokya Cave Suites",
    slug: "kapadokya-cave-suites",
    shortDescription:
      "Peri bacalarının içine oyulmuş büyülü mağara odaları. Sabah balonu turları ile uyanın.",
    description:
      "Kapadokya'nın kalbinde, UNESCO korumasındaki peri bacalarının içine inşa edilmiş bu butik otel, tarihin içinde yaşama deneyimi sunuyor. Her oda el oyması taş detaylarıyla benzersiz.",
    starRating: 5,
    city: "Kapadokya",
    country: "Turkey",
    street: "Göreme Köyü Uzundere Cad. 14",
    postalCode: "50180",
    lat: 38.6431,
    lng: 34.8297,
    amenities: ["Havuz", "Spa", "Balon Turu", "Restorant", "Bar", "Wi-Fi"],
    wifiQuality: "good",
    photos: [
      {
        url: "https://images.unsplash.com/photo-1641128324972-af3212f0f6bd?w=1200&q=80",
        thumb:
          "https://images.unsplash.com/photo-1641128324972-af3212f0f6bd?w=400&q=80",
        alt: "Kapadokya Cave Hotel",
        credit: "Unsplash",
      },
      {
        url: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
        thumb:
          "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&q=80",
        alt: "Cave room interior",
        credit: "Unsplash",
      },
    ],
  },
  {
    name: "Bodrum Blue Palace",
    slug: "bodrum-blue-palace",
    shortDescription:
      "Ege'nin masmavi sularına bakan infinity havuzlu lüks tatil köyü.",
    description:
      "Bodrum yarımadasının en prestijli konumunda, Ege Denizi'ne sıfır mesafede konumlanan Blue Palace, beyaz badanalı mimarisiyle Yunan adaları esintisi taşıyor.",
    starRating: 5,
    city: "Bodrum",
    country: "Turkey",
    street: "Yalıkavak Marina Cad. 8",
    postalCode: "48990",
    lat: 37.1198,
    lng: 27.2863,
    amenities: [
      "Plaj",
      "Infinity Havuz",
      "Spa",
      "Tekneli Tur",
      "Fine Dining",
      "Wi-Fi",
    ],
    wifiQuality: "excellent",
    photos: [
      {
        url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
        thumb:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80",
        alt: "Bodrum resort pool",
        credit: "Unsplash",
      },
      {
        url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&q=80",
        thumb:
          "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&q=80",
        alt: "Luxury sea view room",
        credit: "Unsplash",
      },
    ],
  },
  {
    name: "Antalya Kaleiçi Heritage",
    slug: "antalya-kaleici-heritage",
    shortDescription:
      "Roma surları içinde, tarihi kaleiçi dokusuna entegre edilmiş butik otel.",
    description:
      "Antik Roma limanına yürüme mesafesinde, restore edilmiş osmanlı konağında hizmet veren bu butik otel, tarih ve konforun mükemmel birleşimini sunuyor.",
    starRating: 4,
    city: "Antalya",
    country: "Turkey",
    street: "Kaleiçi Hesapçı Sokak 22",
    postalCode: "07100",
    lat: 36.8841,
    lng: 30.7056,
    amenities: ["Rooftop Bar", "Restorant", "Spa", "Tarihi Tur", "Wi-Fi"],
    wifiQuality: "good",
    photos: [
      {
        url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80",
        thumb:
          "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=80",
        alt: "Antalya heritage hotel",
        credit: "Unsplash",
      },
      {
        url: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=1200&q=80",
        thumb:
          "https://images.unsplash.com/photo-1455587734955-081b22074882?w=400&q=80",
        alt: "Historic courtyard",
        credit: "Unsplash",
      },
    ],
  },
  {
    name: "İzmir Kordon Suites",
    slug: "izmir-kordon-suites",
    shortDescription:
      "Kordon sahil şeridinde, İzmir Körfezi manzaralı modern süitler.",
    description:
      "İzmir'in ikonik Kordon bulvarında, modern mimarisiyle öne çıkan bu design otel, İzmir Körfezi'nin nefes kesen manzaralarını sunuyor. Çatı katı barı ile gün batımı keyfi unutulmaz.",
    starRating: 4,
    city: "Izmir",
    country: "Turkey",
    street: "Atatürk Cad. Kordon 56",
    postalCode: "35210",
    lat: 38.4237,
    lng: 27.1428,
    amenities: [
      "Rooftop Bar",
      "Restorant",
      "Fitness",
      "Bisiklet Kiralama",
      "Wi-Fi",
    ],
    wifiQuality: "excellent",
    photos: [
      {
        url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80",
        thumb:
          "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&q=80",
        alt: "Izmir seafront hotel",
        credit: "Unsplash",
      },
    ],
  },
  {
    name: "Istanbul Bosphorus View",
    slug: "istanbul-bosphorus-view",
    shortDescription:
      "Boğaz'a sıfır, iki kıtayı aynı anda gören muhteşem konumda butik otel.",
    description:
      "Bebek sahilinde, Boğaz'ın en güzel açısında konumlanan bu otelde sabah kahvaltısını Avrupa yakasını, öğleyi Asya yakasını izleyerek yapabilirsiniz.",
    starRating: 4,
    city: "Istanbul",
    country: "Turkey",
    street: "Cevdetpaşa Cad. Bebek 18",
    postalCode: "34342",
    lat: 41.0779,
    lng: 29.0446,
    amenities: ["Boğaz Manzarası", "Restorant", "Bar", "Concierge", "Wi-Fi"],
    wifiQuality: "excellent",
    photos: [
      {
        url: "https://images.unsplash.com/photo-1527838832700-5059252407fa?w=1200&q=80",
        thumb:
          "https://images.unsplash.com/photo-1527838832700-5059252407fa?w=400&q=80",
        alt: "Istanbul Bosphorus",
        credit: "Unsplash",
      },
      {
        url: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
        thumb:
          "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&q=80",
        alt: "Hotel room view",
        credit: "Unsplash",
      },
    ],
  },
  {
    name: "Istanbul Design Hotel",
    slug: "istanbul-design-hotel",
    shortDescription:
      "Karaköy'ün sanatçı ruhunu yansıtan, Galata Kulesi'ne yürüyüş mesafesinde butik otel.",
    description:
      "Karaköy'ün tarihi bankacılık yapısından dönüştürülen bu design otel, yüksek tavanları ve endüstriyel estetiğiyle İstanbul'un en trendy konaklama seçeneklerinden biri.",
    starRating: 4,
    city: "Istanbul",
    country: "Turkey",
    street: "Kemeraltı Cad. Karaköy 12",
    postalCode: "34425",
    lat: 41.0236,
    lng: 28.9774,
    amenities: [
      "Çatı Terası",
      "Kütüphane Bar",
      "Sanat Galerisi",
      "Wi-Fi",
      "Bisiklet",
    ],
    wifiQuality: "excellent",
    photos: [
      {
        url: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80",
        thumb:
          "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&q=80",
        alt: "Design hotel lobby",
        credit: "Unsplash",
      },
    ],
  },
  {
    name: "Trabzon Mountain Lodge",
    slug: "trabzon-mountain-lodge",
    shortDescription:
      "Karadeniz'in yeşil ormanlarıyla kuşatılmış, Uzungöl manzaralı dağ oteli.",
    description:
      "Trabzon'un efsanevi Uzungöl gölünün kıyısında, geleneksel Karadeniz mimarisinivtaşıyan bu dağ oteli, şehrin gürültüsünden kaçış arayan misafirler için mükemmel bir sığınak.",
    starRating: 3,
    city: "Trabzon",
    country: "Turkey",
    street: "Uzungöl Köyü Göl Kenarı 5",
    postalCode: "61960",
    lat: 40.6228,
    lng: 40.2883,
    amenities: [
      "Doğa Yürüyüşü",
      "Göl Manzarası",
      "Yerel Mutfak",
      "Ateş Başı",
      "Wi-Fi",
    ],
    wifiQuality: "fair",
    photos: [
      {
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
        thumb:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
        alt: "Mountain lodge",
        credit: "Unsplash",
      },
    ],
  },
  {
    name: "Paris Marais Boutique",
    slug: "paris-marais-boutique",
    shortDescription:
      "Le Marais'nin kalbinde, Picasso Müzesi'ne 2 dakika, Haussmann ruhunu yaşatan butik otel.",
    description:
      "Paris'in en sevilen semtlerinden Marais'de, 19. yüzyıldan kalma bir hôtel particulier'de konumlanan bu otel, Fransız zarafetini modern konforla harmanlıyor.",
    starRating: 4,
    city: "Paris",
    country: "France",
    street: "Rue de Bretagne 18, 3e",
    postalCode: "75003",
    lat: 48.8626,
    lng: 2.3591,
    amenities: ["Ön Bahçe", "Bar", "Concierge", "Bisiklet Kiralama", "Wi-Fi"],
    wifiQuality: "excellent",
    photos: [
      {
        url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
        thumb:
          "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80",
        alt: "Paris boutique hotel",
        credit: "Unsplash",
      },
    ],
  },
  {
    name: "Barcelona Gothic Quarter",
    slug: "barcelona-gothic-quarter",
    shortDescription:
      "Gotik Mahalle'nin taş sokaklarında, La Rambla'ya yürüme mesafesinde tarihi otel.",
    description:
      "Barcelona'nın 2000 yıllık kalbi Gotik Mahalle'de, Roma döneminden kalma surların hemen yanında konumlanan bu otel, şehrin DNA'sını nefes alıyor.",
    starRating: 4,
    city: "Barcelona",
    country: "Spain",
    street: "Carrer del Call 8, Barri Gòtic",
    postalCode: "08002",
    lat: 41.3831,
    lng: 2.1761,
    amenities: ["Rooftop Havuz", "Tapas Bar", "Concierge", "Teras", "Wi-Fi"],
    wifiQuality: "excellent",
    photos: [
      {
        url: "https://images.unsplash.com/photo-1562790351-d273a961e0e9?w=1200&q=80",
        thumb:
          "https://images.unsplash.com/photo-1562790351-d273a961e0e9?w=400&q=80",
        alt: "Barcelona hotel rooftop",
        credit: "Unsplash",
      },
    ],
  },
  {
    name: "Rome Trastevere Inn",
    slug: "rome-trastevere-inn",
    shortDescription:
      "Roma'nın en otantik semtinde, çiçekli balkonları ve taş döşeli sokaklarıyla eşsiz konum.",
    description:
      "Trastevere'nin sarmaşıklı duvarları arasında, Roma'nın en büyülü atmosferini sunan bu küçük otel, şehrin kalabalığından uzakta romantik bir Roma deneyimi vadediyor.",
    starRating: 3,
    city: "Rome",
    country: "Italy",
    street: "Via della Lungaretta 14, Trastevere",
    postalCode: "00153",
    lat: 41.889,
    lng: 12.4712,
    amenities: ["Teras", "Yerel Kahvaltı", "Tur Organizasyonu", "Wi-Fi"],
    wifiQuality: "good",
    photos: [
      {
        url: "https://images.unsplash.com/photo-1529260830199-42c24126f198?w=1200&q=80",
        thumb:
          "https://images.unsplash.com/photo-1529260830199-42c24126f198?w=400&q=80",
        alt: "Rome boutique hotel",
        credit: "Unsplash",
      },
    ],
  },
  {
    name: "Santorini Caldera Suites",
    slug: "santorini-caldera-suites",
    shortDescription:
      "Oia'nın volkanik uçurumlarına asılı, caldera manzaralı sonsuz havuzlu lüks süitler.",
    description:
      "Dünyanın en ünlü gün batımı manzaralarından birini sunan Oia'da, beyaz badanalı kayaya oyulmuş bu otel, Santorini deneyiminin en saf halini temsil ediyor.",
    starRating: 5,
    city: "Santorini",
    country: "Greece",
    street: "Oia Village Cliffside 3",
    postalCode: "84702",
    lat: 36.4618,
    lng: 25.3753,
    amenities: [
      "Sonsuz Havuz",
      "Spa",
      "Fine Dining",
      "Şarap Mahzeni",
      "Caldera Manzarası",
      "Wi-Fi",
    ],
    wifiQuality: "good",
    photos: [
      {
        url: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=80",
        thumb:
          "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&q=80",
        alt: "Santorini caldera view",
        credit: "Unsplash",
      },
      {
        url: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=1200&q=80",
        thumb:
          "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400&q=80",
        alt: "Santorini infinity pool",
        credit: "Unsplash",
      },
    ],
  },
  {
    name: "Dubrovnik Old Town Palace",
    slug: "dubrovnik-old-town-palace",
    shortDescription:
      "UNESCO koruma altındaki surlar içinde, Adriyatik Denizi manzaralı beş yıldızlı saray oteli.",
    description:
      "Dubrovnik'in surlarla çevrili eski şehir merkezinde, 15. yüzyıldan kalma bir sarayın içine kurulmuş bu otel, Adriyatik'in en prestijli konaklama deneyimlerinden birini sunuyor.",
    starRating: 5,
    city: "Dubrovnik",
    country: "Croatia",
    street: "Stradun Caddesi 1, Stari Grad",
    postalCode: "20000",
    lat: 42.6407,
    lng: 18.1077,
    amenities: [
      "Plaj Erişimi",
      "Spa",
      "Fine Dining",
      "Sur Turu",
      "Concierge",
      "Wi-Fi",
    ],
    wifiQuality: "excellent",
    photos: [
      {
        url: "https://images.unsplash.com/photo-1555990793-da11153b2473?w=1200&q=80",
        thumb:
          "https://images.unsplash.com/photo-1555990793-da11153b2473?w=400&q=80",
        alt: "Dubrovnik old town",
        credit: "Unsplash",
      },
    ],
  },
];

const ROOM_TEMPLATES = [
  {
    name: "Standart Oda",
    bedType: "double",
    capacity: 2,
    sizeSqm: 22,
    baseRateCents: 12000,
    features: ["air-conditioning", "wifi", "tv", "safe"],
  },
  {
    name: "Deniz Manzaralı Oda",
    bedType: "queen",
    capacity: 2,
    sizeSqm: 28,
    baseRateCents: 18000,
    features: ["air-conditioning", "wifi", "tv", "minibar", "panoramic-view"],
  },
  {
    name: "Deluxe Süit",
    bedType: "king",
    capacity: 2,
    sizeSqm: 45,
    baseRateCents: 32000,
    features: [
      "air-conditioning",
      "wifi",
      "tv",
      "minibar",
      "rain-shower",
      "bathrobe",
      "private-terrace",
    ],
  },
  {
    name: "Aile Odası",
    bedType: "twin",
    capacity: 4,
    sizeSqm: 38,
    baseRateCents: 22000,
    features: [
      "air-conditioning",
      "wifi",
      "tv",
      "connecting-rooms",
      "bunk-beds",
    ],
  },
];

async function main() {
  console.log("🏨 Seeding extra hotels...");

  // Get tenantId from existing hotel
  const existingHotel = await db.hotel.findFirst({
    select: { tenantId: true },
  });
  if (!existingHotel) {
    console.error("❌ No existing hotel found — run base seed first.");
    process.exit(1);
  }
  const tenantId = existingHotel.tenantId;

  for (const h of HOTELS) {
    const existing = await db.hotel.findFirst({ where: { slug: h.slug } });
    if (existing) {
      console.log(`  ⏭ Skipping: ${h.name}`);
      continue;
    }

    const hotel = await db.hotel.create({
      data: {
        tenantId,
        name: h.name,
        slug: h.slug,
        shortDescription: h.shortDescription,
        description: h.description,
        starRating: h.starRating,
        status: "ACTIVE",
        address: {
          city: h.city,
          country: h.country,
          street: h.street,
          postalCode: h.postalCode,
          lat: h.lat,
          lng: h.lng,
        },
        timezone: h.country === "Turkey" ? "Europe/Istanbul" : "Europe/Paris",
        currency: h.country === "Turkey" ? "TRY" : "EUR",
        amenities: h.amenities,
        wifiQuality: h.wifiQuality,
        noiseNotes: null,
        photos: h.photos,
      },
    });

    // Create room types + inventory for next 90 days
    const priceMult = h.starRating >= 5 ? 2.2 : h.starRating >= 4 ? 1.5 : 1.0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < ROOM_TEMPLATES.length; i++) {
      const t = ROOM_TEMPLATES[i]!;
      const pricePerNight = Math.round(t.baseRateCents * priceMult);
      const roomType = await db.roomType.create({
        data: {
          tenantId,
          hotelId: hotel.id,
          name: t.name,
          bedType: t.bedType,
          capacity: t.capacity,
          sizeSqm: t.sizeSqm,
          description: `${hotel.name} bünyesinde, ${t.name} kategorisinde konforlu konaklama.`,
          features: t.features,
          isActive: true,
          sortOrder: i,
          photos: [],
        },
      });

      // Create 90 days of inventory
      const inventoryData = Array.from({ length: 90 }, (_, d) => {
        const date = new Date(today);
        date.setDate(today.getDate() + d);
        return {
          tenantId,
          roomTypeId: roomType.id,
          date,
          totalCount: 10,
          availableCount: 10,
          blockedCount: 0,
          pricePerNight,
          minStay: 1,
          restrictions: {},
        };
      });
      await db.roomInventory.createMany({ data: inventoryData });
    }

    console.log(`  ✅ Created: ${h.name} (${h.city})`);
  }

  console.log("\n✅ Extra hotel seed complete!");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
