"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@repo/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  Wifi,
  MapPin,
  Users,
  Bed,
  Maximize2,
  MessageSquare,
  ArrowLeft,
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addr = (hotel as any).address as Record<string, string>;
  const avgScore =
    hotel.reviews.length > 0
      ? (
          hotel.reviews.reduce((s, r) => s + r.overallScore, 0) /
          hotel.reviews.length
        ).toFixed(1)
      : null;

  const handleBookRoom = (roomTypeId: string, pricePerNight: number) => {
    if (!checkIn || !checkOut) {
      alert("Please select check-in and check-out dates first.");
      return;
    }
    router.push(
      `/booking/new?hotelId=${hotel.id}&roomTypeId=${roomTypeId}&checkIn=${checkIn}&checkOut=${checkOut}&guestCount=${guestCount}&price=${pricePerNight}`,
    );
  };

  return (
    <div className="space-y-8">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="text-gray-500"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to results
      </Button>

      {/* Hero */}
      <div className="overflow-hidden rounded-2xl border bg-white">
        <div className="h-48 bg-gradient-to-br from-[#1a1a2e] to-[#16213e]" />
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {hotel.name}
                </h1>
                {hotel.starRating && (
                  <div className="flex text-amber-400">
                    {Array.from({ length: hotel.starRating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                )}
              </div>
              <p className="mt-1 flex items-center gap-1 text-gray-500">
                <MapPin className="h-4 w-4" />
                {addr.city}, {addr.country}
              </p>
              {avgScore && (
                <p className="mt-2 text-sm text-gray-600">
                  ⭐ {avgScore}/10 · {hotel.reviews.length} reviews
                </p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => router.push(`/support/new?hotelId=${hotel.id}`)}
            >
              <MessageSquare className="mr-2 h-4 w-4" /> Report Issue
            </Button>
          </div>

          {hotel.shortDescription && (
            <p className="mt-4 text-gray-600">{hotel.shortDescription}</p>
          )}

          {/* Transparency Panel */}
          <div className="mt-5 flex flex-wrap gap-3 rounded-xl bg-gray-50 p-4">
            {hotel.wifiQuality && (
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${WIFI_BADGE[hotel.wifiQuality] ?? "bg-gray-100 text-gray-600"}`}
              >
                <Wifi className="mr-1 inline h-3.5 w-3.5" />
                WiFi: {hotel.wifiQuality}
              </span>
            )}
            {hotel.noiseNotes && (
              <span className="rounded-full bg-yellow-50 px-3 py-1 text-sm text-yellow-700">
                🔊 {hotel.noiseNotes}
              </span>
            )}
            {Array.isArray(hotel.amenities) &&
              (hotel.amenities as string[]).slice(0, 5).map((a) => (
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
            Rooms ({hotel.roomTypes.length})
          </TabsTrigger>
          <TabsTrigger value="dining">
            Dining ({hotel.diningExperiences.length})
          </TabsTrigger>
          <TabsTrigger value="nightlife">
            Nightlife ({hotel.nightExperiences.length})
          </TabsTrigger>
          <TabsTrigger value="reviews">
            Reviews ({hotel.reviews.length})
          </TabsTrigger>
        </TabsList>

        {/* Rooms */}
        <TabsContent value="rooms" className="mt-4">
          {hotel.roomTypes.length === 0 ? (
            <p className="py-8 text-center text-gray-400">
              No rooms available.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {hotel.roomTypes.map((room) => (
                <div
                  key={room.id}
                  className="rounded-xl border bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
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
                  </div>
                  {room.description && (
                    <p className="mt-2 text-sm text-gray-500">
                      {room.description}
                    </p>
                  )}
                  {Array.isArray(room.features) && room.features.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {(room.features as string[]).map((f) => (
                        <Badge key={f} variant="outline" className="text-xs">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">from</p>
                      <p className="text-lg font-bold text-[#1a1a2e]">
                        {formatCurrency(0)}/night
                      </p>
                    </div>
                    <Button
                      onClick={() => handleBookRoom(room.id, 0)}
                      className="bg-[#1a1a2e] hover:bg-[#16213e]"
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Dining */}
        <TabsContent value="dining" className="mt-4">
          {hotel.diningExperiences.length === 0 ? (
            <p className="py-8 text-center text-gray-400">
              No dining experiences listed.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {hotel.diningExperiences.map((d) => (
                <div key={d.id} className="rounded-xl border bg-white p-5">
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
              ))}
            </div>
          )}
        </TabsContent>

        {/* Nightlife */}
        <TabsContent value="nightlife" className="mt-4">
          {hotel.nightExperiences.length === 0 ? (
            <p className="py-8 text-center text-gray-400">
              No nightlife experiences listed.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {hotel.nightExperiences.map((n) => (
                <div key={n.id} className="rounded-xl border bg-white p-5">
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
                      Ticket: {formatCurrency(n.priceCents)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Reviews */}
        <TabsContent value="reviews" className="mt-4">
          {hotel.reviews.length === 0 ? (
            <p className="py-8 text-center text-gray-400">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {hotel.reviews.map((r) => (
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

      {hotel.description && (
        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">About</h2>
          <p className="text-gray-600">{hotel.description}</p>
        </div>
      )}
    </div>
  );
}
