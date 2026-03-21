"use client";

import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dumbbell,
  Clock,
  MapPin,
  CreditCard,
  CheckCircle,
  Calendar,
} from "lucide-react";

const AMENITY_TYPE_LABELS: Record<string, string> = {
  GYM: "Gym",
  SPA: "Spa",
  POOL: "Pool",
  ROOFTOP: "Rooftop",
  LOUNGE: "Lounge",
  BEACH: "Beach Club",
  WELLNESS: "Wellness",
  COWORKING: "Co-working",
  OTHER: "Other",
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AmenityDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  const { data: amenity, isLoading } = trpc.amenity.getBySlug.useQuery({
    id: slug,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!amenity) {
    return (
      <div className="py-20 text-center">
        <Dumbbell className="mx-auto mb-4 h-12 w-12 text-gray-200" />
        <p className="text-gray-500">Amenity not found.</p>
      </div>
    );
  }

  const a = amenity as any;

  return (
    <div className="space-y-8">
      {/* Photos */}
      {a.photos?.length > 0 && (
        <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-2xl sm:grid-cols-3">
          {(a.photos as string[]).slice(0, 5).map((src: string, i: number) => (
            <img
              key={i}
              src={src}
              alt={a.name}
              className={`w-full rounded-xl object-cover ${i === 0 ? "col-span-2 h-48 sm:h-64" : "h-32"}`}
            />
          ))}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{a.name}</h1>
                <span className="mt-1 inline-block rounded-full bg-gray-100 px-3 py-0.5 text-sm text-gray-500">
                  {AMENITY_TYPE_LABELS[a.amenityType] ?? a.amenityType}
                </span>
              </div>
              {a.isExternal && (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  Open to public
                </span>
              )}
            </div>
            {a.hotel && (
              <p className="mt-2 flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-4 w-4" /> {a.hotel.name}
                {a.hotel.address?.city ? `, ${a.hotel.address.city}` : ""}
              </p>
            )}
          </div>

          {a.description && (
            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
                About
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                {a.description}
              </p>
            </div>
          )}

          {/* Capacity & duration */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {a.capacityPerSlot && (
              <div className="rounded-xl border bg-white p-4 text-center">
                <CheckCircle className="mx-auto mb-1 h-5 w-5 text-gray-400" />
                <p className="text-lg font-bold text-gray-900">
                  {a.capacityPerSlot}
                </p>
                <p className="text-xs text-gray-400">Capacity / slot</p>
              </div>
            )}
            {a.slotDurationMinutes && (
              <div className="rounded-xl border bg-white p-4 text-center">
                <Clock className="mx-auto mb-1 h-5 w-5 text-gray-400" />
                <p className="text-lg font-bold text-gray-900">
                  {a.slotDurationMinutes}
                </p>
                <p className="text-xs text-gray-400">Minutes / slot</p>
              </div>
            )}
          </div>

          {/* Schedule */}
          {a.schedules?.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
                <Calendar className="mr-1 inline h-4 w-4" />
                Opening Hours
              </h2>
              <div className="space-y-2">
                {a.schedules.map((s: any) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-lg border bg-white px-4 py-2 text-sm"
                  >
                    <span className="font-medium text-gray-700">
                      {DAY_NAMES[s.dayOfWeek] ?? s.dayOfWeek}
                    </span>
                    {s.isClosed ? (
                      <span className="text-xs text-gray-400">Closed</span>
                    ) : (
                      <span className="text-gray-600">
                        {s.openTime} – {s.closeTime}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pass plans / booking card */}
        <div className="space-y-4">
          {a.passPlans?.map((plan: any) => (
            <div
              key={plan.id}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >
              <div className="mb-1 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gray-400" />
                <p className="text-sm font-semibold text-gray-700">
                  {plan.name}
                </p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {plan.priceCents != null
                  ? `$${(plan.priceCents / 100).toFixed(0)}`
                  : "Free"}
              </p>
              {plan.description && (
                <p className="mt-1 text-xs text-gray-400">{plan.description}</p>
              )}
              <Button
                className="mt-4 w-full bg-[#1a1a2e] hover:bg-[#16213e]"
                size="sm"
              >
                {plan.priceCents ? "Purchase Pass" : "Book Free"}
              </Button>
            </div>
          ))}

          {(!a.passPlans || a.passPlans.length === 0) && (
            <div className="rounded-2xl border bg-white p-6 text-center">
              <Button className="w-full bg-[#1a1a2e] hover:bg-[#16213e]">
                Reserve a Slot
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
