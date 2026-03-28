"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import {
  Compass,
  Clock,
  Users,
  Star,
  BookOpen,
  Map,
  Zap,
  ChevronRight,
  ArrowLeft,
  Tag,
  Camera,
} from "lucide-react";

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  CULTURE: { bg: "bg-purple-50", text: "text-purple-700" },
  FOOD: { bg: "bg-amber-50", text: "text-amber-700" },
  NIGHTLIFE: { bg: "bg-indigo-50", text: "text-indigo-700" },
  ADVENTURE: { bg: "bg-green-50", text: "text-green-700" },
  WELLNESS: { bg: "bg-teal-50", text: "text-teal-700" },
  SHOPPING: { bg: "bg-pink-50", text: "text-pink-700" },
  FAMILY: { bg: "bg-blue-50", text: "text-blue-700" },
  SPORTS: { bg: "bg-orange-50", text: "text-orange-700" },
  NATURE: { bg: "bg-emerald-50", text: "text-emerald-700" },
  ART: { bg: "bg-rose-50", text: "text-rose-700" },
};

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
  ART: "Art & Museums",
};

function ExperienceCard({
  exp,
  stayId,
  onBook,
}: {
  exp: any;
  stayId: string;
  onBook: (slotId: string, expId: string) => void;
}) {
  const colors = CATEGORY_COLORS[exp.category] ?? {
    bg: "bg-gray-50",
    text: "text-gray-600",
  };
  const nextSlot = exp.slots?.[0];

  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md">
      {/* Photo or category band */}
      {exp.photos?.[0] ? (
        <img
          src={exp.photos[0]}
          alt={exp.name}
          className="h-40 w-full object-cover"
        />
      ) : (
        <div className={`flex h-40 items-center justify-center ${colors.bg}`}>
          <Camera className={`h-10 w-10 opacity-30 ${colors.text}`} />
        </div>
      )}

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}
            >
              {CATEGORY_LABELS[exp.category] ?? exp.category}
            </span>
            <h3 className="mt-1.5 font-semibold text-gray-900">{exp.name}</h3>
          </div>
          <span className="flex-shrink-0 text-sm font-bold text-[#1a1a2e]">
            {exp.priceCents != null
              ? `$${(exp.priceCents / 100).toFixed(0)}`
              : "Free"}
          </span>
        </div>

        {exp.shortDescription && (
          <p className="line-clamp-2 text-xs text-gray-500">
            {exp.shortDescription}
          </p>
        )}

        <div className="flex flex-wrap gap-3 text-xs text-gray-400">
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
          {exp.rating && (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {Number(exp.rating).toFixed(1)}
            </span>
          )}
        </div>

        {nextSlot ? (
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-gray-400">
              Next:{" "}
              {new Date(nextSlot.startsAt).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <Button
              size="sm"
              className="bg-[#1a1a2e] text-xs hover:bg-[#16213e]"
              onClick={() => onBook(nextSlot.id, exp.id)}
            >
              Book
            </Button>
          </div>
        ) : (
          <Link
            href={`/experiences/${exp.slug ?? exp.id}`}
            className="block pt-1"
          >
            <Button size="sm" variant="outline" className="w-full text-xs">
              View Details
              <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default function StayExplorePage() {
  const params = useSearchParams();
  const router = useRouter();
  const stayId = params.get("stayId") ?? "";
  const { isAuthenticated } = useAuthStore();

  // Get active stay for hotel context
  const { data: session } = trpc.guestStay.myActive.useQuery(undefined, {
    enabled: isAuthenticated(),
  });

  const hotelId = (session as any)?.hotel?.id;
  const hotelSlug = (session as any)?.hotel?.slug;
  const hotelName = (session as any)?.hotel?.name;

  // Fetch full hotel for city
  const { data: hotel } = (trpc.hotel as any).getBySlug.useQuery(
    { slug: hotelSlug },
    { enabled: !!hotelSlug },
  );
  const city: string =
    (hotel as any)?.address?.city ?? (hotel as any)?.city ?? "";
  const cityCode = city.toLowerCase().replace(/\s+/g, "-");

  // Local experiences tied to this hotel
  const { data: experiences, isLoading: expLoading } = (
    trpc.localExperience as any
  ).listExperiences.useQuery({ hotelId, limit: 12 }, { enabled: !!hotelId });

  // City guide for the destination
  const { data: guide } = (trpc.cityGuide as any).getGuideByCity.useQuery(
    { cityCode, languageCode: "en" },
    { enabled: !!cityCode },
  );

  // Flash deals
  const today = new Date().toISOString().split("T")[0];
  const { data: deals } = (trpc.flashInventory as any).listActive.useQuery(
    { date: today, limit: 4 },
    { enabled: true },
  );

  const bookMutation = (trpc.localExperience as any).bookExperience.useMutation(
    {
      onSuccess: () => toast.success("Experience booked! Check your bookings."),
      onError: (e: { message: string }) => toast.error(e.message),
    },
  );

  const handleBook = (slotId: string, experienceId: string) => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    bookMutation.mutate({ localExperienceSlotId: slotId, guestCount: 1 });
  };

  const expList: any[] = experiences ?? [];
  const dealList: any[] = deals ?? [];
  const guideData: any = guide;

  return (
    <div className="space-y-10">
      {/* Back */}
      {stayId && (
        <Link
          href={`/stay?stayId=${stayId}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to My Stay
        </Link>
      )}

      {/* Hero */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-8 text-white">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Compass className="h-4 w-4" />
          <span>Destination Guide</span>
        </div>
        <h1 className="mt-2 text-3xl font-bold">
          {city ? `Explore ${city}` : "Explore Your Destination"}
        </h1>
        {hotelName && (
          <p className="mt-1 text-white/70">
            Curated for guests of {hotelName}
          </p>
        )}
        {guideData?.tagline && (
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/80">
            {guideData.tagline}
          </p>
        )}
        <div className="mt-5 flex flex-wrap gap-3">
          {expList.length > 0 && (
            <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs">
              <Compass className="h-3.5 w-3.5" />
              {expList.length} experiences nearby
            </span>
          )}
          {guideData?.sections?.length > 0 && (
            <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs">
              <BookOpen className="h-3.5 w-3.5" />
              {guideData.sections.length} guide sections
            </span>
          )}
          {dealList.length > 0 && (
            <span className="flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-xs text-amber-300">
              <Zap className="h-3.5 w-3.5" />
              {dealList.length} flash deals tonight
            </span>
          )}
        </div>
      </div>

      {/* City guide intro */}
      {guideData?.intro && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
            <Map className="h-4 w-4" /> About {city}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-gray-700">
            {guideData.intro}
          </p>
          {cityCode && (
            <Link
              href={`/guides/${cityCode}`}
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#1a1a2e] hover:underline"
            >
              Full {city} Guide <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}

      {/* Local experiences */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            Experiences Near You
          </h2>
          <Link
            href="/experiences"
            className="flex items-center gap-1 text-sm text-[#1a1a2e] hover:underline"
          >
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {expLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        ) : expList.length === 0 ? (
          <div className="rounded-2xl border bg-white py-12 text-center">
            <Compass className="mx-auto mb-3 h-12 w-12 text-gray-200" />
            <p className="text-gray-500">No experiences available yet.</p>
            <Link
              href="/experiences"
              className="mt-3 inline-flex items-center gap-1 text-sm text-[#1a1a2e] hover:underline"
            >
              Browse all experiences <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {expList.map((exp: any) => (
              <ExperienceCard
                key={exp.id}
                exp={exp}
                stayId={stayId}
                onBook={handleBook}
              />
            ))}
          </div>
        )}
      </div>

      {/* Guide highlights */}
      {guideData?.sections?.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            City Highlights
          </h2>
          <div className="space-y-4">
            {(guideData.sections as any[]).slice(0, 3).map((section: any) => (
              <div
                key={section.id}
                className="rounded-2xl border bg-white p-5 shadow-sm"
              >
                <h3 className="font-semibold text-gray-900">{section.title}</h3>
                {section.body && (
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    {section.body}
                  </p>
                )}
                {section.mediaUrls?.length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {(section.mediaUrls as string[])
                      .slice(0, 4)
                      .map((url: string, i: number) => (
                        <img
                          key={i}
                          src={url}
                          alt=""
                          className="h-24 w-40 shrink-0 rounded-xl object-cover"
                        />
                      ))}
                  </div>
                )}
              </div>
            ))}
            {guideData.sections.length > 3 && cityCode && (
              <Link
                href={`/guides/${cityCode}`}
                className="flex items-center justify-center gap-2 rounded-2xl border border-dashed bg-white p-4 text-sm text-gray-500 transition hover:border-[#1a1a2e] hover:text-[#1a1a2e]"
              >
                <BookOpen className="h-4 w-4" />
                View all {guideData.sections.length} sections
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Tonight's flash deals */}
      {dealList.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <Zap className="h-5 w-5 text-amber-500" />
              Tonight&apos;s Flash Deals
            </h2>
            <Link
              href="/tonight"
              className="flex items-center gap-1 text-sm text-[#1a1a2e] hover:underline"
            >
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {dealList.map((deal: any) => {
              const snap = deal.rateSnapshots?.[0];
              const discountPct =
                snap &&
                Math.round(
                  ((snap.originalPriceCents - snap.flashPriceCents) /
                    snap.originalPriceCents) *
                    100,
                );
              return (
                <Link
                  key={deal.id}
                  href={`/hotel/${deal.hotel?.slug}`}
                  className="flex items-center gap-4 rounded-2xl border bg-white p-4 transition hover:shadow-md"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                    <Tag className="h-6 w-6 text-amber-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-900">
                      {deal.name}
                    </p>
                    <p className="text-xs text-gray-500">{deal.hotel?.name}</p>
                  </div>
                  <div className="text-right">
                    {snap && (
                      <p className="font-bold text-[#1a1a2e]">
                        ${(snap.flashPriceCents / 100).toFixed(0)}
                      </p>
                    )}
                    {discountPct && discountPct > 0 && (
                      <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-700">
                        -{discountPct}%
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
