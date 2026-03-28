"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  MapPin,
  Clock,
  Star,
  ChevronRight,
  Filter,
} from "lucide-react";

const EMPLOYMENT_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  SEASONAL: "Seasonal",
  INTERNSHIP: "Internship",
  TRAINEE: "Trainee",
  TEMPORARY: "Temporary",
};

const DEPT_LABELS: Record<string, string> = {
  FRONT_DESK: "Front Desk",
  CONCIERGE: "Concierge",
  HOUSEKEEPING: "Housekeeping",
  DINING: "Dining",
  ROOM_SERVICE: "Room Service",
  MANAGEMENT: "Management",
  MAINTENANCE: "Maintenance",
  SPA: "Spa",
  SECURITY: "Security",
  OTHER: "Other",
};

const EMPLOYMENT_TYPES = [
  "FULL_TIME",
  "PART_TIME",
  "SEASONAL",
  "INTERNSHIP",
  "TRAINEE",
  "TEMPORARY",
] as const;

export default function JobsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [employmentType, setEmploymentType] = useState<string | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [visaSupport, setVisaSupport] = useState<boolean | undefined>();
  const [accommodationIncluded, setAccommodationIncluded] = useState<
    boolean | undefined
  >();
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.jobPosting.search.useQuery({
    query: query || undefined,
    visaSupport,
    accommodationIncluded,
    page,
    pageSize: 20,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-6 text-white">
        <h1 className="text-2xl font-bold">Hospitality Careers</h1>
        <p className="mt-1 text-white/70">Find your next role in hospitality</p>

        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search jobs, roles, hotels..."
            className="flex-1 rounded-lg bg-white/10 px-4 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Employment Type
              </label>
              <select
                value={employmentType ?? ""}
                onChange={(e) => {
                  setEmploymentType(e.target.value || undefined);
                  setPage(1);
                }}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value="">All Types</option>
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {EMPLOYMENT_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Visa Support
              </label>
              <select
                value={visaSupport === undefined ? "" : String(visaSupport)}
                onChange={(e) => {
                  setVisaSupport(
                    e.target.value === ""
                      ? undefined
                      : e.target.value === "true",
                  );
                  setPage(1);
                }}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value="">Any</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Accommodation
              </label>
              <select
                value={
                  accommodationIncluded === undefined
                    ? ""
                    : String(accommodationIncluded)
                }
                onChange={(e) => {
                  setAccommodationIncluded(
                    e.target.value === ""
                      ? undefined
                      : e.target.value === "true",
                  );
                  setPage(1);
                }}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value="">Any</option>
                <option value="true">Included</option>
                <option value="false">Not Included</option>
              </select>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="mt-3"
            onClick={() => {
              setEmploymentType(undefined);
              setVisaSupport(undefined);
              setAccommodationIncluded(undefined);
              setPage(1);
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : !data?.items || data.items.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center">
          <Briefcase className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">No jobs match your search.</p>
          <p className="mt-1 text-sm text-gray-400">
            Try adjusting your filters.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {(data.items as any[]).map((job) => (
            <div
              key={job.id}
              className="cursor-pointer rounded-xl border bg-white p-4 shadow-sm transition-all hover:border-[#1a1a2e]/20 hover:shadow-md"
              onClick={() => router.push(`/jobs/${job.slug}`)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    {job.isFeatured && (
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    )}
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{job.hotel?.name}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.city}, {job.country}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {EMPLOYMENT_LABELS[job.employmentType] ??
                        job.employmentType}
                    </span>
                    <span>{DEPT_LABELS[job.department] ?? job.department}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {job.accommodationIncluded && (
                      <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                        Accommodation
                      </span>
                    )}
                    {job.visaSupport && (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        Visa Support
                      </span>
                    )}
                    {job.mealsIncluded && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Meals
                      </span>
                    )}
                    {job.tags?.map((t: { tag: string }) => (
                      <span
                        key={t.tag}
                        className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
                      >
                        {t.tag}
                      </span>
                    ))}
                  </div>
                </div>
                <ChevronRight className="mt-1 h-4 w-4 flex-shrink-0 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.total > data.pageSize && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-500">
            Page {page} of {Math.ceil(data.total / data.pageSize)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page * data.pageSize >= data.total}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
