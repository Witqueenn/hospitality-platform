"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Car, Star, Clock, Users } from "lucide-react";

const MOBILITY_TYPE_LABELS: Record<string, string> = {
  TAXI: "Taxi",
  TRANSFER: "Transfer",
  RENTAL: "Rental",
  SHUTTLE: "Shuttle",
  CHAUFFEUR: "Chauffeur",
  BICYCLE: "Bicycle",
  SCOOTER: "Scooter",
};

export default function MobilityPage() {
  const [mobilityType, setMobilityType] = useState<string>("");

  const { data: products, isLoading } = trpc.mobility.listProducts.useQuery({
    mobilityType: (mobilityType as any) || undefined,
    limit: 20,
  });

  const list = (products as any[]) ?? [];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Car className="h-7 w-7 text-[#1a1a2e]" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mobility</h1>
          <p className="text-sm text-gray-500">
            Transfers, rentals & chauffeur services
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={mobilityType}
          onChange={(e) => setMobilityType(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">All types</option>
          {Object.entries(MOBILITY_TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="py-20 text-center">
          <Car className="mx-auto mb-4 h-12 w-12 text-gray-200" />
          <p className="text-gray-500">No mobility options available.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((product: any) => (
            <a
              key={product.id}
              href={`/mobility/${product.id}`}
              className="group overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                  <Car className="h-6 w-6 text-blue-600" />
                </div>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                  {MOBILITY_TYPE_LABELS[product.mobilityType] ??
                    product.mobilityType}
                </span>
              </div>

              <div className="mt-4">
                <p className="line-clamp-1 font-semibold text-gray-900">
                  {product.name}
                </p>
                {product.mobilityProvider && (
                  <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {product.mobilityProvider.ratingAggregate != null
                      ? Number(
                          product.mobilityProvider.ratingAggregate,
                        ).toFixed(1)
                      : "—"}
                    <span className="ml-1">
                      {product.mobilityProvider.name}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-400">
                {product.durationMinutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {product.durationMinutes} min
                  </span>
                )}
                {product.capacity && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> {product.capacity} pax
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-gray-400">per trip</span>
                <span className="font-bold text-[#1a1a2e]">
                  {product.priceCents != null
                    ? `$${(product.priceCents / 100).toFixed(0)}`
                    : "On request"}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
