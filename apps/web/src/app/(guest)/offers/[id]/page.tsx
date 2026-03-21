"use client";

import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import {
  Package,
  Tag,
  CheckCircle,
  Clock,
  ArrowLeft,
  Hotel,
  Sparkles,
  TrendingDown,
  CalendarRange,
  BadgePercent,
} from "lucide-react";

const ITEM_TYPE_ICONS: Record<string, string> = {
  ROOM_NIGHTS: "🛏",
  LOCAL_EXPERIENCE: "🗺",
  AMENITY_PASS: "🧖",
  TRANSFER: "🚗",
  DINING_CREDIT: "🍽",
  ROOM_EXTRA: "✨",
  SPA: "💆",
  ACTIVITY: "🎯",
};

function getItemLabel(item: any): string {
  if (item.metadata?.itemLabel) return item.metadata.itemLabel as string;
  const labels: Record<string, string> = {
    ROOM_NIGHTS: "Accommodation",
    LOCAL_EXPERIENCE: "Local Experience",
    AMENITY_PASS: "Amenity Access",
    TRANSFER: "Transfer Service",
    DINING_CREDIT: "Dining Credit",
    ROOM_EXTRA: "Room Extra",
    SPA: "Spa Treatment",
    ACTIVITY: "Activity",
  };
  return labels[item.itemType] ?? item.itemType;
}

function getSavingsPercent(bundle: any): number | null {
  if (!bundle.subtotalCents || !bundle.totalCents) return null;
  const saving = bundle.subtotalCents - bundle.totalCents;
  if (saving <= 0) return null;
  return Math.round((saving / bundle.subtotalCents) * 100);
}

function getBundgeTypeLabel(bundleType: string): string {
  const labels: Record<string, string> = {
    CURATED: "Curated Package",
    VIP_EXCLUSIVE: "VIP Exclusive",
    ACTIVITY_PACK: "Activity Pack",
    SEASONAL: "Seasonal Offer",
    FLASH: "Flash Deal",
  };
  return labels[bundleType] ?? bundleType;
}

export default function OfferDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const { data: bundle, isLoading } = trpc.bundle.getBundle.useQuery({ id });

  const handleBook = () => {
    toast.success(
      "Bundle booking coming soon — our concierge will be in touch!",
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 py-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="py-20 text-center">
        <Package className="mx-auto mb-4 h-12 w-12 text-gray-200" />
        <p className="text-gray-500">Offer not found.</p>
        <Link
          href="/offers"
          className="mt-4 inline-block text-sm text-blue-600 hover:underline"
        >
          Back to offers
        </Link>
      </div>
    );
  }

  const b = bundle as any;
  const savingsPercent = getSavingsPercent(b);
  const savings =
    b.subtotalCents && b.totalCents ? b.subtotalCents - b.totalCents : 0;
  const sym = b.currency === "EUR" ? "€" : "$";

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        href="/offers"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        All Offers
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Hero */}
          <div className="overflow-hidden rounded-2xl shadow-sm">
            <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-8 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {b.hotel && (
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-white/50">
                      <Hotel className="h-3.5 w-3.5" />
                      {b.hotel.name}
                    </p>
                  )}
                  <h1 className="text-2xl font-bold leading-tight">{b.name}</h1>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                      {getBundgeTypeLabel(b.bundleType)}
                    </span>
                    {b.isVipOnly && (
                      <span className="flex items-center gap-1 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-gray-900">
                        <Sparkles className="h-3 w-3" />
                        VIP Only
                      </span>
                    )}
                    {savingsPercent && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
                        <BadgePercent className="h-3 w-3" />
                        Save {savingsPercent}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {b.description && (
                <p className="mt-4 leading-relaxed text-white/70">
                  {b.description}
                </p>
              )}

              {/* Validity */}
              {(b.startsAt || b.endsAt) && (
                <div className="mt-5 flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm text-white/60">
                  <CalendarRange className="h-4 w-4 shrink-0" />
                  <span>
                    Valid{" "}
                    {b.startsAt
                      ? `from ${new Date(b.startsAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}`
                      : ""}
                    {b.endsAt
                      ? ` until ${new Date(b.endsAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}`
                      : ""}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* What's included */}
          {b.items?.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
                What&apos;s Included
              </h2>
              <div className="divide-y rounded-2xl border bg-white">
                {(b.items as any[]).map((item: any, idx: number) => (
                  <div
                    key={item.id ?? idx}
                    className="flex items-center gap-4 px-5 py-4"
                  >
                    <span className="text-2xl" aria-hidden="true">
                      {ITEM_TYPE_ICONS[item.itemType] ?? "✓"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900">
                        {getItemLabel(item)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-gray-400">
                          × {item.quantity}
                        </p>
                      )}
                    </div>
                    {item.unitCents != null && item.unitCents > 0 && (
                      <span className="text-sm font-semibold text-gray-700">
                        {sym}
                        {((item.unitCents * item.quantity) / 100).toFixed(0)}
                      </span>
                    )}
                    {item.unitCents === 0 && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        Included
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Savings breakdown */}
          {b.subtotalCents &&
            b.totalCents &&
            b.subtotalCents > b.totalCents && (
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
                  Your Savings
                </h2>
                <div className="rounded-2xl border bg-emerald-50 p-5">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="h-8 w-8 text-emerald-600" />
                    <div>
                      <p className="text-2xl font-bold text-emerald-700">
                        {sym}
                        {(savings / 100).toFixed(0)} saved
                      </p>
                      <p className="text-sm text-emerald-600">
                        compared to booking each item separately
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white p-3 text-center">
                      <p className="text-xs text-gray-400">Individual price</p>
                      <p className="text-lg font-bold text-gray-400 line-through">
                        {sym}
                        {(b.subtotalCents / 100).toFixed(0)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-emerald-100 p-3 text-center">
                      <p className="text-xs text-emerald-600">Bundle price</p>
                      <p className="text-lg font-bold text-emerald-700">
                        {sym}
                        {(b.totalCents / 100).toFixed(0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* Why book this bundle */}
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
              Why Book This Bundle?
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: CheckCircle,
                  title: "Fully arranged",
                  desc: "Everything pre-organised — just show up and enjoy",
                },
                {
                  icon: Tag,
                  title: "Best value",
                  desc: "Bundled price is lower than booking each item separately",
                },
                {
                  icon: Clock,
                  title: "Flexible dates",
                  desc: "Choose your preferred dates at checkout",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="rounded-xl border bg-white p-4"
                >
                  <card.icon className="mb-2 h-5 w-5 text-[#1a1a2e]" />
                  <p className="font-semibold text-gray-900">{card.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: booking card */}
        <div>
          <div className="sticky top-4 space-y-5 rounded-2xl border bg-white p-6 shadow-sm">
            {/* Price */}
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Bundle total
              </p>
              {b.subtotalCents &&
                b.totalCents &&
                b.subtotalCents > b.totalCents && (
                  <p className="mt-1 text-sm text-gray-400 line-through">
                    {sym}
                    {(b.subtotalCents / 100).toFixed(0)}
                  </p>
                )}
              <p className="text-3xl font-bold text-gray-900">
                {b.totalCents
                  ? `${sym}${(b.totalCents / 100).toFixed(0)}`
                  : "On request"}
              </p>
              {savingsPercent && (
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                  <BadgePercent className="h-3 w-3" />
                  {savingsPercent}% off
                </span>
              )}
            </div>

            <Button
              className="w-full bg-[#1a1a2e] py-6 text-base hover:bg-[#16213e]"
              onClick={handleBook}
            >
              Book This Bundle
            </Button>

            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                No upfront payment required
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                Free cancellation within 24 hours
              </div>
              {b.endsAt && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  Offer valid until{" "}
                  {new Date(b.endsAt).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              )}
            </div>

            {/* Items summary */}
            {b.items?.length > 0 && (
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Includes
                </p>
                <div className="space-y-1.5">
                  {(b.items as any[])
                    .slice(0, 5)
                    .map((item: any, idx: number) => (
                      <div
                        key={item.id ?? idx}
                        className="flex items-center gap-2 text-xs text-gray-600"
                      >
                        <span>{ITEM_TYPE_ICONS[item.itemType] ?? "✓"}</span>
                        <span>{getItemLabel(item)}</span>
                      </div>
                    ))}
                  {b.items.length > 5 && (
                    <p className="text-xs text-gray-400">
                      +{b.items.length - 5} more items
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
