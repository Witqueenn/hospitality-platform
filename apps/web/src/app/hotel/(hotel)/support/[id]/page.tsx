"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { formatDate, formatCurrency } from "@repo/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ArrowLeft,
  Send,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  UserCheck,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const SEVERITY_STYLE: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-700",
  HIGH: "bg-orange-100 text-orange-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-gray-100 text-gray-600",
};

const STATUS_STYLE: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-purple-100 text-purple-700",
  AWAITING_HOTEL: "bg-yellow-100 text-yellow-700",
  AWAITING_GUEST: "bg-orange-100 text-orange-700",
  AWAITING_APPROVAL: "bg-pink-100 text-pink-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-600",
  ESCALATED: "bg-red-200 text-red-800",
};

interface TimelineEntry {
  id: string;
  actorType: string;
  actorId: string;
  actorName: string;
  content: string;
  createdAt: string;
}

const NEXT_STATUS: Record<string, string | null> = {
  OPEN: "IN_PROGRESS",
  IN_PROGRESS: "AWAITING_GUEST",
  AWAITING_HOTEL: "IN_PROGRESS",
  AWAITING_GUEST: "RESOLVED",
  AWAITING_APPROVAL: "RESOLVED",
  ESCALATED: "IN_PROGRESS",
  RESOLVED: null,
  CLOSED: null,
};

export default function HotelSupportCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const id = params.id as string;
  const [message, setMessage] = useState("");
  const [showCompensation, setShowCompensation] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    data: supportCase,
    isLoading,
    refetch,
  } = trpc.supportCase.getById.useQuery({ id }, { enabled: !!id });

  const addEntry = trpc.supportCase.addTimelineEntry.useMutation({
    onSuccess: () => {
      setMessage("");
      void refetch();
      setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  const updateStatus = trpc.supportCase.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated!");
      void refetch();
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  const [compForm, setCompForm] = useState({
    type: "ROOM_UPGRADE",
    desc: "",
    valueCents: "",
  });

  const proposeComp = trpc.supportCase.proposeCompensation.useMutation({
    onSuccess: () => {
      toast.success("Compensation proposed!");
      setShowCompensation(false);
      void refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSend = () => {
    if (!message.trim()) return;
    addEntry.mutate({
      caseId: id,
      eventType: "message",
      content: message.trim(),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!supportCase) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-500">Case not found.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const status = supportCase.status;
  const nextStatus = NEXT_STATUS[status];
  const isClosed = status === "RESOLVED" || status === "CLOSED";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="text-gray-500"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Cases
      </Button>

      {/* Header */}
      <div className="rounded-xl border bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono text-sm text-gray-400">
                {supportCase.caseRef}
              </p>
              <Badge
                className={SEVERITY_STYLE[supportCase.severity] ?? ""}
                variant="outline"
              >
                {supportCase.severity}
              </Badge>
              <Badge
                className={STATUS_STYLE[supportCase.status] ?? ""}
                variant="outline"
              >
                {supportCase.status.replace(/_/g, " ")}
              </Badge>
              <Badge variant="secondary">
                {supportCase.category.replace(/_/g, " ")}
              </Badge>
            </div>
            <h1 className="mt-2 text-xl font-bold text-gray-900">
              {supportCase.title}
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Guest:{" "}
              <span className="font-medium text-gray-700">
                {supportCase.guest?.name}
              </span>
              {supportCase.booking &&
                ` · Booking: ${supportCase.booking.bookingRef}`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {nextStatus && (
              <Button
                size="sm"
                className="bg-[#1a1a2e] text-xs hover:bg-[#16213e]"
                onClick={() =>
                  updateStatus.mutate({
                    caseId: id,
                    status: nextStatus as "OPEN",
                  })
                }
                disabled={updateStatus.isPending}
              >
                → {nextStatus.replace(/_/g, " ")}
              </Button>
            )}
            {!isClosed && (
              <Button
                size="sm"
                variant="outline"
                className="border-green-200 text-xs text-green-700 hover:bg-green-50"
                onClick={() =>
                  updateStatus.mutate({ caseId: id, status: "RESOLVED" })
                }
                disabled={updateStatus.isPending}
              >
                ✓ Resolve
              </Button>
            )}
          </div>
        </div>

        {/* SLA */}
        {(supportCase.responseDeadline || supportCase.resolutionDeadline) && (
          <div className="mt-4 flex flex-wrap gap-4 rounded-lg bg-gray-50 p-3 text-sm">
            {supportCase.responseDeadline && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  Response by:{" "}
                  <span className="font-medium">
                    {formatDate(supportCase.responseDeadline)}
                  </span>
                </span>
              </div>
            )}
            {supportCase.resolutionDeadline && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  Resolve by:{" "}
                  <span className="font-medium">
                    {formatDate(supportCase.resolutionDeadline)}
                  </span>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Assigned to */}
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
          <UserCheck className="h-4 w-4" />
          {supportCase.assignedTo ? (
            <span>
              Assigned to{" "}
              <span className="font-medium text-gray-700">
                {supportCase.assignedTo.name}
              </span>
            </span>
          ) : (
            <span className="text-gray-400">Unassigned</span>
          )}
        </div>
      </div>

      {/* Compensation */}
      {supportCase.compensations && supportCase.compensations.length > 0 && (
        <div className="rounded-xl border bg-white p-5">
          <h2 className="mb-3 font-semibold text-gray-900">Compensation</h2>
          <div className="space-y-2">
            {supportCase.compensations.map((comp) => (
              <div
                key={comp.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {comp.compensationType.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-gray-500">{comp.description}</p>
                  {comp.valueCents && (
                    <p className="text-xs font-semibold text-green-700">
                      Value: {formatCurrency(comp.valueCents)}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="text-xs">
                  {comp.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Propose compensation */}
      {!isClosed && (
        <div className="rounded-xl border bg-white p-5">
          <button
            className="flex w-full items-center justify-between text-sm font-semibold text-gray-900"
            onClick={() => setShowCompensation((v) => !v)}
          >
            Propose Compensation
            {showCompensation ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {showCompensation && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Type
                </label>
                <select
                  value={compForm.type}
                  onChange={(e) =>
                    setCompForm({ ...compForm, type: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  {[
                    "ROOM_UPGRADE",
                    "LATE_CHECKOUT",
                    "EARLY_CHECKIN",
                    "BREAKFAST_INCLUDED",
                    "PARTIAL_REFUND",
                    "FULL_REFUND",
                    "SERVICE_VOUCHER",
                    "AMENITY_CREDIT",
                    "EVENT_DISCOUNT",
                    "FREE_NIGHT",
                    "OTHER",
                  ].map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Description
                </label>
                <input
                  value={compForm.desc}
                  onChange={(e) =>
                    setCompForm({ ...compForm, desc: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="Explain the compensation offer..."
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Value ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={compForm.valueCents}
                  onChange={(e) =>
                    setCompForm({ ...compForm, valueCents: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <Button
                size="sm"
                className="bg-[#1a1a2e] hover:bg-[#16213e]"
                disabled={proposeComp.isPending || !compForm.desc}
                onClick={() =>
                  proposeComp.mutate({
                    caseId: id,
                    compensationType: compForm.type as
                      | "ROOM_UPGRADE"
                      | "LATE_CHECKOUT"
                      | "EARLY_CHECKIN"
                      | "BREAKFAST_INCLUDED"
                      | "PARTIAL_REFUND"
                      | "FULL_REFUND"
                      | "SERVICE_VOUCHER"
                      | "AMENITY_CREDIT"
                      | "EVENT_DISCOUNT"
                      | "FREE_NIGHT"
                      | "OTHER",
                    description: compForm.desc,
                    valueCents: compForm.valueCents
                      ? Math.round(Number(compForm.valueCents) * 100)
                      : undefined,
                  })
                }
              >
                Submit Proposal
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Timeline / Chat */}
      <div className="rounded-xl border bg-white">
        <div className="border-b px-5 py-3">
          <h2 className="font-semibold text-gray-900">Conversation</h2>
        </div>
        <div className="max-h-96 space-y-3 overflow-y-auto p-5">
          {(supportCase.timeline as TimelineEntry[]).map((entry) => {
            const isGuestMsg = entry.actorType === "guest";
            const isMe = entry.actorId === user?.id;
            return (
              <div
                key={entry.id}
                className={`flex ${isGuestMsg ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-xs rounded-2xl px-4 py-2.5 lg:max-w-md ${
                    isGuestMsg
                      ? "bg-gray-100 text-gray-900"
                      : "bg-[#1a1a2e] text-white"
                  }`}
                >
                  {!isMe && (
                    <p
                      className={`mb-1 text-xs font-semibold ${isGuestMsg ? "text-gray-500" : "text-gray-300"}`}
                    >
                      {entry.actorName}
                    </p>
                  )}
                  <p className="text-sm">{entry.content}</p>
                  <p
                    className={`mt-1 text-xs ${isGuestMsg ? "text-gray-400" : "text-gray-400"}`}
                  >
                    {new Date(entry.createdAt).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" · "}
                    {new Date(entry.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {!isClosed ? (
          <div className="border-t p-4">
            <div className="flex gap-3">
              <Textarea
                placeholder="Reply to guest..."
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="resize-none"
              />
              <Button
                className="self-end bg-[#1a1a2e] hover:bg-[#16213e]"
                onClick={handleSend}
                disabled={!message.trim() || addEntry.isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        ) : (
          <div className="border-t bg-green-50 px-5 py-3 text-center text-sm text-green-700">
            This case is {status.toLowerCase()}.
          </div>
        )}
      </div>
    </div>
  );
}
