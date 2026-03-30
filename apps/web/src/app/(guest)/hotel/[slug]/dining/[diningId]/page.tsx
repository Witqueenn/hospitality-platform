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
  UtensilsCrossed,
  Clock,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
type Photo = { url: string; thumb: string; alt: string; credit: string };
type DiningDetail = {
  id: string;
  name: string;
  diningType: string;
  description: string | null;
  cuisine: unknown;
  capacity: number | null;
  priceRange: string | null;
  menuHighlights: unknown;
  openHours: unknown;
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
const TYPE_COLORS: Record<string, string> = {
  RESTAURANT: "bg-orange-100 text-orange-700",
  ROOM_SERVICE: "bg-blue-100 text-blue-700",
  BRUNCH: "bg-yellow-100 text-yellow-700",
  ROOFTOP: "bg-purple-100 text-purple-700",
  PRIVATE_DINING: "bg-rose-100 text-rose-700",
  GROUP_DINING: "bg-green-100 text-green-700",
  BUFFET: "bg-teal-100 text-teal-700",
};

const TYPE_LABELS: Record<string, string> = {
  RESTAURANT: "Restaurant",
  ROOM_SERVICE: "Room Service",
  BRUNCH: "Brunch",
  ROOFTOP: "Rooftop",
  PRIVATE_DINING: "Private Dining",
  GROUP_DINING: "Group Dining",
  BUFFET: "Buffet",
};

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
        className="bg-nv-border/10 text-nv-text hover:bg-nv-border/20 absolute right-4 top-4 rounded-full p-2"
      >
        <X className="h-5 w-5" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          prev();
        }}
        className="bg-nv-border/10 text-nv-text hover:bg-nv-border/20 absolute left-4 rounded-full p-3"
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
        className="bg-nv-border/10 text-nv-text hover:bg-nv-border/20 absolute right-4 rounded-full p-3"
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
export default function DiningDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const diningId = params.diningId as string;

  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const { data, isLoading, error } = trpc.dining.getPublic.useQuery(
    { id: diningId },
    { enabled: !!diningId },
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
        <p className="text-nv-dim">Dining experience not found.</p>
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

  const d = data as unknown as DiningDetail;
  const photos = d.photos ?? [];
  const cuisine = (Array.isArray(d.cuisine) ? d.cuisine : []) as string[];
  const menuHighlights = (
    Array.isArray(d.menuHighlights) ? d.menuHighlights : []
  ) as string[];
  const hotel = d.hotel;

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
          href={`/hotel/${slug}?tab=dining`}
          className="text-nv-dim hover:text-nv-text inline-flex items-center gap-1.5 text-sm"
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
                className="bg-nv-surface border-nv-border/10 text-nv-dim hover:bg-nv-surface absolute bottom-3 right-3 rounded-lg px-3 py-1.5 text-xs font-medium shadow backdrop-blur"
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
                <h1 className="text-nv-text text-3xl font-bold">{d.name}</h1>
                <span
                  className={`mt-1 rounded-full px-3 py-1 text-sm font-medium ${TYPE_COLORS[d.diningType] ?? "bg-gray-100 text-gray-600"}`}
                >
                  {TYPE_LABELS[d.diningType] ?? d.diningType}
                </span>
                {d.priceRange && (
                  <span className="bg-nv-surface text-nv-muted mt-1 rounded-full px-3 py-1 font-mono text-sm font-bold">
                    {d.priceRange}
                  </span>
                )}
              </div>
              {d.capacity && (
                <p className="text-nv-dim mt-2 flex items-center gap-1.5 text-sm">
                  <Users className="h-4 w-4" /> Capacity: {d.capacity} covers
                </p>
              )}
            </div>

            {/* Description */}
            {d.description && (
              <div className="border-nv-border/10 bg-nv-surface rounded-xl border p-6">
                <h2 className="text-nv-text mb-3 text-lg font-semibold">
                  About this experience
                </h2>
                <p className="text-nv-muted leading-relaxed">{d.description}</p>
              </div>
            )}

            {/* Cuisine tags */}
            {cuisine.length > 0 && (
              <div className="border-nv-border/10 bg-nv-surface rounded-xl border p-6">
                <h2 className="text-nv-text mb-3 text-lg font-semibold">
                  Cuisine
                </h2>
                <div className="flex flex-wrap gap-2">
                  {cuisine.map((c: any) => (
                    <Badge key={c} variant="secondary" className="text-sm">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Menu highlights */}
            {menuHighlights.length > 0 && (
              <div className="border-nv-border/10 bg-nv-surface rounded-xl border p-6">
                <h2 className="text-nv-text mb-3 text-lg font-semibold">
                  Menu Highlights
                </h2>
                <ul className="space-y-2">
                  {menuHighlights.map((h: any) => (
                    <li key={h} className="text-nv-dim flex items-center gap-2">
                      <span className="text-emerald-500">•</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Opening hours placeholder */}
            <div className="border-nv-border/10 bg-nv-surface/50 rounded-xl border p-5">
              <h2 className="text-nv-dim mb-3 flex items-center gap-2 text-sm font-semibold">
                <Clock className="h-4 w-4" /> Opening Hours
              </h2>
              <p className="text-nv-dim text-sm">
                Please contact the hotel for current opening hours and
                reservations.
              </p>
            </div>
          </div>

          {/* Right: hotel info sticky card */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <div
                className="border-nv-border/10 bg-nv-surface cursor-pointer rounded-xl border p-5 shadow-sm transition hover:shadow-md"
                onClick={() => router.push(`/hotel/${slug}`)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-nv-muted text-xs font-semibold uppercase tracking-wide">
                      Property
                    </p>
                    <p className="text-nv-text mt-0.5 font-semibold">
                      {hotel.name}
                    </p>
                    {hotel.starRating && (
                      <p className="mt-0.5 text-sm text-amber-500">
                        {"★".repeat(hotel.starRating)}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="text-nv-muted h-4 w-4" />
                </div>
                <p className="text-nv-dim mt-2 flex items-center gap-1 text-xs">
                  <MapPin className="h-3 w-3" />
                  {hotel.address?.city}, {hotel.address?.country}
                </p>
                <p className="mt-1 text-xs text-[#1a1a2e] hover:underline">
                  View hotel details →
                </p>
              </div>

              {/* Quick info card */}
              <div className="border-nv-border/10 bg-nv-surface rounded-xl border p-5">
                <h3 className="text-nv-dim mb-4 text-sm font-semibold">
                  Quick Info
                </h3>
                <div className="space-y-3">
                  <div className="text-nv-muted flex items-center gap-2 text-sm">
                    <UtensilsCrossed className="h-4 w-4 text-[#1a1a2e]" />
                    <span>
                      {TYPE_LABELS[d.diningType] ?? d.diningType} experience
                    </span>
                  </div>
                  {d.capacity && (
                    <div className="text-nv-muted flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-[#1a1a2e]" />
                      <span>Up to {d.capacity} covers</span>
                    </div>
                  )}
                  {hotel.starRating && (
                    <div className="text-nv-muted flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span>{hotel.starRating}-star property</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
