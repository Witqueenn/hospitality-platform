"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  ShieldCheck,
  Package,
  Tag,
  Compass,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type Tab = "bundles" | "experiences";

export default function MarketplaceModerationPage() {
  const [tab, setTab] = useState<Tab>("bundles");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const {
    data: bundles,
    isLoading: bundlesLoading,
    refetch: refetchBundles,
  } = trpc.bundle.listActive.useQuery({ limit: 50 });

  const {
    data: experiences,
    isLoading: expLoading,
    refetch: refetchExp,
  } = trpc.localExperience.listExperiences.useQuery({ limit: 50 });

  /* eslint-disable */
  const updateBundleMutation = (trpc.bundle.update as any).useMutation({
    onSuccess: () => {
      toast.success("Bundle updated.");
      void refetchBundles();
    },
    onError: (e: any) => toast.error(e.message),
  });
  /* eslint-enable */

  const bundleList = (bundles as any[]) ?? [];
  const expList = (experiences as any[]) ?? [];

  const isLoading = tab === "bundles" ? bundlesLoading : expLoading;
  const list = tab === "bundles" ? bundleList : expList;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-7 w-7 text-[#1a1a2e]" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Marketplace Moderation
          </h1>
          <p className="text-sm text-gray-500">
            Review and moderate bundles & experiences
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border bg-white p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">
            {bundleList.length}
          </p>
          <p className="text-xs text-gray-500">Active Bundles</p>
        </div>
        <div className="rounded-xl border bg-white p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{expList.length}</p>
          <p className="text-xs text-gray-500">Active Experiences</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex w-fit gap-1 rounded-xl border bg-gray-50 p-1">
        {(["bundles", "experiences"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === t
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "bundles" ? (
              <Package className="h-4 w-4" />
            ) : (
              <Compass className="h-4 w-4" />
            )}
            {t === "bundles" ? "Bundles" : "Experiences"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="py-20 text-center">
          <CheckCircle className="mx-auto mb-4 h-12 w-12 text-emerald-300" />
          <p className="text-gray-500">Nothing to moderate.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((item: any) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-xl border bg-white shadow-sm"
              >
                <div className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                    {tab === "bundles" ? (
                      <Package className="h-6 w-6 text-gray-500" />
                    ) : (
                      <Compass className="h-6 w-6 text-emerald-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      {item.hotel && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                          {item.hotel.name}
                        </span>
                      )}
                      {tab === "experiences" && item.category && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                          {item.category}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">
                      {item.description ?? "No description"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {tab === "bundles" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() =>
                          updateBundleMutation.mutate({
                            id: item.id,
                            isActive: !item.isActive,
                          })
                        }
                        disabled={updateBundleMutation.isPending}
                      >
                        {item.isActive ? (
                          <>
                            <EyeOff className="mr-1 h-3 w-3" /> Deactivate
                          </>
                        ) : (
                          <>
                            <Eye className="mr-1 h-3 w-3" /> Activate
                          </>
                        )}
                      </Button>
                    )}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="rounded p-1 text-gray-400 hover:text-gray-600"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="space-y-3 border-t bg-gray-50 p-4">
                    {tab === "bundles" && item.items?.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase text-gray-400">
                          Bundle Items
                        </p>
                        <div className="space-y-1">
                          {item.items.map((bi: any) => (
                            <div
                              key={bi.id}
                              className="flex items-center gap-2 text-sm text-gray-600"
                            >
                              <Tag className="h-3 w-3 text-gray-400" />
                              {bi.itemLabel ?? bi.itemType}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {tab === "experiences" && (
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {item.durationMinutes && (
                          <span>Duration: {item.durationMinutes} min</span>
                        )}
                        {item.maxGuests && (
                          <span>Max guests: {item.maxGuests}</span>
                        )}
                        {item.priceCents != null && (
                          <span>
                            Price: ${(item.priceCents / 100).toFixed(2)}
                          </span>
                        )}
                      </div>
                    )}
                    {item.validFrom || item.validUntil ? (
                      <p className="text-xs text-gray-400">
                        Valid:{" "}
                        {item.validFrom
                          ? new Date(item.validFrom).toLocaleDateString()
                          : "—"}
                        {" → "}
                        {item.validUntil
                          ? new Date(item.validUntil).toLocaleDateString()
                          : "ongoing"}
                      </p>
                    ) : null}
                    <p className="flex items-center gap-1 text-xs text-gray-400">
                      <AlertTriangle className="h-3 w-3 text-yellow-500" />
                      Created {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
