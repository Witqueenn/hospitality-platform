"use client";

import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Map, Compass, Clock, Users, BookOpen } from "lucide-react";

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

export default function CityGuidePage({
  params,
}: {
  params: { city: string };
}) {
  const { city } = params;

  const { data: guide, isLoading } = trpc.cityGuide.getGuideByCity.useQuery({
    cityCode: city,
    languageCode: "en",
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="py-20 text-center">
        <Map className="mx-auto mb-4 h-12 w-12 text-gray-200" />
        <p className="text-gray-500">No guide available for this city.</p>
      </div>
    );
  }

  const g = guide as any;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-8 text-white">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Map className="h-4 w-4" />{" "}
          {g.countryCode && <span>{g.countryCode}</span>}
        </div>
        <h1 className="mt-2 text-3xl font-bold">{g.cityName}</h1>
        {g.tagline && <p className="mt-2 text-white/80">{g.tagline}</p>}
        {g.intro && (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70">
            {g.intro}
          </p>
        )}
      </div>

      {/* Sections */}
      {g.sections?.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            <BookOpen className="mr-1 inline h-4 w-4" />
            Highlights
          </h2>
          {g.sections.map((section: any) => (
            <div
              key={section.id}
              className="rounded-2xl border bg-white p-6 shadow-sm"
            >
              <h3 className="font-bold text-gray-900">{section.title}</h3>
              {section.body && (
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {section.body}
                </p>
              )}
              {section.mediaUrls?.length > 0 && (
                <div className="mt-4 flex gap-2 overflow-x-auto">
                  {(section.mediaUrls as string[])
                    .slice(0, 4)
                    .map((url: string, i: number) => (
                      <img
                        key={i}
                        src={url}
                        alt=""
                        className="h-28 w-44 shrink-0 rounded-xl object-cover"
                      />
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Experiences */}
      {g.experiences?.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            <Compass className="mr-1 inline h-4 w-4" />
            Experiences
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {g.experiences.map((exp: any) => (
              <a
                key={exp.id}
                href={`/experiences/${exp.slug ?? exp.id}`}
                className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">{exp.name}</p>
                      <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                        {CATEGORY_LABELS[exp.category] ?? exp.category}
                      </span>
                    </div>
                    <span className="shrink-0 font-bold text-[#1a1a2e]">
                      {exp.priceCents != null
                        ? `$${(exp.priceCents / 100).toFixed(0)}`
                        : "Free"}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="mt-2 line-clamp-2 text-xs text-gray-500">
                      {exp.description}
                    </p>
                  )}
                  <div className="mt-3 flex gap-3 text-xs text-gray-400">
                    {exp.durationMinutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {exp.durationMinutes} min
                      </span>
                    )}
                    {exp.maxGuests && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> Max {exp.maxGuests}
                      </span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
