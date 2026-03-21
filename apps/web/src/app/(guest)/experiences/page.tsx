"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { Compass, Clock, Users, MapPin, Calendar } from "lucide-react";

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

const CATEGORY_COLORS: Record<string, string> = {
  CULTURE: "bg-purple-100 text-purple-700",
  FOOD: "bg-orange-100 text-orange-700",
  NIGHTLIFE: "bg-indigo-100 text-indigo-700",
  ADVENTURE: "bg-green-100 text-green-700",
  WELLNESS: "bg-teal-100 text-teal-700",
  SHOPPING: "bg-pink-100 text-pink-700",
  FAMILY: "bg-blue-100 text-blue-700",
  SPORTS: "bg-yellow-100 text-yellow-700",
  NATURE: "bg-emerald-100 text-emerald-700",
  ART: "bg-rose-100 text-rose-700",
};

export default function ExperiencesPage() {
  const [category, setCategory] = useState<string | undefined>();
  const [bookingSlot, setBookingSlot] = useState<{
    expId: string;
    slotId: string;
    priceCents: number;
  } | null>(null);

  const {
    data: experiencesRaw,
    isLoading,
    refetch,
  } = trpc.localExperience.listExperiences.useQuery({
    category: category as any,
    limit: 30,
  });
  const experiences = experiencesRaw as any[] | undefined;

  const bookMutation = (trpc.localExperience.bookExperience as any).useMutation(
    {
      onSuccess: () => {
        toast.success("Experience booked! Check your profile for details.");
        setBookingSlot(null);
        void refetch();
      },
      onError: (e: any) => toast.error(e.message),
    },
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Local Experiences</h1>
        <p className="mt-1 text-gray-500">
          Curated by our city guides — discover culture, cuisine, and hidden
          gems
        </p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategory(undefined)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            !category
              ? "bg-[#1a1a2e] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setCategory(category === val ? undefined : val)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              category === val
                ? "bg-[#1a1a2e] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : !experiences || experiences.length === 0 ? (
        <div className="py-20 text-center">
          <Compass className="mx-auto mb-4 h-12 w-12 text-gray-200" />
          <p className="text-gray-500">
            No experiences found in this category.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {experiences.map((exp) => {
            const slots = exp.slots ?? [];
            const nextSlot = slots[0] as any;

            return (
              <div
                key={exp.id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
              >
                {/* Cover */}
                <div className="relative h-44 bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
                  <div className="absolute left-3 top-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${CATEGORY_COLORS[exp.category] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {CATEGORY_LABELS[exp.category] ?? exp.category}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  <h3 className="font-semibold text-gray-900">{exp.name}</h3>

                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {exp.durationMinutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> Max {exp.maxGuests}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-[#1a1a2e]">
                      {exp.priceCents != null
                        ? `$${(exp.priceCents / 100).toFixed(0)}`
                        : "Free"}
                      <span className="text-xs font-normal text-gray-400">
                        {" "}
                        / person
                      </span>
                    </span>
                    {nextSlot && (
                      <span className="flex items-center gap-1 text-xs text-emerald-600">
                        <Calendar className="h-3 w-3" />
                        {new Date(nextSlot.date).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/experiences/${exp.id}`} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full text-sm"
                        size="sm"
                      >
                        Details
                      </Button>
                    </Link>
                    <Button
                      className="flex-1 bg-[#1a1a2e] text-sm hover:bg-[#16213e]"
                      size="sm"
                      disabled={!nextSlot || bookMutation.isPending}
                      onClick={() => {
                        if (nextSlot) {
                          bookMutation.mutate({
                            localExperienceId: exp.id,
                            localExperienceSlotId: nextSlot.id,
                            partySize: 1,
                          });
                        }
                      }}
                    >
                      {nextSlot ? "Book Now" : "No Slots"}
                    </Button>
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
