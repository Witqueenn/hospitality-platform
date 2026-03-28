"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Briefcase,
  Calendar,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
} from "lucide-react";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  SUBMITTED: { label: "Submitted", className: "bg-blue-100 text-blue-700" },
  SHORTLISTED: {
    label: "Shortlisted",
    className: "bg-purple-100 text-purple-700",
  },
  INTERVIEW: { label: "Interview", className: "bg-indigo-100 text-indigo-700" },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-600" },
  HIRED: { label: "Hired", className: "bg-green-100 text-green-700" },
  WITHDRAWN: { label: "Withdrawn", className: "bg-gray-100 text-gray-600" },
};

const STATUS_TRANSITIONS: Record<string, string[]> = {
  SUBMITTED: ["SHORTLISTED", "REJECTED"],
  SHORTLISTED: ["INTERVIEW", "REJECTED"],
  INTERVIEW: ["HIRED", "REJECTED"],
};

const ALL_STATUSES = Object.keys(STATUS_BADGE);

const EMPLOYMENT_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  SEASONAL: "Seasonal",
  INTERNSHIP: "Internship",
  TRAINEE: "Trainee",
  TEMPORARY: "Temporary",
};

export default function HotelApplicationsPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useAuthStore();
  const hotelId = user?.hotelId ?? "";
  const jobIdParam = params.get("jobId") ?? undefined;

  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [scheduleForm, setScheduleForm] = useState<{
    appId: string;
    date: string;
    notes: string;
  } | null>(null);
  const [noteForm, setNoteForm] = useState<{
    appId: string;
    body: string;
  } | null>(null);

  const { data: jobsData } = trpc.jobPosting.listByHotel.useQuery(
    { hotelId, pageSize: 100 },
    { enabled: !!hotelId },
  );

  const [selectedJobId, setSelectedJobId] = useState<string>(jobIdParam ?? "");

  const { data, isLoading, refetch } =
    trpc.jobApplication.listByPosting.useQuery(
      {
        postingId: selectedJobId,
        status: statusFilter as
          | "SUBMITTED"
          | "SHORTLISTED"
          | "INTERVIEW"
          | "HIRED"
          | "REJECTED"
          | undefined,
        pageSize: 50,
      },
      { enabled: !!selectedJobId },
    );

  const updateStatusMutation = trpc.jobApplication.updateStatus.useMutation({
    onSuccess: (_, vars) => {
      toast.success(`Applicant ${vars.status.toLowerCase()}.`);
      void refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  // @ts-expect-error -- legacy type mismatch
  const scheduleMutation = trpc.jobApplication.scheduleInterview.useMutation({
    onSuccess: () => {
      toast.success("Interview scheduled.");
      void refetch();
      setScheduleForm(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const addNoteMutation = trpc.jobApplication.addNote.useMutation({
    onSuccess: () => {
      toast.success("Note added.");
      void refetch();
      setNoteForm(null);
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Briefcase className="h-6 w-6 text-[#1a1a2e]" />
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
      </div>

      {/* Job selector */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Select Job Posting
        </label>
        <select
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">Choose a posting...</option>
          {jobsData?.items.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title} ({j.status})
            </option>
          ))}
        </select>
      </div>

      {selectedJobId && (
        <>
          {/* Status filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter(undefined)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                !statusFilter
                  ? "bg-[#1a1a2e] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-[#1a1a2e] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {STATUS_BADGE[s]?.label ?? s}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          ) : !data?.items || data.items.length === 0 ? (
            <div className="rounded-xl border bg-white py-12 text-center">
              <Briefcase className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p className="text-gray-500">No applications yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.items.map((app) => {
                const badge =
                  STATUS_BADGE[app.status] ?? STATUS_BADGE.SUBMITTED!;
                const isExpanded = expandedId === app.id;
                const nextStatuses = STATUS_TRANSITIONS[app.status] ?? [];
                const interview = app.interviews?.[0];

                return (
                  <div
                    key={app.id}
                    className="overflow-hidden rounded-xl border bg-white shadow-sm"
                  >
                    <div
                      className="flex cursor-pointer items-start justify-between gap-3 p-4"
                      onClick={() => setExpandedId(isExpanded ? null : app.id)}
                    >
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <p className="font-semibold text-gray-900">
                          Applicant #{app.applicantId.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Applied {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                        {interview && (
                          <p className="flex items-center gap-1 text-xs text-indigo-600">
                            <Calendar className="h-3.5 w-3.5" />
                            Interview:{" "}
                            {new Date(interview.scheduledAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      )}
                    </div>

                    {isExpanded && (
                      <div className="space-y-4 border-t bg-gray-50 p-4">
                        {/* Cover letter */}
                        {app.coverLetter && (
                          <div>
                            <p className="mb-1 text-xs font-medium text-gray-500">
                              Cover Letter
                            </p>
                            <p className="text-sm leading-relaxed text-gray-600">
                              {app.coverLetter}
                            </p>
                          </div>
                        )}

                        {/* Recruiter notes */}
                        {app.recruiterNotes &&
                          app.recruiterNotes.length > 0 && (
                            <div>
                              <p className="mb-1 text-xs font-medium text-gray-500">
                                Recruiter Notes
                              </p>
                              <div className="space-y-1">
                                {app.recruiterNotes.map(
                                  (note: {
                                    id: string;
                                    content: string;
                                    createdAt: Date | string;
                                  }) => (
                                    <p
                                      key={note.id}
                                      className="text-sm text-gray-600"
                                    >
                                      • {note.content}
                                    </p>
                                  ),
                                )}
                              </div>
                            </div>
                          )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          {nextStatuses.map((s) => {
                            const b = STATUS_BADGE[s];
                            return (
                              <Button
                                key={s}
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateStatusMutation.mutate({
                                    id: app.id,
                                    status: s as Parameters<
                                      typeof updateStatusMutation.mutate
                                    >[0]["status"],
                                  })
                                }
                                disabled={updateStatusMutation.isPending}
                              >
                                Move to {b?.label ?? s}
                              </Button>
                            );
                          })}

                          {app.status === "SHORTLISTED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setScheduleForm({
                                  appId: app.id,
                                  date: "",
                                  notes: "",
                                })
                              }
                            >
                              <Calendar className="mr-1 h-3.5 w-3.5" />
                              Schedule Interview
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setNoteForm({ appId: app.id, body: "" })
                            }
                          >
                            Add Note
                          </Button>
                        </div>

                        {/* Schedule interview form */}
                        {scheduleForm?.appId === app.id && (
                          <div className="space-y-2 rounded-lg border bg-white p-3">
                            <p className="text-xs font-medium text-gray-600">
                              Schedule Interview
                            </p>
                            <input
                              type="datetime-local"
                              value={scheduleForm.date}
                              onChange={(e) =>
                                setScheduleForm({
                                  ...scheduleForm,
                                  date: e.target.value,
                                })
                              }
                              className="w-full rounded-lg border px-3 py-1.5 text-sm"
                            />
                            <input
                              type="text"
                              value={scheduleForm.notes}
                              onChange={(e) =>
                                setScheduleForm({
                                  ...scheduleForm,
                                  notes: e.target.value,
                                })
                              }
                              placeholder="Notes (optional)"
                              className="w-full rounded-lg border px-3 py-1.5 text-sm"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-[#1a1a2e] hover:bg-[#16213e]"
                                onClick={() => {
                                  if (!scheduleForm.date) {
                                    toast.error("Select a date.");
                                    return;
                                  }
                                  scheduleMutation.mutate({
                                    applicationId: app.id,
                                    scheduledAt: new Date(
                                      scheduleForm.date,
                                    ).toISOString(),
                                    notes: scheduleForm.notes || undefined,
                                  });
                                }}
                                disabled={scheduleMutation.isPending}
                              >
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setScheduleForm(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Add note form */}
                        {noteForm?.appId === app.id && (
                          <div className="space-y-2 rounded-lg border bg-white p-3">
                            <p className="text-xs font-medium text-gray-600">
                              Add Recruiter Note
                            </p>
                            <textarea
                              value={noteForm.body}
                              onChange={(e) =>
                                setNoteForm({
                                  ...noteForm,
                                  body: e.target.value,
                                })
                              }
                              rows={2}
                              placeholder="Internal note about this applicant..."
                              className="w-full rounded-lg border px-3 py-1.5 text-sm"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-[#1a1a2e] hover:bg-[#16213e]"
                                onClick={() => {
                                  if (!noteForm.body.trim()) {
                                    toast.error("Note cannot be empty.");
                                    return;
                                  }
                                  addNoteMutation.mutate({
                                    applicationId: app.id,
                                    content: noteForm.body,
                                  });
                                }}
                                disabled={addNoteMutation.isPending}
                              >
                                Save Note
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setNoteForm(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
