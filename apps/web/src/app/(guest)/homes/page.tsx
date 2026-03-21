"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Home, Star, MapPin, Calendar } from "lucide-react";

const STAY_TYPE_LABELS: Record<string, string> = {
  APARTMENT: "Apartment",
  VILLA: "Villa",
  BOUTIQUE_HOTEL: "Boutique Hotel",
  HOSTEL: "Hostel",
  GUESTHOUSE: "Guesthouse",
  RESORT: "Resort",
};

const STAY_TERM_LABELS: Record<string, string> = {
  DAILY: "Nightly",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  FLEX: "Flexible",
};

export default function HomesPage() {
  const [stayType, setStayType] = useState<string>("");
  const [stayTerm, setStayTerm] = useState<string>("");

  const { data: units, isLoading } = trpc.trustedStay.listUnits.useQuery({
    trustedStayType: (stayType as any) || undefined,
    stayTerm: (stayTerm as any) || undefined,
    limit: 20,
  });

  const list = (units as any[]) ?? [];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Home className="h-7 w-7 text-[#1a1a2e]" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trusted Stays</h1>
          <p className="text-sm text-gray-500">
            Verified homes & apartments for extended stays
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={stayType}
          onChange={(e) => setStayType(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">All types</option>
          {Object.entries(STAY_TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <select
          value={stayTerm}
          onChange={(e) => setStayTerm(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">Any term</option>
          {Object.entries(STAY_TERM_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="py-20 text-center">
          <Home className="mx-auto mb-4 h-12 w-12 text-gray-200" />
          <p className="text-gray-500">No trusted stays available.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((unit: any) => (
            <a
              key={unit.id}
              href={`/homes/${unit.id}`}
              className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
            >
              {/* Photo */}
              <div className="relative h-44 bg-gray-100">
                {unit.photos?.[0] ? (
                  <img
                    src={unit.photos[0]}
                    alt={unit.name}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Home className="h-12 w-12 text-gray-300" />
                  </div>
                )}
                {unit.host?.verificationStatus === "VERIFIED" && (
                  <span className="absolute left-3 top-3 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white">
                    Verified
                  </span>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="line-clamp-1 font-semibold text-gray-900">
                      {unit.name}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {STAY_TYPE_LABELS[unit.stayType] ?? unit.stayType}
                    </p>
                  </div>
                  {unit.ratingAggregate != null && (
                    <div className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {unit.ratingAggregate.toFixed(1)}
                    </div>
                  )}
                </div>

                {unit.city && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                    <MapPin className="h-3 w-3" /> {unit.city}
                    {unit.country ? `, ${unit.country}` : ""}
                  </p>
                )}

                {unit.ratePlans?.[0] && (
                  <div className="mt-3 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="h-3 w-3" />
                      {STAY_TERM_LABELS[unit.ratePlans[0].stayTerm] ??
                        unit.ratePlans[0].stayTerm}
                    </span>
                    <span className="font-bold text-[#1a1a2e]">
                      ${(unit.ratePlans[0].baseRateCents / 100).toFixed(0)}
                      <span className="text-xs font-normal text-gray-400">
                        {" "}
                        / night
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
