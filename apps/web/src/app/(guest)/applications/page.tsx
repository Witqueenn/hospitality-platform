"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Clock, Calendar } from "lucide-react";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  SUBMITTED: { label: "Submitted", className: "bg-blue-100 text-blue-700" },
  SHORTLISTED: {
    label: "Shortlisted",
    className: "bg-purple-100 text-purple-700",
  },
  INTERVIEW: { label: "Interview", className: "bg-indigo-100 text-indigo-700" },
  REJECTED: { label: "Not Selected", className: "bg-gray-100 text-gray-600" },
  HIRED: { label: "Hired", className: "bg-green-100 text-green-700" },
};

const EMPLOYMENT_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  SEASONAL: "Seasonal",
  INTERNSHIP: "Internship",
  TRAINEE: "Trainee",
  TEMPORARY: "Temporary",
};

export default function ApplicationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated()) router.push("/login");
  }, [isAuthenticated, router]);

  const { data, isLoading } = trpc.jobApplication.myApplications.useQuery(
    { pageSize: 50 },
    { enabled: isAuthenticated() },
  );

  if (!isAuthenticated()) return null;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Briefcase className="h-6 w-6 text-[#1a1a2e]" />
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
      </div>

      {!data?.items || data.items.length === 0 ? (
        <div className="rounded-xl border bg-white py-16 text-center shadow-sm">
          <Briefcase className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">No applications yet.</p>
          <Button
            className="mt-4 bg-[#1a1a2e] hover:bg-[#16213e]"
            onClick={() => router.push("/jobs")}
          >
            Browse Jobs
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {data.items.map((app) => {
            const badge =
              STATUS_BADGE[app.status] ?? STATUS_BADGE["SUBMITTED"]!;
            const interview = app.interviews?.[0];
            return (
              <div
                key={app.id}
                className="rounded-xl border bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <h3 className="font-semibold text-gray-900">
                      {app.posting?.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {app.posting?.hotel?.name}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {app.posting?.city}, {app.posting?.country}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {EMPLOYMENT_LABELS[app.posting?.employmentType ?? ""] ??
                          app.posting?.employmentType}
                      </span>
                    </div>

                    {interview && (
                      <div className="flex items-center gap-1.5 text-xs text-indigo-600">
                        <Calendar className="h-3.5 w-3.5" />
                        Interview:{" "}
                        {new Date(interview.scheduledAt).toLocaleString()}
                      </div>
                    )}

                    <p className="text-xs text-gray-400">
                      Applied {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span
                    className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
