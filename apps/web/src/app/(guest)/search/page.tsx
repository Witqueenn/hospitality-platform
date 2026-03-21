"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@repo/shared";

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
  });

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
    roomTypes: { baseRateCents: number }[];
  };

  const { data: rawData, isLoading } = trpc.hotel.search.useQuery({
    city: search.city || undefined,
    checkIn: search.checkIn || undefined,
    checkOut: search.checkOut || undefined,
    guestCount: search.guestCount,
  });
  const data = rawData as { items: HotelResult[]; total: number } | undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-[#1a1a2e] px-4 py-10 text-white">
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-6 text-3xl font-bold">Find Your Perfect Stay</h1>
          <div className="grid grid-cols-1 gap-3 rounded-xl bg-white p-4 md:grid-cols-4">
            <input
              placeholder="City or destination"
              value={filters.city}
              onChange={(e) =>
                setFilters((f) => ({ ...f, city: e.target.value }))
              }
              className="rounded-lg border px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
            />
            <input
              type="date"
              placeholder="Check-in"
              value={filters.checkIn}
              onChange={(e) =>
                setFilters((f) => ({ ...f, checkIn: e.target.value }))
              }
              className="rounded-lg border px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
            />
            <input
              type="date"
              placeholder="Check-out"
              value={filters.checkOut}
              onChange={(e) =>
                setFilters((f) => ({ ...f, checkOut: e.target.value }))
              }
              className="rounded-lg border px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
            />
            <button
              onClick={() =>
                setSearch({
                  city: filters.city,
                  checkIn: filters.checkIn,
                  checkOut: filters.checkOut,
                  guestCount: filters.guestCount,
                })
              }
              className="rounded-lg bg-[#e94560] px-6 py-2.5 font-semibold text-white transition-colors hover:bg-[#c73652]"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        {isLoading ? (
          <div className="py-20 text-center text-gray-400">Searching...</div>
        ) : !data?.items.length ? (
          <div className="py-20 text-center text-gray-400">
            No hotels found. Try a different search.
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">{data.total} hotels found</p>
            {data.items.map((hotel: any) => {
              const reviews = hotel.reviews as { overallScore: number }[];
              const avgScore =
                reviews.length > 0
                  ? Math.round(
                      (reviews.reduce((s, r) => s + r.overallScore, 0) /
                        reviews.length) *
                        10,
                    ) / 10
                  : null;

              return (
                <div
                  key={hotel.id}
                  className="rounded-xl border bg-white p-5 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h2 className="text-lg font-bold text-gray-900">
                          {hotel.name}
                        </h2>
                        {hotel.starRating && (
                          <span className="text-sm text-yellow-500">
                            {"★".repeat(hotel.starRating)}
                          </span>
                        )}
                        {hotel.status === "ACTIVE" && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                            Verified ✓
                          </span>
                        )}
                      </div>

                      <p className="mb-2 text-sm text-gray-500">
                        {(hotel.address as Record<string, string>)?.city},{" "}
                        {(hotel.address as Record<string, string>)?.country}
                      </p>

                      {hotel.shortDescription && (
                        <p className="mb-3 text-sm text-gray-600">
                          {hotel.shortDescription}
                        </p>
                      )}

                      {/* Transparency */}
                      <div className="flex flex-wrap gap-2">
                        {hotel.wifiQuality && (
                          <span className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-600">
                            Wi-Fi: {hotel.wifiQuality}
                          </span>
                        )}
                        {(hotel.amenities as string[]).slice(0, 3).map((a) => (
                          <span
                            key={a}
                            className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      {avgScore && (
                        <div className="mb-2">
                          <span className="text-2xl font-bold text-gray-900">
                            {avgScore}
                          </span>
                          <span className="text-sm text-gray-400">/10</span>
                          <p className="text-xs text-gray-400">
                            {reviews.length} reviews
                          </p>
                        </div>
                      )}

                      <Link
                        href={`/hotel/${hotel.slug}`}
                        className="block rounded-lg bg-[#1a1a2e] px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-[#16213e]"
                      >
                        View Hotel
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
