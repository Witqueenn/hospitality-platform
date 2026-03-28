"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { formatCurrency, formatDate } from "@repo/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  AlertTriangle,
  User,
  Clock,
} from "lucide-react";

const SEVERITY_STYLE: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-600",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};

const COMP_TYPE_LABELS: Record<string, string> = {
  ROOM_UPGRADE: "Room Upgrade",
  LATE_CHECKOUT: "Late Check-out",
  EARLY_CHECKIN: "Early Check-in",
  BREAKFAST_INCLUDED: "Breakfast Included",
  PARTIAL_REFUND: "Partial Refund",
  FULL_REFUND: "Full Refund",
  SERVICE_VOUCHER: "Service Voucher",
  AMENITY_CREDIT: "Amenity Credit",
  EVENT_DISCOUNT: "Event Discount",
  FREE_NIGHT: "Free Night",
  OTHER: "Other",
};

function CaseCard({
  c,
  onAction,
}: {
  c: {
    id: string;
    caseRef: string;
    title: string;
    category: string;
    severity: string;
    status: string;
    createdAt: Date | string;
    guest: { name: string };
    hotel?: { name: string } | null;
  };
  onAction: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [approveNote, setApproveNote] = useState("");
  const [rejectNote, setRejectNote] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const { data: detail, isLoading: detailLoading } =
    trpc.supportCase.getById.useQuery({ id: c.id }, { enabled: open });

  const approveCompensation = trpc.supportCase.approveCompensation.useMutation({
    onSuccess: () => {
      toast.success("Compensation approved.");
      onAction();
    },
    onError: (err) => toast.error(err.message),
  });

  // eslint-disable-next-line
  const updateStatus = (trpc.supportCase.updateStatus as any).useMutation({
    onSuccess: () => {
      toast.success("Case moved back to in-progress.");
      onAction();
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  const pendingComps = ((detail as any)?.compensations ?? []).filter(
    (comp: any) => comp.status === "PENDING_APPROVAL",
  );

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start justify-between gap-3 p-5 text-left hover:bg-gray-50"
      >
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${SEVERITY_STYLE[c.severity] ?? "bg-gray-100 text-gray-600"}`}
            >
              {c.severity}
            </span>
            <span className="font-mono text-sm font-semibold text-[#1a1a2e]">
              {c.caseRef}
            </span>
          </div>
          <p className="font-semibold text-gray-900">{c.title}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {c.guest.name}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDate(c.createdAt)}
            </span>
            {c.hotel && <span>{c.hotel.name}</span>}
          </div>
        </div>
        {open ? (
          <ChevronUp className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
        ) : (
          <ChevronDown className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
        )}
      </button>

      {open && (
        <div className="space-y-4 border-t bg-gray-50 p-5">
          {detailLoading ? (
            <Skeleton className="h-24 w-full rounded-lg" />
          ) : pendingComps.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-sm text-gray-500">
                No pending compensation proposals on this case.
              </p>
              <p className="mt-1 text-xs text-gray-400">
                It may have been auto-approved or already handled.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() =>
                  updateStatus.mutate({
                    caseId: c.id,
                    status: "IN_PROGRESS",
                    note: "Moved back to in-progress after review",
                  })
                }
                disabled={updateStatus.isPending}
              >
                Mark In-Progress
              </Button>
            </div>
          ) : (
            pendingComps.map((comp: any) => (
              <div
                key={comp.id}
                className="space-y-3 rounded-xl border bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {COMP_TYPE_LABELS[comp.compensationType] ??
                        comp.compensationType}
                    </p>
                    <p className="mt-0.5 text-sm text-gray-600">
                      {comp.description}
                    </p>
                    {comp.reasoning && (
                      <p className="mt-1 text-xs italic text-gray-400">
                        Reason: {comp.reasoning}
                      </p>
                    )}
                  </div>
                  {comp.valueCents != null && (
                    <span className="flex-shrink-0 rounded-lg bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">
                      {formatCurrency(comp.valueCents)}
                    </span>
                  )}
                </div>

                {!showRejectForm ? (
                  <div className="space-y-2">
                    <textarea
                      value={approveNote}
                      onChange={(e) => setApproveNote(e.target.value)}
                      rows={2}
                      placeholder="Approval note (optional)"
                      className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 text-white hover:bg-green-700"
                        onClick={() =>
                          approveCompensation.mutate({
                            compensationId: comp.id,
                            note: approveNote || undefined,
                          })
                        }
                        disabled={approveCompensation.isPending}
                      >
                        <CheckCircle className="mr-1.5 h-4 w-4" />
                        {approveCompensation.isPending
                          ? "Approving…"
                          : "Approve"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => setShowRejectForm(true)}
                      >
                        <XCircle className="mr-1.5 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                      rows={2}
                      placeholder="Reason for rejection (required)"
                      className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-red-600 text-white hover:bg-red-700"
                        onClick={() => {
                          if (!rejectNote.trim()) {
                            toast.error("Please provide a rejection reason.");
                            return;
                          }
                          updateStatus.mutate({
                            caseId: c.id,
                            status: "IN_PROGRESS",
                            note: `Compensation rejected: ${rejectNote}`,
                          });
                        }}
                        disabled={updateStatus.isPending}
                      >
                        {updateStatus.isPending
                          ? "Rejecting…"
                          : "Confirm Reject"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowRejectForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function ApprovalsPage() {
  const { user } = useAuthStore();
  const hotelId = user?.hotelId;
  const [page, setPage] = useState(1);

  const {
    data: casesRaw,
    isLoading,
    refetch,
  } = trpc.supportCase.list.useQuery(
    {
      hotelId: hotelId ?? undefined,
      status: "AWAITING_APPROVAL" as any,
      page,
      pageSize: 20,
    },
    { enabled: !!hotelId },
  );

  const cases = casesRaw as
    | {
        items: {
          id: string;
          caseRef: string;
          title: string;
          category: string;
          severity: string;
          status: string;
          createdAt: Date;
          guest: { name: string };
          hotel?: { name: string } | null;
        }[];
        total: number;
        pageSize: number;
      }
    | undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-6 w-6 text-[#1a1a2e]" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Pending Approvals
          </h1>
          <p className="text-sm text-gray-500">
            Compensation proposals awaiting your review
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <p>
          Cases appear here when a proposed compensation exceeds the
          auto-approval threshold or involves a full refund / free night. Expand
          a case to review and approve or reject the proposal.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : !cases?.items.length ? (
        <div className="rounded-xl border bg-white py-20 text-center">
          <CheckCircle className="mx-auto mb-3 h-12 w-12 text-green-300" />
          <p className="font-medium text-gray-700">All caught up!</p>
          <p className="mt-1 text-sm text-gray-400">
            No pending approvals at the moment.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">
            {cases.total} case{cases.total !== 1 ? "s" : ""} awaiting approval
          </p>
          <div className="space-y-3">
            {cases.items.map((c: any) => (
              <CaseCard key={c.id} c={c} onAction={() => void refetch()} />
            ))}
          </div>

          {cases.total > cases.pageSize && (
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
                Page {page} of {Math.ceil(cases.total / cases.pageSize)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page * cases.pageSize >= cases.total}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
