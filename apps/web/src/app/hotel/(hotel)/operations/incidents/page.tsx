"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  ROOM_ISSUE: "Room Issue",
  NOISE_COMPLAINT: "Noise",
  MAINTENANCE: "Maintenance",
  BILLING: "Billing",
  SAFETY: "Safety",
  STAFF_CONDUCT: "Staff Conduct",
  FOOD_QUALITY: "Food Quality",
  SERVICE_DELAY: "Service Delay",
  OTHER: "Other",
};

const SEVERITY_BADGE: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-600",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};

const STATUS_BADGE: Record<string, string> = {
  OPEN: "bg-red-100 text-red-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  AWAITING_RESPONSE: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-600",
};

const TABS = [
  { label: "Open", value: "OPEN" },
  { label: "Investigating", value: "IN_PROGRESS" },
  { label: "Pending Guest", value: "AWAITING_RESPONSE" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "All", value: undefined },
] as const;

export default function HotelIncidentsPage() {
  const { user } = useAuthStore();
  const hotelId = user?.hotelId ?? "";
  const [statusFilter, setStatusFilter] = useState<string | undefined>("OPEN");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading, refetch } = trpc.incident.list.useQuery(
    {
      hotelId,
      status: statusFilter as
        | "OPEN"
        | "IN_PROGRESS"
        | "RESOLVED"
        | "CLOSED"
        | "AWAITING_RESPONSE"
        | undefined,
      pageSize: 50,
    },
    { enabled: !!hotelId },
  );

  const updateStatusMutation = trpc.incident.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated.");
      void refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const resolveMutation = trpc.incident.resolve.useMutation({
    onSuccess: () => {
      toast.success("Incident resolved.");
      void refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  function formatDue(dueAt: Date | string | null | undefined) {
    if (!dueAt) return null;
    const d = new Date(dueAt);
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    if (diff < 0)
      return { label: "Overdue", className: "text-red-600 font-semibold" };
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return {
      label: hrs > 0 ? `${hrs}h ${mins}m remaining` : `${mins}m remaining`,
      className: hrs < 2 ? "text-orange-600" : "text-gray-500",
    };
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-6 w-6 text-[#1a1a2e]" />
        <h1 className="text-2xl font-bold text-gray-900">Incidents</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b">
        {TABS.map((tab) => (
          <button
            key={String(tab.value)}
            onClick={() => setStatusFilter(tab.value)}
            className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === tab.value
                ? "border-[#1a1a2e] text-[#1a1a2e]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            {tab.label}
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
          <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">No incidents in this category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.items.map((inc) => {
            const due = formatDue(inc.dueAt);
            const isExpanded = expandedId === inc.id;
            return (
              <div
                key={inc.id}
                className="overflow-hidden rounded-xl border bg-white shadow-sm"
              >
                <div
                  className="flex cursor-pointer items-start justify-between gap-3 p-4"
                  onClick={() => setExpandedId(isExpanded ? null : inc.id)}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${SEVERITY_BADGE[inc.severity]}`}
                      >
                        {inc.severity}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGE[inc.status]}`}
                      >
                        {inc.status.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-gray-500">
                        {CATEGORY_LABELS[inc.category] ?? inc.category}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900">{inc.title}</p>
                    {due && (
                      <p
                        className={`flex items-center gap-1 text-xs ${due.className}`}
                      >
                        <Clock className="h-3.5 w-3.5" />
                        {due.label}
                      </p>
                    )}
                    <p className="font-mono text-xs text-gray-400">
                      {inc.incidentRef}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  )}
                </div>

                {isExpanded && (
                  <div className="space-y-3 border-t bg-gray-50 p-4">
                    {inc.description && (
                      <p className="text-sm text-gray-600">{inc.description}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      Reported: {new Date(inc.createdAt).toLocaleString()}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {inc.status === "OPEN" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: inc.id,
                              status: "IN_PROGRESS",
                            })
                          }
                          disabled={updateStatusMutation.isPending}
                        >
                          Start Investigating
                        </Button>
                      )}
                      {inc.status === "IN_PROGRESS" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: inc.id,
                              status: "AWAITING_RESPONSE",
                            })
                          }
                          disabled={updateStatusMutation.isPending}
                        >
                          Awaiting Guest
                        </Button>
                      )}
                      {(inc.status === "IN_PROGRESS" ||
                        inc.status === "AWAITING_RESPONSE") && (
                        <Button
                          size="sm"
                          className="bg-green-600 text-white hover:bg-green-700"
                          onClick={() => {
                            const notes = prompt(
                              "Resolution notes (optional):",
                            );
                            resolveMutation.mutate({
                              incidentId: inc.id,
                              resolution: notes ?? "",
                            });
                          }}
                          disabled={resolveMutation.isPending}
                        >
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                          Resolve
                        </Button>
                      )}
                      {inc.status === "RESOLVED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: inc.id,
                              status: "CLOSED",
                            })
                          }
                          disabled={updateStatusMutation.isPending}
                        >
                          Close
                        </Button>
                      )}
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
