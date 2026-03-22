"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Star, Award, Globe, Briefcase, Heart } from "lucide-react";
import Link from "next/link";

const BADGE_LABELS: Record<string, string> = {
  GUEST_FAVORITE: "Guest Favorite",
  TOP_CONCIERGE: "Top Concierge",
  FRONT_DESK_STAR: "Front Desk Star",
  HOUSEKEEPING_APPRECIATED: "Housekeeping Appreciated",
  SERVICE_EXCELLENCE: "Service Excellence",
  FAST_RESPONDER: "Fast Responder",
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

export default function StaffProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const { data: profile, isLoading } = trpc.staffProfile.getBySlug.useQuery(
    { slug },
    { enabled: !!slug },
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-500">Staff profile not found.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.back()}
        >
          Go Back
        </Button>
      </div>
    );
  }

  const avgRating = profile.avgRating ? Number(profile.avgRating) : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Profile Header */}
      <div className="rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-6 text-white shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold">
            {profile.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{profile.name}</h1>
            <p className="text-white/70">{profile.role}</p>
            <p className="mt-0.5 text-sm text-white/50">
              {DEPT_LABELS[profile.department]}
            </p>
          </div>
          {avgRating && (
            <div className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-bold">{avgRating.toFixed(1)}</span>
              <span className="text-xs text-white/50">
                ({profile.reviewCount})
              </span>
            </div>
          )}
        </div>

        {profile.bio && (
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            {profile.bio}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          {profile.yearsExperience && (
            <div className="flex items-center gap-1.5 text-xs text-white/60">
              <Briefcase className="h-3.5 w-3.5" />
              {profile.yearsExperience} years experience
            </div>
          )}
          {profile.languages.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-white/60">
              <Globe className="h-3.5 w-3.5" />
              {profile.languages.join(", ")}
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-white/60">
            <span>at {profile.hotel?.name}</span>
          </div>
        </div>
      </div>

      {/* Badges */}
      {profile.badges && profile.badges.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Award className="h-4 w-4 text-amber-500" />
            Recognition
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile.badges.map((badge) => (
              <span
                key={badge.id}
                className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700"
              >
                <Award className="h-3.5 w-3.5" />
                {BADGE_LABELS[badge.badgeType] ?? badge.badgeType}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Guest Reviews */}
      {profile.reviews && profile.reviews.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">
            Guest Reviews
          </h2>
          <div className="space-y-3">
            {profile.reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-xl border bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    {review.title && (
                      <p className="font-medium text-gray-900">
                        {review.title}
                      </p>
                    )}
                    {review.body && (
                      <p className="mt-1 text-sm text-gray-600">
                        {review.body}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-3.5 w-3.5 ${
                          s <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {isAuthenticated() && (
        <div className="flex gap-3">
          <Link
            href={`/stay/staff-feedback?staffId=${profile.id}`}
            className="flex-1"
          >
            <Button variant="outline" className="w-full">
              <Star className="mr-1.5 h-4 w-4" />
              Leave a Review
            </Button>
          </Link>
          {profile.tipEnabled && (
            <Link
              href={`/stay/tip?staffId=${profile.id}&staffName=${encodeURIComponent(profile.name)}`}
              className="flex-1"
            >
              <Button className="w-full bg-[#1a1a2e] hover:bg-[#16213e]">
                <Heart className="mr-1.5 h-4 w-4" />
                Send a Tip
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
