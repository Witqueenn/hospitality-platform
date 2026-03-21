"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { formatDate } from "@repo/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ShieldAlert, ChevronDown, ChevronUp } from "lucide-react";

const SEVERITY_STYLE: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-700",
  HIGH: "bg-orange-100 text-orange-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-gray-100 text-gray-500",
};

const STATUS_STYLE: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-purple-100 text-purple-700",
  AWAITING_HOTEL: "bg-yellow-100 text-yellow-700",
  AWAITING_GUEST: "bg-orange-100 text-orange-700",
  AWAITING_APPROVAL: "bg-pink-100 text-pink-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-500",
  ESCALATED: "bg-red-200 text-red-800",
};

const ALL_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "AWAITING_HOTEL",
  "AWAITING_GUEST",
  "AWAITING_APPROVAL",
  "ESCALATED",
  "RESOLVED",
  "CLOSED",
];
const ALL_SEVERITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

export default function AdminCasesPage() {
  const [status, setStatus] = useState<string>("ALL");
  const [severity, setSeverity] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading, refetch } = trpc.supportCase.list.useQuery({
    status: status !== "ALL" ? (status as "OPEN") : undefined,
    severity: severity !== "ALL" ? (severity as "CRITICAL") : undefined,
    page,
    pageSize: 25,
  });

  const updateStatus = trpc.supportCase.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated!");
      void refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Support Cases</h1>
        <div className="flex flex-wrap gap-3">
          <Select
            value={severity}
            onValueChange={(v) => {
              setSeverity(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Severities</SelectItem>
              {ALL_SEVERITIES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {ALL_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : !data?.items.length ? (
        <div className="py-16 text-center">
          <ShieldAlert className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">No cases found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.items.map((c) => {
            const isExpanded = expandedId === c.id;
            return (
              <div
                key={c.id}
                className="overflow-hidden rounded-xl border bg-white shadow-sm"
              >
                <div className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-bold ${SEVERITY_STYLE[c.severity] ?? ""}`}
                        >
                          {c.severity}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[c.status] ?? ""}`}
                        >
                          {c.status.replace(/_/g, " ")}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {c.category.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="font-medium text-gray-900">{c.title}</p>
                      <p className="text-xs text-gray-400">
                        {c.hotel?.name ?? "Unknown hotel"} · Guest:{" "}
                        {c.guest?.name ?? "—"} · {formatDate(c.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {c.status !== "RESOLVED" &&
                        c.status !== "CLOSED" &&
                        c.status !== "ESCALATED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-orange-200 text-xs text-orange-700 hover:bg-orange-50"
                            onClick={() =>
                              updateStatus.mutate({
                                caseId: c.id,
                                status: "ESCALATED",
                              })
                            }
                            disabled={updateStatus.isPending}
                          >
                            Escalate
                          </Button>
                        )}
                      {(c.status === "ESCALATED" ||
                        c.status === "AWAITING_APPROVAL") && (
                        <Button
                          size="sm"
                          className="bg-green-600 text-xs hover:bg-green-700"
                          onClick={() =>
                            updateStatus.mutate({
                              caseId: c.id,
                              status: "RESOLVED",
                            })
                          }
                          disabled={updateStatus.isPending}
                        >
                          Resolve
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setExpandedId(isExpanded ? null : c.id)}
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
                {isExpanded && (
                  <div className="border-t bg-gray-50 p-4 text-sm text-gray-700">
                    <p className="font-mono text-xs text-gray-400">
                      Ref: {c.caseRef} · ID: {c.id}
                    </p>
                    {c.description && <p className="mt-2">{c.description}</p>}
                    {c.assignedTo && (
                      <p className="mt-2 text-xs text-gray-500">
                        Assigned to:{" "}
                        <span className="font-medium">{c.assignedTo.name}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {data && data.total > 25 && (
        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center text-sm text-gray-500">
            Page {page} · {data.total} total
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={!data.hasNext}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
