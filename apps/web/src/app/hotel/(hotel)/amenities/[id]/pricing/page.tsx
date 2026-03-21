"use client";

import { use, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { CreditCard, Plus, Pencil, ArrowLeft } from "lucide-react";
import Link from "next/link";

const ACCESS_UNITS = ["VISIT", "DAY", "WEEK", "MONTH", "YEAR"] as const;

type PlanForm = {
  code: string;
  name: string;
  accessUnit: string;
  durationCount: string;
  priceCents: string;
  totalVisits: string;
  vipDiscountPercent: string;
};

const EMPTY_FORM: PlanForm = {
  code: "",
  name: "",
  accessUnit: "VISIT",
  durationCount: "1",
  priceCents: "",
  totalVisits: "",
  vipDiscountPercent: "",
};

export default function AmenityPricingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: amenityId } = use(params);
  const { user } = useAuthStore();
  const hotelId = user?.hotelId ?? "";

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PlanForm>(EMPTY_FORM);

  const { data: amenities, isLoading } = trpc.amenity.listForHotel.useQuery(
    { hotelId },
    { enabled: !!hotelId },
  );

  const amenity = (amenities as any[])?.find((a: any) => a.id === amenityId);

  const createMutation = (trpc.amenity.createPassPlan as any).useMutation({
    onSuccess: () => {
      toast.success("Plan created!");
      setOpen(false);
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const updateMutation = (trpc.amenity.updatePassPlan as any).useMutation({
    onSuccess: () => {
      toast.success("Plan updated!");
      setOpen(false);
      setEditingId(null);
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        name: form.name,
        priceCents: Math.round(Number(form.priceCents) * 100),
        vipDiscountPercent: form.vipDiscountPercent
          ? Number(form.vipDiscountPercent)
          : undefined,
      });
    } else {
      createMutation.mutate({
        amenityAssetId: amenityId,
        code: form.code,
        name: form.name,
        accessUnit: form.accessUnit as any,
        durationCount: Number(form.durationCount),
        priceCents: Math.round(Number(form.priceCents) * 100),
        totalVisits: form.totalVisits ? Number(form.totalVisits) : undefined,
        vipDiscountPercent: form.vipDiscountPercent
          ? Number(form.vipDiscountPercent)
          : undefined,
      });
    }
  };

  const openEdit = (plan: any) => {
    setEditingId(plan.id);
    setForm({
      code: plan.code ?? "",
      name: plan.name ?? "",
      accessUnit: plan.accessUnit ?? "VISIT",
      durationCount: String(plan.durationCount ?? 1),
      priceCents: plan.priceCents != null ? String(plan.priceCents / 100) : "",
      totalVisits: plan.totalVisits ? String(plan.totalVisits) : "",
      vipDiscountPercent: plan.vipDiscountPercent
        ? String(plan.vipDiscountPercent)
        : "",
    });
    setOpen(true);
  };

  const passPlans: any[] = amenity?.passPlans ?? [];

  if (!hotelId) return <p className="text-gray-400">No hotel assigned.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/hotel/amenities"
          className="rounded-lg p-1.5 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <CreditCard className="h-7 w-7 text-[#1a1a2e]" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isLoading ? "Loading…" : (amenity?.name ?? "Amenity")} — Pricing
          </h1>
          <p className="text-sm text-gray-500">Manage pass plans and pricing</p>
        </div>
        <Button
          onClick={() => {
            setEditingId(null);
            setForm(EMPTY_FORM);
            setOpen(true);
          }}
          className="ml-auto bg-[#1a1a2e] hover:bg-[#16213e]"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Plan
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : passPlans.length === 0 ? (
        <div className="py-20 text-center">
          <CreditCard className="mx-auto mb-4 h-12 w-12 text-gray-200" />
          <p className="text-gray-500">No pricing plans yet.</p>
          <Button
            className="mt-4 bg-[#1a1a2e]"
            onClick={() => {
              setForm(EMPTY_FORM);
              setOpen(true);
            }}
          >
            Add first plan
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {passPlans.map((plan: any) => (
            <div
              key={plan.id}
              className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">{plan.name}</p>
                <div className="mt-0.5 flex flex-wrap gap-3 text-xs text-gray-400">
                  <span>
                    {plan.accessUnit} · {plan.durationCount}x
                  </span>
                  {plan.totalVisits && (
                    <span>Max {plan.totalVisits} visits</span>
                  )}
                  {plan.vipDiscountPercent && (
                    <span className="text-purple-600">
                      {plan.vipDiscountPercent}% VIP discount
                    </span>
                  )}
                  <span
                    className={
                      plan.isActive ? "text-emerald-600" : "text-gray-300"
                    }
                  >
                    {plan.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-[#1a1a2e]">
                  ${(plan.priceCents / 100).toFixed(2)}
                </span>
                <button
                  onClick={() => openEdit(plan)}
                  className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setEditingId(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Plan" : "Add Pricing Plan"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!editingId && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Code *
                  </label>
                  <input
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    placeholder="DAY_PASS"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Access Unit *
                  </label>
                  <select
                    value={form.accessUnit}
                    onChange={(e) =>
                      setForm({ ...form, accessUnit: e.target.value })
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  >
                    {ACCESS_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Plan Name *
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="Day Pass"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Price (USD) *
                </label>
                <input
                  required
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.priceCents}
                  onChange={(e) =>
                    setForm({ ...form, priceCents: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="25.00"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  VIP Discount %
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.vipDiscountPercent}
                  onChange={(e) =>
                    setForm({ ...form, vipDiscountPercent: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="20"
                />
              </div>
            </div>
            {!editingId && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Duration Count
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.durationCount}
                    onChange={(e) =>
                      setForm({ ...form, durationCount: e.target.value })
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Max Visits
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.totalVisits}
                    onChange={(e) =>
                      setForm({ ...form, totalVisits: e.target.value })
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    placeholder="Unlimited"
                  />
                </div>
              </div>
            )}
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
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingId ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
