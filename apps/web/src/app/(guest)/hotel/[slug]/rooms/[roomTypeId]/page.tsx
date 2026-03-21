"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "lucide-react";

// ── Feature icon mapping ───────────────────────────────────────────────────────
const FEATURE_LABELS: Record<string, string> = {
  "bosphorus-view": "Bosphorus View",
  "acropolis-view": "Acropolis View",
  "panoramic-view": "Panoramic View",
  "city-view": "City View",
  "garden-view": "Garden View",
  "garden-terrace": "Garden Terrace",
  "private-terrace": "Private Terrace",
  minibar: "Minibar",
  "rain-shower": "Rain Shower",
  jacuzzi: "Jacuzzi",
  bathrobe: "Bathrobe & Slippers",
  butler: "Butler Service",
  "air-conditioning": "Air Conditioning",
  safe: "In-room Safe",
  "work-desk": "Work Desk",
  kitchenette: "Kitchenette",
  "connecting-rooms": "Connecting Rooms",
  "bunk-beds": "Bunk Beds (children)",
  "twin-beds": "Twin Beds",
};

function featureLabel(f: string) {
  return (
    FEATURE_LABELS[f] ??
    f.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

// ── Photo lightbox ─────────────────────────────────────────────────────────────
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
  const prev = () => setCurrent((c) => (c - 1 + photos.length) % photos.length);
  const next = () => setCurrent((c) => (c + 1) % photos.length);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          prev();
        }}
        className="absolute left-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <img
        src={photos[current]?.url}
        alt={photos[current]?.alt}
        className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          next();
        }}
        className="absolute right-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
      <p className="absolute bottom-4 text-sm text-white/60">
        {photos[current]?.credit} · {current + 1} / {photos.length}
      </p>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
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
      <div className="space-y-4">
        <Skeleton className="h-96 w-full rounded-2xl" />
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-500">Room not found.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Go back
        </Button>
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
    };
  };
  const r = room as unknown as RoomDetail;
  const photos = r.photos ?? [];
  const features = (Array.isArray(r.features) ? r.features : []) as string[];
  const hotel = r.hotel;

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

  const handleBook = () => {
    if (!checkIn || !checkOut) return alert("Please select dates first.");
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

      <div className="space-y-8">
        {/* Back */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-gray-500"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to {hotel.name}
        </Button>

        {/* Photo gallery */}
        {photos.length > 0 ? (
          <div
            className="grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl"
            style={{ height: 420 }}
          >
            {/* Main photo */}
            <div
              className="relative col-span-2 row-span-2 cursor-zoom-in overflow-hidden"
              onClick={() => setLightboxIdx(0)}
            >
              <img
                src={photos[0]?.url}
                alt={photos[0]?.alt}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            {/* Thumbnails */}
            {photos.slice(1, 5).map((p, i) => (
              <div
                key={i}
                className="relative cursor-zoom-in overflow-hidden"
                onClick={() => setLightboxIdx(i + 1)}
              >
                <img
                  src={p.thumb}
                  alt={p.alt}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
                {i === 3 && photos.length > 5 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="text-sm font-semibold text-white">
                      +{photos.length - 5} photos
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="h-72 rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e]" />
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* ── Left: details ─────────────────────────────────────────────── */}
          <div className="space-y-6 lg:col-span-2">
            {/* Title block */}
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  {room.name}
                </h1>
                {hotel.starRating && (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
                    {"★".repeat(hotel.starRating)} {hotel.name}
                  </span>
                )}
              </div>
              <p className="mt-1 text-gray-500">
                {hotel.address?.city}, {hotel.address?.country}
              </p>
            </div>

            {/* Quick specs */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="flex flex-col items-center rounded-xl border bg-white p-4">
                <Bed className="mb-1 h-5 w-5 text-[#1a1a2e]" />
                <span className="text-xs text-gray-400">Bed</span>
                <span className="mt-0.5 font-semibold capitalize text-gray-900">
                  {room.bedType}
                </span>
              </div>
              <div className="flex flex-col items-center rounded-xl border bg-white p-4">
                <Users className="mb-1 h-5 w-5 text-[#1a1a2e]" />
                <span className="text-xs text-gray-400">Guests</span>
                <span className="mt-0.5 font-semibold text-gray-900">
                  Up to {room.capacity}
                </span>
              </div>
              {room.sizeSqm && (
                <div className="flex flex-col items-center rounded-xl border bg-white p-4">
                  <Maximize2 className="mb-1 h-5 w-5 text-[#1a1a2e]" />
                  <span className="text-xs text-gray-400">Size</span>
                  <span className="mt-0.5 font-semibold text-gray-900">
                    {String(room.sizeSqm)} m²
                  </span>
                </div>
              )}
              {room.floor && (
                <div className="flex flex-col items-center rounded-xl border bg-white p-4">
                  <Layers className="mb-1 h-5 w-5 text-[#1a1a2e]" />
                  <span className="text-xs text-gray-400">Floor</span>
                  <span className="mt-0.5 text-center text-sm font-semibold text-gray-900">
                    {room.floor}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            {room.description && (
              <div className="rounded-xl border bg-white p-6">
                <h2 className="mb-3 text-lg font-semibold text-gray-900">
                  About this room
                </h2>
                <p className="leading-relaxed text-gray-600">
                  {room.description}
                </p>
              </div>
            )}

            {/* Features */}
            {features.length > 0 && (
              <div className="rounded-xl border bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  What's included
                </h2>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      {featureLabel(f)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hotel notes */}
            {(hotel.wifiQuality || hotel.noiseNotes) && (
              <div className="rounded-xl border bg-gray-50 p-5">
                <h2 className="mb-3 text-sm font-semibold text-gray-700">
                  Good to know
                </h2>
                <div className="space-y-2">
                  {hotel.wifiQuality && (
                    <p className="flex items-center gap-2 text-sm text-gray-600">
                      <Wifi className="h-4 w-4 text-blue-500" />
                      WiFi quality:{" "}
                      <span className="font-medium capitalize">
                        {hotel.wifiQuality}
                      </span>
                    </p>
                  )}
                  {hotel.noiseNotes && (
                    <p className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-base">🔊</span>
                      {hotel.noiseNotes}
                    </p>
                  )}
                  {room.noiseNotes && (
                    <p className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-base">💡</span>
                      {room.noiseNotes}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: booking card ────────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 rounded-2xl border bg-white p-6 shadow-lg">
              {r.baseRateCents ? (
                <div className="mb-5">
                  <p className="text-xs text-gray-400">from</p>
                  <p className="text-3xl font-bold text-[#1a1a2e]">
                    ${(r.baseRateCents / 100).toFixed(0)}
                    <span className="ml-1 text-base font-normal text-gray-400">
                      /night
                    </span>
                  </p>
                  {nights > 0 && (
                    <p className="mt-1 text-sm text-gray-500">
                      {nights} night{nights > 1 ? "s" : ""} · $
                      {((r.baseRateCents * nights) / 100).toFixed(0)} total
                    </p>
                  )}
                </div>
              ) : (
                <p className="mb-5 text-sm text-gray-400">
                  Contact us for pricing
                </p>
              )}

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Check-in
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Check-out
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn || new Date().toISOString().split("T")[0]}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
                  >
                    {Array.from({ length: room.capacity }, (_, i) => i + 1).map(
                      (n) => (
                        <option key={n} value={n}>
                          {n} guest{n > 1 ? "s" : ""}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <Button
                  onClick={handleBook}
                  className="mt-2 w-full bg-[#1a1a2e] py-5 text-base hover:bg-[#16213e]"
                >
                  Reserve Now
                </Button>

                <p className="text-center text-xs text-gray-400">
                  Free cancellation · No credit card required to reserve
                </p>
              </div>

              {/* Features summary */}
              {features.length > 0 && (
                <div className="mt-5 border-t pt-4">
                  <p className="mb-2 text-xs font-medium text-gray-500">
                    Highlights
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {features.slice(0, 5).map((f) => (
                      <Badge key={f} variant="secondary" className="text-xs">
                        {featureLabel(f)}
                      </Badge>
                    ))}
                    {features.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{features.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
