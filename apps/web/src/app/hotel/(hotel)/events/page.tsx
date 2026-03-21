"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { formatDate, formatCurrency } from "@repo/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { CalendarDays, Users, ChevronDown, ChevronUp } from "lucide-react";

type EventStatus =
  | "INQUIRY"
  | "PROPOSAL_SENT"
  | "NEGOTIATING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

const STATUS_STYLE: Record<EventStatus, string> = {
  INQUIRY: "bg-blue-100 text-blue-700",
  PROPOSAL_SENT: "bg-purple-100 text-purple-700",
  NEGOTIATING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-600",
  COMPLETED: "bg-gray-100 text-gray-600",
};

const NEXT_STATUS: Record<EventStatus, EventStatus | null> = {
  INQUIRY: "PROPOSAL_SENT",
  PROPOSAL_SENT: "NEGOTIATING",
  NEGOTIATING: "CONFIRMED",
  CONFIRMED: "COMPLETED",
  COMPLETED: null,
  CANCELLED: null,
};

const ALL_STATUSES: EventStatus[] = [
  "INQUIRY",
  "PROPOSAL_SENT",
  "NEGOTIATING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
];

export default function EventsPage() {
  const { user } = useAuthStore();
  const hotelId = user?.hotelId ?? "";
  const [filterStatus, setFilterStatus] = useState<EventStatus | "ALL">("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading, refetch } = trpc.eventRequest.list.useQuery(
    {
      hotelId,
      status: filterStatus !== "ALL" ? filterStatus : undefined,
      pageSize: 50,
    },
    { enabled: !!hotelId },
  );

  const updateStatus = trpc.eventRequest.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated!");
      void refetch();
    },
    onError: (e: any) => toast.error(e.message || "An error occurred"),
  });

  if (!hotelId) {
    return (
      <div className="py-20 text-center text-gray-400">No hotel assigned.</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Event Requests</h1>
        <div className="flex items-center gap-3">
          <Select
            value={filterStatus}
            onValueChange={(v) => setFilterStatus(v as EventStatus | "ALL")}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {ALL_STATUSES.map((s: any) => (
                <SelectItem key={s} value={s}>
                  {s.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status summary tabs */}
      <div className="flex flex-wrap gap-2">
        {(["ALL", ...ALL_STATUSES] as const).map((s: any) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s as EventStatus | "ALL")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filterStatus === s
                ? "bg-[#1a1a2e] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s === "ALL" ? "All" : s.replace("_", " ")}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : !data?.items.length ? (
        <div className="py-16 text-center">
          <CalendarDays className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">No event requests found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.items.map((event: any) => {
            const status = event.status as EventStatus;
            const isExpanded = expandedId === event.id;
            const nextStatus = NEXT_STATUS[status];

            return (
              <div
                key={event.id}
                className="overflow-hidden rounded-xl border bg-white shadow-sm"
              >
                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {event.eventType}
                        </Badge>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[status] ?? ""}`}
                        >
                          {status.replace("_", " ")}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900">
                        {event.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatDate(event.eventDate)}
                          {event.startTime && ` · ${event.startTime}`}
                          {event.endTime && ` – ${event.endTime}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {event.guestCount} guests
                        </span>
                        {event.budgetCents && (
                          <span>
                            Budget: {formatCurrency(event.budgetCents)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Organizer:{" "}
                        <span className="font-medium">
                          {event.requester?.name}
                        </span>
                        {" · "}
                        <a
                          href={`mailto:${event.requester?.email}`}
                          className="text-blue-600"
                        >
                          {event.requester?.email}
                        </a>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {nextStatus && (
                        <Button
                          size="sm"
                          className="bg-[#1a1a2e] text-xs hover:bg-[#16213e]"
                          onClick={() =>
                            updateStatus.mutate({
                              id: event.id,
                              status: nextStatus,
                            })
                          }
                          disabled={updateStatus.isPending}
                        >
                          → {nextStatus.replace("_", " ")}
                        </Button>
                      )}
                      {status !== "CANCELLED" && status !== "COMPLETED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-xs text-red-600 hover:bg-red-50"
                          onClick={() =>
                            updateStatus.mutate({
                              id: event.id,
                              status: "CANCELLED",
                            })
                          }
                        >
                          Cancel
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : event.id)
                        }
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="space-y-3 border-t bg-gray-50 p-5">
                    {event.description && (
                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-500">
                          Description
                        </p>
                        <p className="mt-1 text-sm text-gray-700">
                          {event.description}
                        </p>
                      </div>
                    )}
                    {event.requirements &&
                      Object.keys(event.requirements as object).length > 0 && (
                        <div>
                          <p className="text-xs font-semibold uppercase text-gray-500">
                            Requirements
                          </p>
                          <pre className="mt-1 rounded bg-white p-3 text-xs text-gray-700">
                            {JSON.stringify(event.requirements, null, 2)}
                          </pre>
                        </div>
                      )}
                    <p className="text-xs text-gray-400">
                      Submitted: {formatDate(event.createdAt)}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {data && (
        <p className="text-center text-sm text-gray-400">
          {data.total} total event request{data.total !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
