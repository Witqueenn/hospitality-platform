/**
 * seed-testing.ts — yoğun test verisi (şemaya uyumlu)
 * ─────────────────────────────────────────────────────────────────────────────
 * Tüm UI sayfaları için 150+ booking, 40+ review, 25 support case,
 * service request, event request, dining rezervasyonları üretir.
 *
 * BAĞIMLILIK: seed.ts + seed-rich.ts çalışmış olmalı.
 *
 * Çalıştır:
 *   pnpm --filter @repo/db db:seed:testing
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const db = new PrismaClient();

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);
const daysFromNow = (n: number) => new Date(Date.now() + n * 86_400_000);
const hoursAgo = (n: number) => new Date(Date.now() - n * 3_600_000);
const uid = () => crypto.randomBytes(4).toString("hex").toUpperCase();

async function findOrCreate<T extends { id: string }>(
  finder: () => Promise<T | null>,
  creator: () => Promise<T>,
): Promise<T> {
  return (await finder()) ?? creator();
}

// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🧪 seed-testing.ts başlıyor...\n");

  const tenant = await db.tenant.findFirstOrThrow({
    where: { slug: "grand-hotels" },
  });
  const hotel1 = await db.hotel.findFirstOrThrow({
    where: { tenantId: tenant.id, slug: "grand-palace-istanbul" },
  });
  const hotel2 = await db.hotel.findFirstOrThrow({
    where: { tenantId: tenant.id, slug: "boutique-athens" },
  });

  const guestRelations = await db.user.findFirst({
    where: { tenantId: tenant.id, email: "guestrel@grandpalace.com" },
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. MİSAFİR KULLANICILAR (40 adet)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("── Misafirler ──────────────────────────────────────────────");

  const guestHash = await bcrypt.hash("guest123456", 10);

  const guestDefs = [
    ["tst.ahmed@example.com", "Ahmed Al-Farsi"],
    ["tst.yuki@example.jp", "Yuki Nakamura"],
    ["tst.sofia@example.es", "Sofía Hernández"],
    ["tst.luca@example.it", "Luca Bianchi"],
    ["tst.marie@example.fr", "Marie Dupont"],
    ["tst.jan@example.nl", "Jan van der Berg"],
    ["tst.anna@example.se", "Anna Lindström"],
    ["tst.piotr@example.pl", "Piotr Kowalski"],
    ["tst.carlos@example.mx", "Carlos Mendoza"],
    ["tst.ashley@example.com", "Ashley Williams"],
    ["tst.tyler@example.com", "Tyler Anderson"],
    ["tst.jessica@example.com", "Jessica Thompson"],
    ["tst.ryan@example.com", "Ryan Martinez"],
    ["tst.sarah@example.com", "Sarah Davis"],
    ["tst.kevin@example.com", "Kevin Wilson"],
    ["tst.wei@example.cn", "Wei Zhang"],
    ["tst.arjun@example.in", "Arjun Sharma"],
    ["tst.kim@example.kr", "Kim Min-jun"],
    ["tst.rahul@example.in", "Rahul Patel"],
    ["tst.mei@example.sg", "Mei Lin Tan"],
    ["tst.ahmet@example.tr", "Ahmet Yılmaz"],
    ["tst.fatma@example.tr", "Fatma Kaya"],
    ["tst.mustafa@example.tr", "Mustafa Çelik"],
    ["tst.ayse@example.tr", "Ayşe Demir"],
    ["tst.ibrahim@example.tr", "İbrahim Şahin"],
    ["tst.khalid@example.ae", "Khalid Al-Mansouri"],
    ["tst.nour@example.sa", "Nour Al-Ahmad"],
    ["tst.fatima@example.kw", "Fatima Al-Kuwait"],
    ["tst.chioma@example.ng", "Chioma Okonkwo"],
    ["tst.kwame@example.gh", "Kwame Asante"],
    ["tst.elena@example.ru", "Elena Volkova"],
    ["tst.pierre@example.ca", "Pierre Tremblay"],
    ["tst.amelia@example.au", "Amelia Clarke"],
    ["tst.noah@example.nz", "Noah Sullivan"],
    ["tst.ana@example.br", "Ana Ferreira"],
    ["tst.nico@example.ar", "Nicolás García"],
    ["tst.ingrid@example.no", "Ingrid Hansen"],
    ["tst.felix@example.de", "Felix Schreiber"],
    ["tst.ozge@example.tr", "Özge Arslan"],
    ["tst.hamid@example.ir", "Hamid Ahmadi"],
  ] as const;

  const guests: Array<{ id: string; email: string; name: string }> = [];
  for (const [email, name] of guestDefs) {
    const g = await findOrCreate(
      () => db.user.findFirst({ where: { tenantId: tenant.id, email } }),
      () =>
        db.user.create({
          data: {
            tenantId: tenant.id,
            email,
            name,
            passwordHash: guestHash,
            role: "GUEST",
            preferences: {},
          },
        }),
    );
    guests.push(g);
  }
  console.log(`  ✓ ${guests.length} misafir hazır`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. BOOKINGS (155+) — checkIn/checkOut, guestCount, subtotalCents, bookingType
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("\n── Rezervasyonlar ──────────────────────────────────────────");

  type BS =
    | "PENDING"
    | "CONFIRMED"
    | "CHECKED_IN"
    | "CHECKED_OUT"
    | "CANCELLED"
    | "NO_SHOW";
  type PS = "PENDING" | "AUTHORIZED" | "CAPTURED" | "REFUNDED";

  interface BookingDef {
    ref: string;
    hotelId: string;
    guestIdx: number;
    checkIn: Date;
    checkOut: Date;
    cents: number;
    status: BS;
    pay: PS;
    guests?: number;
    children?: number;
    notes?: string;
  }

  const bookingDefs: BookingDef[] = [];

  // Grand Palace Istanbul — geçmiş (CHECKED_OUT)
  for (let i = 0; i < 40; i++) {
    const off = 10 + i * 3;
    bookingDefs.push({
      ref: `TST-GPI-CO-${String(i + 1).padStart(3, "0")}`,
      hotelId: hotel1.id,
      guestIdx: i % guests.length,
      checkIn: daysAgo(off + 4),
      checkOut: daysAgo(off),
      cents: 20000 + (i % 5) * 8000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      guests: (i % 2) + 1,
    });
  }

  // Grand Palace Istanbul — aktif (CHECKED_IN)
  for (let i = 0; i < 12; i++) {
    bookingDefs.push({
      ref: `TST-GPI-CI-${String(i + 1).padStart(3, "0")}`,
      hotelId: hotel1.id,
      guestIdx: (i + 5) % guests.length,
      checkIn: daysAgo(2 + (i % 3)),
      checkOut: daysFromNow(2 + (i % 4)),
      cents: 35000 + i * 3000,
      status: "CHECKED_IN",
      pay: "CAPTURED",
      guests: 1 + (i % 3),
      children: i % 2 === 0 ? 0 : 1,
      notes: i % 3 === 0 ? "Balayı çifti — oda dekorasyonu istedi." : undefined,
    });
  }

  // Grand Palace Istanbul — gelecek (CONFIRMED)
  for (let i = 0; i < 25; i++) {
    bookingDefs.push({
      ref: `TST-GPI-CF-${String(i + 1).padStart(3, "0")}`,
      hotelId: hotel1.id,
      guestIdx: (i + 10) % guests.length,
      checkIn: daysFromNow(5 + i * 2),
      checkOut: daysFromNow(8 + i * 2),
      cents: 28000 + (i % 6) * 5000,
      status: "CONFIRMED",
      pay: "CAPTURED",
      guests: 2,
    });
  }

  // Boutique Athens — CHECKED_OUT
  for (let i = 0; i < 30; i++) {
    const off = 8 + i * 3;
    bookingDefs.push({
      ref: `TST-ATH-CO-${String(i + 1).padStart(3, "0")}`,
      hotelId: hotel2.id,
      guestIdx: (i + 8) % guests.length,
      checkIn: daysAgo(off + 3),
      checkOut: daysAgo(off),
      cents: 15000 + (i % 4) * 5000,
      status: "CHECKED_OUT",
      pay: "CAPTURED",
      guests: (i % 2) + 1,
    });
  }

  // Boutique Athens — aktif (CHECKED_IN)
  for (let i = 0; i < 8; i++) {
    bookingDefs.push({
      ref: `TST-ATH-CI-${String(i + 1).padStart(3, "0")}`,
      hotelId: hotel2.id,
      guestIdx: (i + 15) % guests.length,
      checkIn: daysAgo(1 + (i % 2)),
      checkOut: daysFromNow(3 + (i % 3)),
      cents: 22000 + i * 2000,
      status: "CHECKED_IN",
      pay: "CAPTURED",
      guests: 2,
    });
  }

  // Boutique Athens — CONFIRMED
  for (let i = 0; i < 15; i++) {
    bookingDefs.push({
      ref: `TST-ATH-CF-${String(i + 1).padStart(3, "0")}`,
      hotelId: hotel2.id,
      guestIdx: (i + 20) % guests.length,
      checkIn: daysFromNow(4 + i * 3),
      checkOut: daysFromNow(7 + i * 3),
      cents: 18000 + i * 1500,
      status: "CONFIRMED",
      pay: "CAPTURED",
      guests: 2,
    });
  }

  // İptal edilenler
  for (let i = 0; i < 15; i++) {
    bookingDefs.push({
      ref: `TST-CXL-${String(i + 1).padStart(3, "0")}`,
      hotelId: i % 2 === 0 ? hotel1.id : hotel2.id,
      guestIdx: (i + 3) % guests.length,
      checkIn: daysFromNow(10 + i),
      checkOut: daysFromNow(13 + i),
      cents: 25000,
      status: "CANCELLED",
      pay: "REFUNDED",
      guests: 2,
      notes: i % 2 === 0 ? "Misafir talep etti." : "Kapasite sorunu.",
    });
  }

  // No-show
  for (let i = 0; i < 5; i++) {
    bookingDefs.push({
      ref: `TST-NS-${String(i + 1).padStart(3, "0")}`,
      hotelId: hotel1.id,
      guestIdx: (i + 30) % guests.length,
      checkIn: daysAgo(5 + i),
      checkOut: daysAgo(3 + i),
      cents: 28000,
      status: "NO_SHOW",
      pay: "CAPTURED",
      guests: 1,
    });
  }

  // Bekleyen (PENDING)
  for (let i = 0; i < 10; i++) {
    bookingDefs.push({
      ref: `TST-PND-${String(i + 1).padStart(3, "0")}`,
      hotelId: i % 2 === 0 ? hotel1.id : hotel2.id,
      guestIdx: (i + 25) % guests.length,
      checkIn: daysFromNow(20 + i * 2),
      checkOut: daysFromNow(23 + i * 2),
      cents: 30000,
      status: "PENDING",
      pay: "PENDING",
      guests: 2,
    });
  }

  const createdBookings: Array<{
    id: string;
    guestId: string;
    hotelId: string;
    ref: string;
    status: string;
  }> = [];

  for (const def of bookingDefs) {
    const ex = await db.booking.findFirst({ where: { bookingRef: def.ref } });
    if (ex) {
      process.stdout.write(".");
      createdBookings.push({
        id: ex.id,
        guestId: ex.guestId,
        hotelId: ex.hotelId,
        ref: ex.bookingRef,
        status: ex.status,
      });
      continue;
    }
    const b = await db.booking.create({
      data: {
        tenantId: tenant.id,
        hotelId: def.hotelId,
        guestId: guests[def.guestIdx % guests.length].id,
        bookingType: "ROOM",
        bookingRef: def.ref,
        checkIn: def.checkIn,
        checkOut: def.checkOut,
        guestCount: def.guests ?? 2,
        childCount: def.children ?? 0,
        subtotalCents: def.cents,
        totalCents: Math.round(def.cents * 1.1), // %10 vergi
        taxCents: Math.round(def.cents * 0.1),
        currency: "USD",
        status: def.status,
        paymentStatus: def.pay,
        specialRequests: def.notes ?? null,
      },
    });
    createdBookings.push({
      id: b.id,
      guestId: b.guestId,
      hotelId: b.hotelId,
      ref: b.bookingRef,
      status: b.status,
    });
  }
  console.log(`\n  ✓ ${createdBookings.length} rezervasyon hazır`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. GUEST STAY SESSIONS (CHECKED_IN rezervasyonlar için)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("\n── Stay Sessions ───────────────────────────────────────────");

  const checkedInBookings = createdBookings.filter(
    (b) => b.status === "CHECKED_IN",
  );
  const createdSessions: typeof checkedInBookings = [];

  for (const bk of checkedInBookings) {
    const ex = await db.guestStaySession.findFirst({
      where: { bookingId: bk.id },
    });
    if (!ex) {
      await db.guestStaySession.create({
        data: {
          tenantId: tenant.id,
          hotelId: bk.hotelId,
          bookingId: bk.id,
          guestId: bk.guestId,
          roomNumber: `${Math.floor(Math.random() * 5 + 1)}0${Math.floor(Math.random() * 9 + 1)}`,
          status: "ACTIVE",
          checkInAt: hoursAgo(12 + createdSessions.length),
          metadata: {},
        },
      });
    }
    createdSessions.push(bk);
  }
  console.log(`  ✓ ${createdSessions.length} stay session hazır`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. GUEST SERVICE REQUESTS (stay session'lara bağlı)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("\n── Servis Talepleri ────────────────────────────────────────");

  // Aktif stay session'ları çek
  const activeSessions = await db.guestStaySession.findMany({
    where: { hotelId: hotel1.id, status: "ACTIVE" },
    take: 10,
  });

  const srDefs: Array<{
    type:
      | "EXTRA_TOWELS"
      | "HOUSEKEEPING"
      | "ROOM_CLEANING"
      | "MINIBAR_REFILL"
      | "AC_ISSUE"
      | "TV_INTERNET_ISSUE"
      | "LUGGAGE_ASSISTANCE"
      | "WAKE_UP_CALL"
      | "BABY_CRIB"
      | "MAINTENANCE"
      | "OTHER";
    desc: string;
    status: "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
    priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  }> = [
    {
      type: "EXTRA_TOWELS",
      desc: "4 adet ekstra havlu",
      status: "COMPLETED",
      priority: "LOW",
    },
    {
      type: "ROOM_CLEANING",
      desc: "Saat 09:00 için erken oda temizliği",
      status: "IN_PROGRESS",
      priority: "NORMAL",
    },
    {
      type: "MINIBAR_REFILL",
      desc: "Mini bar tamamen boş, yenilensin",
      status: "PENDING",
      priority: "LOW",
    },
    {
      type: "AC_ISSUE",
      desc: "Klima soğutmuyor — acil",
      status: "IN_PROGRESS",
      priority: "URGENT",
    },
    {
      type: "TV_INTERNET_ISSUE",
      desc: "WiFi bağlantısı çok yavaş",
      status: "IN_PROGRESS",
      priority: "HIGH",
    },
    {
      type: "MAINTENANCE",
      desc: "Banyo musluğu damlıyor",
      status: "PENDING",
      priority: "NORMAL",
    },
    {
      type: "MAINTENANCE",
      desc: "Kasa kiliti çalışmıyor",
      status: "COMPLETED",
      priority: "URGENT",
    },
    {
      type: "OTHER",
      desc: "Oda servisi — Türk kahvaltısı saat 8:00",
      status: "COMPLETED",
      priority: "NORMAL",
    },
    {
      type: "BABY_CRIB",
      desc: "Bebek karyolası gönderilsin",
      status: "COMPLETED",
      priority: "HIGH",
    },
    {
      type: "LUGGAGE_ASSISTANCE",
      desc: "Check-out için bavul yardımı",
      status: "PENDING",
      priority: "LOW",
    },
    {
      type: "HOUSEKEEPING",
      desc: "Doğum günü dekorasyonu — balonlar ve çiçek",
      status: "COMPLETED",
      priority: "HIGH",
    },
    {
      type: "WAKE_UP_CALL",
      desc: "Sabah 06:00 uyandırma servisi",
      status: "COMPLETED",
      priority: "NORMAL",
    },
    {
      type: "OTHER",
      desc: "Şarap ve peynir tabağı oda servisi",
      status: "IN_PROGRESS",
      priority: "NORMAL",
    },
    {
      type: "MAINTENANCE",
      desc: "Elektrikli perde açılmıyor",
      status: "PENDING",
      priority: "LOW",
    },
    {
      type: "OTHER",
      desc: "Havalimanı transferi ayarlanması",
      status: "PENDING",
      priority: "HIGH",
    },
  ];

  let srCount = 0;
  for (let i = 0; i < srDefs.length && i < activeSessions.length; i++) {
    const def = srDefs[i];
    const sess = activeSessions[i % activeSessions.length];
    const ref = `SR-TST-${uid()}`;
    const ex = await db.guestServiceRequest.findFirst({
      where: { stayId: sess.id, requestType: def.type },
    });
    if (ex) continue;
    await db.guestServiceRequest.create({
      data: {
        tenantId: tenant.id,
        hotelId: sess.hotelId,
        stayId: sess.id,
        guestId: sess.guestId,
        requestRef: ref,
        requestType: def.type,
        description: def.desc,
        status: def.status,
        priority: def.priority,
        roomNumber: `${Math.floor(Math.random() * 5 + 1)}0${Math.floor(Math.random() * 9 + 1)}`,
        createdAt: hoursAgo(Math.floor(Math.random() * 24)),
      },
    });
    srCount++;
  }
  console.log(`  ✓ ${srCount} servis talebi oluşturuldu`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. REVIEWS (40 adet — overallScore, text, scores, moderationStatus)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("\n── Yorumlar ────────────────────────────────────────────────");

  const reviewDefs = [
    // 5/5 — İstanbul
    {
      h: hotel1,
      g: 0,
      score: 9,
      title: "Muhteşem bir deneyim!",
      text: "Boğaz manzarası inanılmazdı. Personel her an yanımızdaydı.",
      scores: { cleanliness: 9, service: 10, location: 9, value: 8 },
      mod: "APPROVED",
    },
    {
      h: hotel1,
      g: 1,
      score: 10,
      title: "Best hotel in Istanbul!",
      text: "Exceptional service, stunning views, and the spa was world-class.",
      scores: { cleanliness: 10, service: 10, location: 10, value: 9 },
      mod: "APPROVED",
    },
    {
      h: hotel1,
      g: 2,
      score: 9,
      title: "Parfait séjour!",
      text: "Le service était impeccable et les chambres magnifiques.",
      scores: { cleanliness: 9, service: 10, location: 9, value: 8 },
      mod: "APPROVED",
    },
    {
      h: hotel1,
      g: 3,
      score: 10,
      title: "Wunderschöner Aufenthalt",
      text: "Hervorragender Service, traumhafte Aussicht.",
      scores: { cleanliness: 10, service: 10, location: 10, value: 8 },
      mod: "APPROVED",
    },
    {
      h: hotel1,
      g: 4,
      score: 9,
      title: "Soggiorno indimenticabile",
      text: "Una vista sul Bosforo mozzafiato. Personale gentilissimo.",
      scores: { cleanliness: 9, service: 9, location: 10, value: 8 },
      mod: "APPROVED",
    },
    // 4/5 — İstanbul
    {
      h: hotel1,
      g: 5,
      score: 8,
      title: "Sehr gutes Hotel",
      text: "Das Hotel ist sehr schön, aber die Zimmer könnten größer sein.",
      scores: { cleanliness: 8, service: 9, location: 8, value: 7 },
      mod: "APPROVED",
    },
    {
      h: hotel1,
      g: 6,
      score: 8,
      title: "Great stay with minor issues",
      text: "Beautiful hotel, amazing views. AC was a bit noisy.",
      scores: { cleanliness: 8, service: 8, location: 9, value: 8 },
      mod: "APPROVED",
    },
    {
      h: hotel1,
      g: 7,
      score: 8,
      title: "Excelente ubicación",
      text: "La ubicación es perfecta y el personal muy amable.",
      scores: { cleanliness: 8, service: 8, location: 10, value: 7 },
      mod: "APPROVED",
    },
    {
      h: hotel1,
      g: 8,
      score: 7,
      title: "Harika otel",
      text: "Personel çok ilgiliydi ama oda biraz küçüktü.",
      scores: { cleanliness: 8, service: 9, location: 9, value: 6 },
      mod: "APPROVED",
    },
    // 3/5 — İstanbul
    {
      h: hotel1,
      g: 9,
      score: 6,
      title: "Good but overpriced",
      text: "The location is great but the price is too high for what you get.",
      scores: { cleanliness: 7, service: 6, location: 9, value: 4 },
      mod: "APPROVED",
    },
    {
      h: hotel1,
      g: 10,
      score: 5,
      title: "Ortalama bir deneyim",
      text: "Otel güzel ama fiyatına göre beklentimi karşılamadı. WiFi çok yavaştı.",
      scores: { cleanliness: 6, service: 5, location: 8, value: 4 },
      mod: "APPROVED",
    },
    {
      h: hotel1,
      g: 11,
      score: 6,
      title: "Decent stay",
      text: "Check-in was slow. Views are spectacular though.",
      scores: { cleanliness: 6, service: 5, location: 10, value: 5 },
      mod: "APPROVED",
    },
    // 2/5 — İstanbul
    {
      h: hotel1,
      g: 12,
      score: 4,
      title: "Disappointing for the price",
      text: "Room was smaller than expected, noisy AC, staff seemed indifferent.",
      scores: { cleanliness: 5, service: 4, location: 7, value: 3 },
      mod: "APPROVED",
    },
    {
      h: hotel1,
      g: 13,
      score: 3,
      title: "Terrible experience",
      text: "Booked a Bosphorus view room but was given a garden view. Took 3 hours to resolve.",
      scores: { cleanliness: 4, service: 2, location: 6, value: 2 },
      mod: "FLAGGED",
    },
    // 5/5 — Atina
    {
      h: hotel2,
      g: 14,
      score: 10,
      title: "Hidden gem in Athens!",
      text: "Such a charming boutique hotel. The staff made us feel so welcome.",
      scores: { cleanliness: 10, service: 10, location: 9, value: 10 },
      mod: "APPROVED",
    },
    {
      h: hotel2,
      g: 15,
      score: 9,
      title: "Perfect romantic getaway",
      text: "Intimate atmosphere, beautiful rooms, exceptional breakfast.",
      scores: { cleanliness: 9, service: 10, location: 9, value: 9 },
      mod: "APPROVED",
    },
    // 4/5 — Atina
    {
      h: hotel2,
      g: 16,
      score: 8,
      title: "Lovely boutique hotel",
      text: "Charming property with great personal service. Rooms could use an update.",
      scores: { cleanliness: 8, service: 9, location: 9, value: 8 },
      mod: "APPROVED",
    },
    {
      h: hotel2,
      g: 17,
      score: 8,
      title: "Très bon séjour",
      text: "Hotel très agréable avec une décoration originale.",
      scores: { cleanliness: 8, service: 8, location: 9, value: 8 },
      mod: "APPROVED",
    },
    {
      h: hotel2,
      g: 18,
      score: 7,
      title: "Güzel butik otel",
      text: "Küçük ama şık. Personel çok sıcakkanlı.",
      scores: { cleanliness: 8, service: 8, location: 9, value: 7 },
      mod: "APPROVED",
    },
    // 3/5 — Atina
    {
      h: hotel2,
      g: 19,
      score: 6,
      title: "Good location, average rooms",
      text: "Great location near the Acropolis but rooms are quite small.",
      scores: { cleanliness: 6, service: 6, location: 9, value: 6 },
      mod: "APPROVED",
    },
    // Daha fazla
    {
      h: hotel1,
      g: 20,
      score: 10,
      title: "Luxury at its finest",
      text: "From the moment we arrived, everything was flawless.",
      scores: { cleanliness: 10, service: 10, location: 10, value: 9 },
      mod: "APPROVED",
    },
    {
      h: hotel1,
      g: 21,
      score: 9,
      title: "Amazing views, great service",
      text: "The Bosphorus suite was breathtaking.",
      scores: { cleanliness: 9, service: 10, location: 10, value: 8 },
      mod: "APPROVED",
    },
    {
      h: hotel1,
      g: 22,
      score: 9,
      title: "Spa dünya standartlarında",
      text: "Türk hamamı deneyimi unutulmaz!",
      scores: { cleanliness: 9, service: 9, location: 9, value: 9 },
      mod: "APPROVED",
    },
    {
      h: hotel1,
      g: 23,
      score: 9,
      title: "Memorable anniversary trip",
      text: "They surprised us with rose petals and champagne.",
      scores: { cleanliness: 10, service: 10, location: 9, value: 7 },
      mod: "APPROVED",
    },
    {
      h: hotel2,
      g: 24,
      score: 10,
      title: "Best value in Athens!",
      text: "Boutique hotel with big heart. Staff remembered our names.",
      scores: { cleanliness: 10, service: 10, location: 9, value: 10 },
      mod: "APPROVED",
    },
    {
      h: hotel1,
      g: 25,
      score: 6,
      title: "Mixed experience",
      text: "Beautiful hotel but our room had issues with the AC.",
      scores: { cleanliness: 7, service: 6, location: 9, value: 5 },
      mod: "APPROVED",
    },
    {
      h: hotel1,
      g: 26,
      score: 10,
      title: "スタッフが素晴らしい",
      text: "全てのスタッフが親切で特別な体験を作ってくれました。",
      scores: { cleanliness: 10, service: 10, location: 10, value: 9 },
      mod: "APPROVED",
    },
    {
      h: hotel2,
      g: 27,
      score: 8,
      title: "Gezeliger Aufenthalt",
      text: "Kleines, feines Hotel mit persönlichem Service.",
      scores: { cleanliness: 8, service: 9, location: 8, value: 8 },
      mod: "APPROVED",
    },
    {
      h: hotel1,
      g: 28,
      score: 10,
      title: "Absolutely stunning!",
      text: "Every detail was perfect. The sunset view from our terrace.",
      scores: { cleanliness: 10, service: 10, location: 10, value: 9 },
      mod: "APPROVED",
    },
    {
      h: hotel1,
      g: 29,
      score: 4,
      title: "Below expectations",
      text: "Paid premium price but received standard service.",
      scores: { cleanliness: 5, service: 4, location: 8, value: 3 },
      mod: "PENDING",
    },
    {
      h: hotel2,
      g: 30,
      score: 10,
      title: "Mükemmel butik otel",
      text: "Her şeyiyle düşünülmüş. Misafirperverlik zirvesi.",
      scores: { cleanliness: 10, service: 10, location: 10, value: 10 },
      mod: "APPROVED",
    },
    {
      h: hotel1,
      g: 31,
      score: 8,
      title: "Exceptional food and service",
      text: "The restaurant is world-class. Ottoman cuisine with modern touches.",
      scores: { cleanliness: 9, service: 8, location: 9, value: 7 },
      mod: "APPROVED",
    },
    {
      h: hotel1,
      g: 32,
      score: 8,
      title: "Great business travel",
      text: "Perfect for corporate stays. Fast WiFi, excellent meeting facilities.",
      scores: { cleanliness: 8, service: 8, location: 8, value: 7 },
      mod: "APPROVED",
    },
    {
      h: hotel2,
      g: 33,
      score: 6,
      title: "Decent but limited amenities",
      text: "Lovely atmosphere but no gym or pool.",
      scores: { cleanliness: 7, service: 7, location: 9, value: 6 },
      mod: "APPROVED",
    },
    {
      h: hotel1,
      g: 34,
      score: 10,
      title: "Eşsiz bir konaklamam!",
      text: "Her şey harikaydı. Platinum avantajları fark yarattı.",
      scores: { cleanliness: 10, service: 10, location: 10, value: 10 },
      mod: "APPROVED",
    },
    {
      h: hotel1,
      g: 35,
      score: 5,
      title: "Check-in gecikmesi",
      text: "3 saat bekledik. Oda saat 18:00'de hazır oldu.",
      scores: { cleanliness: 7, service: 4, location: 9, value: 5 },
      mod: "APPROVED",
    },
    {
      h: hotel1,
      g: 36,
      score: 9,
      title: "Wonderful honeymoon",
      text: "The hotel team made our honeymoon truly special.",
      scores: { cleanliness: 9, service: 10, location: 9, value: 8 },
      mod: "APPROVED",
    },
    {
      h: hotel2,
      g: 37,
      score: 9,
      title: "Acropolis at your doorstep",
      text: "Woke up every morning to views of the Acropolis.",
      scores: { cleanliness: 9, service: 9, location: 10, value: 9 },
      mod: "APPROVED",
    },
    {
      h: hotel1,
      g: 38,
      score: 7,
      title: "Good overall",
      text: "Nice hotel with great views. Service was inconsistent.",
      scores: { cleanliness: 7, service: 7, location: 9, value: 7 },
      mod: "APPROVED",
    },
    {
      h: hotel1,
      g: 39,
      score: 10,
      title: "Will come back every year!",
      text: "This is our 3rd stay. Every time it gets better.",
      scores: { cleanliness: 10, service: 10, location: 10, value: 9 },
      mod: "APPROVED",
    },
  ];

  let reviewCount = 0;
  for (const def of reviewDefs) {
    const g = guests[def.g % guests.length];
    const ex = await db.review.findFirst({
      where: { hotelId: def.h.id, guestId: g.id, title: def.title },
    });
    if (ex) continue;
    await db.review.create({
      data: {
        tenantId: tenant.id,
        hotelId: def.h.id,
        guestId: g.id,
        overallScore: def.score,
        title: def.title,
        text: def.text,
        scores: def.scores,
        moderationStatus: def.mod as any,
        createdAt: daysAgo(Math.floor(Math.random() * 90) + 1),
      },
    });
    reviewCount++;
  }
  console.log(`  ✓ ${reviewCount} yorum oluşturuldu`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. SUPPORT CASES (25 adet — category, severity)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("\n── Destek Vakaları ─────────────────────────────────────────");

  type CaseCat =
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
  type CaseSev = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  type CaseStat =
    | "OPEN"
    | "IN_PROGRESS"
    | "AWAITING_HOTEL"
    | "AWAITING_GUEST"
    | "AWAITING_APPROVAL"
    | "RESOLVED"
    | "CLOSED"
    | "ESCALATED";

  const caseDefs: Array<{
    category: CaseCat;
    severity: CaseSev;
    status: CaseStat;
    title: string;
    desc: string;
    gIdx: number;
    hotelId: string;
    withComp?: boolean;
    compType?: string;
    compCents?: number;
  }> = [
    {
      category: "ROOM_NOT_READY",
      severity: "HIGH",
      status: "RESOLVED",
      title: "Oda hazır değildi — 3 saat bekleme",
      desc: "Check-in saati 15:00 olmasına rağmen oda saat 18:00'de hazır oldu.",
      gIdx: 0,
      hotelId: hotel1.id,
    },
    {
      category: "BILLING_ISSUE",
      severity: "CRITICAL",
      status: "RESOLVED",
      title: "Fatura hatası — fazla ücretlendirme",
      desc: "Minibar ürünleri kullanılmadığı halde faturalandırılmış. 150$ fazla alındı.",
      gIdx: 1,
      hotelId: hotel1.id,
      withComp: true,
      compType: "PARTIAL_REFUND",
      compCents: 15000,
    },
    {
      category: "NOISE_COMPLAINT",
      severity: "HIGH",
      status: "CLOSED",
      title: "Gürültülü oda — uyku sorunu",
      desc: "Oda 405 mekanik odanın üstünde. Gece boyunca gürültü.",
      gIdx: 2,
      hotelId: hotel1.id,
      withComp: true,
      compType: "ROOM_UPGRADE",
      compCents: 0,
    },
    {
      category: "ROOM_CLEANLINESS",
      severity: "MEDIUM",
      status: "IN_PROGRESS",
      title: "Havuz bakımı yetersiz",
      desc: "Havuz suyu bulutluydu.",
      gIdx: 3,
      hotelId: hotel1.id,
    },
    {
      category: "WRONG_ROOM",
      severity: "HIGH",
      status: "CLOSED",
      title: "Rezervasyon kaydı kayıp",
      desc: "Otelde kaydım yoktu. 2 saatte çözüldü.",
      gIdx: 4,
      hotelId: hotel2.id,
    },
    {
      category: "SAFETY_CONCERN",
      severity: "CRITICAL",
      status: "ESCALATED",
      title: "Düşme — ıslak zemin işareti yok",
      desc: "Spa girişinde kaygan zemin uyarısı yoktu. Misafir düştü.",
      gIdx: 5,
      hotelId: hotel1.id,
      withComp: true,
      compType: "SERVICE_VOUCHER",
      compCents: 20000,
    },
    {
      category: "FOOD_QUALITY",
      severity: "CRITICAL",
      status: "ESCALATED",
      title: "Allerji reaksiyonu",
      desc: "Fıstık alerjisi belirtilmesine rağmen fıstıklı yemek servis edildi.",
      gIdx: 6,
      hotelId: hotel1.id,
      withComp: true,
      compType: "FREE_NIGHT",
      compCents: 38000,
    },
    {
      category: "OTHER",
      severity: "MEDIUM",
      status: "RESOLVED",
      title: "Oda servisi gecikmesi — 90 dk",
      desc: "25 dk denildi, 90 dk'da geldi. Yemek soğuktu.",
      gIdx: 7,
      hotelId: hotel1.id,
      withComp: true,
      compType: "AMENITY_CREDIT",
      compCents: 5000,
    },
    {
      category: "AMENITY_MISSING",
      severity: "MEDIUM",
      status: "IN_PROGRESS",
      title: "Spa randevusu iptal — bildirim yok",
      desc: "Randevum iptal edildi ama bilgilendirilmedim.",
      gIdx: 8,
      hotelId: hotel1.id,
    },
    {
      category: "BILLING_ISSUE",
      severity: "LOW",
      status: "RESOLVED",
      title: "WiFi'dan ek ücret alındı",
      desc: "Sitede ücretsiz yazıyor ama faturada WiFi ücreti var.",
      gIdx: 9,
      hotelId: hotel1.id,
      withComp: true,
      compType: "PARTIAL_REFUND",
      compCents: 3000,
    },
    {
      category: "STAFF_BEHAVIOR",
      severity: "LOW",
      status: "CLOSED",
      title: "Housekeeping personeline övgü",
      desc: "Fatma Hanım olağanüstü hizmet verdi!",
      gIdx: 10,
      hotelId: hotel1.id,
    },
    {
      category: "OTHER",
      severity: "LOW",
      status: "CLOSED",
      title: "Front desk mükemmel",
      desc: "Elif Hanım İstanbul'u gezmemize inanılmaz yardımcı oldu.",
      gIdx: 11,
      hotelId: hotel1.id,
    },
    {
      category: "OTHER",
      severity: "LOW",
      status: "CLOSED",
      title: "Sürpriz doğum günü",
      desc: "Odama çiçek ve pasta gönderildi. Çok duygulandım!",
      gIdx: 12,
      hotelId: hotel2.id,
    },
    {
      category: "CHECK_IN_DELAY",
      severity: "HIGH",
      status: "RESOLVED",
      title: "Erken check-in — sabah uçuşu",
      desc: "Sabah 06:00 uçuşumuz için erken check-out gerekti.",
      gIdx: 13,
      hotelId: hotel1.id,
    },
    {
      category: "OTHER",
      severity: "MEDIUM",
      status: "AWAITING_HOTEL",
      title: "Geç check-out talebi",
      desc: "Toplantı var. Oda 16:00'ya kadar tutulabilir mi?",
      gIdx: 14,
      hotelId: hotel1.id,
    },
    {
      category: "ROOM_CLEANLINESS",
      severity: "HIGH",
      status: "RESOLVED",
      title: "Engelli oda değişikliği",
      desc: "Tekerlekli sandalye — erişim alanı yetersiz.",
      gIdx: 15,
      hotelId: hotel2.id,
      withComp: true,
      compType: "ROOM_UPGRADE",
      compCents: 0,
    },
    {
      category: "FOOD_QUALITY",
      severity: "MEDIUM",
      status: "IN_PROGRESS",
      title: "Restoran — bekleme süresi çok uzun",
      desc: "45 dk bekledik, rezervasyonumuz olmasına rağmen.",
      gIdx: 16,
      hotelId: hotel1.id,
    },
    {
      category: "SAFETY_CONCERN",
      severity: "CRITICAL",
      status: "ESCALATED",
      title: "Kayıp değerli eşya",
      desc: "Oda kasasındaki saat ve bilezik kayıp. Güvenlik kaydı istiyorum.",
      gIdx: 17,
      hotelId: hotel1.id,
      withComp: true,
      compType: "SERVICE_VOUCHER",
      compCents: 50000,
    },
    {
      category: "OTHER",
      severity: "LOW",
      status: "CLOSED",
      title: "Çocuk havuzu soğuktu",
      desc: "Isıtılacağı söylendi ama değildi.",
      gIdx: 18,
      hotelId: hotel1.id,
    },
    {
      category: "BILLING_ISSUE",
      severity: "HIGH",
      status: "OPEN",
      title: "Yeni şikayet — fatura tartışması",
      desc: "Check-out faturası tartışmalı, çözüme kavuşmadı.",
      gIdx: 19,
      hotelId: hotel1.id,
    },
    {
      category: "AMENITY_MISSING",
      severity: "LOW",
      status: "OPEN",
      title: "Loyalty puanı sorgulama",
      desc: "Son rezervasyondan puan almadım.",
      gIdx: 20,
      hotelId: hotel1.id,
    },
    {
      category: "OTHER",
      severity: "MEDIUM",
      status: "RESOLVED",
      title: "Fatura kopyası",
      desc: "İş seyahati için firma faturası gerekiyor.",
      gIdx: 21,
      hotelId: hotel2.id,
    },
    {
      category: "NOISE_COMPLAINT",
      severity: "HIGH",
      status: "RESOLVED",
      title: "Odada sigara kokusu",
      desc: "Sigara içilmeyen oda istedim ama koku var.",
      gIdx: 22,
      hotelId: hotel2.id,
      withComp: true,
      compType: "ROOM_UPGRADE",
      compCents: 0,
    },
    {
      category: "OTHER",
      severity: "LOW",
      status: "CLOSED",
      title: "Konsiyerj hizmetleri mükemmel",
      desc: "Tüm İstanbul programımızı planladılar.",
      gIdx: 23,
      hotelId: hotel1.id,
    },
    {
      category: "AC_BROKEN",
      severity: "HIGH",
      status: "RESOLVED",
      title: "Klima — 2 gün boyunca arızalı",
      desc: "Sıcak hava koşullarında klima çalışmadı.",
      gIdx: 24,
      hotelId: hotel1.id,
      withComp: true,
      compType: "PARTIAL_REFUND",
      compCents: 8000,
    },
  ];

  let caseCount = 0;
  for (const def of caseDefs) {
    const ref = `TST-CASE-${uid()}`;
    const sc = await findOrCreate(
      () =>
        db.supportCase.findFirst({
          where: {
            tenantId: tenant.id,
            title: def.title,
            hotelId: def.hotelId,
          },
        }),
      () =>
        db.supportCase.create({
          data: {
            tenantId: tenant.id,
            hotelId: def.hotelId,
            guestId: guests[def.gIdx % guests.length].id,
            caseRef: ref,
            category: def.category,
            severity: def.severity,
            status: def.status,
            title: def.title,
            description: def.desc,
            assignedToId:
              def.severity === "CRITICAL" || def.severity === "HIGH"
                ? (guestRelations?.id ?? null)
                : null,
            createdAt: daysAgo(Math.floor(Math.random() * 60) + 1),
          },
        }),
    );
    caseCount++;

    // Tazminat eylemi ekle
    if (def.withComp && def.compType) {
      const exComp = await db.compensationAction.findFirst({
        where: { caseId: sc.id },
      });
      if (!exComp) {
        await db.compensationAction.create({
          data: {
            tenantId: tenant.id,
            caseId: sc.id,
            compensationType: def.compType as any,
            description: "Yaşanan olumsuz deneyim için özür ve tazminat.",
            valueCents: def.compCents ?? 0,
            status: "APPROVED",
            requiresApproval:
              def.compCents && def.compCents > 10000 ? true : false,
          },
        });
      }
    }
  }
  console.log(`  ✓ ${caseCount} destek vakası oluşturuldu`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. EVENT REQUESTS (15 adet)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("\n── Etkinlik Talepleri ──────────────────────────────────────");

  const eventDefs: Array<{
    title: string;
    type:
      | "MEETING"
      | "CONFERENCE"
      | "WORKSHOP"
      | "WEDDING"
      | "GALA_DINNER"
      | "LAUNCH_EVENT"
      | "PRIVATE_EVENT"
      | "CORPORATE_RETREAT"
      | "BIRTHDAY"
      | "OTHER";
    pax: number;
    budget: number;
    status:
      | "INQUIRY"
      | "PROPOSAL_SENT"
      | "NEGOTIATING"
      | "CONFIRMED"
      | "CANCELLED"
      | "COMPLETED";
    gIdx: number;
  }> = [
    {
      title: "Kurumsal Yıllık Toplantı 2026",
      type: "CONFERENCE",
      pax: 120,
      budget: 5000000,
      status: "CONFIRMED",
      gIdx: 0,
    },
    {
      title: "Düğün Töreni & Resepsiyonu",
      type: "WEDDING",
      pax: 200,
      budget: 15000000,
      status: "CONFIRMED",
      gIdx: 1,
    },
    {
      title: "Ürün Lansmanı — Tech Firması",
      type: "LAUNCH_EVENT",
      pax: 80,
      budget: 3000000,
      status: "PROPOSAL_SENT",
      gIdx: 2,
    },
    {
      title: "Mezuniyet Gala Yemeği",
      type: "GALA_DINNER",
      pax: 300,
      budget: 8000000,
      status: "INQUIRY",
      gIdx: 3,
    },
    {
      title: "Team Building Etkinliği",
      type: "CORPORATE_RETREAT",
      pax: 50,
      budget: 1500000,
      status: "CONFIRMED",
      gIdx: 4,
    },
    {
      title: "Finans Sektörü Semineri",
      type: "WORKSHOP",
      pax: 40,
      budget: 800000,
      status: "CONFIRMED",
      gIdx: 5,
    },
    {
      title: "Özel Doğum Günü Partisi",
      type: "BIRTHDAY",
      pax: 30,
      budget: 500000,
      status: "CONFIRMED",
      gIdx: 6,
    },
    {
      title: "Nişan Töreni",
      type: "PRIVATE_EVENT",
      pax: 60,
      budget: 2000000,
      status: "NEGOTIATING",
      gIdx: 7,
    },
    {
      title: "Yönetim Kurulu Toplantısı",
      type: "MEETING",
      pax: 15,
      budget: 200000,
      status: "CONFIRMED",
      gIdx: 8,
    },
    {
      title: "Yıl Sonu Şirket Yemeği",
      type: "GALA_DINNER",
      pax: 100,
      budget: 3500000,
      status: "PROPOSAL_SENT",
      gIdx: 9,
    },
    {
      title: "Müşteri Takdir Gecesi",
      type: "GALA_DINNER",
      pax: 80,
      budget: 2500000,
      status: "CONFIRMED",
      gIdx: 10,
    },
    {
      title: "Sürdürülebilirlik Workshop",
      type: "WORKSHOP",
      pax: 25,
      budget: 300000,
      status: "INQUIRY",
      gIdx: 11,
    },
    {
      title: "Evlilik Yıl Dönümü Kutlaması",
      type: "PRIVATE_EVENT",
      pax: 20,
      budget: 400000,
      status: "CONFIRMED",
      gIdx: 12,
    },
    {
      title: "Startup Demo Day",
      type: "LAUNCH_EVENT",
      pax: 150,
      budget: 4000000,
      status: "NEGOTIATING",
      gIdx: 13,
    },
    {
      title: "Medya Basın Toplantısı",
      type: "CONFERENCE",
      pax: 60,
      budget: 600000,
      status: "CONFIRMED",
      gIdx: 14,
    },
  ];

  let eventCount = 0;
  for (let i = 0; i < eventDefs.length; i++) {
    const def = eventDefs[i];
    const ex = await db.eventRequest.findFirst({
      where: { tenantId: tenant.id, title: def.title },
    });
    if (ex) continue;
    await db.eventRequest.create({
      data: {
        tenantId: tenant.id,
        hotelId: hotel1.id,
        requesterId: guests[def.gIdx % guests.length].id,
        title: def.title,
        eventType: def.type,
        guestCount: def.pax,
        budgetCents: def.budget,
        status: def.status,
        eventDate: daysFromNow(30 + i * 10),
        startTime: "18:00",
        endTime: "23:00",
        requirements: { catering: true, av: true, decoration: i % 2 === 0 },
      },
    });
    eventCount++;
  }
  console.log(`  ✓ ${eventCount} etkinlik talebi oluşturuldu`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. DINING RESERVATIONS (20 adet — date/time alanları)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("\n── Yemek Rezervasyonları ───────────────────────────────────");

  const diningExp = await db.diningExperience.findFirst({
    where: { hotelId: hotel1.id },
  });

  if (diningExp) {
    const diningDefs = [
      {
        g: 0,
        pax: 2,
        date: daysFromNow(1),
        time: "19:30",
        status: "confirmed",
        notes: "Balayı yemeği — mum ışığı",
      },
      {
        g: 1,
        pax: 4,
        date: daysFromNow(2),
        time: "20:00",
        status: "confirmed",
        notes: null,
      },
      {
        g: 2,
        pax: 2,
        date: daysFromNow(3),
        time: "19:00",
        status: "confirmed",
        notes: "Vejetaryen menü",
      },
      {
        g: 3,
        pax: 6,
        date: daysFromNow(4),
        time: "20:30",
        status: "confirmed",
        notes: "Doğum günü kutlaması",
      },
      {
        g: 4,
        pax: 2,
        date: daysFromNow(5),
        time: "21:00",
        status: "pending",
        notes: null,
      },
      {
        g: 5,
        pax: 8,
        date: daysFromNow(6),
        time: "19:30",
        status: "confirmed",
        notes: "Helal yemek",
      },
      {
        g: 6,
        pax: 2,
        date: daysFromNow(7),
        time: "20:00",
        status: "confirmed",
        notes: "Pencere masası",
      },
      {
        g: 7,
        pax: 10,
        date: daysFromNow(8),
        time: "19:00",
        status: "pending",
        notes: "Kurumsal grup",
      },
      {
        g: 8,
        pax: 2,
        date: daysAgo(3),
        time: "20:00",
        status: "completed",
        notes: null,
      },
      {
        g: 9,
        pax: 4,
        date: daysAgo(5),
        time: "19:30",
        status: "completed",
        notes: "Yıl dönümü",
      },
      {
        g: 10,
        pax: 2,
        date: daysAgo(8),
        time: "21:00",
        status: "completed",
        notes: null,
      },
      {
        g: 11,
        pax: 3,
        date: daysAgo(10),
        time: "20:00",
        status: "completed",
        notes: "Çocuksuz masa",
      },
      {
        g: 12,
        pax: 2,
        date: daysFromNow(9),
        time: "19:00",
        status: "confirmed",
        notes: null,
      },
      {
        g: 13,
        pax: 5,
        date: daysFromNow(10),
        time: "20:30",
        status: "confirmed",
        notes: "Deniz ürünleri alerjisi",
      },
      {
        g: 14,
        pax: 4,
        date: daysAgo(1),
        time: "20:00",
        status: "completed",
        notes: "Chef's table",
      },
      {
        g: 15,
        pax: 2,
        date: daysFromNow(12),
        time: "19:30",
        status: "confirmed",
        notes: null,
      },
      {
        g: 16,
        pax: 6,
        date: daysAgo(15),
        time: "19:00",
        status: "cancelled",
        notes: "Misafir iptal etti",
      },
      {
        g: 17,
        pax: 2,
        date: daysFromNow(14),
        time: "20:00",
        status: "confirmed",
        notes: "Boğaz manzaralı masa",
      },
      {
        g: 18,
        pax: 3,
        date: daysFromNow(15),
        time: "21:00",
        status: "pending",
        notes: null,
      },
      {
        g: 19,
        pax: 2,
        date: daysFromNow(16),
        time: "20:30",
        status: "confirmed",
        notes: null,
      },
    ];

    let diningCount = 0;
    for (const def of diningDefs) {
      const g = guests[def.g % guests.length];
      const ex = await db.diningReservation.findFirst({
        where: {
          diningExperienceId: diningExp.id,
          guestId: g.id,
          date: def.date,
        },
      });
      if (ex) continue;
      await db.diningReservation.create({
        data: {
          tenantId: tenant.id,
          diningExperienceId: diningExp.id,
          guestId: g.id,
          partySize: def.pax,
          date: def.date,
          time: def.time,
          status: def.status,
          specialRequests: def.notes,
        },
      });
      diningCount++;
    }
    console.log(`  ✓ ${diningCount} yemek rezervasyonu oluşturuldu`);
  } else {
    console.log("  ℹ DiningExperience bulunamadı — atlandı");
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. NOTIFICATIONS (recipientId, subject, channel, type)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("\n── Bildirimler ─────────────────────────────────────────────");

  const notifDefs = [
    {
      gIdx: 0,
      type: "IN_APP",
      channel: "in_app",
      subject: "Rezervasyonunuz onaylandı",
      body: "Grand Palace Istanbul'daki rezervasyonunuz onaylandı.",
      status: "DELIVERED",
    },
    {
      gIdx: 1,
      type: "PUSH",
      channel: "push",
      subject: "Yarın check-in!",
      body: "Yarın check-in gününüz. Odanız sizi bekliyor.",
      status: "DELIVERED",
    },
    {
      gIdx: 2,
      type: "IN_APP",
      channel: "in_app",
      subject: "Servis talebiniz tamamlandı",
      body: "Havlu talebiniz yerine getirildi.",
      status: "DELIVERED",
    },
    {
      gIdx: 3,
      type: "EMAIL",
      channel: "email",
      subject: "Deneyiminizi paylaşır mısınız?",
      body: "Son konaklamanız hakkında görüşlerinizi bekliyoruz.",
      status: "SENT",
    },
    {
      gIdx: 4,
      type: "IN_APP",
      channel: "in_app",
      subject: "Destek vakanız güncellendi",
      body: "Şikayetiniz incelemeye alındı.",
      status: "DELIVERED",
    },
    {
      gIdx: 5,
      type: "EMAIL",
      channel: "email",
      subject: "Size özel %20 indirim!",
      body: "Sonraki konaklamanızda %20 indirim. Geçerlilik: 30 gün.",
      status: "SENT",
    },
    {
      gIdx: 6,
      type: "SMS",
      channel: "sms",
      subject: "Check-in bugün!",
      body: "Bugün check-in gününüz. Hoş geldiniz!",
      status: "DELIVERED",
    },
    {
      gIdx: 7,
      type: "IN_APP",
      channel: "in_app",
      subject: "Rezervasyon iptal edildi",
      body: "Rezervasyonunuz başarıyla iptal edildi. İade 3-5 gün.",
      status: "DELIVERED",
    },
    {
      gIdx: 8,
      type: "PUSH",
      channel: "push",
      subject: "Yeni spa paketi!",
      body: "Hamam & masaj kombinasyonu — %15 indirimle.",
      status: "SENT",
    },
    {
      gIdx: 9,
      type: "EMAIL",
      channel: "email",
      subject: "Klima sorunu çözüldü",
      body: "Teknik ekibimiz klimanızı tamir etti.",
      status: "DELIVERED",
    },
    {
      gIdx: 10,
      type: "IN_APP",
      channel: "in_app",
      subject: "Konaklamanızı değerlendirin",
      body: "2 dakikanızı ayırır mısınız?",
      status: "PENDING",
    },
    {
      gIdx: 11,
      type: "SMS",
      channel: "sms",
      subject: "Tazminat onaylandı",
      body: "Yaşanan sorun için 50$ kredi hesabınıza eklendi.",
      status: "DELIVERED",
    },
  ];

  let notifCount = 0;
  for (const def of notifDefs) {
    const g = guests[def.gIdx % guests.length];
    const ex = await db.notification.findFirst({
      where: { recipientId: g.id, subject: def.subject },
    });
    if (ex) continue;
    await db.notification.create({
      data: {
        tenantId: tenant.id,
        recipientId: g.id,
        type: def.type as any,
        channel: def.channel,
        subject: def.subject,
        body: def.body,
        status: def.status as any,
        sentAt:
          def.status !== "PENDING"
            ? hoursAgo(Math.floor(Math.random() * 48))
            : null,
        createdAt: hoursAgo(Math.floor(Math.random() * 72)),
      },
    });
    notifCount++;
  }
  console.log(`  ✓ ${notifCount} bildirim oluşturuldu`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 10. HOTEL INSIGHTS (insightType, title, description, data)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("\n── Otel Analizleri ─────────────────────────────────────────");

  const insightDefs = [
    {
      h: hotel1,
      type: "occupancy",
      cat: "revenue",
      title: "Doluluk oranı yüksek — bu hafta %87",
      desc: "Haftalık doluluk oranı geçen haftaya göre +5 puan arttı.",
      data: { value: 87.3, change: 5.0, unit: "%" },
      actionable: false,
      severity: "info",
    },
    {
      h: hotel1,
      type: "avg_daily_rate",
      cat: "revenue",
      title: "Ortalama gecelik ücret $285",
      desc: "ADR bu ay bütçenin %12 üzerinde.",
      data: { value: 285, currency: "USD" },
      actionable: false,
      severity: "info",
    },
    {
      h: hotel1,
      type: "revpar",
      cat: "revenue",
      title: "RevPAR $248 — rekor seviye",
      desc: "RevPAR bu çeyrekte tarihi yüksek.",
      data: { value: 248.1, currency: "USD" },
      actionable: false,
      severity: "info",
    },
    {
      h: hotel1,
      type: "nps_score",
      cat: "quality",
      title: "NPS skoru 72 — mükemmel",
      desc: "Son 30 günde 120 misafir değerlendirmesine göre.",
      data: { score: 72, promoters: 78, detractors: 6 },
      actionable: false,
      severity: "info",
    },
    {
      h: hotel1,
      type: "negative_review_spike",
      cat: "quality",
      title: "Olumsuz yorum artışı — klima şikayetleri",
      desc: "Son 7 günde klima şikayetleri %40 arttı. Teknik ekip bilgilendirilmeli.",
      data: { count: 14, category: "AC_BROKEN" },
      actionable: true,
      severity: "warning",
    },
    {
      h: hotel1,
      type: "cancellation_rate",
      cat: "operations",
      title: "İptal oranı %8 — normal seviye",
      desc: "Aylık iptal oranı sektör ortalamasında.",
      data: { rate: 8.2, benchmark: 9.5 },
      actionable: false,
      severity: "info",
    },
    {
      h: hotel1,
      type: "support_case_surge",
      cat: "quality",
      title: "Destek vakası artışı tespit edildi",
      desc: "Bu hafta billing şikayetleri normalin 2 katı.",
      data: { count: 8, category: "BILLING_ISSUE" },
      actionable: true,
      severity: "critical",
    },
    {
      h: hotel2,
      type: "occupancy",
      cat: "revenue",
      title: "Doluluk oranı %74",
      desc: "Sezon normali. Özel kampanya değerlendirilebilir.",
      data: { value: 73.8, change: -2.1, unit: "%" },
      actionable: true,
      severity: "info",
    },
    {
      h: hotel2,
      type: "avg_daily_rate",
      cat: "revenue",
      title: "Ortalama gecelik ücret $145",
      desc: "Rakip otellerle kıyaslandığında rekabetçi.",
      data: { value: 145, currency: "USD" },
      actionable: false,
      severity: "info",
    },
    {
      h: hotel2,
      type: "nps_score",
      cat: "quality",
      title: "NPS skoru 65",
      desc: "Son 30 günde 54 misafir değerlendirmesi.",
      data: { score: 65, promoters: 72, detractors: 7 },
      actionable: false,
      severity: "info",
    },
    {
      h: hotel1,
      type: "direct_booking_ratio",
      cat: "revenue",
      title: "Direkt rezervasyon oranı %34",
      desc: "OTA komisyon maliyeti azaltılabilir.",
      data: { ratio: 34.5, ota: 65.5 },
      actionable: true,
      severity: "info",
    },
    {
      h: hotel1,
      type: "staff_performance",
      cat: "operations",
      title: "En yüksek puan alan personel",
      desc: "Bu ay en fazla misafir takdiri alan 3 personel tespit edildi.",
      data: { top: ["Elif Kaya", "Fatma Demir", "Mehmet Yılmaz"] },
      actionable: false,
      severity: "info",
    },
  ];

  let insightCount = 0;
  for (const def of insightDefs) {
    const ex = await db.hotelInsight.findFirst({
      where: { hotelId: def.h.id, title: def.title },
    });
    if (ex) continue;
    await db.hotelInsight.create({
      data: {
        tenantId: tenant.id,
        hotelId: def.h.id,
        insightType: def.type,
        category: def.cat,
        title: def.title,
        description: def.desc,
        data: def.data,
        isActionable: def.actionable,
        severity: def.severity,
        createdAt: daysAgo(Math.floor(Math.random() * 7)),
      },
    });
    insightCount++;
  }
  console.log(`  ✓ ${insightCount} otel analizi oluşturuldu`);

  // ─── Özet ────────────────────────────────────────────────────────────────
  console.log("\n════════════════════════════════════════════════════════════");
  console.log("✅  seed-testing.ts tamamlandı!");
  console.log(`    • ${guests.length} misafir`);
  console.log(`    • ${createdBookings.length} rezervasyon`);
  console.log(`    • ${createdSessions.length} aktif stay session`);
  console.log(`    • ${srCount} servis talebi`);
  console.log(`    • ${reviewCount} yorum`);
  console.log(`    • ${caseCount} destek vakası`);
  console.log(`    • ${eventCount} etkinlik talebi`);
  console.log(`    • ${notifCount} bildirim`);
  console.log(`    • ${insightCount} otel analizi`);
  console.log("════════════════════════════════════════════════════════════");
}

main()
  .catch((e) => {
    console.error("❌ Hata:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
