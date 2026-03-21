"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Zap, Clock, Tag, Users } from "lucide-react";

export default function TonightDealsPage() {
  const [date] = useState(() => new Date().toISOString().split("T")[0]);

  const { data: dealsRaw, isLoading } = trpc.flashInventory.listActive.useQuery(
    {
      date,
      limit: 20,
    },
  );
  const deals = dealsRaw as any[] | undefined;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-r from-[#1a1a2e] to-[#16213e] px-8 py-10 text-white">
        <div className="flex items-center gap-3">
          <Zap className="h-8 w-8 text-amber-400" />
          <div>
            <h1 className="text-3xl font-bold">Tonight&apos;s Flash Deals</h1>
            <p className="mt-1 text-white/70">
              Exclusive same-night & night-use rates — updated live
            </p>
          </div>
        </div>
        <div className="mt-6 flex gap-6 text-sm text-white/60">
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> Limited time offers
          </span>
          <span className="flex items-center gap-1.5">
            <Tag className="h-4 w-4" /> Instant confirmation
          </span>
        </div>
      </div>

      {/* Deals grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : !deals || deals.length === 0 ? (
        <div className="py-20 text-center">
          <Zap className="mx-auto mb-4 h-12 w-12 text-gray-200" />
          <p className="text-lg font-semibold text-gray-600">
            No active deals right now
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Check back later — new flash deals are posted throughout the day
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((deal) => {
            const snapshot = deal.rateSnapshots?.[0];
            const hotel = deal.hotel as {
              name: string;
              slug: string;
              starRating?: number | null;
            };
            const roomType = deal.roomType as {
              name: string;
              capacity?: number | null;
            };
            const discountPct = snapshot
              ? Math.round(
                  ((snapshot.originalPriceCents - snapshot.flashPriceCents) /
                    snapshot.originalPriceCents) *
                    100,
                )
              : 0;

            return (
              <div
                key={deal.id}
                className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-lg"
              >
                {/* Header band */}
                <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-white/70">
                      {deal.isVipEarlyAccess
                        ? "VIP Early Access"
                        : "Flash Deal"}
                    </span>
                    {discountPct > 0 && (
                      <Badge className="bg-amber-400 text-amber-900 hover:bg-amber-400">
                        -{discountPct}%
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-lg font-bold text-white">
                    {deal.name}
                  </p>
                </div>

                <div className="space-y-3 p-4">
                  <div>
                    <p className="font-semibold text-gray-900">{hotel.name}</p>
                    {hotel.starRating && (
                      <p className="text-sm text-amber-500">
                        {"★".repeat(hotel.starRating)}
                      </p>
                    )}
                  </div>

                  <div className="rounded-lg bg-gray-50 px-3 py-2">
                    <p className="text-xs text-gray-500">{roomType.name}</p>
                    {roomType.capacity && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                        <Users className="h-3 w-3" /> Up to {roomType.capacity}{" "}
                        guests
                      </p>
                    )}
                  </div>

                  {snapshot && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-[#1a1a2e]">
                        ${(snapshot.flashPriceCents / 100).toFixed(0)}
                      </span>
                      {discountPct > 0 && (
                        <span className="text-sm text-gray-400 line-through">
                          ${(snapshot.originalPriceCents / 100).toFixed(0)}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">/ night</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      Ends{" "}
                      {new Date(deal.endsAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <Link href={`/hotel/${hotel.slug}`}>
                      <Button
                        size="sm"
                        className="bg-[#1a1a2e] text-xs hover:bg-[#16213e]"
                      >
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
