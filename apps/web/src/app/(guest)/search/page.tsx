"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import {
  Search,
  MapPin,
  Star,
  Wifi,
  ChevronRight,
  SlidersHorizontal,
  Calendar,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

const POPULAR_DESTINATIONS = [
  { label: "Istanbul", display: "İstanbul", emoji: "🕌" },
  { label: "Kapadokya", display: "Kapadokya", emoji: "🎈" },
  { label: "Bodrum", display: "Bodrum", emoji: "⛵" },
  { label: "Antalya", display: "Antalya", emoji: "🌊" },
  { label: "Izmir", display: "İzmir", emoji: "☀️" },
  { label: "Trabzon", display: "Trabzon", emoji: "🏔️" },
];

const STAR_FILTERS = [
  { label: "Tümü", value: undefined },
  { label: "5★", value: 5 },
  { label: "4★", value: 4 },
  { label: "3★", value: 3 },
];

type HotelResult = {
  id: string;
  name: string;
  slug: string;
  city: string;
  status: string;
  address: { city: string; country: string; [key: string]: unknown };
  starRating?: number;
  description?: string;
  shortDescription?: string;
  photos: string[];
  amenities: string[];
  wifiQuality?: string;
  reviews: { overallScore: number }[];
  roomTypes: { inventory: { pricePerNight: number }[] }[];
};

export default function SearchPage() {
  const [filters, setFilters] = useState({
    city: "",
    checkIn: "",
    checkOut: "",
    guestCount: 1,
    starRating: undefined as number | undefined,
  });

  const [search, setSearch] = useState({
    city: "",
    checkIn: "",
    checkOut: "",
    guestCount: 1,
    starRating: undefined as number | undefined,
  });

  const [hasSearched, setHasSearched] = useState(false);

  const { data: rawData, isLoading } = trpc.hotel.search.useQuery({
    city: search.city || undefined,
    checkIn: search.checkIn || undefined,
    checkOut: search.checkOut || undefined,
    guestCount: search.guestCount,
    starRating: search.starRating,
  });

  const data = rawData as { items: HotelResult[]; total: number } | undefined;

  const filteredItems = data?.items ?? [];

  const normalizeCity = (c: string) =>
    c
      .replace(/İ/g, "I")
      .replace(/ı/g, "i")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/I/g, "I");

  const handleSearch = () => {
    setSearch({
      city: filters.city ? normalizeCity(filters.city) : "",
      checkIn: filters.checkIn,
      checkOut: filters.checkOut,
      guestCount: filters.guestCount,
      starRating: filters.starRating,
    });
    setHasSearched(true);
  };

  const inputStyle = {
    backgroundColor: "rgb(var(--nv-surface))",
    border: "1px solid rgb(var(--nv-border) / 0.12)",
    color: "rgb(var(--nv-text))",
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "rgb(var(--nv-bg))" }}
    >
      {/* Hero Search */}
      <div className="nv-hero dot-grid relative overflow-hidden px-6 py-16">
        <div
          className="pointer-events-none absolute left-1/3 top-0 h-[300px] w-[300px] rounded-full blur-[100px]"
          style={{ backgroundColor: "rgb(249 115 22 / 0.08)" }}
        />
        <div
          className="pointer-events-none absolute bottom-0 right-1/3 h-[300px] w-[300px] rounded-full blur-[100px]"
          style={{ backgroundColor: "rgb(var(--nv-border) / 0.06)" }}
        />

        <div className="relative mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center"
          >
            <p
              className="mb-2 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#f97316" }}
            >
              Nuvoya ile keşfet
            </p>
            <h1
              className="text-3xl font-bold md:text-5xl"
              style={{ color: "rgb(var(--nv-text))" }}
            >
              Bir sonraki maceranı bul
            </h1>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl p-3"
            style={{
              backgroundColor: "rgb(var(--nv-surface))",
              border: "1px solid rgb(var(--nv-border) / 0.10)",
              boxShadow: "0 4px 24px rgb(var(--nv-shadow) / 0.08)",
            }}
          >
            <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
              <div className="relative">
                <MapPin
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: "rgb(var(--nv-dim))" }}
                />
                <input
                  placeholder="Şehir veya destinasyon"
                  value={filters.city}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, city: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full rounded-xl py-3 pl-9 pr-4 text-sm outline-none transition"
                  style={{ ...inputStyle, borderRadius: "0.75rem" }}
                />
              </div>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: "rgb(var(--nv-dim))" }}
                />
                <input
                  type="date"
                  value={filters.checkIn}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, checkIn: e.target.value }))
                  }
                  className="w-full rounded-xl py-3 pl-9 pr-4 text-sm outline-none transition"
                  style={{ ...inputStyle, borderRadius: "0.75rem" }}
                />
              </div>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: "rgb(var(--nv-dim))" }}
                />
                <input
                  type="date"
                  value={filters.checkOut}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, checkOut: e.target.value }))
                  }
                  className="w-full rounded-xl py-3 pl-9 pr-4 text-sm outline-none transition"
                  style={{ ...inputStyle, borderRadius: "0.75rem" }}
                />
              </div>
              <button
                onClick={handleSearch}
                className="nv-btn-primary rounded-xl py-3"
              >
                <Search className="h-4 w-4" />
                Ara
              </button>
            </div>
          </motion.div>

          {/* Popular Destinations */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-5 flex flex-wrap items-center justify-center gap-2"
          >
            <span className="text-xs" style={{ color: "rgb(var(--nv-dim))" }}>
              Popüler:
            </span>
            {POPULAR_DESTINATIONS.map((dest) => (
              <button
                key={dest.label}
                onClick={() => {
                  setFilters((f) => ({ ...f, city: dest.display }));
                  setSearch((s) => ({ ...s, city: dest.label }));
                  setHasSearched(true);
                }}
                className="nv-pill flex items-center gap-1.5"
              >
                <span>{dest.emoji}</span>
                {dest.display}
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Results Area */}
      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Filters Row */}
        {hasSearched && (
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal
                className="h-4 w-4"
                style={{ color: "rgb(var(--nv-dim))" }}
              />
              <span
                className="text-sm"
                style={{ color: "rgb(var(--nv-muted))" }}
              >
                Filtrele:
              </span>
              <div className="flex gap-2">
                {STAR_FILTERS.map((f) => (
                  <button
                    key={f.label}
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, starRating: f.value }));
                      setSearch((prev) => ({ ...prev, starRating: f.value }));
                    }}
                    className="nv-pill text-xs"
                    style={
                      filters.starRating === f.value
                        ? {
                            backgroundColor: "#f97316",
                            borderColor: "transparent",
                            color: "white",
                          }
                        : {}
                    }
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            {data && (
              <p className="text-sm" style={{ color: "rgb(var(--nv-dim))" }}>
                {filteredItems.length} otel bulundu
              </p>
            )}
          </div>
        )}

        {/* States */}
        {!hasSearched ? (
          <EmptyState />
        ) : isLoading ? (
          <LoadingState />
        ) : !filteredItems.length ? (
          <NoResultsState city={search.city} />
        ) : (
          <div className="space-y-4">
            {filteredItems.map((hotel, i) => (
              <HotelCard key={hotel.id} hotel={hotel} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HotelCard({ hotel, index }: { hotel: HotelResult; index: number }) {
  const avgScore =
    hotel.reviews.length > 0
      ? Math.round(
          (hotel.reviews.reduce((s, r) => s + r.overallScore, 0) /
            hotel.reviews.length) *
            10,
        ) / 10
      : null;

  const allPrices = hotel.roomTypes.flatMap((r) =>
    r.inventory.map((inv) => inv.pricePerNight),
  );
  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) / 100 : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="nv-card p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Name & Stars */}
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <h2
              className="text-lg font-bold"
              style={{ color: "rgb(var(--nv-text))" }}
            >
              {hotel.name}
            </h2>
            {hotel.starRating && (
              <div className="flex">
                {Array.from({ length: hotel.starRating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5 fill-[#fb923c] text-[#fb923c]"
                  />
                ))}
              </div>
            )}
            {hotel.status === "ACTIVE" && (
              <span className="rounded-full border border-[#67dc9f]/30 bg-[#67dc9f]/10 px-2 py-0.5 text-xs text-[#67dc9f]">
                Doğrulandı ✓
              </span>
            )}
          </div>

          {/* Location */}
          <p
            className="mb-2 flex items-center gap-1 text-sm"
            style={{ color: "rgb(var(--nv-dim))" }}
          >
            <MapPin className="h-3.5 w-3.5" />
            {(hotel.address as Record<string, string>)?.city},{" "}
            {(hotel.address as Record<string, string>)?.country}
          </p>

          {/* Description */}
          {hotel.shortDescription && (
            <p
              className="mb-3 line-clamp-2 text-sm"
              style={{ color: "rgb(var(--nv-muted))" }}
            >
              {hotel.shortDescription}
            </p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {hotel.wifiQuality && (
              <span className="flex items-center gap-1 rounded-full border border-[#60a5fa]/20 bg-[#60a5fa]/10 px-2.5 py-1 text-xs text-[#60a5fa]">
                <Wifi className="h-3 w-3" /> {hotel.wifiQuality} Wi-Fi
              </span>
            )}
            {(hotel.amenities as string[]).slice(0, 3).map((a) => (
              <span
                key={a}
                className="rounded-full px-2.5 py-1 text-xs"
                style={{
                  border: "1px solid rgb(var(--nv-border) / 0.08)",
                  backgroundColor: "rgb(var(--nv-border) / 0.04)",
                  color: "rgb(var(--nv-muted))",
                }}
              >
                {a}
              </span>
            ))}
          </div>
        </div>

        {/* Right side */}
        <div className="flex shrink-0 flex-col items-end gap-3">
          {avgScore && (
            <div className="text-right">
              <div className="flex items-baseline gap-0.5">
                <span
                  className="text-2xl font-bold"
                  style={{ color: "rgb(var(--nv-text))" }}
                >
                  {avgScore}
                </span>
                <span
                  className="text-sm"
                  style={{ color: "rgb(var(--nv-dim))" }}
                >
                  /10
                </span>
              </div>
              <p className="text-xs" style={{ color: "rgb(var(--nv-dim))" }}>
                {hotel.reviews.length} yorum
              </p>
            </div>
          )}
          {minPrice && (
            <div className="text-right">
              <p className="text-xs" style={{ color: "rgb(var(--nv-dim))" }}>
                itibaren
              </p>
              <p className="text-lg font-bold" style={{ color: "#f97316" }}>
                ${minPrice}
              </p>
            </div>
          )}
          <Link href={`/hotel/${hotel.slug}`} className="nv-btn-primary">
            İncele <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div className="py-20 text-center">
      <div
        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{
          border: "1px solid rgb(var(--nv-border) / 0.12)",
          backgroundColor: "rgb(var(--nv-border) / 0.05)",
        }}
      >
        <Sparkles className="h-8 w-8" style={{ color: "#f97316" }} />
      </div>
      <h3
        className="mb-2 text-lg font-bold"
        style={{ color: "rgb(var(--nv-text))" }}
      >
        Nereye gidiyorsun?
      </h3>
      <p className="text-sm" style={{ color: "rgb(var(--nv-dim))" }}>
        Bir şehir yaz veya yukarıdan popüler destinasyonlardan birini seç.
      </p>
      <div className="mt-8">
        <Link
          href="/guides"
          className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
          style={{ color: "#f97316" }}
        >
          Destinasyon rehberlerine göz at <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-36 animate-pulse rounded-2xl"
          style={{
            border: "1px solid rgb(var(--nv-border) / 0.08)",
            backgroundColor: "rgb(var(--nv-surface))",
          }}
        />
      ))}
    </div>
  );
}

function NoResultsState({ city }: { city: string }) {
  return (
    <div className="py-20 text-center">
      <div
        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{
          border: "1px solid rgb(var(--nv-border) / 0.12)",
          backgroundColor: "rgb(var(--nv-border) / 0.05)",
        }}
      >
        <MapPin className="h-8 w-8" style={{ color: "rgb(var(--nv-dim))" }} />
      </div>
      <h3
        className="mb-2 text-lg font-bold"
        style={{ color: "rgb(var(--nv-text))" }}
      >
        {city ? `"${city}" için sonuç bulunamadı` : "Sonuç bulunamadı"}
      </h3>
      <p className="text-sm" style={{ color: "rgb(var(--nv-dim))" }}>
        Farklı bir şehir dene veya tarihleri değiştir.
      </p>
    </div>
  );
}
