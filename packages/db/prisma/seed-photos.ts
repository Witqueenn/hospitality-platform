/**
 * seed-photos.ts
 * Fills the `photos` JSON field on Hotel, RoomType, Venue, DiningExperience,
 * and NightExperience records with curated Unsplash images.
 * Safe to re-run — overwrites photos every time (idempotent).
 *
 * Run:
 *   DATABASE_URL="postgresql://dev:devpass@localhost:5432/hospitality_platform" \
 *   ./packages/db/node_modules/.bin/tsx packages/db/prisma/seed-photos.ts
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Unsplash photo object shape used across the app */
function photo(id: string, alt: string, credit: string) {
  return {
    url: `https://images.unsplash.com/photo-${id}?w=1200&q=80&fit=crop`,
    thumb: `https://images.unsplash.com/photo-${id}?w=400&q=70&fit=crop`,
    alt,
    credit,
  };
}

// ── Photo libraries ───────────────────────────────────────────────────────────

// Grand Palace Istanbul — hero + gallery
const GPI_HOTEL_PHOTOS = [
  photo(
    "1566073771259-6a8506099945",
    "Grand Palace Istanbul exterior at dusk",
    "Rawan Yasser / Unsplash",
  ),
  photo(
    "1535827841776-24aeda35f2a1",
    "Grand Palace lobby with Ottoman chandeliers",
    "Dan Gold / Unsplash",
  ),
  photo(
    "1571003123894-1f0594d2b5d9",
    "Rooftop pool overlooking the Bosphorus",
    "Humphrey Muleba / Unsplash",
  ),
  photo(
    "1414235077428-338989a2e8c0",
    "Fine dining restaurant at Grand Palace",
    "Jay Wennington / Unsplash",
  ),
  photo(
    "1540555700478-4be289fbecef",
    "Turkish hammam spa",
    "Raphael Lovaski / Unsplash",
  ),
  photo(
    "1524231757912-21f4fe3a7200",
    "Bosphorus strait panorama from the hotel",
    "Fatih Turan / Unsplash",
  ),
];

// Deluxe Bosphorus Room
const GPI_DELUXE_PHOTOS = [
  photo(
    "1631049307264-da0ec9d70304",
    "Deluxe room with Bosphorus view",
    "Piotr Chrobot / Unsplash",
  ),
  photo(
    "1595576508898-0ad5c2c8e8b4",
    "King bed with Ottoman décor",
    "Andrea Davis / Unsplash",
  ),
  photo(
    "1552321554-5fefe8c9ef14",
    "Marble ensuite bathroom with rain shower",
    "Roberto Nickson / Unsplash",
  ),
];

// Executive Suite
const GPI_EXEC_PHOTOS = [
  photo(
    "1582719478250-c89cae4dc85b",
    "Executive suite living area",
    "Olia Nayda / Unsplash",
  ),
  photo(
    "1560448204-e02f11c3d0e2",
    "Private terrace with city panorama",
    "Filios Sazeides / Unsplash",
  ),
  photo(
    "1571896349842-33c89424de2d",
    "Suite jacuzzi with Bosphorus view",
    "Roberto Nickson / Unsplash",
  ),
];

// Superior Double
const GPI_SUPERIOR_PHOTOS = [
  photo(
    "1566665797739-167f0f8e6d7d",
    "Superior double room",
    "Max Vakhtbovych / Unsplash",
  ),
  photo(
    "1595599487165-4f7fae7b4a4e",
    "Work desk and city view",
    "Spacejoy / Unsplash",
  ),
];

// Twin Room
const GPI_TWIN_PHOTOS = [
  photo(
    "1520250497591-112f2f40a3f4",
    "Twin room with garden view",
    "Roberto Nickson / Unsplash",
  ),
  photo(
    "1522771739844-6a9f6a0981f1",
    "Comfortable twin beds",
    "Spacejoy / Unsplash",
  ),
];

// ── Athens Boutique ───────────────────────────────────────────────────────────

const ATH_HOTEL_PHOTOS = [
  photo(
    "1555993539-1732b0258235",
    "Athens Boutique hotel with Acropolis backdrop",
    "Constantinos Kollias / Unsplash",
  ),
  photo(
    "1502672260266-1c1ef2d93688",
    "Rooftop terrace with Acropolis view",
    "Dawid Zawiła / Unsplash",
  ),
  photo(
    "1534766438357-2b270dbd1b40",
    "Greek breakfast on the terrace",
    "Brooke Lark / Unsplash",
  ),
  photo(
    "1455587734955-081b22074882",
    "Boutique lobby with marble floors",
    "Héctor J. Rivas / Unsplash",
  ),
  photo(
    "1551882547-ff40c4a49b47",
    "Cozy boutique hotel corridor",
    "Andrea Davis / Unsplash",
  ),
  photo(
    "1476514525535-07fb3b4ae5f1",
    "Athens old town view from the hotel",
    "Andy Holmes / Unsplash",
  ),
];

// Classic Double
const ATH_CLASSIC_PHOTOS = [
  photo(
    "1522771739844-6a9f6a0981f1",
    "Classic double room with Greek décor",
    "Spacejoy / Unsplash",
  ),
  photo(
    "1560184897-ae75f418493e",
    "City-view classic room",
    "Im3rd Media / Unsplash",
  ),
];

// Acropolis View Suite
const ATH_ACROPOLIS_PHOTOS = [
  photo(
    "1602028915047-37269d1a73f7",
    "Acropolis View Suite lounge",
    "Wout Vanacker / Unsplash",
  ),
  photo(
    "1578683010236-d716f9a3f461",
    "Suite marble bathroom",
    "Sidekix Media / Unsplash",
  ),
  photo(
    "1559508551-44bff1de756b",
    "Private suite balcony with Acropolis view",
    "Sasha Kaunas / Unsplash",
  ),
];

// Garden Studio
const ATH_STUDIO_PHOTOS = [
  photo(
    "1505691938895-1758d7feb511",
    "Garden studio with terrace",
    "Roberto Nickson / Unsplash",
  ),
  photo(
    "1484101403633-562f891dc89a",
    "Studio kitchenette",
    "Sidekix Media / Unsplash",
  ),
];

// Family Suite
const ATH_FAMILY_PHOTOS = [
  photo(
    "1586023492125-27b2c045efd1",
    "Family suite connecting rooms",
    "Spacejoy / Unsplash",
  ),
  photo(
    "1596436870631-4f5eed3a3b8d",
    "Bunk bed room for children",
    "Collov Home Design / Unsplash",
  ),
];

// ── Venue photos ──────────────────────────────────────────────────────────────

const GPI_BALLROOM_PHOTOS = [
  photo(
    "1519167758481-83f550bb49b3",
    "Grand Ballroom set for gala dinner",
    "Foto Sushi / Unsplash",
  ),
  photo(
    "1478147427282-58a87a702b70",
    "Ballroom stage with lighting",
    "Samantha Gades / Unsplash",
  ),
];

const GPI_TERRACE_PHOTOS = [
  photo(
    "1470229722913-7c0e2dbbafd3",
    "Ottoman Terrace wedding set-up",
    "Anthony DELANOIX / Unsplash",
  ),
  photo(
    "1511795409834-ef04bbd61622",
    "Terrace dinner with Bosphorus sunset",
    "Kseniya Lapteva / Unsplash",
  ),
];

const ATH_TERRACE_PHOTOS = [
  photo(
    "1549294413-26f195200391",
    "Rooftop terrace set for wedding ceremony",
    "Thomas AE / Unsplash",
  ),
  photo(
    "1464366400600-7168b8af9bc3",
    "Terrace sunset with Acropolis view",
    "Mathew Schwartz / Unsplash",
  ),
];

// ── Dining photos ──────────────────────────────────────────────────────────────

const GPI_DINING_PHOTOS = [
  photo(
    "1414235077428-338989a2e8c0",
    "Istanbul Bosphorus Restaurant — table setting",
    "Jay Wennington / Unsplash",
  ),
  photo(
    "1551218808-d0d9f8d3a5c5",
    "Restaurant interior with Bosphorus view",
    "Jay Wennington / Unsplash",
  ),
  photo(
    "1481833761820-0509d3217039",
    "Breakfast spread at Grand Palace",
    "Brooke Lark / Unsplash",
  ),
];

const ATH_DINING_PHOTOS = [
  photo(
    "1534766438357-2b270dbd1b40",
    "Greek mezze breakfast on the terrace",
    "Brooke Lark / Unsplash",
  ),
  photo(
    "1555396273-367ea4eb4db5",
    "Athens Boutique restaurant interior",
    "Robin Stickel / Unsplash",
  ),
  photo(
    "1490645935967-10de6ba17061",
    "Fresh Greek produce and dishes",
    "Brooke Lark / Unsplash",
  ),
];

// ── Night experience photos ───────────────────────────────────────────────────

const GPI_NIGHT_PHOTOS = [
  photo(
    "1566417713940-fe7c737a9ef2",
    "Rooftop bar at night — Istanbul skyline",
    "Kelsey Chance / Unsplash",
  ),
  photo(
    "1514362545857-3bc16c4c7d1b",
    "Cocktail hour at Grand Palace bar",
    "Adam Jaime / Unsplash",
  ),
];

const ATH_NIGHT_PHOTOS = [
  photo(
    "1470229722913-7c0e2dbbafd3",
    "Athens rooftop bar at dusk",
    "Anthony DELANOIX / Unsplash",
  ),
  photo(
    "1516997121675-4c2d1684aa3e",
    "Live bouzouki music evening",
    "Kelsey Chance / Unsplash",
  ),
];

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("=== seed-photos.ts starting ===\n");

  const tenant = await db.tenant.findFirst({ where: { slug: "grand-hotels" } });
  if (!tenant) throw new Error("Tenant not found. Run seed.ts first.");

  const hotel1 = await db.hotel.findFirst({
    where: { tenantId: tenant.id, slug: "grand-palace-istanbul" },
  });
  const hotel2 = await db.hotel.findFirst({
    where: { tenantId: tenant.id, slug: "boutique-athens" },
  });
  if (!hotel1 || !hotel2)
    throw new Error("Hotels not found. Run seed.ts first.");

  // ── Hotels ────────────────────────────────────────────────────────────────
  console.log("── Hotels ───────────────────────────────────────────────────");

  await db.hotel.update({
    where: { id: hotel1.id },
    data: { photos: GPI_HOTEL_PHOTOS },
  });
  console.log(`  ✓ Grand Palace Istanbul — ${GPI_HOTEL_PHOTOS.length} photos`);

  await db.hotel.update({
    where: { id: hotel2.id },
    data: { photos: ATH_HOTEL_PHOTOS },
  });
  console.log(`  ✓ Athens Boutique — ${ATH_HOTEL_PHOTOS.length} photos`);

  // ── Room Types ────────────────────────────────────────────────────────────
  console.log(
    "\n── Room Types ───────────────────────────────────────────────",
  );

  const roomPhotoMap: Record<string, typeof GPI_DELUXE_PHOTOS> = {
    // Grand Palace Istanbul
    "Deluxe Bosphorus Room": GPI_DELUXE_PHOTOS,
    "Executive Suite": GPI_EXEC_PHOTOS,
    "Superior Double": GPI_SUPERIOR_PHOTOS,
    "Twin Room": GPI_TWIN_PHOTOS,
    "Deluxe King — Bosphorus View": [
      photo(
        "1618773928121-c32242e63f39",
        "Deluxe king room with Bosphorus panorama",
        "Piotr Chrobot / Unsplash",
      ),
      photo(
        "1560448204-e02f11c3d0e2",
        "King bed with floor-to-ceiling windows",
        "Filios Sazeides / Unsplash",
      ),
      photo(
        "1512918728672-56cf88e2041b",
        "Ensuite with marble vanity and rain shower",
        "Roberto Nickson / Unsplash",
      ),
    ],
    "Junior Suite": [
      photo(
        "1590490360182-c33d57733427",
        "Junior suite lounge area",
        "Olia Nayda / Unsplash",
      ),
      photo(
        "1578683010236-d716f9a3f461",
        "Junior suite marble bathroom",
        "Sidekix Media / Unsplash",
      ),
      photo(
        "1595599487165-4f7fae7b4a4e",
        "Suite work desk with city view",
        "Spacejoy / Unsplash",
      ),
    ],
    "Deluxe Twin": [
      photo(
        "1631049552240-59c37f38802b",
        "Deluxe twin room with Bosphorus view",
        "Max Vakhtbovych / Unsplash",
      ),
      photo(
        "1522771739844-6a9f6a0981f1",
        "Twin beds with premium linens",
        "Spacejoy / Unsplash",
      ),
    ],
    // Athens Boutique
    "Classic Double": ATH_CLASSIC_PHOTOS,
    "Acropolis View Suite": ATH_ACROPOLIS_PHOTOS,
    "Garden Studio": ATH_STUDIO_PHOTOS,
    "Family Suite": ATH_FAMILY_PHOTOS,
  };

  const allRoomTypes = await db.roomType.findMany({
    where: { tenantId: tenant.id },
  });
  for (const rt of allRoomTypes) {
    const photos = roomPhotoMap[rt.name];
    if (!photos) {
      console.log(`  skip (no photos defined): ${rt.name}`);
      continue;
    }
    await db.roomType.update({ where: { id: rt.id }, data: { photos } });
    console.log(`  ✓ ${rt.name} — ${photos.length} photos`);
  }

  // ── Venues ────────────────────────────────────────────────────────────────
  console.log(
    "\n── Venues ───────────────────────────────────────────────────",
  );

  const venues = await db.venue.findMany({ where: { tenantId: tenant.id } });
  for (const v of venues) {
    let photos: typeof GPI_BALLROOM_PHOTOS | null = null;
    if (/ballroom/i.test(v.name)) photos = GPI_BALLROOM_PHOTOS;
    else if (/ottoman/i.test(v.name)) photos = GPI_TERRACE_PHOTOS;
    else if (/rooftop|terrace/i.test(v.name)) {
      photos =
        v.hotelId === hotel1.id ? GPI_TERRACE_PHOTOS : ATH_TERRACE_PHOTOS;
    }
    if (!photos) {
      // fallback — use hotel-appropriate generic photos
      photos =
        v.hotelId === hotel1.id ? [GPI_HOTEL_PHOTOS[0]] : [ATH_HOTEL_PHOTOS[0]];
    }
    await db.venue.update({ where: { id: v.id }, data: { photos } });
    console.log(`  ✓ ${v.name} — ${photos.length} photos`);
  }

  // ── Dining Experiences ────────────────────────────────────────────────────
  console.log(
    "\n── Dining Experiences ───────────────────────────────────────",
  );

  const dinings = await db.diningExperience.findMany({
    where: { tenantId: tenant.id },
  });
  for (const d of dinings) {
    const photos =
      d.hotelId === hotel1.id ? GPI_DINING_PHOTOS : ATH_DINING_PHOTOS;
    await db.diningExperience.update({ where: { id: d.id }, data: { photos } });
    console.log(`  ✓ ${d.name} — ${photos.length} photos`);
  }

  // ── Night Experiences ─────────────────────────────────────────────────────
  console.log(
    "\n── Night Experiences ────────────────────────────────────────",
  );

  const nights = await db.nightExperience.findMany({
    where: { tenantId: tenant.id },
  });
  for (const n of nights) {
    const photos =
      n.hotelId === hotel1.id ? GPI_NIGHT_PHOTOS : ATH_NIGHT_PHOTOS;
    await db.nightExperience.update({ where: { id: n.id }, data: { photos } });
    console.log(`  ✓ ${n.name} — ${photos.length} photos`);
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n=== seed-photos.ts done ===");
  console.log(`  Hotels           : 2`);
  console.log(`  Room types       : ${allRoomTypes.length}`);
  console.log(`  Venues           : ${venues.length}`);
  console.log(`  Dining           : ${dinings.length}`);
  console.log(`  Night exp.       : ${nights.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
