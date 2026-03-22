"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Map, Compass, BookOpen, Search, Globe } from "lucide-react";

export default function GuidesPage() {
  const [query, setQuery] = useState("");

  const { data: guidesRaw, isLoading } = (
    trpc.cityGuide as any
  ).listGuides.useQuery({ languageCode: "en" });

  const guides: any[] = guidesRaw ?? [];

  const filtered = query.trim()
    ? guides.filter(
        (g: any) =>
          g.cityName.toLowerCase().includes(query.toLowerCase()) ||
          g.countryCode?.toLowerCase().includes(query.toLowerCase()),
      )
    : guides;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] px-8 py-10 text-white">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Globe className="h-4 w-4" /> Destination Guides
        </div>
        <h1 className="mt-2 text-3xl font-bold">Explore the World</h1>
        <p className="mt-2 max-w-lg text-white/70">
          Curated local insights, hidden gems, and experiences — crafted by our
          hospitality teams on the ground.
        </p>

        {/* Search */}
        <div className="mt-6 flex max-w-md items-center gap-3 rounded-xl bg-white/10 px-4 py-2.5">
          <Search className="h-4 w-4 text-white/50" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cities or countries…"
            className="flex-1 bg-transparent text-sm text-white placeholder-white/40 focus:outline-none"
          />
        </div>
      </div>

      {/* Stats row */}
      {!isLoading && guides.length > 0 && (
        <div className="flex flex-wrap gap-6 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <Map className="h-4 w-4 text-[#1a1a2e]" />
            <strong className="text-gray-900">{guides.length}</strong>{" "}
            destinations
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-[#1a1a2e]" />
            <strong className="text-gray-900">
              {guides.reduce(
                (s: number, g: any) => s + (g._count?.sections ?? 0),
                0,
              )}
            </strong>{" "}
            guide sections
          </span>
          <span className="flex items-center gap-1.5">
            <Compass className="h-4 w-4 text-[#1a1a2e]" />
            <strong className="text-gray-900">
              {guides.reduce(
                (s: number, g: any) => s + (g._count?.experiences ?? 0),
                0,
              )}
            </strong>{" "}
            experiences
          </span>
        </div>
      )}

      {/* Guides grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <Map className="mx-auto mb-4 h-12 w-12 text-gray-200" />
          {query ? (
            <>
              <p className="font-medium text-gray-600">
                No results for &ldquo;{query}&rdquo;
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Try a different city or country name.
              </p>
            </>
          ) : (
            <>
              <p className="font-medium text-gray-600">
                No destination guides yet
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Guides are added by hotel teams — check back soon.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((guide: any) => (
            <Link
              key={guide.id}
              href={`/guides/${guide.cityCode}`}
              className="group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-lg"
            >
              {/* Cover image or gradient */}
              {guide.coverImageUrl ? (
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={guide.coverImageUrl}
                    alt={guide.cityName}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4">
                    <p className="text-xs font-medium text-white/70">
                      {guide.countryCode}
                    </p>
                    <h3 className="text-xl font-bold text-white">
                      {guide.cityName}
                    </h3>
                  </div>
                </div>
              ) : (
                <div className="flex h-40 items-end bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-4">
                  <div>
                    <p className="text-xs font-medium text-white/50">
                      {guide.countryCode}
                    </p>
                    <h3 className="text-xl font-bold text-white">
                      {guide.cityName}
                    </h3>
                  </div>
                </div>
              )}

              <div className="p-4">
                {guide.tagline && (
                  <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                    {guide.tagline}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  {(guide._count?.sections ?? 0) > 0 && (
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {guide._count.sections} sections
                    </span>
                  )}
                  {(guide._count?.experiences ?? 0) > 0 && (
                    <span className="flex items-center gap-1">
                      <Compass className="h-3.5 w-3.5" />
                      {guide._count.experiences} experiences
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
