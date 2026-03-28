"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Wrench, CheckCircle2, Clock, Loader2 } from "lucide-react";

const REQUEST_LABELS: Record<string, string> = {
  EXTRA_TOWELS: "Extra Towels",
  HOUSEKEEPING: "Housekeeping",
  ROOM_CLEANING: "Room Cleaning",
  MINIBAR_REFILL: "Minibar Refill",
  AC_ISSUE: "A/C Issue",
  TV_INTERNET_ISSUE: "TV / Internet",
  LUGGAGE_ASSISTANCE: "Luggage",
  WAKE_UP_CALL: "Wake-Up Call",
  BABY_CRIB: "Baby Crib",
  MAINTENANCE: "Maintenance",
  OTHER: "Other",
};

const PRIORITY_BADGE: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-600",
  NORMAL: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  ASSIGNED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-indigo-100 text-indigo-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-600",
};

export default function HotelServiceRequestsPage() {
  const { user } = useAuthStore();
  const hotelId = user?.hotelId ?? "";
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const { data, isLoading, refetch } = trpc.guestServiceRequest.list.useQuery(
    {
      hotelId,
      status: statusFilter as
        | "PENDING"
        | "ASSIGNED"
        | "IN_PROGRESS"
        | "COMPLETED"
        | "CANCELLED"
        | undefined,
      pageSize: 100,
    },
    { enabled: !!hotelId },
  );

  const completeMutation = trpc.guestServiceRequest.complete.useMutation({
    onSuccess: () => {
      toast.success("Request marked as complete.");
      void refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateStatusMutation =
    trpc.guestServiceRequest.updateStatus.useMutation({
      onSuccess: () => {
        toast.success("Status updated.");
        void refetch();
      },
      onError: (err) => toast.error(err.message),
    });

  const TABS = [
    { label: "All", value: undefined },
    { label: "Pending", value: "PENDING" },
    { label: "Assigned", value: "ASSIGNED" },
    { label: "In Progress", value: "IN_PROGRESS" },
    { label: "Done", value: "COMPLETED" },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Wrench className="h-6 w-6 text-[#1a1a2e]" />
        <h1 className="text-2xl font-bold text-gray-900">Service Requests</h1>
      </div>

      {/* Status tabs */}
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
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : !data?.items || data.items.length === 0 ? (
        <div className="rounded-xl border bg-white py-12 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">No requests in this category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.items.map((req) => (
            <div
              key={req.id}
              className="rounded-xl border bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_BADGE[req.priority]}`}
                    >
                      {req.priority}
                    </span>
                    <p className="font-semibold text-gray-900">
                      {REQUEST_LABELS[req.requestType] ?? req.requestType}
                    </p>
                  </div>
                  {req.description && (
                    <p className="text-sm text-gray-500">{req.description}</p>
                  )}
                  {req.stay?.roomNumber && (
                    <p className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3.5 w-3.5" />
                      Room {req.stay.roomNumber}
                    </p>
                  )}
                  <p className="font-mono text-xs text-gray-400">
                    {req.requestRef}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGE[req.status]}`}
                  >
                    {req.status.replace(/_/g, " ")}
                  </span>
                  {req.status === "PENDING" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: req.id,
                          status: "IN_PROGRESS",
                        })
                      }
                    >
                      <Loader2 className="mr-1 h-3.5 w-3.5" />
                      Start
                    </Button>
                  )}
                  {req.status === "IN_PROGRESS" && (
                    <Button
                      size="sm"
                      className="bg-green-600 text-white hover:bg-green-700"
                      onClick={() => completeMutation.mutate({ id: req.id })}
                    >
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
