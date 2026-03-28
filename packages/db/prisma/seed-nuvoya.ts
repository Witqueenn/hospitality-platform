/**
 * seed-nuvoya.ts
 * Nuvoya platformuna uyumlu Türkçe içerik, yeni oteller, city guides, deneyimler
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const UNSPLASH = {
  istanbul_hero:
    "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80&fit=crop",
  istanbul_bosphorus:
    "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80&fit=crop",
  istanbul_bazaar:
    "https://images.unsplash.com/photo-1527838832700-5059252407fa?w=1200&q=80&fit=crop",
  kapadokya_balloon:
    "https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=1200&q=80&fit=crop",
  kapadokya_cave:
    "https://images.unsplash.com/photo-1626254437762-c44ded149174?w=1200&q=80&fit=crop",
  kapadokya_valley:
    "https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=1200&q=80&fit=crop",
  bodrum_harbor:
    "https://images.unsplash.com/photo-1594815740428-a7e4cfed3af7?w=1200&q=80&fit=crop",
  bodrum_sea:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80&fit=crop",
  antalya_coast:
    "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1200&q=80&fit=crop",
  antalya_old_town:
    "https://images.unsplash.com/photo-1548199569-3e1c6aa8f469?w=1200&q=80&fit=crop",
  izmir_kordon:
    "https://images.unsplash.com/photo-1560698975-5d7e8daf9b34?w=1200&q=80&fit=crop",
  hotel_pool:
    "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&q=80&fit=crop",
  hotel_lobby:
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80&fit=crop",
  hotel_room:
    "https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=1200&q=80&fit=crop",
  hotel_dining:
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80&fit=crop",
  hotel_cave_room:
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80&fit=crop",
  hotel_terrace:
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80&fit=crop",
};

async function main() {
  console.log("🌱 Nuvoya seed başlıyor...\n");

  // ─── Tenant bul ──────────────────────────────────────────
  const tenant = await db.tenant.findFirst({ where: { slug: "grand-hotels" } });
  if (!tenant) throw new Error("Tenant bulunamadı — önce seed.ts çalıştır");
  console.log("✓ Tenant:", tenant.name);

  // ─── Mevcut otellerin açıklamalarını Nuvoya temasına çevir ──
  await db.hotel.updateMany({
    where: { slug: "grand-palace-istanbul" },
    data: {
      shortDescription:
        "Boğaz'a nazır 5 yıldızlı lüks — tarihin kalbinde bir macera merkezi",
      description:
        "İstanbul'un tarihi yarımadasında, Boğaz'ın hemen kıyısında yükselen Grand Palace; Ottoman zarafetini modern lüksle buluşturuyor. Her sabah güneşin Asya yakasından doğuşunu izlerken başlayan bir konaklama macerası sizi bekliyor. Türk hamamı, çatı havuzu, ödüllü gastronomi restoranı ve 12 AI ajanın kişiselleştirdiği bir deneyimle kapıdan içeri girer girmez sizi tanıyoruz.",
      tags: ["luxury", "bosphorus-view", "historic", "romantic", "adventure"],
    },
  });

  await db.hotel.updateMany({
    where: { slug: "boutique-athens" },
    data: {
      shortDescription:
        "Akropolis'in gölgesinde butik kaçamak — Atina'yı yerli gibi yaşa",
      description:
        "Dionysiou Areopagitou'nun taş sokaklarında, Akropolis'in tam dibinde saklı bir otel. Sabah kahveni çatıda içerken Parthenon sizi selamlıyor. Küçük ama özenle tasarlanmış odalar, yerel malzemelerle hazırlanan kahvaltı ve şehrin gizli noktalarına özel rehberli turlarla Atina'yı bir turist gibi değil, yerli gibi keşfediyorsun.",
      tags: ["boutique", "historic", "acropolis-view", "romantic"],
    },
  });

  console.log("✓ Mevcut otel açıklamaları güncellendi");

  // ─── Kapadokya Oteli ─────────────────────────────────────
  const kapadokyaHotel = await db.hotel.upsert({
    where: {
      tenantId_slug: { tenantId: tenant.id, slug: "cave-suites-kapadokya" },
    },
    create: {
      tenantId: tenant.id,
      slug: "cave-suites-kapadokya",
      name: "Cave Suites Kapadokya",
      shortDescription:
        "Peri bacalarına oyulmuş lüks mağara süitleri — gökyüzü senin",
      description:
        "Göreme'nin kalbinde, binlerce yıllık volkanik kayaya işlenmiş odalarda uyan. Şafakta balonların süzüldüğü gökyüzüyle gözlerini aç, gün batımında kaya terasından kadeh tokuştur. Cave Suites, Kapadokya'nın büyüsünü ve çağdaş lüksü tek çatı altında buluşturuyor. Şömineli mağara odalardan panoramik vadi manzaralı süitlere kadar her oda kendi hikayesini taşıyor.",
      starRating: 5,
      status: "ACTIVE",
      address: {
        street: "Aydınlı Mahallesi, Göreme",
        city: "Nevşehir",
        country: "Turkey",
        postalCode: "50180",
        lat: 38.6431,
        lng: 34.8289,
      },
      contactInfo: { phone: "+90 384 271 0000", email: "info@cavesuites.com" },
      amenities: ["Spa", "Çatı Terası", "Özel Balon Turu", "Şömine", "Havuz"],
      tags: ["cave-hotel", "luxury", "romantic", "adventure", "balloon"],
      wifiQuality: "Fast",
      currency: "USD",
      timezone: "Europe/Istanbul",
      photos: [
        {
          url: UNSPLASH.kapadokya_balloon,
          thumb: UNSPLASH.kapadokya_balloon.replace("w=1200", "w=400"),
          alt: "Kapadokya'da şafak balonları",
          credit: "Unsplash",
        },
        {
          url: UNSPLASH.kapadokya_cave,
          thumb: UNSPLASH.kapadokya_cave.replace("w=1200", "w=400"),
          alt: "Lüks mağara süit",
          credit: "Unsplash",
        },
        {
          url: UNSPLASH.kapadokya_valley,
          thumb: UNSPLASH.kapadokya_valley.replace("w=1200", "w=400"),
          alt: "Peri bacaları vadisi",
          credit: "Unsplash",
        },
        {
          url: UNSPLASH.hotel_cave_room,
          thumb: UNSPLASH.hotel_cave_room.replace("w=1200", "w=400"),
          alt: "Mağara oda iç mekan",
          credit: "Unsplash",
        },
        {
          url: UNSPLASH.hotel_terrace,
          thumb: UNSPLASH.hotel_terrace.replace("w=1200", "w=400"),
          alt: "Kaya teras gün batımı",
          credit: "Unsplash",
        },
      ],
    },
    update: {
      shortDescription:
        "Peri bacalarına oyulmuş lüks mağara süitleri — gökyüzü senin",
      status: "ACTIVE",
    },
  } as any);
  console.log("✓ Otel oluşturuldu:", kapadokyaHotel.name);

  // Kapadokya oda tipleri
  const caveRoomExists = await db.roomType.findFirst({
    where: { hotelId: kapadokyaHotel.id, name: "Mağara Süit" },
  });
  if (!caveRoomExists) {
    await db.roomType.createMany({
      data: [
        {
          tenantId: tenant.id,
          hotelId: kapadokyaHotel.id,
          name: "Mağara Süit",
          bedType: "King",
          capacity: 2,
          sizeSqm: 45,
          description:
            "Kayaya oyulmuş özel süit, şömine ve vadi manzarası. Doğanın içinde lüks.",
          features: ["Şömine", "Vadi manzarası", "Özel teras", "Jakuzi"],
          photos: [{ url: UNSPLASH.hotel_cave_room, alt: "Mağara süit" }],
        },
        {
          tenantId: tenant.id,
          hotelId: kapadokyaHotel.id,
          name: "Panorama Oda",
          bedType: "Queen",
          capacity: 2,
          sizeSqm: 30,
          description:
            "Geniş balkon ve peri bacası manzarasıyla güneşi karşılayan sıcak oda.",
          features: ["Balkon", "Peri bacası manzarası", "Kahvaltı dahil"],
          photos: [
            { url: UNSPLASH.kapadokya_valley, alt: "Panorama oda manzara" },
          ],
        },
      ],
    });
    console.log("✓ Kapadokya oda tipleri eklendi");
  }

  // ─── Bodrum Oteli ────────────────────────────────────────
  const bodrumHotel = await db.hotel.upsert({
    where: {
      tenantId_slug: { tenantId: tenant.id, slug: "aegean-blue-bodrum" },
    },
    create: {
      tenantId: tenant.id,
      slug: "aegean-blue-bodrum",
      name: "Aegean Blue Bodrum",
      shortDescription:
        "Ege'nin mavisinde kaybolmak için — tekne turları ve gece hayatı kapında",
      description:
        "Bodrum Kalesi'nin hemen karşısında, tarihi yarımadanın en canlı noktasında konumlanan Aegean Blue; turkuaz denizi ve beyaz badanalı mimarisiyle tam bir Ege masalı. Özel iskelesinden her sabah tekneyle Ege'ye açılıyor, her akşam Bodrum'un efsane gece hayatına karışıyorsun. Gündüz saltanat, gece macera — ikisi bir arada.",
      starRating: 4,
      status: "ACTIVE",
      address: {
        street: "Neyzen Tevfik Caddesi 168",
        city: "Bodrum",
        country: "Turkey",
        postalCode: "48400",
        lat: 37.0344,
        lng: 27.4305,
      },
      contactInfo: { phone: "+90 252 316 0000", email: "info@aegeanblue.com" },
      amenities: [
        "Sonsuzluk Havuzu",
        "Özel İskele",
        "Beach Club",
        "Spa",
        "Tekne Turu",
      ],
      tags: ["beach", "luxury", "nightlife", "yacht", "aegean"],
      wifiQuality: "Fast",
      currency: "USD",
      timezone: "Europe/Istanbul",
      photos: [
        {
          url: UNSPLASH.bodrum_harbor,
          thumb: UNSPLASH.bodrum_harbor.replace("w=1200", "w=400"),
          alt: "Bodrum limanı",
          credit: "Unsplash",
        },
        {
          url: UNSPLASH.bodrum_sea,
          thumb: UNSPLASH.bodrum_sea.replace("w=1200", "w=400"),
          alt: "Ege mavi denizi",
          credit: "Unsplash",
        },
        {
          url: UNSPLASH.hotel_pool,
          thumb: UNSPLASH.hotel_pool.replace("w=1200", "w=400"),
          alt: "Sonsuzluk havuzu",
          credit: "Unsplash",
        },
        {
          url: UNSPLASH.hotel_terrace,
          thumb: UNSPLASH.hotel_terrace.replace("w=1200", "w=400"),
          alt: "Deniz manzaralı teras",
          credit: "Unsplash",
        },
        {
          url: UNSPLASH.hotel_dining,
          thumb: UNSPLASH.hotel_dining.replace("w=1200", "w=400"),
          alt: "Açık hava restoranı",
          credit: "Unsplash",
        },
      ],
    },
    update: {
      shortDescription:
        "Ege'nin mavisinde kaybolmak için — tekne turları ve gece hayatı kapında",
      status: "ACTIVE",
    },
  } as any);
  console.log("✓ Otel oluşturuldu:", bodrumHotel.name);

  // Bodrum oda tipleri
  const bodrumRoomExists = await db.roomType.findFirst({
    where: { hotelId: bodrumHotel.id, name: "Deniz Manzaralı Suit" },
  });
  if (!bodrumRoomExists) {
    await db.roomType.createMany({
      data: [
        {
          tenantId: tenant.id,
          hotelId: bodrumHotel.id,
          name: "Deniz Manzaralı Suit",
          bedType: "King",
          capacity: 2,
          sizeSqm: 55,
          description:
            "Ege'ye açılan geniş balkon, infinity havuz erişimi ve özel konsiyerj.",
          features: [
            "Deniz manzarası",
            "Özel balkon",
            "Infinity havuz erişimi",
            "Konsiyerj",
          ],
          photos: [
            { url: UNSPLASH.bodrum_harbor, alt: "Deniz manzaralı suit" },
          ],
        },
        {
          tenantId: tenant.id,
          hotelId: bodrumHotel.id,
          name: "Bahçe Odası",
          bedType: "Double",
          capacity: 2,
          sizeSqm: 28,
          description:
            "Tropikal bahçeye açılan huzurlu oda, beach club'a yürüme mesafesinde.",
          features: ["Bahçe manzarası", "Beach club erişimi"],
          photos: [{ url: UNSPLASH.hotel_room, alt: "Bahçe odası" }],
        },
      ],
    });
    console.log("✓ Bodrum oda tipleri eklendi");
  }

  // ─── Antalya Oteli ───────────────────────────────────────
  const antalyaHotel = await db.hotel.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: "kalekapi-antalya" } },
    create: {
      tenantId: tenant.id,
      slug: "kalekapi-antalya",
      name: "Kalekapi Antalya",
      shortDescription:
        "Kaleiçi'nin tarihi sokaklarında modern lüks — Akdeniz'in kalbi",
      description:
        "Antalya'nın 2.000 yıllık Kaleiçi semtinin tam merkezinde, Roma liman kapısının hemen yanında yükselen butik otel. Mermer avlular, portakal bahçeleri ve Akdeniz'in sonsuz mavisiyle çerçevelenmiş bir konaklama. Sabahları antik sokaklar sizi bekliyor, akşamları ise teras restoranında tazeliğiyle öne çıkan Akdeniz mutfağının başyapıtları.",
      starRating: 5,
      status: "ACTIVE",
      address: {
        street: "Hesapçı Sokak 37, Kaleiçi",
        city: "Antalya",
        country: "Turkey",
        postalCode: "07100",
        lat: 36.8841,
        lng: 30.7056,
      },
      contactInfo: { phone: "+90 242 247 0000", email: "info@kalekapi.com" },
      amenities: [
        "Mermer Havuz",
        "Spa",
        "Teras Restoran",
        "Tur Servisi",
        "Tarihi Tur",
      ],
      tags: ["historic", "boutique", "mediterranean", "luxury", "old-town"],
      wifiQuality: "Fast",
      currency: "USD",
      timezone: "Europe/Istanbul",
      photos: [
        {
          url: UNSPLASH.antalya_old_town,
          thumb: UNSPLASH.antalya_old_town.replace("w=1200", "w=400"),
          alt: "Kaleiçi tarihi sokaklar",
          credit: "Unsplash",
        },
        {
          url: UNSPLASH.antalya_coast,
          thumb: UNSPLASH.antalya_coast.replace("w=1200", "w=400"),
          alt: "Antalya Akdeniz kıyısı",
          credit: "Unsplash",
        },
        {
          url: UNSPLASH.hotel_lobby,
          thumb: UNSPLASH.hotel_lobby.replace("w=1200", "w=400"),
          alt: "Mermer avlu",
          credit: "Unsplash",
        },
        {
          url: UNSPLASH.hotel_pool,
          thumb: UNSPLASH.hotel_pool.replace("w=1200", "w=400"),
          alt: "Mermer havuz",
          credit: "Unsplash",
        },
        {
          url: UNSPLASH.hotel_dining,
          thumb: UNSPLASH.hotel_dining.replace("w=1200", "w=400"),
          alt: "Teras restoran",
          credit: "Unsplash",
        },
      ],
    },
    update: {
      shortDescription:
        "Kaleiçi'nin tarihi sokaklarında modern lüks — Akdeniz'in kalbi",
      status: "ACTIVE",
    },
  } as any);
  console.log("✓ Otel oluşturuldu:", antalyaHotel.name);

  const antalyaRoomExists = await db.roomType.findFirst({
    where: { hotelId: antalyaHotel.id, name: "Akdeniz Suit" },
  });
  if (!antalyaRoomExists) {
    await db.roomType.createMany({
      data: [
        {
          tenantId: tenant.id,
          hotelId: antalyaHotel.id,
          name: "Akdeniz Suit",
          bedType: "King",
          capacity: 2,
          sizeSqm: 60,
          description:
            "Akdeniz'e bakan geniş teras, özel jakuzi ve tarihi limana panoramik manzara.",
          features: ["Deniz manzarası", "Özel jakuzi", "Teras", "Konsiyerj"],
          photos: [
            { url: UNSPLASH.antalya_coast, alt: "Akdeniz suit manzara" },
          ],
        },
        {
          tenantId: tenant.id,
          hotelId: antalyaHotel.id,
          name: "Bahçe Odası",
          bedType: "Queen",
          capacity: 2,
          sizeSqm: 32,
          description:
            "Portakal bahçesine açılan ferah oda, tarihi Kaleiçi'nin kalbinde.",
          features: ["Bahçe manzarası", "Klima", "Minibar"],
          photos: [{ url: UNSPLASH.hotel_room, alt: "Bahçe odası" }],
        },
      ],
    });
    console.log("✓ Antalya oda tipleri eklendi");
  }

  // ─── City Guides (cityCode = URL slug) ───────────────────
  const guides = [
    {
      cityCode: "istanbul",
      cityName: "İstanbul",
      countryCode: "TR",
      summary:
        "İstanbul — iki kıtanın buluştuğu, tarihin en derin katmanlarını yaşayan şehir. Boğaz'ın iki yakasında uzanan bu dev metropol; camiler, bazarlar, rooftop barlar ve dünyaca ünlü mutfağıyla seni her köşede bir sürprizle karşılar.",
      safetyNotes:
        "Genel olarak güvenli bir şehir. Turistik bölgelerde dikkatli ol, taksi yerine Uber veya İstanbulkart'lı metroyu tercih et.",
      transportTips:
        "Metrobüs, metro ve tramvay ağı çok gelişmiş. İstanbulkart al, hem ucuz hem pratik. Boğaz turları için Karaköy iskelesini kullan.",
      sections: [
        {
          key: "must_see",
          title: "Mutlaka Görülmesi Gerekenler",
          body: "Sultanahmet'teki Ayasofya ve Topkapı Sarayı tarihin en görkemli anıtları arasında. Kapalıçarşı'da kaybolmak, Mısır Çarşısı'nda baharatları koklamak İstanbul ritüelinin parçası. Galata Köprüsü'nden Boğaz'a bakarken balık ekmek yemek ise şehrin simgesi haline gelmiş.",
        },
        {
          key: "food",
          title: "Gastronomi Rotası",
          body: "Sabah Karaköy'de simit ve çay. Öğle Beyoğlu'nun arka sokaklarında meyhane. Akşam Arnavutköy'de balık. Tatlı için Bebek'te dondurma. İstanbul'da her mahalle ayrı bir mutfak dünyası taşır.",
        },
        {
          key: "nightlife",
          title: "Gece Hayatı",
          body: "Beyoğlu ve Karaköy gece hayatının merkezi. Cihangir'in küçük barları ve Bosphorus kıyısındaki rooftop mekânlar farklı enerji sunar. Rakamlı kulüplerden küçük caz barlarına geniş bir yelpaze var.",
        },
      ],
      experiences: [
        {
          name: "Boğaz Gün Batımı Turu",
          slug: "bosphorus-sunset-cruise-ist",
          category: "CULTURAL" as any,
          durationMinutes: 120,
          priceCents: 4500,
          maxGuests: 12,
          description:
            "Boğaz'ın iki yakasını gün batımının altın ışığında keşfet. Tarihi köşkler, camiler ve boğaz köprüleri suya yansırken şampanya kadehini kaldır.",
        },
        {
          name: "Kapalıçarşı Gurme Turu",
          slug: "grand-bazaar-food-tour-ist",
          category: "FOOD_TOUR" as any,
          durationMinutes: 180,
          priceCents: 6000,
          maxGuests: 8,
          description:
            "Dünyanın en eski kapalı çarşısının labirentlerinde yerel rehberinle dolaş, 20+ lezzet tadımı yap. Türk kahvesi, baklava, lokum ve daha fazlası.",
        },
        {
          name: "Türk Hamamı Deneyimi",
          slug: "turkish-hammam-ist",
          category: "OTHER" as any,
          durationMinutes: 90,
          priceCents: 8000,
          maxGuests: 1,
          description:
            "500 yıllık tarihi Çemberlitaş Hamamı'nda geleneksel kese ve köpük masajıyla kendinizi yenileyin. Osmanlı ritüelinin en saf hali.",
        },
        {
          name: "Gecenin İstanbul'u — Fotoğraf Turu",
          slug: "istanbul-night-photo-ist",
          category: "NIGHT_TOUR" as any,
          durationMinutes: 150,
          priceCents: 5500,
          maxGuests: 6,
          description:
            "Galata Kulesi, Sultanahmet ve Karaköy'ün gece aydınlatmalarında profesyonel rehber eşliğinde fotoğraf turu. Kameranı getir, anları yakala.",
        },
        {
          name: "Semazen Töreni",
          slug: "whirling-dervish-ist",
          category: "CULTURAL" as any,
          durationMinutes: 60,
          priceCents: 3500,
          maxGuests: 30,
          description:
            "Mevlana'nın öğretileri ışığında dönen dervişlerin trans halindeki meditasyonu. Tarihi Galata Mevlevihanesi'nde unutulmaz bir ruhsal deneyim.",
        },
      ],
    },
    {
      cityCode: "kapadokya",
      cityName: "Kapadokya",
      countryCode: "TR",
      summary:
        "Kapadokya — dünyanın başka hiçbir yerinde göremeyeceğin peri bacaları, yeraltı şehirleri ve şafakta gökyüzünü dolduran onlarca rengarenk balon. Her an bir fotoğraf karesi, her köşe bir şiir.",
      safetyNotes:
        "Balon turları için sertifikalı şirketler seç. Tur rezervasyonlarını güvenilir platformlardan yap. Kaya oluşumlarında yürüyüş sırasında rehber alman tavsiye edilir.",
      transportTips:
        "Nevşehir'e uçuşlar var. Havalimanından servisle Göreme'ye ulaşabilirsin. Bölgede araç kiralama veya tur araçları en pratik seçenek.",
      sections: [
        {
          key: "balloon",
          title: "Balon Turu — Hayatının Deneyimi",
          body: "Şafakta kalkan balonlar Kapadokya'nın en ikonik deneyimi. Rezervasyonu önceden yap, hava koşullarına göre iptal olabiliyor. 45-60 dakikalık uçuşta vadi manzarası nefes kesiyor.",
        },
        {
          key: "underground",
          title: "Yeraltı Şehirleri",
          body: "Derinkuyu ve Kaymaklı yeraltı şehirleri antik çağda binlerce kişiyi barındıran mucizevi yapılar. Rehberli tur şart, bazı bölümler oldukça dar.",
        },
        {
          key: "valleys",
          title: "Yürüyüş Rotaları",
          body: "Güvercinlik Vadisi, Kızılçukur Vadisi ve Ihlara Vadisi en popüler rotalar. Gün batımına 2 saat kala başla, altın ışıkta peri bacaları başka bir dünya gibi görünüyor.",
        },
      ],
      experiences: [
        {
          name: "Şafak Balon Turu",
          slug: "balloon-tour-kapadokya",
          category: "OTHER" as any,
          durationMinutes: 90,
          priceCents: 25000,
          maxGuests: 16,
          description:
            "Gün doğumunda gökyüzüne yüksel. Peri bacaları, vadiler ve tarihi köyler 1000 metre yükseklikten bambaşka görünüyor. Şampanya ikramıyla son buluyor.",
        },
        {
          name: "Peri Bacaları Fotoğraf Turu",
          slug: "fairy-chimneys-photo-kapadokya",
          category: "CULTURAL" as any,
          durationMinutes: 240,
          priceCents: 8000,
          maxGuests: 8,
          description:
            "Profesyonel fotoğraf rehberiyle en ikonik noktaları keşfet. Gün batımı ve altın saat ışığında çekim teknikleri öğren.",
        },
        {
          name: "Yeraltı Şehri Turu",
          slug: "underground-city-kapadokya",
          category: "CULTURAL" as any,
          durationMinutes: 180,
          priceCents: 6000,
          maxGuests: 10,
          description:
            "Derinkuyu'nun derinliklerine in, antik uygarlıkların sırlarını keşfet. Uzman arkeolog rehber eşliğinde.",
        },
        {
          name: "ATV Safari — Vadiler",
          slug: "atv-safari-kapadokya",
          category: "OTHER" as any,
          durationMinutes: 120,
          priceCents: 9000,
          maxGuests: 8,
          description:
            "ATV ile Kızılçukur ve Güllüdere vadilerini keşfet. Adrenalin ve doğayı bir arada yaşa.",
        },
      ],
    },
    {
      cityCode: "bodrum",
      cityName: "Bodrum",
      countryCode: "TR",
      summary:
        "Bodrum — yaz güneşinin en sıcak sardığı, gece hayatının hiç bitmediği, turkuaz Ege'nin kucağında bir cennet. Gündüz teknede Ege koylarında süzül, gece Bodrum'un dünyaca ünlü kulüplerinde dans et.",
      safetyNotes:
        "Yaz aylarında çok kalabalık oluyor. Değerli eşyaları plajda bırakma. Denizde akıntı olabilir, uyarı işaretlerine dikkat et.",
      transportTips:
        "Milas-Bodrum Havalimanı'ndan transfer var. Şehir içinde dolmuş veya scooter kiralama pratik. Koy turları için Bodrum iskelesinden günlük tekneler kalkıyor.",
      sections: [
        {
          key: "beaches",
          title: "Plajlar & Koylar",
          body: "Gümbet, Bitez, Türkbükü ve Yalıkavak en popüler plajlar. Tekne turuyla Aquarium Koyu, Kızılbük ve Palamutbükü gibi bakir koylara ulaşabilirsin.",
        },
        {
          key: "castle",
          title: "Bodrum Kalesi & Müze",
          body: "Aziz Petrus Kalesi, Ege kıyısındaki en iyi korunmuş haçlı kalelerinden biri. İçindeki Sualtı Arkeoloji Müzesi dünyada eşsiz bir koleksiyona sahip.",
        },
        {
          key: "nightlife",
          title: "Gece Hayatı",
          body: "Halikarnas Gece Kulübü, D-Hotel Maris, Macakizi — Bodrum'un gece sahnesinde dünya DJ'leri sahne alıyor. Erken rezervasyon şart.",
        },
      ],
      experiences: [
        {
          name: "Mavi Yolculuk — Koy Turu",
          slug: "blue-cruise-bodrum",
          category: "OTHER" as any,
          durationMinutes: 480,
          priceCents: 12000,
          maxGuests: 12,
          description:
            "Sabahtan akşama Ege'nin bakir koylarında özel teknede. 5 koy, şnorkeling, açık büfe öğle yemeği.",
        },
        {
          name: "Günbatımı Tekne Cocktail Turu",
          slug: "sunset-cocktail-bodrum",
          category: "NIGHT_TOUR" as any,
          durationMinutes: 150,
          priceCents: 7500,
          maxGuests: 20,
          description:
            "Gün batımında Bodrum Kalesi manzarasında cocktail partisi. Canlı müzik ve açık bar dahil.",
        },
        {
          name: "Bodrum Kalesi & Sualtı Müzesi",
          slug: "castle-museum-bodrum",
          category: "CULTURAL" as any,
          durationMinutes: 120,
          priceCents: 3000,
          maxGuests: 15,
          description:
            "Uzman rehber eşliğinde Haçlı kalesi ve dünyanın tek Sualtı Arkeoloji Müzesi turu.",
        },
      ],
    },
    {
      cityCode: "antalya",
      cityName: "Antalya",
      countryCode: "TR",
      summary:
        "Antalya — antik medeniyetlerin izlerini taşıyan, Akdeniz'in en uzun sahil şeridine sahip, her mevsim yaşayan bir şehir. Kaleiçi'nin dar sokaklarında gezerken ansızın Akdeniz panoramasıyla yüzleşirsin.",
      safetyNotes:
        "Turistik bölge oldukça güvenli. Plajlarda kalabalık mevsimlerde eşyalarınıza dikkat edin. Rehberli turlar için lisanslı acenteleri tercih edin.",
      transportTips:
        "Tramvay Kaleiçi'ne kadar geliyor. Plajlar için Antalyakart'lı otobüs. Düden Şelalesi ve antik kentler için tur arabası veya araç kiralama.",
      sections: [
        {
          key: "kaleici",
          title: "Kaleiçi — 2000 Yıllık Tarihi Liman",
          body: "Roma dönemi liman kapısı, Osmanlı konakları ve Bizans kiliseleri aynı sokakta bir arada. Dar taş sokaklarda gezinmek başlı başına bir deneyim.",
        },
        {
          key: "nature",
          title: "Doğa Harikası — Şelaleler",
          body: "Düden Şelalesi doğrudan Akdeniz'e düşen eşsiz bir manzara sunuyor. Manavgat Şelalesi ise piknik ve tekne turu için ideal.",
        },
        {
          key: "ancient",
          title: "Antik Kentler",
          body: "Perge, Aspendos ve Side; Roma döneminden kalma amfiteatrlar ve tapınaklarıyla UNESCO listesinde. Side'de gün batımında Apollon Tapınağı önünde fotoğraf çekmek unutulmaz.",
        },
      ],
      experiences: [
        {
          name: "Kaleiçi Gece Turu",
          slug: "kaleici-night-tour-antalya",
          category: "NIGHT_TOUR" as any,
          durationMinutes: 120,
          priceCents: 4000,
          maxGuests: 10,
          description:
            "Tarihi Kaleiçi'nin aydınlatılmış sokaklarında rehberli gece yürüyüşü. Yüzyılların hikayelerini dinle, gizli mekânları keşfet.",
        },
        {
          name: "Aspendos Amfitiyatrosu Turu",
          slug: "aspendos-tour-antalya",
          category: "CULTURAL" as any,
          durationMinutes: 240,
          priceCents: 7000,
          maxGuests: 12,
          description:
            "Dünyanın en iyi korunmuş Roma amfitiyatrosunda özel tur. Akustik mükemmelliğini yerinde hisset.",
        },
        {
          name: "Akdeniz Tekne Turu",
          slug: "mediterranean-boat-antalya",
          category: "OTHER" as any,
          durationMinutes: 360,
          priceCents: 9500,
          maxGuests: 15,
          description:
            "Antalya körfezinde günlük tekne turu. Düden Şelalesi sualtı mağarası, şnorkeling ve plaj molaları.",
        },
      ],
    },
    {
      cityCode: "izmir",
      cityName: "İzmir",
      countryCode: "TR",
      summary:
        "İzmir — Ege'nin en özgür, en renkli, en canlı şehri. Kordon'da yürürken deniz rüzgarı yüzüne çarpar, Kemeraltı'nda kaybolursun, Efes'te 2000 yıl geriye gidersin.",
      safetyNotes:
        "Oldukça güvenli bir şehir. Toplu taşıma gelişmiş, İZBAN banliyö treni pratik. Kemeraltı'nda kalabalık saatlerde dikkatli ol.",
      transportTips:
        "İZBAN ve metro ağı ile şehrin her yerine ulaşabilirsin. Efes için Selçuk'a tren veya tur arabası. Çeşme ve Alaçatı için araç kiralama.",
      sections: [
        {
          key: "kordon",
          title: "Kordon — Şehrin Nefes Aldığı Yer",
          body: "Kordon'da sabah koşusu, öğle kahvesi, akşam yürüyüşü — İzmirli'nin günlük ritüeli. Pasaport Meydanı'ndan Alsancak'a uzanan sahil şeridi şehrin kalbini taşıyor.",
        },
        {
          key: "ephesus",
          title: "Efes Antik Kenti",
          body: "Roma İmparatorluğu'nun en büyük şehirlerinden birinin kalıntıları bugün bile nefes kesiyor. Celsus Kütüphanesi, büyük tiyatro ve kutsal yollar... Sabah erken git, kalabalıktan önce.",
        },
        {
          key: "alacati",
          title: "Alaçatı — Rüzgarın Şehri",
          body: "Taş evleri ve bougainvillea'larıyla Ege'nin en romantik köyü. Rüzgar sörfü için dünya merkezi. Küçük butik oteller ve gourmet restoranlarıyla hafta sonu kaçamağının mükemmel adresi.",
        },
      ],
      experiences: [
        {
          name: "Efes Antik Kenti Sabah Turu",
          slug: "ephesus-morning-izmir",
          category: "CULTURAL" as any,
          durationMinutes: 300,
          priceCents: 8500,
          maxGuests: 10,
          description:
            "Sabah 8'de giriş, kalabalık olmadan Roma döneminin en büyük kentini keşfet. Uzman arkeolog rehber eşliğinde.",
        },
        {
          name: "Kemeraltı Lezzet Turu",
          slug: "kemeralti-food-izmir",
          category: "FOOD_TOUR" as any,
          durationMinutes: 180,
          priceCents: 5500,
          maxGuests: 8,
          description:
            "İzmir'in 400 yıllık tarihi çarşısında boyoz, kumru, İzmir köftesi ve gevrek tadımı. Yerel rehberle arka sokakların sırlarını keşfet.",
        },
        {
          name: "Alaçatı Rüzgar Sörfü",
          slug: "windsurf-alacati-izmir",
          category: "OTHER" as any,
          durationMinutes: 240,
          priceCents: 11000,
          maxGuests: 4,
          description:
            "Dünyanın en iyi rüzgar sörfü noktalarından birinde profesyonel eğitim. Başlangıç seviyesine uygun.",
        },
      ],
    },
  ];

  for (const guideData of guides) {
    const { sections, experiences, ...guideFields } = guideData;

    // Guide upsert
    const guide = await db.cityGuide.upsert({
      where: {
        tenantId_cityCode_languageCode: {
          tenantId: tenant.id,
          cityCode: guideFields.cityCode,
          languageCode: "en",
        },
      },
      create: {
        ...guideFields,
        tenantId: tenant.id,
        languageCode: "en",
        isActive: true,
      },
      update: {
        cityName: guideFields.cityName,
        summary: guideFields.summary,
        safetyNotes: guideFields.safetyNotes,
        transportTips: guideFields.transportTips,
      },
    });

    // Sections
    await db.cityGuideSection.createMany({
      skipDuplicates: true,
      data: sections.map((sec, i) => ({
        tenantId: tenant.id,
        cityGuideId: guide.id,
        sectionKey: sec.key,
        title: sec.title,
        body: sec.body,
        sortOrder: i,
        isActive: true,
      })),
    });

    // Experiences
    for (const exp of experiences) {
      const existing = await db.localExperience.findFirst({
        where: { tenantId: tenant.id, slug: exp.slug },
      });
      if (!existing) {
        await db.localExperience.create({
          data: {
            tenantId: tenant.id,
            cityGuideId: guide.id,
            name: exp.name,
            slug: exp.slug,
            category: exp.category,
            description: exp.description,
            durationMinutes: exp.durationMinutes,
            priceCents: exp.priceCents,
            maxGuests: exp.maxGuests,
            city: guideFields.cityName,
            isActive: true,
            languages: ["tr", "en"],
          },
        });
      }
    }

    console.log(
      `✓ City guide: ${guideFields.cityName} (${sections.length} bölüm, ${experiences.length} deneyim)`,
    );
  }

  console.log("\n✅ Nuvoya seed tamamlandı!");
  console.log("\n🗺️  Aktif city guide URL'leri:");
  guides.forEach((g) =>
    console.log(`  /guides/${g.cityCode}  →  ${g.cityName}`),
  );
  console.log("\n🏨 Toplam otel:");
  const hotelCount = await db.hotel.count({ where: { tenantId: tenant.id } });
  console.log(`  ${hotelCount} otel aktif`);
}

main()
  .catch((e) => {
    console.error("❌ Seed hatası:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
