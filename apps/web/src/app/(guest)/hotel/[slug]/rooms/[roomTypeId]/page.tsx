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
  Cigarette,
  CreditCard,
  Info,
  MapPin,
} from "lucide-react";

// ── Feature icon + label map ───────────────────────────────────────────────────
const FEATURE_MAP: Record<string, { label: string; icon: React.ElementType }> =
  {
    "bosphorus-view": { label: "Bosphorus View", icon: Eye },
    "acropolis-view": { label: "Acropolis View", icon: Eye },
    "panoramic-view": { label: "Panoramic View", icon: Eye },
    "city-view": { label: "City View", icon: Eye },
    "garden-view": { label: "Garden View", icon: Leaf },
    "garden-terrace": { label: "Garden Terrace", icon: Leaf },
    "private-terrace": { label: "Private Terrace", icon: Leaf },
    minibar: { label: "Minibar", icon: Coffee },
    "rain-shower": { label: "Rain Shower", icon: Bath },
    jacuzzi: { label: "Jacuzzi", icon: Bath },
    bathrobe: { label: "Bathrobe & Slippers", icon: Star },
    butler: { label: "Butler Service", icon: Star },
    "air-conditioning": { label: "Air Conditioning", icon: Wind },
    safe: { label: "In-room Safe", icon: ShieldCheck },
    "work-desk": { label: "Work Desk", icon: Briefcase },
    kitchenette: { label: "Kitchenette", icon: Utensils },
    "connecting-rooms": { label: "Connecting Rooms", icon: Users },
    "bunk-beds": { label: "Bunk Beds (children)", icon: Bed },
    "twin-beds": { label: "Twin Beds", icon: Bed },
    tv: { label: "Smart TV", icon: Tv },
    wifi: { label: "High-Speed WiFi", icon: Wifi },
    gym: { label: "Gym Access", icon: Dumbbell },
  };

function featureInfo(f: string): { label: string; icon: React.ElementType } {
  return (
    FEATURE_MAP[f] ?? {
      label: f.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      icon: CheckCircle2,
    }
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
      <div className="absolute bottom-4 text-center">
        <p className="text-sm text-white/60">
          {photos[current]?.credit} · {current + 1} / {photos.length}
        </p>
        <div className="mt-2 flex justify-center gap-1.5">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setCurrent(i);
              }}
              className={`h-1.5 rounded-full transition-all ${i === current ? "w-5 bg-white" : "w-1.5 bg-white/40"}`}
            />
          ))}
        </div>
      </div>
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
        <Skeleton className="h-4 w-1/2" />
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
      amenities: unknown;
    };
  };
  const r = room as unknown as RoomDetail;
  const photos = r.photos ?? [];
  const features = (Array.isArray(r.features) ? r.features : []) as string[];
  const hotel = r.hotel;
  const amenities = (
    Array.isArray(hotel.amenities) ? hotel.amenities : []
  ) as string[];

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
          <div className="relative">
            <div
              className="grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl"
              style={{ height: 440 }}
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
            {photos.length > 1 && (
              <button
                onClick={() => setLightboxIdx(0)}
                className="absolute bottom-3 right-3 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-700 shadow backdrop-blur hover:bg-white"
              >
                Show all {photos.length} photos
              </button>
            )}
          </div>
        ) : (
          <div className="h-72 rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e]" />
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* ── Left: details ─────────────────────────────────────────────── */}
          <div className="space-y-6 lg:col-span-2">
            {/* Title block */}
            <div className="border-b pb-4">
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
              <div className="mt-2 flex items-center gap-1.5 text-gray-500">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">
                  {hotel.address?.city}, {hotel.address?.country}
                </span>
              </div>
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

            {/* Features — with icons */}
            {features.length > 0 && (
              <div className="rounded-xl border bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  What&apos;s included
                </h2>
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {features.map((f) => {
                    const { label, icon: Icon } = featureInfo(f);
                    return (
                      <li
                        key={f}
                        className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700"
                      >
                        <Icon className="h-4 w-4 shrink-0 text-[#1a1a2e]" />
                        {label}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Hotel amenities */}
            {amenities.length > 0 && (
              <div className="rounded-xl border bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Hotel amenities
                </h2>
                <div className="flex flex-wrap gap-2">
                  {(amenities as string[]).map((a) => (
                    <Badge key={a} variant="secondary" className="text-xs">
                      {a
                        .replace(/-/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Policies */}
            <div className="rounded-xl border bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Policies
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Check-in
                    </p>
                    <p className="text-sm text-gray-500">From 15:00</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Check-out
                    </p>
                    <p className="text-sm text-gray-500">Until 12:00</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BanIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Smoking</p>
                    <p className="text-sm text-gray-500">Not allowed</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <PawPrint className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Pets</p>
                    <p className="text-sm text-gray-500">Not allowed</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Cigarette className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Cancellation
                    </p>
                    <p className="text-sm text-gray-500">
                      Free cancellation any time
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Payment</p>
                    <p className="text-sm text-gray-500">
                      No card required to reserve
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Good to know */}
            {(hotel.wifiQuality ?? hotel.noiseNotes ?? r.noiseNotes) && (
              <div className="rounded-xl border bg-gray-50 p-5">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Info className="h-4 w-4" /> Good to know
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
                  {r.noiseNotes && (
                    <p className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-base">💡</span>
                      {r.noiseNotes}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: booking card ────────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <div className="rounded-2xl border bg-white p-6 shadow-lg">
                {r.baseRateCents ? (
                  <div className="mb-5">
                    <p className="text-xs text-gray-400">from</p>
                    <p className="text-3xl font-bold text-[#1a1a2e]">
                      ${(r.baseRateCents / 100).toFixed(0)}
                      <span className="ml-1 text-base font-normal text-gray-400">
                        /night
                      </span>
                    </p>
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
                      min={today}
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
                      min={checkIn || today}
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
                      {Array.from(
                        { length: room.capacity },
                        (_, i) => i + 1,
                      ).map((n) => (
                        <option key={n} value={n}>
                          {n} guest{n > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price breakdown */}
                  {nights > 0 && r.baseRateCents && (
                    <div className="rounded-lg bg-gray-50 p-3 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>
                          ${(r.baseRateCents / 100).toFixed(0)} × {nights} night
                          {nights > 1 ? "s" : ""}
                        </span>
                        <span>${subtotal.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Taxes & fees (10%)</span>
                        <span>${tax.toFixed(0)}</span>
                      </div>
                      <div className="mt-2 flex justify-between border-t pt-2 font-semibold text-gray-900">
                        <span>Total</span>
                        <span>${(subtotal + tax).toFixed(0)}</span>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleBook}
                    className="mt-2 w-full bg-[#1a1a2e] py-5 text-base hover:bg-[#16213e]"
                  >
                    Reserve Now
                  </Button>

                  <p className="text-center text-xs text-gray-400">
                    Free cancellation · No credit card required
                  </p>
                </div>

                {/* Feature highlights in card */}
                {features.length > 0 && (
                  <div className="mt-5 border-t pt-4">
                    <p className="mb-2 text-xs font-medium text-gray-500">
                      Highlights
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {features.slice(0, 5).map((f) => (
                        <Badge key={f} variant="secondary" className="text-xs">
                          {featureInfo(f).label}
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

              {/* Hotel summary card */}
              <div
                className="cursor-pointer rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md"
                onClick={() => router.push(`/hotel/${slug}`)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Property
                    </p>
                    <p className="mt-0.5 font-semibold text-gray-900">
                      {hotel.name}
                    </p>
                    {hotel.starRating && (
                      <p className="mt-0.5 text-sm text-amber-500">
                        {"★".repeat(hotel.starRating)}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                </div>
                <p className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="h-3 w-3" />
                  {hotel.address?.city}, {hotel.address?.country}
                </p>
                <p className="mt-1 text-xs text-[#1a1a2e] hover:underline">
                  View hotel details →
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
