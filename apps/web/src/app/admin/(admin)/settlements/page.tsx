"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Banknote,
  Plus,
  ChevronDown,
  ChevronUp,
  CheckCircle,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  READY: "bg-blue-100 text-blue-600",
  PAID: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-red-100 text-red-600",
  VOID: "bg-orange-100 text-orange-700",
};

export default function AdminSettlementsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    batchRef: "",
    periodStart: "",
    periodEnd: "",
  });

  const {
    data: batches,
    isLoading,
    refetch,
  } = trpc.settlement.listBatches.useQuery({
    status: statusFilter as any,
  });

  const { data: partners } = trpc.partner.list.useQuery();

  const createMutation = trpc.settlement.createBatch.useMutation({
    onSuccess: () => {
      toast.success("Settlement batch created!");
      setCreateOpen(false);
      void refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const updateStatusMutation = trpc.settlement.updateBatchStatus.useMutation({
    onSuccess: () => void refetch(),
    onError: (e) => toast.error(e.message),
  });

  const list = (batches as any[]) ?? [];
  const partnerList = (partners as any[]) ?? [];

  const totalReadyNet = list
    .filter((b) => b.status === "READY")
    .reduce((sum, b) => sum + (b.totalNetCents ?? 0), 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      batchRef: createForm.batchRef,
      periodStart: new Date(createForm.periodStart).toISOString(),
      periodEnd: new Date(createForm.periodEnd).toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Banknote className="h-7 w-7 text-[#1a1a2e]" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Settlement Management
            </h1>
            <p className="text-sm text-gray-500">
              Create and process settlement batches for all partners
            </p>
          </div>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-[#1a1a2e] hover:bg-[#16213e]"
        >
          <Plus className="mr-2 h-4 w-4" /> New Batch
        </Button>
      </div>

      {!isLoading && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs font-semibold uppercase text-gray-400">
              Ready Payout
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              ${(totalReadyNet / 100).toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs font-semibold uppercase text-gray-400">
              Total Batches
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {list.length}
            </p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs font-semibold uppercase text-gray-400">
              Active Partners
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {partnerList.length}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {([undefined, "DRAFT", "READY", "PAID", "FAILED", "VOID"] as const).map(
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
          <p className="text-gray-500">No settlement batches yet.</p>
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
                        {batch.batchRef}
                      </p>
                      <Badge
                        className={`text-xs ${STATUS_COLORS[batch.status] ?? ""}`}
                      >
                        {batch.status}
                      </Badge>
                    </div>
                    <div className="mt-0.5 flex flex-wrap gap-3 text-xs text-gray-400">
                      <span>
                        {new Date(batch.periodStart).toLocaleDateString()} —{" "}
                        {new Date(batch.periodEnd).toLocaleDateString()}
                      </span>
                      <span>
                        Net:{" "}
                        <strong className="text-gray-700">
                          ${((batch.totalNetCents ?? 0) / 100).toLocaleString()}
                        </strong>
                      </span>
                      <span>{batch._count?.lines ?? 0} lines</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {batch.status === "DRAFT" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: batch.id,
                            status: "READY",
                          })
                        }
                        disabled={updateStatusMutation.isPending}
                      >
                        Mark Ready
                      </Button>
                    )}
                    {batch.status === "READY" && (
                      <Button
                        size="sm"
                        className="bg-emerald-600 text-xs hover:bg-emerald-700"
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: batch.id,
                            status: "PAID",
                          })
                        }
                        disabled={updateStatusMutation.isPending}
                      >
                        <CheckCircle className="mr-1 h-3 w-3" /> Mark Paid
                      </Button>
                    )}
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : batch.id)
                      }
                      className="rounded p-1 text-gray-400 hover:text-gray-600"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t bg-gray-50 px-4 py-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">
                          Gross Revenue
                        </p>
                        <p className="mt-1 font-semibold">
                          $
                          {(
                            (batch.totalGrossCents ?? 0) / 100
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">
                          Commission
                        </p>
                        <p className="mt-1 font-semibold">
                          $
                          {(
                            (batch.totalCommissionCents ?? 0) / 100
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">
                          Net Payable
                        </p>
                        <p className="mt-1 font-bold text-emerald-600">
                          ${((batch.totalNetCents ?? 0) / 100).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Settlement Batch</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Batch Reference *
              </label>
              <input
                required
                value={createForm.batchRef}
                onChange={(e) =>
                  setCreateForm({ ...createForm, batchRef: e.target.value })
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="BATCH-2026-01"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Period Start *
                </label>
                <input
                  required
                  type="date"
                  value={createForm.periodStart}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      periodStart: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Period End *
                </label>
                <input
                  required
                  type="date"
                  value={createForm.periodEnd}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, periodEnd: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#1a1a2e]"
                disabled={createMutation.isPending}
              >
                Create
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
