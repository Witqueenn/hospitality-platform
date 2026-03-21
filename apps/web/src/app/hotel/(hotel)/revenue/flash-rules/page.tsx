"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Zap, Plus, Clock, Tag, Play, Pause, Pencil } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-500",
  SCHEDULED: "bg-blue-100 text-blue-600",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  PAUSED: "bg-yellow-100 text-yellow-700",
  ENDED: "bg-red-100 text-red-500",
};

type WindowForm = {
  name: string;
  roomTypeId: string;
  startsAt: string;
  endsAt: string;
  isVipEarlyAccess: boolean;
};

const EMPTY_FORM: WindowForm = {
  name: "",
  roomTypeId: "",
  startsAt: "",
  endsAt: "",
  isVipEarlyAccess: false,
};

export default function FlashRulesPage() {
  const { user } = useAuthStore();
  const hotelId = user?.hotelId ?? "";
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<WindowForm>(EMPTY_FORM);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const {
    data: windows,
    isLoading,
    refetch,
  } = trpc.flashInventory.listForHotel.useQuery(
    { hotelId, status: statusFilter as any },
    { enabled: !!hotelId },
  );

  const { data: roomTypes } = trpc.roomType.list.useQuery(
    { hotelId },
    { enabled: !!hotelId },
  );

  const createMutation = (trpc.flashInventory.create as any).useMutation({
    onSuccess: () => {
      toast.success("Flash window created!");
      setOpen(false);
      void refetch();
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const updateStatusMutation = (
    trpc.flashInventory.updateStatus as any
  ).useMutation({
    onSuccess: () => void refetch(),
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      hotelId,
      roomTypeId: form.roomTypeId,
      name: form.name,
      startsAt: new Date(form.startsAt).toISOString(),
      endsAt: new Date(form.endsAt).toISOString(),
      isVipEarlyAccess: form.isVipEarlyAccess,
    });
  };

  const list = (windows as any[]) ?? [];

  if (!hotelId) return <p className="text-gray-400">No hotel assigned.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Flash & Night-Use Rules
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Manage same-night deals and time-limited flash windows
          </p>
        </div>
        <Button
          onClick={() => {
            setForm(EMPTY_FORM);
            setOpen(true);
          }}
          className="bg-[#1a1a2e] hover:bg-[#16213e]"
        >
          <Plus className="mr-2 h-4 w-4" /> New Window
        </Button>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {[undefined, "DRAFT", "SCHEDULED", "ACTIVE", "PAUSED", "ENDED"].map(
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
          <Zap className="mx-auto mb-4 h-12 w-12 text-gray-200" />
          <p className="text-gray-500">No flash windows yet.</p>
          <Button
            className="mt-4 bg-[#1a1a2e]"
            onClick={() => {
              setForm(EMPTY_FORM);
              setOpen(true);
            }}
          >
            Create your first window
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((win: any) => (
            <div
              key={win.id}
              className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                <Zap className="h-6 w-6 text-amber-500" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-gray-900">{win.name}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[win.status] ?? "bg-gray-100 text-gray-500"}`}
                  >
                    {win.status}
                  </span>
                  {win.isVipEarlyAccess && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                      VIP Early
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3 w-3" /> {win.roomType?.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(win.startsAt).toLocaleString()} —{" "}
                    {new Date(win.endsAt).toLocaleString()}
                  </span>
                  <span>{win._count?.rateSnapshots ?? 0} snapshots</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {win.status === "DRAFT" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateStatusMutation.mutate({
                        id: win.id,
                        status: "ACTIVE",
                      })
                    }
                  >
                    <Play className="mr-1 h-3 w-3" /> Activate
                  </Button>
                )}
                {win.status === "ACTIVE" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateStatusMutation.mutate({
                        id: win.id,
                        status: "PAUSED",
                      })
                    }
                  >
                    <Pause className="mr-1 h-3 w-3" /> Pause
                  </Button>
                )}
                {win.status === "PAUSED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateStatusMutation.mutate({
                        id: win.id,
                        status: "ACTIVE",
                      })
                    }
                  >
                    <Play className="mr-1 h-3 w-3" /> Resume
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Flash Window</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Window Name *
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="e.g. Friday Night Deal"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Room Type *
              </label>
              <select
                required
                value={form.roomTypeId}
                onChange={(e) =>
                  setForm({ ...form, roomTypeId: e.target.value })
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value="">Select room type…</option>
                {((roomTypes as any[]) ?? []).map((rt: any) => (
                  <option key={rt.id} value={rt.id}>
                    {rt.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Starts At *
                </label>
                <input
                  required
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) =>
                    setForm({ ...form, startsAt: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Ends At *
                </label>
                <input
                  required
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isVipEarlyAccess}
                onChange={(e) =>
                  setForm({ ...form, isVipEarlyAccess: e.target.checked })
                }
              />
              VIP early access
            </label>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setOpen(false)}
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
