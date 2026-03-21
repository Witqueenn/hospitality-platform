"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Home,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  IN_REVIEW: "bg-blue-100 text-blue-700",
  VERIFIED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-600",
  SUSPENDED: "bg-gray-100 text-gray-500",
};

export default function TrustedStaysAdminPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  const {
    data: pending,
    isLoading,
    refetch,
  } = trpc.trustedStay.listPendingVerifications.useQuery();

  const reviewMutation = (
    trpc.trustedStay.reviewVerification as any
  ).useMutation({
    onSuccess: (_: unknown, vars: any) => {
      toast.success(
        `Verification ${vars.status === "VERIFIED" ? "approved" : "reviewed"}.`,
      );
      void refetch();
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const list = (pending as any[]) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-7 w-7 text-[#1a1a2e]" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Trusted Stays Verification
          </h1>
          <p className="text-sm text-gray-500">
            Review host and unit verification requests
          </p>
        </div>
      </div>

      {/* Stats */}
      {!isLoading && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border bg-white p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {list.filter((v: any) => v.status === "PENDING").length}
            </p>
            <p className="text-xs text-gray-500">Pending</p>
          </div>
          <div className="rounded-xl border bg-white p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {list.filter((v: any) => v.status === "IN_REVIEW").length}
            </p>
            <p className="text-xs text-gray-500">In Review</p>
          </div>
          <div className="rounded-xl border bg-white p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{list.length}</p>
            <p className="text-xs text-gray-500">Total Open</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="py-20 text-center">
          <CheckCircle className="mx-auto mb-4 h-12 w-12 text-emerald-300" />
          <p className="text-gray-500">No pending verifications.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((v: any) => {
            const isExpanded = expandedId === v.id;
            return (
              <div
                key={v.id}
                className="overflow-hidden rounded-xl border bg-white shadow-sm"
              >
                <div className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1a1a2e]/10">
                    <Home className="h-6 w-6 text-[#1a1a2e]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-900">
                        {v.host?.displayName ?? v.unit?.name ?? "—"}
                      </p>
                      <Badge
                        className={`text-xs ${STATUS_COLORS[v.status] ?? ""}`}
                      >
                        {v.status}
                      </Badge>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                        {v.documentType}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {v.host ? `Host: ${v.host.displayName}` : ""}
                      {v.unit
                        ? ` · Unit: ${v.unit.name} (${v.unit.stayType})`
                        : ""}
                      {" · "}
                      Submitted {new Date(v.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : v.id)}
                    className="rounded p-1 text-gray-400 hover:text-gray-600"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {isExpanded && (
                  <div className="space-y-4 border-t bg-gray-50 px-4 py-4">
                    {v.documentUrls?.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase text-gray-400">
                          Documents
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {v.documentUrls.map((url: string, i: number) => (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-lg border bg-white px-3 py-1.5 text-xs text-[#1a1a2e] hover:bg-gray-50"
                            >
                              Document {i + 1} ↗
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {v.notes && (
                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase text-gray-400">
                          Applicant Notes
                        </p>
                        <p className="text-sm text-gray-600">{v.notes}</p>
                      </div>
                    )}
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase text-gray-400">
                        Review Notes
                      </label>
                      <textarea
                        rows={2}
                        value={reviewNotes[v.id] ?? ""}
                        onChange={(e) =>
                          setReviewNotes({
                            ...reviewNotes,
                            [v.id]: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                        placeholder="Optional notes…"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() =>
                          reviewMutation.mutate({
                            id: v.id,
                            status: "REJECTED",
                            notes: reviewNotes[v.id],
                          })
                        }
                        disabled={reviewMutation.isPending}
                      >
                        <XCircle className="mr-1 h-4 w-4" /> Reject
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() =>
                          reviewMutation.mutate({
                            id: v.id,
                            status: "VERIFIED",
                            notes: reviewNotes[v.id],
                          })
                        }
                        disabled={reviewMutation.isPending}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" /> Approve
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
