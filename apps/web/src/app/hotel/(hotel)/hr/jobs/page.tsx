"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Briefcase,
  Plus,
  MapPin,
  Clock,
  Star,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  PUBLISHED: "bg-green-100 text-green-700",
  CLOSED: "bg-red-100 text-red-600",
  FILLED: "bg-blue-100 text-blue-700",
  PAUSED: "bg-yellow-100 text-yellow-700",
};

const EMPLOYMENT_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  SEASONAL: "Seasonal",
  INTERNSHIP: "Internship",
  TRAINEE: "Trainee",
  TEMPORARY: "Temporary",
};

export default function HotelJobsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const hotelId = user?.hotelId ?? "";

  const { data, isLoading, refetch } = trpc.jobPosting.listByHotel.useQuery(
    { hotelId, pageSize: 50 },
    { enabled: !!hotelId },
  );

  const publishMutation = trpc.jobPosting.publish.useMutation({
    onSuccess: () => {
      toast.success("Job published.");
      void refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const closeMutation = trpc.jobPosting.close.useMutation({
    onSuccess: () => {
      toast.success("Job closed.");
      void refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Briefcase className="h-6 w-6 text-[#1a1a2e]" />
          <h1 className="text-2xl font-bold text-gray-900">Job Postings</h1>
        </div>
        <Button
          className="bg-[#1a1a2e] hover:bg-[#16213e]"
          onClick={() => router.push("/hotel/hr/jobs/create")}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Post Job
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : !data?.items || data.items.length === 0 ? (
        <div className="rounded-xl border bg-white py-16 text-center">
          <Briefcase className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">No job postings yet.</p>
          <Button
            className="mt-4 bg-[#1a1a2e] hover:bg-[#16213e]"
            onClick={() => router.push("/hotel/hr/jobs/create")}
          >
            Create First Posting
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {data.items.map((job) => (
            <div
              key={job.id}
              className="rounded-xl border bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[job.status]}`}
                    >
                      {job.status}
                    </span>
                    {job.isFeatured && (
                      <span className="flex items-center gap-0.5 text-xs text-amber-600">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        Featured
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900">{job.title}</h3>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.city}, {job.country}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {EMPLOYMENT_LABELS[job.employmentType] ??
                        job.employmentType}
                    </span>
                    {job._count?.applications !== undefined && (
                      <span className="text-gray-400">
                        {job._count.applications} application
                        {job._count.applications !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  {job.status === "DRAFT" && (
                    <Button
                      size="sm"
                      className="bg-green-600 text-white hover:bg-green-700"
                      onClick={() => publishMutation.mutate({ id: job.id })}
                      disabled={publishMutation.isPending}
                    >
                      <Eye className="mr-1 h-3.5 w-3.5" />
                      Publish
                    </Button>
                  )}
                  {job.status === "PUBLISHED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => closeMutation.mutate({ id: job.id })}
                      disabled={closeMutation.isPending}
                    >
                      <EyeOff className="mr-1 h-3.5 w-3.5" />
                      Close
                    </Button>
                  )}
                  <button
                    onClick={() =>
                      router.push(`/hotel/hr/applications?jobId=${job.id}`)
                    }
                    className="text-xs text-[#1a1a2e] hover:underline"
                  >
                    View Applications
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
