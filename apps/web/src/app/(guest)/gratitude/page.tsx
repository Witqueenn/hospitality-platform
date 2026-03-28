"use client";

export const dynamic = "force-dynamic";

import { useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Award, Heart } from "lucide-react";
import Link from "next/link";

export default function GratitudePage() {
  const params = useSearchParams();
  const hotelId = params.get("hotelId") ?? "";

  const { data, isLoading } = trpc.staffRecognition.gratitudeWall.useQuery(
    { hotelId, pageSize: 20 },
    { enabled: !!hotelId },
  );

  if (!hotelId) {
    return (
      <div className="py-16 text-center">
        <Heart className="mx-auto mb-3 h-12 w-12 text-gray-300" />
        <p className="text-gray-500">Hotel not specified.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500">
          <Heart className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Wall of Gratitude</h1>
        <p className="mt-1 text-gray-500">
          Celebrating our staff through the words of our guests
        </p>
      </div>

      {isLoading ? (
        <div className="columns-1 gap-4 sm:columns-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="mb-4 h-36 w-full rounded-xl" />
          ))}
        </div>
      ) : !data?.items || data.items.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          <Heart className="mx-auto mb-3 h-12 w-12 text-gray-200" />
          <p className="text-gray-400">No entries yet.</p>
        </div>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2">
          {data.items.map((entry) => (
            <div
              key={entry.id}
              className="mb-4 break-inside-avoid rounded-xl border bg-white p-5 shadow-sm"
            >
              {/* Stars */}
              <div className="mb-2 flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${
                      s <= (entry.review.rating ?? 0)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-200"
                    }`}
                  />
                ))}
              </div>

              {entry.review.title && (
                <p className="font-semibold text-gray-900">
                  {entry.review.title}
                </p>
              )}
              {entry.review.body && (
                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                  &ldquo;{entry.review.body}&rdquo;
                </p>
              )}

              {/* Staff info */}
              <div className="mt-3 flex items-center gap-2 border-t pt-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a1a2e]/10 text-sm font-bold text-[#1a1a2e]">
                  {entry.staffProfile.name.charAt(0)}
                </div>
                <div>
                  <Link
                    href={`/staff/${entry.staffProfile.slug}`}
                    className="text-sm font-semibold text-gray-900 hover:text-[#1a1a2e]"
                  >
                    {entry.staffProfile.name}
                  </Link>
                  <p className="text-xs text-gray-500">
                    {entry.staffProfile.department.replace(/_/g, " ")}
                  </p>
                </div>
                {entry.staffProfile.avgRating && (
                  <div className="ml-auto flex items-center gap-1 text-xs text-gray-400">
                    <Award className="h-3.5 w-3.5 text-amber-500" />
                    {Number(entry.staffProfile.avgRating).toFixed(1)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
