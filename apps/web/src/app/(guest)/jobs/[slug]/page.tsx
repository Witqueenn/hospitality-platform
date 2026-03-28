"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  MapPin,
  Clock,
  Star,
  Building2,
  Globe,
  Utensils,
  Home,
  CheckCircle2,
  ChevronLeft,
} from "lucide-react";

const EMPLOYMENT_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  SEASONAL: "Seasonal",
  INTERNSHIP: "Internship",
  TRAINEE: "Trainee",
  TEMPORARY: "Temporary",
};

const EXPERIENCE_LABELS: Record<string, string> = {
  ENTRY: "Entry Level",
  JUNIOR: "Junior",
  MID: "Mid Level",
  SENIOR: "Senior",
  MANAGEMENT: "Management",
};

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [showApply, setShowApply] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  const { data: job, isLoading } = trpc.jobPosting.getBySlug.useQuery(
    { slug },
    { enabled: !!slug },
  );

  const applyMutation = trpc.jobApplication.submit.useMutation({
    onSuccess: () => {
      toast.success("Application submitted! We'll be in touch.");
      setShowApply(false);
      router.push("/applications");
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-60 w-full rounded-xl" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-500">Job not found.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/jobs")}
        >
          Browse Jobs
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Jobs
      </button>

      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-6 text-white">
        {job.isFeatured && (
          <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2.5 py-0.5 text-xs font-medium text-amber-300">
            <Star className="h-3 w-3 fill-amber-300" />
            Featured
          </span>
        )}
        <h1 className="text-xl font-bold">{job.title}</h1>
        <div className="mt-2 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-white/60" />
          <span className="text-white/80">{job.hotel?.name}</span>
          {job.hotel?.starRating && (
            <span className="text-xs text-white/50">
              {"★".repeat(job.hotel.starRating)}
            </span>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/60">
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {job.city}, {job.country}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {EMPLOYMENT_LABELS[job.employmentType]}
          </span>
          {job.experienceLevel && (
            <span>{EXPERIENCE_LABELS[job.experienceLevel]}</span>
          )}
        </div>

        {/* Perks summary */}
        <div className="mt-4 flex flex-wrap gap-2">
          {job.accommodationIncluded && (
            <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/80">
              <Home className="h-3.5 w-3.5" /> Accommodation
            </span>
          )}
          {job.mealsIncluded && (
            <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/80">
              <Utensils className="h-3.5 w-3.5" /> Meals
            </span>
          )}
          {job.visaSupport && (
            <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/80">
              <Globe className="h-3.5 w-3.5" /> Visa Support
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold text-gray-900">About this Role</h2>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
          {job.description}
        </p>
      </div>

      {/* Requirements */}
      {job.requirements && job.requirements.length > 0 && (
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold text-gray-900">Requirements</h2>
          <ul className="space-y-2">
            {job.requirements.map((req, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-gray-600"
              >
                <CheckCircle2
                  className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                    req.isRequired ? "text-[#1a1a2e]" : "text-gray-300"
                  }`}
                />
                <span>
                  {req.label}
                  {!req.isRequired && (
                    <span className="ml-1.5 text-xs text-gray-400">
                      (preferred)
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Benefits */}
      {job.benefits && job.benefits.length > 0 && (
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold text-gray-900">Benefits</h2>
          <div className="flex flex-wrap gap-2">
            {job.benefits.map((b, i) => (
              <span
                key={i}
                className="rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700"
              >
                {b.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Apply section */}
      {showApply ? (
        <div className="space-y-4 rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900">
            Apply for this Position
          </h2>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Cover Letter <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Tell us why you're interested in this role..."
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
              rows={4}
            />
          </div>
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-[#1a1a2e] hover:bg-[#16213e]"
              onClick={() =>
                applyMutation.mutate({
                  postingId: job.id,
                  coverLetter: coverLetter || undefined,
                })
              }
              disabled={applyMutation.isPending}
            >
              {applyMutation.isPending ? "Submitting..." : "Submit Application"}
            </Button>
            <Button variant="outline" onClick={() => setShowApply(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          className="w-full bg-[#1a1a2e] hover:bg-[#16213e]"
          size="lg"
          onClick={() => {
            if (!isAuthenticated()) {
              router.push("/login");
              return;
            }
            setShowApply(true);
          }}
        >
          Apply Now
        </Button>
      )}

      {job.deadline && (
        <p className="text-center text-xs text-gray-400">
          Application deadline: {new Date(job.deadline).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
