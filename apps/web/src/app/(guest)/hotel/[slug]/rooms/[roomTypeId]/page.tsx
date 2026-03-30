"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bed,
  Users,
  Maximize2,
  Layers,
  Wifi,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  Tv,
  Wind,
  Coffee,
  Bath,
  Star,
  Briefcase,
  Eye,
  Leaf,
  ShieldCheck,
  Utensils,
  Dumbbell,
  Clock,
  BanIcon,
  PawPrint,
  CreditCard,
  Info,
  MapPin,
} from "lucide-react";

const ROOM_PLACEHOLDERS = [
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80",
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200&q=80",
  "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=1200&q=80",
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
  "https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=1200&q=80",
];

const FEATURE_MAP: Record<
  string,
  { label: string; icon: React.ComponentType<any> }
> = {
  "bosphorus-view": { label: "Boğaz Manzarası", icon: Eye },
  "acropolis-view": { label: "Akropolis Manzarası", icon: Eye },
  "panoramic-view": { label: "Panoramik Manzara", icon: Eye },
  "city-view": { label: "Şehir Manzarası", icon: Eye },
  "garden-view": { label: "Bahçe Manzarası", icon: Leaf },
  "garden-terrace": { label: "Bahçe Terası", icon: Leaf },
  "private-terrace": { label: "Özel Teras", icon: Leaf },
  minibar: { label: "Minibar", icon: Coffee },
  "rain-shower": { label: "Yağmur Duşu", icon: Bath },
  jacuzzi: { label: "Jakuzi", icon: Bath },
  bathrobe: { label: "Bornoz & Terlik", icon: Star },
  butler: { label: "Butler Servisi", icon: Star },
  "air-conditioning": { label: "Klima", icon: Wind },
  safe: { label: "Oda Kasası", icon: ShieldCheck },
  "work-desk": { label: "Çalışma Masası", icon: Briefcase },
  kitchenette: { label: "Mini Mutfak", icon: Utensils },
  "connecting-rooms": { label: "Bağlantılı Odalar", icon: Users },
  "bunk-beds": { label: "Ranza (çocuk)", icon: Bed },
  "twin-beds": { label: "İkiz Yatak", icon: Bed },
  tv: { label: "Akıllı TV", icon: Tv },
  wifi: { label: "Yüksek Hızlı WiFi", icon: Wifi },
  gym: { label: "Spor Salonu Erişimi", icon: Dumbbell },
};

function featureInfo(f: string) {
  return (
    FEATURE_MAP[f] ?? {
      label: f.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      icon: CheckCircle2,
    }
  );
}

function Lightbox({
  photos,
  index,
  onClose,
}: {
  photos: { url: string; alt: string; credit: string }[];
  index: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(index);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full p-2 text-white transition hover:bg-white/10"
      >
        <X className="h-5 w-5" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setCurrent((c) => (c - 1 + photos.length) % photos.length);
        }}
        className="absolute left-4 rounded-full p-3 text-white transition hover:bg-white/10"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <img
        src={photos[current]?.url}
        alt={photos[current]?.alt}
        className="max-h-[88vh] max-w-[88vw] rounded-2xl object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          setCurrent((c) => (c + 1) % photos.length);
        }}
        className="absolute right-4 rounded-full p-3 text-white transition hover:bg-white/10"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
      <div className="absolute bottom-5 flex flex-col items-center gap-2">
        <p className="text-xs text-white/50">
          {photos[current]?.credit} · {current + 1} / {photos.length}
        </p>
        <div className="flex gap-1.5">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setCurrent(i);
              }}
              className={`h-1.5 rounded-full transition-all ${i === current ? "w-5 bg-white" : "w-1.5 bg-white/30"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const roomTypeId = params.roomTypeId as string;
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  const {
    data: room,
    isLoading,
    error,
  } = trpc.roomType.getPublic.useQuery(
    { id: roomTypeId },
    { enabled: !!roomTypeId },
  );

  if (isLoading) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: "rgb(var(--nv-bg))" }}
      >
        <div
          className="h-[50vh] animate-pulse"
          style={{ backgroundColor: "rgb(var(--nv-surface))" }}
        />
        <div className="mx-auto grid max-w-5xl gap-6 px-6 py-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {[200, 120, 280].map((h, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl"
                style={{ height: h, backgroundColor: "rgb(var(--nv-surface))" }}
              />
            ))}
          </div>
          <div
            className="h-80 animate-pulse rounded-2xl"
            style={{ backgroundColor: "rgb(var(--nv-surface))" }}
          />
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
        style={{ backgroundColor: "rgb(var(--nv-bg))" }}
      >
        <h2
          className="mb-2 text-xl font-bold"
          style={{ color: "rgb(var(--nv-text))" }}
        >
          Oda bulunamadı
        </h2>
        <button
          onClick={() => router.back()}
          className="mt-3 flex items-center gap-1.5 text-sm hover:underline"
          style={{ color: "#f97316" }}
        >
          <ArrowLeft className="h-4 w-4" /> Geri dön
        </button>
      </div>
    );
  }

  type Photo = { url: string; thumb: string; alt: string; credit: string };
  type RoomDetail = {
    id: string;
    name: string;
    description: string | null;
    bedType: string;
    capacity: number;
    sizeSqm: number | null;
    floor: string | null;
    noiseNotes: string | null;
    baseRateCents: number | null;
    features: unknown;
    photos: Photo[];
    hotel: {
      id: string;
      name: string;
      slug: string;
      starRating: number | null;
      address: Record<string, string>;
      wifiQuality: string | null;
      noiseNotes: string | null;
      amenities: unknown;
    };
  };

  const r = room as unknown as RoomDetail;
  const hotel = r.hotel;
  const features = (Array.isArray(r.features) ? r.features : []) as string[];
  const amenities = (
    Array.isArray(hotel.amenities) ? hotel.amenities : []
  ) as string[];

  // Use real photos if available, otherwise mix in placeholders
  const rawPhotos = r.photos ?? [];
  const photos: { url: string; thumb: string; alt: string; credit: string }[] =
    rawPhotos.length > 0
      ? rawPhotos
      : ROOM_PLACEHOLDERS.map((url, i) => ({
          url,
          thumb: url.replace("w=1200", "w=400"),
          alt: `${r.name} — ${i + 1}`,
          credit: "Nuvoya",
        }));

  const today = new Date().toISOString().split("T")[0]!;
  const nights =
    checkIn && checkOut
      ? Math.max(
          0,
          Math.round(
            (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
              86_400_000,
          ),
        )
      : 0;
  const subtotal = r.baseRateCents ? (r.baseRateCents * nights) / 100 : 0;
  const tax = subtotal * 0.1;

  const handleBook = () => {
    if (!checkIn || !checkOut) return alert("Lütfen önce tarih seçin.");
    router.push(
      `/booking/new?hotelId=${hotel.id}&roomTypeId=${r.id}&checkIn=${checkIn}&checkOut=${checkOut}&guestCount=${guests}&price=${r.baseRateCents ?? 0}`,
    );
  };

  return (
    <>
      {lightboxIdx !== null && (
        <Lightbox
          photos={photos}
          index={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}

      <div
        className="min-h-screen"
        style={{ backgroundColor: "rgb(var(--nv-bg))" }}
      >
        {/* ── Photo Hero ── */}
        <div className="relative">
          <div
            className="grid overflow-hidden"
            style={{
              height: 480,
              gridTemplateColumns: "2fr 1fr 1fr",
              gridTemplateRows: "1fr 1fr",
              gap: 3,
            }}
          >
            {/* Main photo */}
            <div
              className="relative row-span-2 cursor-zoom-in overflow-hidden"
              onClick={() => setLightboxIdx(0)}
            >
              <img
                src={photos[0]?.url}
                alt={photos[0]?.alt}
                className="h-full w-full object-cover transition duration-700 hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
            </div>
            {/* 4 thumbnails */}
            {photos.slice(1, 5).map((p, i) => (
              <div
                key={i}
                className="relative cursor-zoom-in overflow-hidden"
                onClick={() => setLightboxIdx(i + 1)}
              >
                <img
                  src={p.thumb || p.url}
                  alt={p.alt}
                  className="h-full w-full object-cover transition duration-700 hover:scale-[1.04]"
                />
                {i === 3 && photos.length > 5 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/55">
                    <span className="text-sm font-bold text-white">
                      +{photos.length - 5} fotoğraf
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Back button */}
          <div className="absolute left-5 top-5">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-white backdrop-blur-sm transition hover:bg-black/60"
              style={{
                backgroundColor: "rgba(0,0,0,0.45)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <ArrowLeft className="h-4 w-4" /> {hotel.name}
            </button>
          </div>

          {/* Show all photos button */}
          {photos.length > 1 && (
            <button
              onClick={() => setLightboxIdx(0)}
              className="absolute bottom-4 right-4 rounded-xl px-4 py-2 text-xs font-semibold backdrop-blur-sm transition"
              style={{
                backgroundColor: "rgb(var(--nv-surface))",
                border: "1px solid rgb(var(--nv-border) / 0.2)",
                color: "rgb(var(--nv-text))",
              }}
            >
              Tüm {photos.length} fotoğrafı gör
            </button>
          )}
        </div>

        {/* ── Content ── */}
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* ── Left ── */}
            <div className="space-y-6 lg:col-span-2">
              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div
                  className="pb-5"
                  style={{
                    borderBottom: "1px solid rgb(var(--nv-border) / 0.08)",
                  }}
                >
                  <h1
                    className="text-3xl font-bold"
                    style={{ color: "rgb(var(--nv-text))" }}
                  >
                    {r.name}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <p
                      className="flex items-center gap-1.5 text-sm"
                      style={{ color: "rgb(var(--nv-muted))" }}
                    >
                      <MapPin className="h-4 w-4" />
                      {hotel.address?.city}, {hotel.address?.country}
                    </p>
                    {hotel.starRating && (
                      <span
                        className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: "rgba(251,191,36,0.12)",
                          color: "#fbbf24",
                        }}
                      >
                        {"★".repeat(hotel.starRating)} {hotel.name}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Quick specs */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
              >
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { icon: Bed, label: "Yatak", value: r.bedType },
                    {
                      icon: Users,
                      label: "Misafir",
                      value: `${r.capacity} kişiye kadar`,
                    },
                    r.sizeSqm
                      ? {
                          icon: Maximize2,
                          label: "Boyut",
                          value: `${r.sizeSqm} m²`,
                        }
                      : null,
                    r.floor
                      ? { icon: Layers, label: "Kat", value: r.floor }
                      : null,
                  ]
                    .filter(Boolean)
                    .map((spec: any) => (
                      <div
                        key={spec.label}
                        className="flex flex-col items-center rounded-2xl p-4 text-center"
                        style={{
                          backgroundColor: "rgb(var(--nv-surface))",
                          border: "1px solid rgb(var(--nv-border) / 0.08)",
                          boxShadow: "0 2px 10px rgb(var(--nv-shadow) / 0.06)",
                        }}
                      >
                        <spec.icon
                          className="mb-1.5 h-5 w-5"
                          style={{ color: "#f97316" }}
                        />
                        <span
                          className="text-xs"
                          style={{ color: "rgb(var(--nv-dim))" }}
                        >
                          {spec.label}
                        </span>
                        <span
                          className="mt-0.5 text-sm font-semibold capitalize"
                          style={{ color: "rgb(var(--nv-text))" }}
                        >
                          {spec.value}
                        </span>
                      </div>
                    ))}
                </div>
              </motion.div>

              {/* Description */}
              {r.description && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div
                    className="rounded-2xl p-6"
                    style={{
                      backgroundColor: "rgb(var(--nv-surface))",
                      border: "1px solid rgb(var(--nv-border) / 0.08)",
                      boxShadow: "0 2px 12px rgb(var(--nv-shadow) / 0.06)",
                    }}
                  >
                    <h2
                      className="mb-3 text-base font-semibold"
                      style={{ color: "rgb(var(--nv-text))" }}
                    >
                      Bu Oda Hakkında
                    </h2>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "rgb(var(--nv-muted))" }}
                    >
                      {r.description}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Features */}
              {features.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                >
                  <div
                    className="rounded-2xl p-6"
                    style={{
                      backgroundColor: "rgb(var(--nv-surface))",
                      border: "1px solid rgb(var(--nv-border) / 0.08)",
                      boxShadow: "0 2px 12px rgb(var(--nv-shadow) / 0.06)",
                    }}
                  >
                    <h2
                      className="mb-4 text-base font-semibold"
                      style={{ color: "rgb(var(--nv-text))" }}
                    >
                      Neler Dahil
                    </h2>
                    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {features.map((f) => {
                        const { label, icon: Icon } = featureInfo(f);
                        return (
                          <li
                            key={f}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm"
                            style={{
                              backgroundColor: "rgb(var(--nv-surface-2))",
                              color: "rgb(var(--nv-muted))",
                            }}
                          >
                            <Icon
                              className="h-4 w-4 shrink-0"
                              style={{ color: "#f97316" }}
                            />
                            {label}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </motion.div>
              )}

              {/* Hotel amenities */}
              {amenities.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <div
                    className="rounded-2xl p-6"
                    style={{
                      backgroundColor: "rgb(var(--nv-surface))",
                      border: "1px solid rgb(var(--nv-border) / 0.08)",
                    }}
                  >
                    <h2
                      className="mb-4 text-base font-semibold"
                      style={{ color: "rgb(var(--nv-text))" }}
                    >
                      Otel Olanakları
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {amenities.map((a) => (
                        <span
                          key={a}
                          className="rounded-full px-3 py-1.5 text-xs"
                          style={{
                            border: "1px solid rgb(var(--nv-border) / 0.10)",
                            color: "rgb(var(--nv-muted))",
                            backgroundColor: "rgb(var(--nv-surface-2))",
                          }}
                        >
                          {a
                            .replace(/-/g, " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Policies */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
              >
                <div
                  className="rounded-2xl p-6"
                  style={{
                    backgroundColor: "rgb(var(--nv-surface))",
                    border: "1px solid rgb(var(--nv-border) / 0.08)",
                  }}
                >
                  <h2
                    className="mb-4 text-base font-semibold"
                    style={{ color: "rgb(var(--nv-text))" }}
                  >
                    Kurallar & Politikalar
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[
                      {
                        icon: Clock,
                        color: "#60a5fa",
                        label: "Giriş",
                        value: "15:00'den itibaren",
                      },
                      {
                        icon: Clock,
                        color: "#60a5fa",
                        label: "Çıkış",
                        value: "12:00'ye kadar",
                      },
                      {
                        icon: BanIcon,
                        color: "#f87171",
                        label: "Sigara",
                        value: "Yasak",
                      },
                      {
                        icon: PawPrint,
                        color: "rgb(var(--nv-dim))",
                        label: "Evcil hayvan",
                        value: "Kabul edilmez",
                      },
                      {
                        icon: CreditCard,
                        color: "#67dc9f",
                        label: "Ödeme",
                        value: "Kart zorunlu değil",
                      },
                      {
                        icon: CheckCircle2,
                        color: "#67dc9f",
                        label: "İptal",
                        value: "Ücretsiz iptal",
                      },
                    ].map(({ icon: Icon, color, label, value }) => (
                      <div key={label} className="flex items-start gap-3">
                        <Icon
                          className="mt-0.5 h-4 w-4 shrink-0"
                          style={{ color }}
                        />
                        <div>
                          <p
                            className="text-sm font-medium"
                            style={{ color: "rgb(var(--nv-text))" }}
                          >
                            {label}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: "rgb(var(--nv-dim))" }}
                          >
                            {value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Good to know */}
              {(hotel.wifiQuality || hotel.noiseNotes || r.noiseNotes) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <div
                    className="rounded-2xl p-5"
                    style={{
                      backgroundColor: "rgb(var(--nv-surface-2))",
                      border: "1px solid rgb(var(--nv-border) / 0.06)",
                    }}
                  >
                    <h2
                      className="mb-3 flex items-center gap-2 text-sm font-semibold"
                      style={{ color: "rgb(var(--nv-text))" }}
                    >
                      <Info className="h-4 w-4" style={{ color: "#60a5fa" }} />{" "}
                      Bilmeniz Gerekenler
                    </h2>
                    <div className="space-y-2">
                      {hotel.wifiQuality && (
                        <p
                          className="flex items-center gap-2 text-sm"
                          style={{ color: "rgb(var(--nv-muted))" }}
                        >
                          <Wifi
                            className="h-4 w-4"
                            style={{ color: "#60a5fa" }}
                          />
                          WiFi kalitesi:{" "}
                          <span className="font-medium capitalize">
                            {hotel.wifiQuality}
                          </span>
                        </p>
                      )}
                      {hotel.noiseNotes && (
                        <p
                          className="flex items-center gap-2 text-sm"
                          style={{ color: "rgb(var(--nv-muted))" }}
                        >
                          <span>🔊</span>
                          {hotel.noiseNotes}
                        </p>
                      )}
                      {r.noiseNotes && (
                        <p
                          className="flex items-center gap-2 text-sm"
                          style={{ color: "rgb(var(--nv-muted))" }}
                        >
                          <span>💡</span>
                          {r.noiseNotes}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* ── Right: Booking card ── */}
            <div>
              <div className="sticky top-6 space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <div
                    className="rounded-2xl p-6"
                    style={{
                      backgroundColor: "rgb(var(--nv-surface))",
                      border: "1px solid rgb(var(--nv-border) / 0.1)",
                      boxShadow: "0 8px 32px rgb(var(--nv-shadow) / 0.12)",
                    }}
                  >
                    {r.baseRateCents ? (
                      <div className="mb-5">
                        <p
                          className="text-xs"
                          style={{ color: "rgb(var(--nv-dim))" }}
                        >
                          itibaren
                        </p>
                        <div className="flex items-baseline gap-1">
                          <span
                            className="text-3xl font-bold"
                            style={{ color: "rgb(var(--nv-text))" }}
                          >
                            ${(r.baseRateCents / 100).toFixed(0)}
                          </span>
                          <span
                            className="text-sm"
                            style={{ color: "rgb(var(--nv-muted))" }}
                          >
                            /gece
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p
                        className="mb-5 text-sm"
                        style={{ color: "rgb(var(--nv-muted))" }}
                      >
                        Fiyat için iletişime geçin
                      </p>
                    )}

                    <div className="space-y-3">
                      {[
                        {
                          label: "Giriş",
                          value: checkIn,
                          setter: setCheckIn,
                          min: today,
                        },
                        {
                          label: "Çıkış",
                          value: checkOut,
                          setter: setCheckOut,
                          min: checkIn || today,
                        },
                      ].map(({ label, value, setter, min }) => (
                        <div key={label}>
                          <label
                            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider"
                            style={{ color: "rgb(var(--nv-dim))" }}
                          >
                            {label}
                          </label>
                          <input
                            type="date"
                            value={value}
                            min={min}
                            onChange={(e) => setter(e.target.value)}
                            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-orange-400/40"
                            style={{
                              backgroundColor: "rgb(var(--nv-surface-2))",
                              border: "1px solid rgb(var(--nv-border) / 0.12)",
                              color: "rgb(var(--nv-text))",
                            }}
                          />
                        </div>
                      ))}

                      <div>
                        <label
                          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider"
                          style={{ color: "rgb(var(--nv-dim))" }}
                        >
                          Misafir
                        </label>
                        <select
                          value={guests}
                          onChange={(e) => setGuests(Number(e.target.value))}
                          className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                          style={{
                            backgroundColor: "rgb(var(--nv-surface-2))",
                            border: "1px solid rgb(var(--nv-border) / 0.12)",
                            color: "rgb(var(--nv-text))",
                          }}
                        >
                          {Array.from(
                            { length: r.capacity },
                            (_, i) => i + 1,
                          ).map((n) => (
                            <option key={n} value={n}>
                              {n} misafir
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Price breakdown */}
                      {nights > 0 && r.baseRateCents && (
                        <div
                          className="rounded-xl p-3 text-sm"
                          style={{
                            backgroundColor: "rgb(var(--nv-surface-2))",
                            border: "1px solid rgb(var(--nv-border) / 0.08)",
                          }}
                        >
                          <div
                            className="flex justify-between"
                            style={{ color: "rgb(var(--nv-muted))" }}
                          >
                            <span>
                              ${(r.baseRateCents / 100).toFixed(0)} × {nights}{" "}
                              gece
                            </span>
                            <span>${subtotal.toFixed(0)}</span>
                          </div>
                          <div
                            className="flex justify-between"
                            style={{ color: "rgb(var(--nv-muted))" }}
                          >
                            <span>Vergiler & ücretler (%10)</span>
                            <span>${tax.toFixed(0)}</span>
                          </div>
                          <div
                            className="mt-2 flex justify-between pt-2 font-semibold"
                            style={{
                              borderTop:
                                "1px solid rgb(var(--nv-border) / 0.1)",
                              color: "rgb(var(--nv-text))",
                            }}
                          >
                            <span>Toplam</span>
                            <span>${(subtotal + tax).toFixed(0)}</span>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={handleBook}
                        className="mt-1 w-full rounded-xl py-3.5 font-semibold text-white transition hover:opacity-90 active:scale-95"
                        style={{ backgroundColor: "#f97316" }}
                      >
                        Rezervasyon Yap
                      </button>
                      <p
                        className="text-center text-xs"
                        style={{ color: "rgb(var(--nv-dim))" }}
                      >
                        Ücretsiz iptal · Kart zorunlu değil
                      </p>
                    </div>

                    {/* Feature highlights */}
                    {features.length > 0 && (
                      <div
                        className="mt-5 pt-4"
                        style={{
                          borderTop: "1px solid rgb(var(--nv-border) / 0.08)",
                        }}
                      >
                        <p
                          className="mb-2 text-xs font-medium"
                          style={{ color: "rgb(var(--nv-dim))" }}
                        >
                          Öne Çıkanlar
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {features.slice(0, 5).map((f) => (
                            <span
                              key={f}
                              className="rounded-full px-2.5 py-1 text-xs"
                              style={{
                                backgroundColor: "rgb(var(--nv-surface-2))",
                                border:
                                  "1px solid rgb(var(--nv-border) / 0.10)",
                                color: "rgb(var(--nv-muted))",
                              }}
                            >
                              {featureInfo(f).label}
                            </span>
                          ))}
                          {features.length > 5 && (
                            <span
                              className="rounded-full px-2.5 py-1 text-xs"
                              style={{ color: "rgb(var(--nv-dim))" }}
                            >
                              +{features.length - 5}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Hotel summary */}
                <motion.div
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <button
                    onClick={() => router.push(`/hotel/${slug}`)}
                    className="w-full rounded-2xl p-4 text-left transition"
                    style={{
                      backgroundColor: "rgb(var(--nv-surface))",
                      border: "1px solid rgb(var(--nv-border) / 0.08)",
                      boxShadow: "0 2px 10px rgb(var(--nv-shadow) / 0.05)",
                    }}
                  >
                    <p
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "rgb(var(--nv-dim))" }}
                    >
                      Tesis
                    </p>
                    <p
                      className="mt-1 font-semibold"
                      style={{ color: "rgb(var(--nv-text))" }}
                    >
                      {hotel.name}
                    </p>
                    {hotel.starRating && (
                      <p className="mt-0.5 text-sm text-amber-400">
                        {"★".repeat(hotel.starRating)}
                      </p>
                    )}
                    <p
                      className="mt-2 flex items-center gap-1 text-xs"
                      style={{ color: "rgb(var(--nv-muted))" }}
                    >
                      <MapPin className="h-3 w-3" />
                      {hotel.address?.city}, {hotel.address?.country}
                    </p>
                    <p
                      className="mt-2 text-xs hover:underline"
                      style={{ color: "#f97316" }}
                    >
                      Otel detaylarını gör →
                    </p>
                  </button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
