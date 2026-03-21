"use client";

import { use } from "react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Car, Star, Clock, Users, MapPin, CheckCircle } from "lucide-react";

export default function MobilityDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = use(params);

  const { data: product, isLoading } = trpc.mobility.getProduct.useQuery({
    id: productId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center">
        <Car className="mx-auto mb-4 h-12 w-12 text-gray-200" />
        <p className="text-gray-500">Product not found.</p>
      </div>
    );
  }

  const p = product as any;

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main info */}
        <div className="space-y-6 lg:col-span-2">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
              <Car className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{p.name}</h1>
              {p.mobilityProvider && (
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                  <span>{p.mobilityProvider.name}</span>
                  {p.mobilityProvider.ratingAggregate != null && (
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {p.mobilityProvider.ratingAggregate.toFixed(1)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {p.description && (
            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
                About
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                {p.description}
              </p>
            </div>
          )}

          {/* Specs */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {p.durationMinutes && (
              <div className="rounded-xl border bg-white p-4 text-center">
                <Clock className="mx-auto mb-1 h-5 w-5 text-gray-400" />
                <p className="text-lg font-bold text-gray-900">
                  {p.durationMinutes}
                </p>
                <p className="text-xs text-gray-400">Minutes</p>
              </div>
            )}
            {p.capacity && (
              <div className="rounded-xl border bg-white p-4 text-center">
                <Users className="mx-auto mb-1 h-5 w-5 text-gray-400" />
                <p className="text-lg font-bold text-gray-900">{p.capacity}</p>
                <p className="text-xs text-gray-400">Passengers</p>
              </div>
            )}
          </div>

          {/* Hotel */}
          {p.hotel && (
            <div className="flex items-center gap-3 rounded-xl border bg-white p-4">
              <MapPin className="h-5 w-5 shrink-0 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Serving hotel</p>
                <p className="font-semibold text-gray-900">{p.hotel.name}</p>
              </div>
            </div>
          )}

          {/* Inclusions */}
          {p.inclusions && p.inclusions.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
                Included
              </h2>
              <div className="space-y-2">
                {(p.inclusions as string[]).map((inc: string) => (
                  <div
                    key={inc}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                    {inc}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Booking card */}
        <div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-400">
              Price per trip
            </p>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              {p.priceCents != null
                ? `$${(p.priceCents / 100).toFixed(0)}`
                : "On request"}
            </p>
            {p.mobilityType && (
              <p className="mt-1 text-xs text-gray-400">{p.mobilityType}</p>
            )}
            <Button className="mt-6 w-full bg-[#1a1a2e] hover:bg-[#16213e]">
              Book Transfer
            </Button>
            <p className="mt-3 text-center text-xs text-gray-400">
              Free cancellation up to 2h before
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
