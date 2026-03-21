"use client";

import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Package, Tag, Clock, CheckCircle } from "lucide-react";

export default function OffersPage() {
  const { data: bundles, isLoading } = trpc.bundle.listActive.useQuery({
    limit: 20,
  });

  const list = (bundles as any[]) ?? [];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Tag className="h-7 w-7 text-[#1a1a2e]" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Special Offers</h1>
          <p className="text-sm text-gray-500">
            Curated bundles and exclusive deals
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="py-20 text-center">
          <Package className="mx-auto mb-4 h-12 w-12 text-gray-200" />
          <p className="text-gray-500">No active offers right now.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((bundle: any) => (
            <div
              key={bundle.id}
              className="overflow-hidden rounded-2xl border bg-white shadow-sm"
            >
              {/* Header gradient */}
              <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] p-5 text-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                      {bundle.hotel?.name ?? "Platform Offer"}
                    </p>
                    <h2 className="mt-1 text-lg font-bold">{bundle.name}</h2>
                  </div>
                  <div className="text-right">
                    {bundle.discountPercent && (
                      <span className="rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-bold text-gray-900">
                        -{bundle.discountPercent}%
                      </span>
                    )}
                  </div>
                </div>
                {bundle.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-white/70">
                    {bundle.description}
                  </p>
                )}
              </div>

              <div className="p-5">
                {/* Items */}
                {bundle.items?.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {bundle.items.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 text-sm text-gray-600"
                      >
                        <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                        {item.itemLabel ?? item.itemType}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  {bundle.validUntil && (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      Until {new Date(bundle.validUntil).toLocaleDateString()}
                    </span>
                  )}
                  <Button size="sm" className="bg-[#1a1a2e] hover:bg-[#16213e]">
                    Claim Offer
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
