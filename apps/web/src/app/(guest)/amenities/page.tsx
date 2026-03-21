"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Dumbbell, Waves, Sparkles, Users, MapPin } from "lucide-react";

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  GYM: <Dumbbell className="h-5 w-5" />,
  POOL: <Waves className="h-5 w-5" />,
  SPA: <Sparkles className="h-5 w-5" />,
  SAUNA: <Sparkles className="h-5 w-5" />,
};

const AMENITY_LABELS: Record<string, string> = {
  GYM: "Gym & Fitness",
  POOL: "Swimming Pool",
  TENNIS: "Tennis",
  SPA: "Spa",
  SAUNA: "Sauna",
  HAMMAM: "Hammam",
  CO_WORKING: "Co-Working",
  KIDS_CLUB: "Kids Club",
  BEACH_ACCESS: "Beach Access",
  OTHER: "Other",
};

export default function AmenitiesPage() {
  const [filterType, setFilterType] = useState<string | undefined>();

  const { data: amenitiesRaw, isLoading } = trpc.amenity.listPublic.useQuery({
    amenityType: filterType as any,
  });
  const amenities = amenitiesRaw as any[] | undefined;

  const types = Object.keys(AMENITY_LABELS);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Amenity Marketplace
        </h1>
        <p className="mt-1 text-gray-500">
          Book gym sessions, spa treatments, pools and more — with or without a
          hotel stay
        </p>
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterType(undefined)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            !filterType
              ? "bg-[#1a1a2e] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {types.map((type) => (
          <button
            key={type}
            onClick={() =>
              setFilterType(filterType === type ? undefined : type)
            }
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filterType === type
                ? "bg-[#1a1a2e] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {AMENITY_ICONS[type]}
            {AMENITY_LABELS[type]}
          </button>
        ))}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : !amenities || amenities.length === 0 ? (
        <div className="py-20 text-center">
          <Dumbbell className="mx-auto mb-4 h-12 w-12 text-gray-200" />
          <p className="text-gray-500">No amenities found.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {amenities.map((asset) => {
            const hotel = asset.hotel as { name: string; slug: string };
            const activePlans = asset.passPlans ?? [];

            return (
              <div
                key={asset.id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
              >
                {/* Photo */}
                <div className="flex h-40 items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
                  <div className="text-white/30">
                    {AMENITY_ICONS[asset.amenityType] ?? (
                      <Sparkles className="h-10 w-10" />
                    )}
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  <div>
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-gray-900">
                        {asset.name}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="ml-2 shrink-0 text-xs"
                      >
                        {AMENITY_LABELS[asset.amenityType] ?? asset.amenityType}
                      </Badge>
                    </div>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                      <MapPin className="h-3 w-3" /> {hotel.name}
                    </p>
                    {asset.locationLabel && (
                      <p className="text-xs text-gray-400">
                        {asset.locationLabel}
                      </p>
                    )}
                  </div>

                  {asset.capacity && (
                    <p className="flex items-center gap-1 text-xs text-gray-500">
                      <Users className="h-3 w-3" /> Capacity: {asset.capacity}
                    </p>
                  )}

                  {activePlans.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-500">
                        Pass Plans
                      </p>
                      {activePlans.slice(0, 2).map((plan: any) => (
                        <div
                          key={plan.id}
                          className="flex items-center justify-between"
                        >
                          <span className="text-xs text-gray-600">
                            {plan.name}
                          </span>
                          <span className="text-xs font-semibold text-[#1a1a2e]">
                            ${(plan.priceCents / 100).toFixed(0)} /{" "}
                            {plan.accessUnit.toLowerCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <Link href={`/amenities/${asset.id}`}>
                    <Button
                      className="w-full bg-[#1a1a2e] text-sm hover:bg-[#16213e]"
                      size="sm"
                    >
                      View & Book
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
