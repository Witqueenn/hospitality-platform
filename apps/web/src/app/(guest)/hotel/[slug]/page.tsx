"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Star,
  Wifi,
  MapPin,
  Users,
  Bed,
  Maximize2,
  ArrowLeft,
  ChevronRight,
  UtensilsCrossed,
  Music,
  MessageSquare,
  Shield,
} from "lucide-react";

// Placeholder images for each section
const HOTEL_PLACEHOLDERS = [
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80",
  "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&q=80",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80",
  "https://images.unsplash.com/photo-1455587734955-081b22074882?w=1200&q=80",
];
const ROOM_PLACEHOLDERS = [
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80",
  "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80",
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80",
];
const DINING_PLACEHOLDERS = [
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80",
];
const NIGHT_PLACEHOLDERS = [
  "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800&q=80",
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
];

const TABS = ["Odalar", "Yeme & İçme", "Gece Hayatı", "Yorumlar"] as const;
type Tab = (typeof TABS)[number];

const WIFI_COLORS: Record<string, string> = {
  excellent: "rgba(103,220,159,0.15)",
  good: "rgba(96,165,250,0.15)",
  fair: "rgba(251,191,36,0.15)",
  poor: "rgba(239,68,68,0.15)",
};
const WIFI_TEXT: Record<string, string> = {
  excellent: "#67dc9f",
  good: "#60a5fa",
  fair: "#fbbf24",
  poor: "#ef4444",
};

export default function HotelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [activeTab, setActiveTab] = useState<Tab>("Odalar");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestCount, setGuestCount] = useState(1);

  const {
    data: hotel,
    isLoading,
    error,
  } = trpc.hotel.getBySlug.useQuery({ slug }, { enabled: !!slug });

  if (isLoading) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: "rgb(var(--nv-bg))" }}
      >
        <div
          className="h-[55vh] animate-pulse"
          style={{ backgroundColor: "rgb(var(--nv-surface))" }}
        />
        <div className="mx-auto max-w-5xl space-y-4 px-6 py-10">
          <div
            className="h-9 w-64 animate-pulse rounded-xl"
            style={{ backgroundColor: "rgb(var(--nv-surface))" }}
          />
          <div
            className="h-5 w-48 animate-pulse rounded-lg"
            style={{ backgroundColor: "rgb(var(--nv-surface))" }}
          />
          <div
            className="h-32 animate-pulse rounded-2xl"
            style={{ backgroundColor: "rgb(var(--nv-surface))" }}
          />
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
        style={{ backgroundColor: "rgb(var(--nv-bg))" }}
      >
        <h2
          className="mb-3 text-xl font-bold"
          style={{ color: "rgb(var(--nv-text))" }}
        >
          Otel bulunamadı
        </h2>
        <button
          onClick={() => router.push("/search")}
          className="mt-2 flex items-center gap-1.5 text-sm hover:underline"
          style={{ color: "#f97316" }}
        >
          <ArrowLeft className="h-4 w-4" /> Sonuçlara dön
        </button>
      </div>
    );
  }

  type HotelPhoto = { url: string; thumb: string; alt: string; credit: string };
  type HotelDetail = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    shortDescription: string | null;
    starRating: number | null;
    address: Record<string, string>;
    wifiQuality: string | null;
    noiseNotes: string | null;
    amenities: unknown;
    photos: HotelPhoto[];
    roomTypes: {
      id: string;
      name: string;
      bedType: string;
      capacity: number;
      sizeSqm: number | null;
      description: string | null;
      baseRateCents?: number;
      features: unknown;
      photos: HotelPhoto[];
    }[];
    diningExperiences: {
      id: string;
      name: string;
      diningType: string;
      description: string | null;
      capacity: number | null;
      priceRange: string | null;
      photos: HotelPhoto[];
    }[];
    nightExperiences: {
      id: string;
      name: string;
      experienceType: string;
      description: string | null;
      priceCents: number | null;
      photos: HotelPhoto[];
    }[];
    reviews: {
      id: string;
      overallScore: number;
      title: string | null;
      text: string | null;
      sentiment: string | null;
      hotelResponse: string | null;
      guest: { name: string | null; avatarUrl: string | null } | null;
    }[];
  };

  const h = hotel as unknown as HotelDetail;
  const addr = h.address;
  const avgScore =
    h.reviews.length > 0
      ? (
          h.reviews.reduce((s, r) => s + r.overallScore, 0) / h.reviews.length
        ).toFixed(1)
      : null;

  const heroPhotos: string[] =
    h.photos?.length > 0 ? h.photos.map((p) => p.url) : HOTEL_PLACEHOLDERS;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "rgb(var(--nv-bg))" }}
    >
      {/* ── Photo Hero ── */}
      <div
        className="relative h-[60vh] min-h-[420px] overflow-hidden"
        style={{ backgroundColor: "rgb(var(--nv-surface))" }}
      >
        {/* Main image */}
        <img
          src={heroPhotos[0]}
          alt={h.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Thumbnail grid — bottom right */}
        <div className="absolute bottom-6 right-6 hidden gap-2 md:grid md:grid-cols-2">
          {heroPhotos.slice(1, 5).map((src, i) => (
            <div
              key={i}
              className="relative h-20 w-32 overflow-hidden rounded-xl border-2 border-white/20 shadow-xl"
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
              {i === 3 && heroPhotos.length > 5 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <span className="text-xs font-bold text-white">
                    +{heroPhotos.length - 5}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Back button */}
        <div className="absolute left-6 top-6">
          <button
            onClick={() => router.push("/search")}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-white backdrop-blur-sm transition hover:bg-black/60"
            style={{
              backgroundColor: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <ArrowLeft className="h-4 w-4" /> Geri
          </button>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-8 pb-8">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                {h.starRating && (
                  <div className="mb-2 flex">
                    {Array.from({ length: h.starRating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                )}
                <h1 className="text-3xl font-bold text-white drop-shadow-lg md:text-4xl">
                  {h.name}
                </h1>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-white/80">
                  <MapPin className="h-4 w-4" />
                  {addr.city}, {addr.country}
                </p>
              </div>
              {avgScore && (
                <div
                  className="flex flex-col items-center rounded-2xl bg-black/50 px-5 py-3 backdrop-blur-sm"
                  style={{ border: "1px solid rgba(255,255,255,0.15)" }}
                >
                  <span className="text-3xl font-bold text-white">
                    {avgScore}
                  </span>
                  <span className="text-xs text-white/60">
                    /10 · {h.reviews.length} yorum
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Quick info bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div
            className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl p-5"
            style={{
              backgroundColor: "rgb(var(--nv-surface))",
              border: "1px solid rgb(var(--nv-border) / 0.08)",
              boxShadow: "0 2px 16px rgb(var(--nv-shadow) / 0.07)",
            }}
          >
            {h.wifiQuality && (
              <span
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
                style={{
                  backgroundColor:
                    WIFI_COLORS[h.wifiQuality] ?? "rgba(148,163,184,0.1)",
                  color: WIFI_TEXT[h.wifiQuality] ?? "rgb(var(--nv-muted))",
                }}
              >
                <Wifi className="h-3.5 w-3.5" /> WiFi: {h.wifiQuality}
              </span>
            )}
            {h.noiseNotes && (
              <span
                className="rounded-full px-3 py-1.5 text-xs"
                style={{
                  backgroundColor: "rgba(251,191,36,0.12)",
                  color: "#fbbf24",
                }}
              >
                🔊 {h.noiseNotes}
              </span>
            )}
            {Array.isArray(h.amenities) &&
              (h.amenities as string[]).slice(0, 6).map((a) => (
                <span
                  key={a}
                  className="rounded-full px-3 py-1.5 text-xs"
                  style={{
                    border: "1px solid rgb(var(--nv-border) / 0.1)",
                    color: "rgb(var(--nv-muted))",
                  }}
                >
                  {a}
                </span>
              ))}
          </div>
        </motion.div>

        {/* Description */}
        {h.shortDescription && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-8 text-base leading-relaxed"
            style={{ color: "rgb(var(--nv-muted))" }}
          >
            {h.shortDescription}
          </motion.p>
        )}

        {/* Date selector */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <div
            className="mb-8 flex flex-wrap items-end gap-4 rounded-2xl p-5"
            style={{
              backgroundColor: "rgb(var(--nv-surface))",
              border: "1px solid rgb(var(--nv-border) / 0.08)",
            }}
          >
            <div>
              <label
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider"
                style={{ color: "rgb(var(--nv-dim))" }}
              >
                Giriş
              </label>
              <input
                type="date"
                value={checkIn}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setCheckIn(e.target.value)}
                className="rounded-xl px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-orange-400/40"
                style={{
                  backgroundColor: "rgb(var(--nv-surface-2))",
                  border: "1px solid rgb(var(--nv-border) / 0.12)",
                  color: "rgb(var(--nv-text))",
                }}
              />
            </div>
            <div>
              <label
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider"
                style={{ color: "rgb(var(--nv-dim))" }}
              >
                Çıkış
              </label>
              <input
                type="date"
                value={checkOut}
                min={checkIn || new Date().toISOString().split("T")[0]}
                onChange={(e) => setCheckOut(e.target.value)}
                className="rounded-xl px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-orange-400/40"
                style={{
                  backgroundColor: "rgb(var(--nv-surface-2))",
                  border: "1px solid rgb(var(--nv-border) / 0.12)",
                  color: "rgb(var(--nv-text))",
                }}
              />
            </div>
            <div>
              <label
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider"
                style={{ color: "rgb(var(--nv-dim))" }}
              >
                Misafir
              </label>
              <select
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="rounded-xl px-3 py-2 text-sm outline-none"
                style={{
                  backgroundColor: "rgb(var(--nv-surface-2))",
                  border: "1px solid rgb(var(--nv-border) / 0.12)",
                  color: "rgb(var(--nv-text))",
                }}
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} misafir
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* ── Tabs ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {/* Tab nav */}
          <div
            className="mb-6 flex gap-1 rounded-xl p-1"
            style={{
              backgroundColor: "rgb(var(--nv-surface))",
              border: "1px solid rgb(var(--nv-border) / 0.08)",
            }}
          >
            {TABS.map((tab) => {
              const count =
                tab === "Odalar"
                  ? h.roomTypes.length
                  : tab === "Yeme & İçme"
                    ? h.diningExperiences.length
                    : tab === "Gece Hayatı"
                      ? h.nightExperiences.length
                      : h.reviews.length;
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
                  style={{
                    backgroundColor: active ? "#f97316" : "transparent",
                    color: active ? "white" : "rgb(var(--nv-muted))",
                  }}
                >
                  {tab}{" "}
                  <span className="ml-1 text-xs opacity-60">({count})</span>
                </button>
              );
            })}
          </div>

          {/* ── Rooms ── */}
          {activeTab === "Odalar" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {h.roomTypes.length === 0 ? (
                <p
                  className="col-span-2 py-8 text-center"
                  style={{ color: "rgb(var(--nv-muted))" }}
                >
                  Oda bilgisi mevcut değil.
                </p>
              ) : (
                h.roomTypes.map((room, idx) => {
                  const photo =
                    room.photos?.[0]?.url ??
                    ROOM_PLACEHOLDERS[idx % ROOM_PLACEHOLDERS.length];
                  return (
                    <Link
                      key={room.id}
                      href={`/hotel/${slug}/rooms/${room.id}`}
                      className="group block overflow-hidden rounded-2xl transition-all"
                      style={{
                        border: "1px solid rgb(var(--nv-border) / 0.08)",
                        backgroundColor: "rgb(var(--nv-surface))",
                        boxShadow: "0 2px 12px rgb(var(--nv-shadow) / 0.06)",
                      }}
                    >
                      <div className="relative h-52 overflow-hidden">
                        <img
                          src={photo}
                          alt={room.name}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        {room.baseRateCents && (
                          <div className="absolute bottom-3 right-3 rounded-xl bg-black/70 px-3 py-1.5 backdrop-blur-sm">
                            <span className="text-sm font-bold text-white">
                              ${(room.baseRateCents / 100).toFixed(0)}
                            </span>
                            <span className="text-xs text-white/70">
                              {" "}
                              / gece
                            </span>
                          </div>
                        )}
                        {/* Thumbnail strip */}
                        {room.photos?.length > 1 && (
                          <div className="absolute bottom-3 left-3 flex gap-1">
                            {room.photos.slice(1, 4).map((p, i) => (
                              <img
                                key={i}
                                src={p.thumb}
                                alt=""
                                className="h-10 w-10 rounded-lg border-2 border-white/40 object-cover shadow"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3
                              className="font-semibold"
                              style={{ color: "rgb(var(--nv-text))" }}
                            >
                              {room.name}
                            </h3>
                            <p
                              className="mt-1.5 flex flex-wrap items-center gap-3 text-xs"
                              style={{ color: "rgb(var(--nv-dim))" }}
                            >
                              <span className="flex items-center gap-1">
                                <Bed className="h-3.5 w-3.5" /> {room.bedType}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />{" "}
                                {room.capacity} kişi
                              </span>
                              {room.sizeSqm && (
                                <span className="flex items-center gap-1">
                                  <Maximize2 className="h-3.5 w-3.5" />{" "}
                                  {String(room.sizeSqm)}m²
                                </span>
                              )}
                            </p>
                          </div>
                          <ChevronRight
                            className="mt-1 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                            style={{ color: "rgb(var(--nv-dim))" }}
                          />
                        </div>
                        {room.description && (
                          <p
                            className="mt-2 line-clamp-2 text-sm"
                            style={{ color: "rgb(var(--nv-dim))" }}
                          >
                            {room.description}
                          </p>
                        )}
                        {Array.isArray(room.features) &&
                          (room.features as string[]).length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {(room.features as string[])
                                .slice(0, 4)
                                .map((f) => (
                                  <span
                                    key={f}
                                    className="rounded-full px-2.5 py-1 text-xs"
                                    style={{
                                      border:
                                        "1px solid rgb(var(--nv-border) / 0.1)",
                                      color: "rgb(var(--nv-muted))",
                                    }}
                                  >
                                    {f.replace(/-/g, " ")}
                                  </span>
                                ))}
                            </div>
                          )}
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          )}

          {/* ── Dining ── */}
          {activeTab === "Yeme & İçme" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {h.diningExperiences.length === 0 ? (
                <p
                  className="col-span-2 py-8 text-center"
                  style={{ color: "rgb(var(--nv-muted))" }}
                >
                  Yeme & içme deneyimi mevcut değil.
                </p>
              ) : (
                h.diningExperiences.map((d, idx) => {
                  const photo =
                    d.photos?.[0]?.url ??
                    DINING_PLACEHOLDERS[idx % DINING_PLACEHOLDERS.length];
                  return (
                    <Link
                      key={d.id}
                      href={`/hotel/${slug}/dining/${d.id}`}
                      className="group block overflow-hidden rounded-2xl transition-all"
                      style={{
                        border: "1px solid rgb(var(--nv-border) / 0.08)",
                        backgroundColor: "rgb(var(--nv-surface))",
                        boxShadow: "0 2px 12px rgb(var(--nv-shadow) / 0.06)",
                      }}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={photo}
                          alt={d.name}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                          {d.diningType}
                        </span>
                      </div>
                      <div className="p-5">
                        <div className="flex items-start justify-between">
                          <h3
                            className="font-semibold"
                            style={{ color: "rgb(var(--nv-text))" }}
                          >
                            {d.name}
                          </h3>
                          <UtensilsCrossed
                            className="h-4 w-4 shrink-0"
                            style={{ color: "rgb(var(--nv-dim))" }}
                          />
                        </div>
                        {d.description && (
                          <p
                            className="mt-2 line-clamp-2 text-sm"
                            style={{ color: "rgb(var(--nv-dim))" }}
                          >
                            {d.description}
                          </p>
                        )}
                        <div
                          className="mt-3 flex items-center gap-3 text-xs"
                          style={{ color: "rgb(var(--nv-dim))" }}
                        >
                          {d.capacity && <span>{d.capacity} kişilik</span>}
                          {d.priceRange && <span>{d.priceRange}</span>}
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          )}

          {/* ── Nightlife ── */}
          {activeTab === "Gece Hayatı" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {h.nightExperiences.length === 0 ? (
                <p
                  className="col-span-2 py-8 text-center"
                  style={{ color: "rgb(var(--nv-muted))" }}
                >
                  Gece hayatı deneyimi mevcut değil.
                </p>
              ) : (
                h.nightExperiences.map((n, idx) => {
                  const photo =
                    n.photos?.[0]?.url ??
                    NIGHT_PLACEHOLDERS[idx % NIGHT_PLACEHOLDERS.length];
                  return (
                    <Link
                      key={n.id}
                      href={`/hotel/${slug}/nightlife/${n.id}`}
                      className="group block overflow-hidden rounded-2xl transition-all"
                      style={{
                        border: "1px solid rgb(var(--nv-border) / 0.08)",
                        backgroundColor: "rgb(var(--nv-surface))",
                        boxShadow: "0 2px 12px rgb(var(--nv-shadow) / 0.06)",
                      }}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={photo}
                          alt={n.name}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        {n.priceCents && (
                          <div className="absolute bottom-3 right-3 rounded-xl bg-black/70 px-3 py-1.5 backdrop-blur-sm">
                            <span className="text-sm font-bold text-white">
                              ${(n.priceCents / 100).toFixed(0)}
                            </span>
                            <span className="text-xs text-white/70">
                              {" "}
                              bilet
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="flex items-start justify-between">
                          <h3
                            className="font-semibold"
                            style={{ color: "rgb(var(--nv-text))" }}
                          >
                            {n.name}
                          </h3>
                          <Music
                            className="h-4 w-4 shrink-0"
                            style={{ color: "rgb(var(--nv-dim))" }}
                          />
                        </div>
                        <span
                          className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs"
                          style={{
                            backgroundColor: "rgba(139,92,246,0.15)",
                            color: "#a78bfa",
                          }}
                        >
                          {n.experienceType}
                        </span>
                        {n.description && (
                          <p
                            className="mt-2 line-clamp-2 text-sm"
                            style={{ color: "rgb(var(--nv-dim))" }}
                          >
                            {n.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          )}

          {/* ── Reviews ── */}
          {activeTab === "Yorumlar" && (
            <div className="space-y-4">
              {h.reviews.length === 0 ? (
                <p
                  className="py-8 text-center"
                  style={{ color: "rgb(var(--nv-muted))" }}
                >
                  Henüz yorum yok.
                </p>
              ) : (
                h.reviews.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-2xl p-5"
                    style={{
                      border: "1px solid rgb(var(--nv-border) / 0.08)",
                      backgroundColor: "rgb(var(--nv-surface))",
                      boxShadow: "0 2px 12px rgb(var(--nv-shadow) / 0.05)",
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                          style={{
                            background:
                              "linear-gradient(135deg, #f97316, #fb923c)",
                          }}
                        >
                          {(r.guest?.name ?? "M")[0]}
                        </div>
                        <div>
                          <p
                            className="text-sm font-semibold"
                            style={{ color: "rgb(var(--nv-text))" }}
                          >
                            {r.guest?.name ?? "Misafir"}
                          </p>
                          {r.title && (
                            <p
                              className="text-xs"
                              style={{ color: "rgb(var(--nv-dim))" }}
                            >
                              {r.title}
                            </p>
                          )}
                        </div>
                      </div>
                      <div
                        className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
                        style={{
                          backgroundColor: "rgba(249,115,22,0.12)",
                          border: "1px solid rgba(249,115,22,0.2)",
                        }}
                      >
                        <Star className="h-3.5 w-3.5 fill-[#f97316] text-[#f97316]" />
                        <span
                          className="text-sm font-bold"
                          style={{ color: "rgb(var(--nv-text))" }}
                        >
                          {r.overallScore}
                          <span className="text-xs font-normal opacity-60">
                            /10
                          </span>
                        </span>
                      </div>
                    </div>
                    {r.text && (
                      <p
                        className="mt-3 text-sm leading-relaxed"
                        style={{ color: "rgb(var(--nv-muted))" }}
                      >
                        {r.text}
                      </p>
                    )}
                    {r.hotelResponse && (
                      <div
                        className="mt-3 rounded-xl p-3"
                        style={{
                          backgroundColor: "rgb(var(--nv-surface-2))",
                          border: "1px solid rgb(var(--nv-border) / 0.08)",
                        }}
                      >
                        <p
                          className="flex items-center gap-1.5 text-xs font-semibold"
                          style={{ color: "#60a5fa" }}
                        >
                          <Shield className="h-3 w-3" /> Otel yanıtı
                        </p>
                        <p
                          className="mt-1 text-sm"
                          style={{ color: "rgb(var(--nv-muted))" }}
                        >
                          {r.hotelResponse}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </motion.div>

        {/* About section */}
        {h.description && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div
              className="mt-8 rounded-2xl p-6"
              style={{
                border: "1px solid rgb(var(--nv-border) / 0.08)",
                backgroundColor: "rgb(var(--nv-surface))",
              }}
            >
              <h2
                className="mb-3 text-lg font-semibold"
                style={{ color: "rgb(var(--nv-text))" }}
              >
                Otel Hakkında
              </h2>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "rgb(var(--nv-muted))" }}
              >
                {h.description}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
