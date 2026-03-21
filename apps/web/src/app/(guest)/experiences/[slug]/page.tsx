"use client";

import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Compass, Clock, Users, MapPin, Calendar, Star } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  CULTURE: "Culture",
  FOOD: "Food & Drink",
  NIGHTLIFE: "Nightlife",
  ADVENTURE: "Adventure",
  WELLNESS: "Wellness",
  SHOPPING: "Shopping",
  FAMILY: "Family",
  SPORTS: "Sports",
  NATURE: "Nature",
  ART: "Art",
};

export default function ExperienceDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  const { data: experience, isLoading } =
    trpc.localExperience.getExperience.useQuery({ id: slug });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="py-20 text-center">
        <Compass className="mx-auto mb-4 h-12 w-12 text-gray-200" />
        <p className="text-gray-500">Experience not found.</p>
      </div>
    );
  }

  const exp = experience as any;
  const upcomingSlots =
    exp.slots?.filter((s: any) => new Date(s.startsAt) > new Date()) ?? [];

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main info */}
        <div className="space-y-6 lg:col-span-2">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
              <Compass className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                {CATEGORY_LABELS[exp.category] ?? exp.category}
              </span>
              <h1 className="mt-1 text-2xl font-bold text-gray-900">
                {exp.name}
              </h1>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {exp.durationMinutes && (
              <div className="rounded-xl border bg-white p-3 text-center">
                <Clock className="mx-auto mb-1 h-5 w-5 text-gray-400" />
                <p className="text-lg font-bold text-gray-900">
                  {exp.durationMinutes}
                </p>
                <p className="text-xs text-gray-400">Minutes</p>
              </div>
            )}
            {exp.maxGuests && (
              <div className="rounded-xl border bg-white p-3 text-center">
                <Users className="mx-auto mb-1 h-5 w-5 text-gray-400" />
                <p className="text-lg font-bold text-gray-900">
                  {exp.maxGuests}
                </p>
                <p className="text-xs text-gray-400">Max guests</p>
              </div>
            )}
            {exp.ratingAggregate != null && (
              <div className="rounded-xl border bg-white p-3 text-center">
                <Star className="mx-auto mb-1 h-5 w-5 fill-yellow-400 text-yellow-400" />
                <p className="text-lg font-bold text-gray-900">
                  {exp.ratingAggregate.toFixed(1)}
                </p>
                <p className="text-xs text-gray-400">Rating</p>
              </div>
            )}
          </div>

          {/* Description */}
          {exp.description && (
            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
                About
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                {exp.description}
              </p>
            </div>
          )}

          {/* Location */}
          {exp.meetingPoint && (
            <div className="flex items-start gap-3 rounded-xl border bg-white p-4">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Meeting point</p>
                <p className="text-sm font-medium text-gray-700">
                  {typeof exp.meetingPoint === "object" &&
                  exp.meetingPoint !== null
                    ? ((exp.meetingPoint as any).address ??
                      JSON.stringify(exp.meetingPoint))
                    : exp.meetingPoint}
                </p>
              </div>
            </div>
          )}

          {/* Hotel */}
          {exp.hotel && (
            <div className="flex items-center gap-3 rounded-xl border bg-white p-4">
              <MapPin className="h-5 w-5 shrink-0 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Offered by hotel</p>
                <p className="font-semibold text-gray-900">{exp.hotel.name}</p>
              </div>
            </div>
          )}

          {/* Upcoming slots */}
          {upcomingSlots.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
                <Calendar className="mr-1 inline h-4 w-4" />
                Available Slots
              </h2>
              <div className="flex flex-wrap gap-2">
                {upcomingSlots.slice(0, 12).map((slot: any) => (
                  <button
                    key={slot.id}
                    className="rounded-lg border bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:border-[#1a1a2e] hover:bg-gray-50"
                  >
                    {new Date(slot.startsAt).toLocaleString("en", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {slot.remainingSpots != null && (
                      <span className="ml-1 text-gray-400">
                        ({slot.remainingSpots} left)
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Booking card */}
        <div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-400">
              Price per person
            </p>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              {exp.priceCents != null
                ? `$${(exp.priceCents / 100).toFixed(0)}`
                : "Free"}
            </p>
            {exp.cityGuide && (
              <p className="mt-2 text-xs text-gray-400">
                {exp.cityGuide.cityName} experience
              </p>
            )}
            <Button className="mt-6 w-full bg-[#1a1a2e] hover:bg-[#16213e]">
              Reserve a Spot
            </Button>
            <p className="mt-3 text-center text-xs text-gray-400">
              No payment taken now
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
