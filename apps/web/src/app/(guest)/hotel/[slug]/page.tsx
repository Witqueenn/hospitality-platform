"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import {
  Star,
  Wifi,
  MapPin,
  Users,
  Bed,
  Maximize2,
  MessageSquare,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";

const SENTIMENT_BADGE: Record<string, string> = {
  positive: "bg-green-100 text-green-700",
  negative: "bg-red-100 text-red-700",
  neutral: "bg-gray-100 text-gray-600",
};

const WIFI_BADGE: Record<string, string> = {
  excellent: "bg-green-100 text-green-700",
  good: "bg-blue-100 text-blue-700",
  fair: "bg-yellow-100 text-yellow-700",
  poor: "bg-red-100 text-red-700",
};

export default function HotelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
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
      <div className="space-y-4">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-500">Hotel not found.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  type HotelPhoto = { url: string; thumb: string; alt: string; credit: string };

  // Narrow the deeply nested Prisma return type to avoid TS2589
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
  const hotelData = hotel as unknown as HotelDetail;

  const addr = hotelData.address;
  const scores: number[] = hotelData.reviews.map((r) => r.overallScore);
  const avgScore =
    scores.length > 0
      ? (scores.reduce((s, v) => s + v, 0) / scores.length).toFixed(1)
      : null;

  return (
    <div className="space-y-8">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/search")}
        className="text-gray-500"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to results
      </Button>

      {/* Hero */}
      <div className="overflow-hidden rounded-2xl border bg-white">
        {/* Photo gallery */}
        {hotelData.photos?.length > 0 ? (
          <div className="grid h-72 grid-cols-4 grid-rows-2 gap-1 overflow-hidden">
            {/* Main photo — spans 2 cols × 2 rows */}
            <div className="relative col-span-2 row-span-2 overflow-hidden">
              <img
                src={hotelData.photos[0]?.url}
                alt={hotelData.photos[0]?.alt}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            {/* Up to 4 thumbnails */}
            {hotelData.photos.slice(1, 5).map((p, i) => (
              <div key={i} className="relative overflow-hidden">
                <img
                  src={p.thumb}
                  alt={p.alt}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
                {/* "See all" overlay on last visible thumb */}
                {i === 3 && hotelData.photos.length > 5 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="text-sm font-semibold text-white">
                      +{hotelData.photos.length - 5} more
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-[#1a1a2e] to-[#16213e]" />
        )}
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {hotelData.name}
                </h1>
                {hotelData.starRating && (
                  <div className="flex text-amber-400">
                    {Array.from({ length: hotelData.starRating }).map(
                      (_, i) => (
                        <Star key={i} className="h-5 w-5 fill-current" />
                      ),
                    )}
                  </div>
                )}
              </div>
              <p className="mt-1 flex items-center gap-1 text-gray-500">
                <MapPin className="h-4 w-4" />
                {addr.city}, {addr.country}
              </p>
              {avgScore && (
                <p className="mt-2 text-sm text-gray-600">
                  ⭐ {avgScore}/10 · {hotelData.reviews.length} reviews
                </p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/support/new?hotelId=${hotelData.id}`)
              }
            >
              <MessageSquare className="mr-2 h-4 w-4" /> Report Issue
            </Button>
          </div>

          {hotelData.shortDescription && (
            <p className="mt-4 text-gray-600">{hotelData.shortDescription}</p>
          )}

          {/* Transparency Panel */}
          <div className="mt-5 flex flex-wrap gap-3 rounded-xl bg-gray-50 p-4">
            {hotelData.wifiQuality && (
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${WIFI_BADGE[hotelData.wifiQuality] ?? "bg-gray-100 text-gray-600"}`}
              >
                <Wifi className="mr-1 inline h-3.5 w-3.5" />
                WiFi: {hotelData.wifiQuality}
              </span>
            )}
            {hotelData.noiseNotes && (
              <span className="rounded-full bg-yellow-50 px-3 py-1 text-sm text-yellow-700">
                🔊 {hotelData.noiseNotes}
              </span>
            )}
            {Array.isArray(hotelData.amenities) &&
              (hotelData.amenities as string[]).slice(0, 5).map((a) => (
                <Badge key={a} variant="secondary">
                  {a}
                </Badge>
              ))}
          </div>
        </div>
      </div>

      {/* Date selector */}
      <div className="flex flex-wrap items-end gap-4 rounded-xl border bg-white p-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Check-in
          </label>
          <input
            type="date"
            value={checkIn}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setCheckIn(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Check-out
          </label>
          <input
            type="date"
            value={checkOut}
            min={checkIn || new Date().toISOString().split("T")[0]}
            onChange={(e) => setCheckOut(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Guests
          </label>
          <select
            value={guestCount}
            onChange={(e) => setGuestCount(Number(e.target.value))}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} guest{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="rooms">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rooms">
            Rooms ({hotelData.roomTypes.length})
          </TabsTrigger>
          <TabsTrigger value="dining">
            Dining ({hotelData.diningExperiences.length})
          </TabsTrigger>
          <TabsTrigger value="nightlife">
            Nightlife ({hotelData.nightExperiences.length})
          </TabsTrigger>
          <TabsTrigger value="reviews">
            Reviews ({hotelData.reviews.length})
          </TabsTrigger>
        </TabsList>

        {/* Rooms */}
        <TabsContent value="rooms" className="mt-4">
          {hotelData.roomTypes.length === 0 ? (
            <p className="py-8 text-center text-gray-400">
              No rooms available.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {hotelData.roomTypes.map((room) => (
                <Link
                  key={room.id}
                  href={`/hotel/${slug}/rooms/${room.id}`}
                  className="group overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Room photo */}
                  {room.photos?.length > 0 ? (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={room.photos[0]?.url}
                        alt={room.photos[0]?.alt}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {room.photos.length > 1 && (
                        <div className="absolute bottom-2 right-2 flex gap-1">
                          {room.photos.slice(1, 4).map((p, i) => (
                            <img
                              key={i}
                              src={p.thumb}
                              alt={p.alt}
                              className="h-10 w-10 rounded-md border-2 border-white object-cover shadow"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200" />
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-[#1a1a2e]">
                          {room.name}
                        </h3>
                        <p className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Bed className="h-3.5 w-3.5" /> {room.bedType}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" /> {room.capacity}{" "}
                            guests
                          </span>
                          {room.sizeSqm && (
                            <span className="flex items-center gap-1">
                              <Maximize2 className="h-3.5 w-3.5" />{" "}
                              {String(room.sizeSqm)}m²
                            </span>
                          )}
                        </p>
                      </div>
                      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#1a1a2e]" />
                    </div>
                    {room.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                        {room.description}
                      </p>
                    )}
                    {Array.isArray(room.features) &&
                      room.features.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {(room.features as string[]).slice(0, 4).map((f) => (
                            <Badge
                              key={f}
                              variant="outline"
                              className="text-xs"
                            >
                              {f.replace(/-/g, " ")}
                            </Badge>
                          ))}
                          {(room.features as string[]).length > 4 && (
                            <Badge
                              variant="outline"
                              className="text-xs text-gray-400"
                            >
                              +{(room.features as string[]).length - 4}
                            </Badge>
                          )}
                        </div>
                      )}
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-sm font-semibold text-[#1a1a2e]">
                        View details & book →
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Dining */}
        <TabsContent value="dining" className="mt-4">
          {hotelData.diningExperiences.length === 0 ? (
            <p className="py-8 text-center text-gray-400">
              No dining experiences listed.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {hotelData.diningExperiences.map((d) => (
                <div
                  key={d.id}
                  className="overflow-hidden rounded-xl border bg-white"
                >
                  {d.photos?.length > 0 && (
                    <div className="h-36 overflow-hidden">
                      <img
                        src={d.photos[0]?.url}
                        alt={d.photos[0]?.alt}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-gray-900">{d.name}</h3>
                      <Badge variant="secondary">{d.diningType}</Badge>
                    </div>
                    {d.description && (
                      <p className="mt-2 text-sm text-gray-500">
                        {d.description}
                      </p>
                    )}
                    <p className="mt-3 text-sm text-gray-600">
                      {d.capacity ? `Capacity: ${d.capacity}` : ""}
                      {d.priceRange ? ` · ${d.priceRange}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Nightlife */}
        <TabsContent value="nightlife" className="mt-4">
          {hotelData.nightExperiences.length === 0 ? (
            <p className="py-8 text-center text-gray-400">
              No nightlife experiences listed.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {hotelData.nightExperiences.map((n) => (
                <div
                  key={n.id}
                  className="overflow-hidden rounded-xl border bg-white"
                >
                  {n.photos?.length > 0 && (
                    <div className="h-36 overflow-hidden">
                      <img
                        src={n.photos[0]?.url}
                        alt={n.photos[0]?.alt}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-gray-900">{n.name}</h3>
                      <Badge variant="secondary">{n.experienceType}</Badge>
                    </div>
                    {n.description && (
                      <p className="mt-2 text-sm text-gray-500">
                        {n.description}
                      </p>
                    )}
                    {n.priceCents && (
                      <p className="mt-3 text-sm font-medium text-gray-700">
                        Ticket: ${(n.priceCents / 100).toFixed(0)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Reviews */}
        <TabsContent value="reviews" className="mt-4">
          {hotelData.reviews.length === 0 ? (
            <p className="py-8 text-center text-gray-400">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {hotelData.reviews.map((r) => (
                <div key={r.id} className="rounded-xl border bg-white p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {r.guest?.name ?? "Guest"}
                      </p>
                      {r.title && (
                        <p className="text-sm font-semibold text-gray-700">
                          {r.title}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-[#1a1a2e] px-2 py-1 text-sm font-bold text-white">
                        {r.overallScore}/10
                      </span>
                      {r.sentiment && (
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${SENTIMENT_BADGE[r.sentiment] ?? ""}`}
                        >
                          {r.sentiment}
                        </span>
                      )}
                    </div>
                  </div>
                  {r.text && (
                    <p className="mt-2 text-sm text-gray-600">{r.text}</p>
                  )}
                  {r.hotelResponse && (
                    <div className="mt-3 rounded-lg bg-blue-50 p-3">
                      <p className="text-xs font-semibold text-blue-800">
                        Hotel Response
                      </p>
                      <p className="mt-1 text-sm text-blue-700">
                        {r.hotelResponse}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {hotelData.description && (
        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">About</h2>
          <p className="text-gray-600">{hotelData.description}</p>
        </div>
      )}
    </div>
  );
}
