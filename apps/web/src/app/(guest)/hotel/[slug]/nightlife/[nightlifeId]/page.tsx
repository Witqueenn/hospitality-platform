"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
  Star,
  MapPin,
  Calendar,
  Clock,
  Ticket,
  ShieldCheck,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
type Photo = { url: string; thumb: string; alt: string; credit: string };
type NightDetail = {
  id: string;
  name: string;
  experienceType: string;
  description: string | null;
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  priceCents: number | null;
  capacity: number | null;
  minAge: number | null;
  dressCode: string | null;
  features: unknown;
  photos: Photo[];
  isActive: boolean;
  hotel: {
    id: string;
    name: string;
    slug: string;
    starRating: number | null;
    address: Record<string, string>;
  };
};

// ── Type helpers ───────────────────────────────────────────────────────────────
const NIGHT_COLORS: Record<string, string> = {
  DJ_NIGHT: "bg-purple-100 text-purple-700",
  LIVE_MUSIC: "bg-pink-100 text-pink-700",
  VIP_LOUNGE: "bg-amber-100 text-amber-700",
  COCKTAIL_PARTY: "bg-rose-100 text-rose-700",
  THEMED_NIGHT: "bg-indigo-100 text-indigo-700",
  POOL_PARTY: "bg-cyan-100 text-cyan-700",
  COMEDY_SHOW: "bg-yellow-100 text-yellow-700",
  OTHER: "bg-gray-100 text-gray-600",
};

const NIGHT_LABELS: Record<string, string> = {
  DJ_NIGHT: "DJ Night",
  LIVE_MUSIC: "Live Music",
  VIP_LOUNGE: "VIP Lounge",
  COCKTAIL_PARTY: "Cocktail Party",
  THEMED_NIGHT: "Themed Night",
  POOL_PARTY: "Pool Party",
  COMEDY_SHOW: "Comedy Show",
  OTHER: "Other",
};

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({
  photos,
  index,
  onClose,
}: {
  photos: Photo[];
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function NightlifeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const nightlifeId = params.nightlifeId as string;

  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const { data, isLoading, error } = trpc.nightlife.getPublic.useQuery(
    { id: nightlifeId },
    { enabled: !!nightlifeId },
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

  if (error || !data) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-500">Nightlife experience not found.</p>
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

  const n = data as unknown as NightDetail;
  const photos = n.photos ?? [];
  const features = (Array.isArray(n.features) ? n.features : []) as string[];
  const hotel = n.hotel;

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
        <Link
          href={`/hotel/${slug}?tab=nightlife`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to {hotel.name}
        </Link>

        {/* Photo gallery */}
        {photos.length > 0 ? (
          <div className="relative">
            <div
              className="grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl"
              style={{ height: 400 }}
            >
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
          {/* Left: details */}
          <div className="space-y-6 lg:col-span-2">
            {/* Header block */}
            <div className="border-b pb-4">
              <div className="flex flex-wrap items-start gap-3">
                <h1 className="text-3xl font-bold text-gray-900">{n.name}</h1>
                <span
                  className={`mt-1 rounded-full px-3 py-1 text-sm font-medium ${NIGHT_COLORS[n.experienceType] ?? "bg-gray-100 text-gray-600"}`}
                >
                  {NIGHT_LABELS[n.experienceType] ?? n.experienceType}
                </span>
                {n.priceCents !== null && n.priceCents !== undefined && (
                  <span className="mt-1 flex items-center gap-1 rounded-full bg-[#1a1a2e] px-3 py-1 text-sm font-semibold text-white">
                    <Ticket className="h-3.5 w-3.5" /> $
                    {(n.priceCents / 100).toFixed(0)} ticket
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {n.description && (
              <div className="rounded-xl border bg-white p-6">
                <h2 className="mb-3 text-lg font-semibold text-gray-900">
                  About this event
                </h2>
                <p className="leading-relaxed text-gray-600">{n.description}</p>
              </div>
            )}

            {/* Details grid */}
            <div className="rounded-xl border bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Event Details
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {n.date && (
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#1a1a2e]" />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Date
                      </p>
                      <p className="mt-0.5 text-sm text-gray-700">
                        {formatDate(n.date)}
                      </p>
                    </div>
                  </div>
                )}
                {(n.startTime ?? n.endTime) && (
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#1a1a2e]" />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Time
                      </p>
                      <p className="mt-0.5 text-sm text-gray-700">
                        {n.startTime ?? ""}
                        {n.startTime && n.endTime ? " – " : ""}
                        {n.endTime ?? ""}
                      </p>
                    </div>
                  </div>
                )}
                {n.capacity && (
                  <div className="flex items-start gap-3">
                    <Users className="mt-0.5 h-4 w-4 shrink-0 text-[#1a1a2e]" />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Capacity
                      </p>
                      <p className="mt-0.5 text-sm text-gray-700">
                        {n.capacity} guests
                      </p>
                    </div>
                  </div>
                )}
                {n.minAge !== null && n.minAge !== undefined && (
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#1a1a2e]" />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Minimum Age
                      </p>
                      <p className="mt-0.5 text-sm text-gray-700">
                        {n.minAge}+
                      </p>
                    </div>
                  </div>
                )}
                {n.dressCode && (
                  <div className="flex items-start gap-3">
                    <Star className="mt-0.5 h-4 w-4 shrink-0 text-[#1a1a2e]" />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Dress Code
                      </p>
                      <p className="mt-0.5 text-sm text-gray-700">
                        {n.dressCode}
                      </p>
                    </div>
                  </div>
                )}
                {n.priceCents !== null && n.priceCents !== undefined && (
                  <div className="flex items-start gap-3">
                    <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-[#1a1a2e]" />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Ticket Price
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-gray-700">
                        ${(n.priceCents / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            {features.length > 0 && (
              <div className="rounded-xl border bg-white p-6">
                <h2 className="mb-3 text-lg font-semibold text-gray-900">
                  Features
                </h2>
                <div className="flex flex-wrap gap-2">
                  {features.map((f) => (
                    <Badge key={f} variant="secondary" className="text-sm">
                      {f}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: hotel info sticky card */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              {/* Ticket price highlight */}
              {n.priceCents !== null && n.priceCents !== undefined && (
                <div className="rounded-2xl border bg-[#1a1a2e] p-6 text-white shadow-lg">
                  <p className="text-xs font-medium text-white/60">
                    Ticket price
                  </p>
                  <p className="mt-1 text-4xl font-bold">
                    ${(n.priceCents / 100).toFixed(0)}
                  </p>
                  <p className="mt-1 text-sm text-white/60">per person</p>
                  {n.date && (
                    <p className="mt-3 rounded-lg bg-white/10 px-3 py-2 text-sm">
                      {formatDate(n.date)}
                    </p>
                  )}
                </div>
              )}

              {/* Hotel card */}
              <div
                className="cursor-pointer rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md"
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
