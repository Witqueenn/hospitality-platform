"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Wrench,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

const REQUEST_TYPES = [
  { value: "EXTRA_TOWELS", label: "Extra Towels" },
  { value: "HOUSEKEEPING", label: "Housekeeping" },
  { value: "ROOM_CLEANING", label: "Room Cleaning" },
  { value: "MINIBAR_REFILL", label: "Minibar Refill" },
  { value: "AC_ISSUE", label: "A/C Issue" },
  { value: "TV_INTERNET_ISSUE", label: "TV / Internet Issue" },
  { value: "LUGGAGE_ASSISTANCE", label: "Luggage Assistance" },
  { value: "WAKE_UP_CALL", label: "Wake-Up Call" },
  { value: "BABY_CRIB", label: "Baby Crib" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "OTHER", label: "Other" },
] as const;

const STATUS_BADGE: Record<
  string,
  { label: string; className: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-700",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  ASSIGNED: {
    label: "Assigned",
    className: "bg-blue-100 text-blue-700",
    icon: <Loader2 className="h-3.5 w-3.5" />,
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-indigo-100 text-indigo-700",
    icon: <Loader2 className="h-3.5 w-3.5" />,
  },
  COMPLETED: {
    label: "Done",
    className: "bg-green-100 text-green-700",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-600",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
};

export default function StayRequestsPage() {
  const params = useSearchParams();
  const stayId = params.get("stayId") ?? "";
  const { isAuthenticated } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [requestType, setRequestType] = useState<string>("HOUSEKEEPING");
  const [description, setDescription] = useState("");

  const {
    data: requests,
    isLoading,
    refetch,
  } = trpc.guestServiceRequest.myRequests.useQuery(
    { stayId },
    { enabled: isAuthenticated() && !!stayId },
  );

  const createMutation = trpc.guestServiceRequest.create.useMutation({
    onSuccess: () => {
      toast.success("Request submitted. We'll take care of it shortly.");
      setShowForm(false);
      setDescription("");
      void refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = () => {
    if (!stayId) return;
    createMutation.mutate({
      stayId,
      hotelId: "", // Will be resolved server-side via stayId
      requestType: requestType as Parameters<
        typeof createMutation.mutate
      >[0]["requestType"],
      description: description || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-green-100 p-2">
            <Wrench className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Service Requests
            </h1>
            <p className="text-sm text-gray-500">We&apos;re here to help</p>
          </div>
        </div>
        <Button
          size="sm"
          className="bg-[#1a1a2e] hover:bg-[#16213e]"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          New Request
        </Button>
      </div>

      {/* New Request Form */}
      {showForm && (
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">
            What do you need?
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {REQUEST_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setRequestType(type.value)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                    requestType === type.value
                      ? "border-[#1a1a2e] bg-[#1a1a2e]/5 font-medium text-[#1a1a2e]"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any additional details? (optional)"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
              rows={2}
            />

            <div className="flex gap-2">
              <Button
                className="flex-1 bg-[#1a1a2e] hover:bg-[#16213e]"
                onClick={handleSubmit}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Submitting..." : "Submit Request"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Request list */}
      {!requests || requests.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          <Wrench className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">No requests yet.</p>
          <p className="mt-1 text-sm text-gray-400">
            Tap &quot;New Request&quot; to get help.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const badge = STATUS_BADGE[req.status] ?? STATUS_BADGE["PENDING"]!;
            return (
              <div
                key={req.id}
                className="rounded-xl border bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900">
                      {REQUEST_TYPES.find((t) => t.value === req.requestType)
                        ?.label ?? req.requestType}
                    </p>
                    {req.description && (
                      <p className="text-sm text-gray-500">{req.description}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(req.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${badge.className}`}
                  >
                    {badge.icon}
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
