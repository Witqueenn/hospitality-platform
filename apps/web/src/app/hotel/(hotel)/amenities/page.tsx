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
import {
  Plus,
  Dumbbell,
  Users,
  CalendarDays,
  Pencil,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

const AMENITY_TYPES = [
  "GYM",
  "POOL",
  "TENNIS",
  "SPA",
  "SAUNA",
  "HAMMAM",
  "CO_WORKING",
  "KIDS_CLUB",
  "BEACH_ACCESS",
  "OTHER",
] as const;

const AMENITY_LABELS: Record<string, string> = {
  GYM: "Gym",
  POOL: "Pool",
  TENNIS: "Tennis",
  SPA: "Spa",
  SAUNA: "Sauna",
  HAMMAM: "Hammam",
  CO_WORKING: "Co-Working",
  KIDS_CLUB: "Kids Club",
  BEACH_ACCESS: "Beach Access",
  OTHER: "Other",
};

type AmenityForm = {
  code: string;
  name: string;
  amenityType: string;
  description: string;
  locationLabel: string;
  capacity: string;
  isExternalAccessOpen: boolean;
  isVipOnly: boolean;
};

const EMPTY_FORM: AmenityForm = {
  code: "",
  name: "",
  amenityType: "GYM",
  description: "",
  locationLabel: "",
  capacity: "",
  isExternalAccessOpen: false,
  isVipOnly: false,
};

export default function AmenitiesAdminPage() {
  const { user } = useAuthStore();
  const hotelId = user?.hotelId ?? "";

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<AmenityForm>(EMPTY_FORM);

  const {
    data: amenities,
    isLoading,
    refetch,
  } = trpc.amenity.listForHotel.useQuery({ hotelId }, { enabled: !!hotelId });

  const createMutation = (trpc.amenity.create as any).useMutation({
    onSuccess: () => {
      toast.success("Amenity created!");
      setOpen(false);
      void refetch();
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const updateMutation = (trpc.amenity.update as any).useMutation({
    onSuccess: () => {
      toast.success("Updated!");
      setOpen(false);
      void refetch();
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const handleOpen = (item?: any) => {
    if (item) {
      setEditId(item.id);
      setForm({
        code: item.code ?? "",
        name: item.name,
        amenityType: item.amenityType,
        description: item.description ?? "",
        locationLabel: item.locationLabel ?? "",
        capacity: item.capacity ? String(item.capacity) : "",
        isExternalAccessOpen: item.isExternalAccessOpen ?? false,
        isVipOnly: item.isVipOnly ?? false,
      });
    } else {
      setEditId(null);
      setForm(EMPTY_FORM);
    }
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      amenityType: form.amenityType as any,
      description: form.description || undefined,
      locationLabel: form.locationLabel || undefined,
      capacity: form.capacity ? Number(form.capacity) : undefined,
      isExternalAccessOpen: form.isExternalAccessOpen,
      isVipOnly: form.isVipOnly,
    };
    if (editId) {
      updateMutation.mutate({ id: editId, ...payload });
    } else {
      createMutation.mutate({ hotelId, code: form.code, ...payload });
    }
  };

  const list = (amenities as any[]) ?? [];

  if (!hotelId) return <p className="text-gray-400">No hotel assigned.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Amenity Management
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Manage gym, pool, spa and other amenity assets — with booking and
            scheduling
          </p>
        </div>
        <Button
          onClick={() => handleOpen()}
          className="bg-[#1a1a2e] hover:bg-[#16213e]"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Amenity
        </Button>
      </div>

      {/* Summary */}
      {!isLoading && list.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {["GYM", "POOL", "SPA", "OTHER"].map((type) => (
            <div
              key={type}
              className="rounded-xl border bg-white p-4 text-center"
            >
              <p className="text-2xl font-bold text-[#1a1a2e]">
                {
                  list.filter((a) => a.amenityType === type && a.isActive)
                    .length
                }
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                {AMENITY_LABELS[type]}
              </p>
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="py-20 text-center">
          <Dumbbell className="mx-auto mb-4 h-12 w-12 text-gray-200" />
          <p className="text-gray-500">No amenities yet.</p>
          <Button className="mt-4 bg-[#1a1a2e]" onClick={() => handleOpen()}>
            Add your first amenity
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((item: any) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1a1a2e]/10">
                <Dumbbell className="h-6 w-6 text-[#1a1a2e]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                    {AMENITY_LABELS[item.amenityType] ?? item.amenityType}
                  </span>
                  {item.isVipOnly && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                      VIP Only
                    </span>
                  )}
                  {item.isExternalAccessOpen && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                      External
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex gap-3 text-xs text-gray-400">
                  {item.capacity && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {item.capacity}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />{" "}
                    {item._count?.reservations ?? 0} bookings
                  </span>
                  <span className="flex items-center gap-1">
                    {item.passPlans?.length ?? 0} pass plans
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    updateMutation.mutate({
                      id: item.id,
                      isActive: !item.isActive,
                    })
                  }
                  className="text-gray-400 hover:text-[#1a1a2e]"
                  title={item.isActive ? "Deactivate" : "Activate"}
                >
                  {item.isActive ? (
                    <ToggleRight className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="h-5 w-5" />
                  )}
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpen(item)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Amenity" : "Add Amenity"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {!editId && (
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Code *
                  </label>
                  <input
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    placeholder="GYM_01"
                  />
                </div>
              )}
              <div className={editId ? "col-span-2" : ""}>
                <label className="mb-1 block text-sm font-medium">Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Type *</label>
                <select
                  value={form.amenityType}
                  onChange={(e) =>
                    setForm({ ...form, amenityType: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  {AMENITY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {AMENITY_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Capacity
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(e) =>
                    setForm({ ...form, capacity: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium">
                  Location Label
                </label>
                <input
                  value={form.locationLabel}
                  onChange={(e) =>
                    setForm({ ...form, locationLabel: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="e.g. Floor 3, East Wing"
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isExternalAccessOpen}
                  onChange={(e) =>
                    setForm({ ...form, isExternalAccessOpen: e.target.checked })
                  }
                />
                External access open
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isVipOnly}
                  onChange={(e) =>
                    setForm({ ...form, isVipOnly: e.target.checked })
                  }
                />
                VIP only
              </label>
            </div>
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
                {editId ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
