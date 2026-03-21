"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Banknote,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Clock,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  PROCESSING: "bg-blue-100 text-blue-600",
  PAID: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-red-100 text-red-600",
  DISPUTED: "bg-orange-100 text-orange-700",
};

export default function SettlementsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const { data: batches, isLoading } = trpc.settlement.listBatches.useQuery({
    status: statusFilter as any,
  });

  const list = (batches as any[]) ?? [];

  const totalPending = list
    .filter((b) => b.status === "PENDING")
    .reduce((sum, b) => sum + b.netCents, 0);

  const totalPaid = list
    .filter((b) => b.status === "PAID")
    .reduce((sum, b) => sum + b.netCents, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settlement Center</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Review and manage partner settlement batches
        </p>
      </div>

      {/* Summary cards */}
      {!isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Pending
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              ${(totalPending / 100).toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Total Paid
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">
              ${(totalPaid / 100).toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Batches
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {list.length}
            </p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Partners
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {new Set(list.map((b: any) => b.partnerId)).size}
            </p>
          </div>
        </div>
      )}

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {[undefined, "PENDING", "PROCESSING", "PAID", "FAILED", "DISPUTED"].map(
          (s) => (
            <button
              key={s ?? "all"}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                statusFilter === s
                  ? "bg-[#1a1a2e] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s ?? "All"}
            </button>
          ),
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="py-20 text-center">
          <Banknote className="mx-auto mb-4 h-12 w-12 text-gray-200" />
          <p className="text-gray-500">No settlement batches found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((batch: any) => {
            const isExpanded = expandedId === batch.id;
            return (
              <div
                key={batch.id}
                className="overflow-hidden rounded-xl border bg-white shadow-sm"
              >
                <div className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1a1a2e]/10">
                    <Banknote className="h-6 w-6 text-[#1a1a2e]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-900">
                        {batch.partner?.name ?? "—"}
                      </p>
                      <Badge
                        className={`text-xs ${STATUS_COLORS[batch.status] ?? "bg-gray-100"}`}
                      >
                        {batch.status}
                      </Badge>
                    </div>
                    <div className="mt-0.5 flex flex-wrap gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(
                          batch.periodStart,
                        ).toLocaleDateString()} —{" "}
                        {new Date(batch.periodEnd).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Gross: ${(batch.grossCents / 100).toLocaleString()}
                        {" · "}
                        Net: ${(batch.netCents / 100).toLocaleString()}
                      </span>
                      <span>{batch._count?.lines ?? 0} lines</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : batch.id)}
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
                  <div className="border-t bg-gray-50 px-4 py-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">
                          Gross Revenue
                        </p>
                        <p className="mt-1 font-semibold text-gray-800">
                          ${(batch.grossCents / 100).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">
                          Commission
                        </p>
                        <p className="mt-1 font-semibold text-gray-800">
                          ${(batch.commissionCents / 100).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">
                          Net Payable
                        </p>
                        <p className="mt-1 font-bold text-emerald-600">
                          ${(batch.netCents / 100).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {batch.notes && (
                      <p className="mt-3 text-sm text-gray-500">
                        {batch.notes}
                      </p>
                    )}
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
