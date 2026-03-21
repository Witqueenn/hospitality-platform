"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Pencil,
  UtensilsCrossed,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type DiningType =
  | "RESTAURANT"
  | "ROOM_SERVICE"
  | "BRUNCH"
  | "ROOFTOP"
  | "PRIVATE_DINING"
  | "GROUP_DINING"
  | "BUFFET";

const DINING_TYPE_LABELS: Record<DiningType, string> = {
  RESTAURANT: "Restaurant",
  ROOM_SERVICE: "Room Service",
  BRUNCH: "Brunch",
  ROOFTOP: "Rooftop",
  PRIVATE_DINING: "Private Dining",
  GROUP_DINING: "Group Dining",
  BUFFET: "Buffet",
};

const PRICE_RANGES = [
  { value: "$", label: "$ — Budget-friendly" },
  { value: "$$", label: "$$ — Mid-range" },
  { value: "$$$", label: "$$$ — Fine dining" },
  { value: "$$$$", label: "$$$$ — Ultra-premium" },
];

const TYPE_COLORS: Record<DiningType, string> = {
  RESTAURANT: "bg-orange-100 text-orange-700",
  ROOM_SERVICE: "bg-blue-100 text-blue-700",
  BRUNCH: "bg-yellow-100 text-yellow-700",
  ROOFTOP: "bg-purple-100 text-purple-700",
  PRIVATE_DINING: "bg-rose-100 text-rose-700",
  GROUP_DINING: "bg-green-100 text-green-700",
  BUFFET: "bg-teal-100 text-teal-700",
};

type DiningForm = {
  name: string;
  diningType: DiningType;
  description: string;
  cuisine: string;
  capacity: string;
  priceRange: string;
  menuHighlights: string;
};

const EMPTY_FORM: DiningForm = {
  name: "",
  diningType: "RESTAURANT",
  description: "",
  cuisine: "",
  capacity: "",
  priceRange: "",
  menuHighlights: "",
};

type DiningItem = {
  id: string;
  name: string;
  diningType: string;
  description: string | null;
  cuisine: unknown;
  capacity: number | null;
  priceRange: string | null;
  menuHighlights: unknown;
  photos: unknown;
  isActive: boolean;
};

export default function DiningPage() {
  const { user } = useAuthStore();
  const hotelId = user?.hotelId ?? "";
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<DiningForm>(EMPTY_FORM);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const {
    data: rawDining,
    isLoading,
    refetch,
  } = trpc.dining.list.useQuery({ hotelId }, { enabled: !!hotelId });
  const dining = (rawDining as DiningItem[] | undefined) ?? [];

  const createMutation = trpc.dining.create.useMutation({
    onSuccess: () => {
      toast.success("Dining experience created!");
      setOpen(false);
      void refetch();
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const updateMutation = trpc.dining.update.useMutation({
    onSuccess: () => {
      toast.success("Updated successfully!");
      setOpen(false);
      void refetch();
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const deleteMutation = trpc.dining.delete.useMutation({
    onSuccess: () => void refetch(),
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const handleOpen = (item?: DiningItem) => {
    if (item) {
      setEditId(item.id);
      setForm({
        name: item.name,
        diningType: item.diningType as DiningType,
        description: item.description ?? "",
        cuisine: Array.isArray(item.cuisine)
          ? (item.cuisine as string[]).join(", ")
          : "",
        capacity: item.capacity ? String(item.capacity) : "",
        priceRange: item.priceRange ?? "",
        menuHighlights: Array.isArray(item.menuHighlights)
          ? (item.menuHighlights as string[]).join(", ")
          : "",
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
      diningType: form.diningType,
      description: form.description || undefined,
      cuisine: form.cuisine
        ? form.cuisine
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      capacity: form.capacity ? Number(form.capacity) : undefined,
      priceRange: form.priceRange || undefined,
      menuHighlights: form.menuHighlights
        ? form.menuHighlights
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    };

    if (editId) {
      updateMutation.mutate({ id: editId, ...payload });
    } else {
      createMutation.mutate({ hotelId, ...payload });
    }
  };

  const photos = (item: DiningItem) =>
    Array.isArray(item.photos)
      ? (item.photos as { thumb: string; alt: string }[])
      : [];

  if (!hotelId) {
    return (
      <div className="py-20 text-center text-gray-400">
        No hotel assigned to your account.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dining & F&B Experiences
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Manage restaurants, bars, room service and special dining events.
          </p>
        </div>
        <Button
          onClick={() => handleOpen()}
          className="bg-[#1a1a2e] hover:bg-[#16213e]"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Experience
        </Button>
      </div>

      {/* Summary cards */}
      {!isLoading && dining.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(
            [
              "RESTAURANT",
              "ROOM_SERVICE",
              "ROOFTOP",
              "PRIVATE_DINING",
            ] as DiningType[]
          ).map((type) => {
            const count = dining.filter(
              (d) => d.diningType === type && d.isActive,
            ).length;
            return (
              <div
                key={type}
                className="rounded-xl border bg-white p-4 text-center"
              >
                <p className="text-2xl font-bold text-[#1a1a2e]">{count}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {DINING_TYPE_LABELS[type]}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : dining.length === 0 ? (
        <div className="py-20 text-center">
          <UtensilsCrossed className="mx-auto mb-4 h-12 w-12 text-gray-200" />
          <p className="text-gray-500">No dining experiences yet.</p>
          <Button className="mt-4 bg-[#1a1a2e]" onClick={() => handleOpen()}>
            Add your first experience
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {dining.map((item) => {
            const isExpanded = expandedId === item.id;
            const photo = photos(item)[0];
            const cuisines = Array.isArray(item.cuisine)
              ? (item.cuisine as string[])
              : [];
            const highlights = Array.isArray(item.menuHighlights)
              ? (item.menuHighlights as string[])
              : [];

            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-xl border bg-white shadow-sm"
              >
                {/* Row */}
                <div className="flex items-center gap-4 p-4">
                  {/* Photo */}
                  <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {photo ? (
                      <img
                        src={photo.thumb}
                        alt={photo.alt}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <UtensilsCrossed className="h-6 w-6 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[item.diningType as DiningType] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {DINING_TYPE_LABELS[item.diningType as DiningType] ??
                          item.diningType}
                      </span>
                      {item.priceRange && (
                        <span className="font-mono text-sm font-bold text-gray-500">
                          {item.priceRange}
                        </span>
                      )}
                      {!item.isActive && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
                      {item.capacity && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {item.capacity} covers
                        </span>
                      )}
                      {cuisines.length > 0 && (
                        <span>{cuisines.slice(0, 3).join(" · ")}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-2">
                    {item.isActive && (
                      <button
                        onClick={() => deleteMutation.mutate({ id: item.id })}
                        className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 hover:bg-green-200"
                        title="Click to deactivate"
                      >
                        Active
                      </button>
                    )}
                    {!item.isActive && (
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-400">
                        Inactive
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpen(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
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

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t bg-gray-50 px-4 py-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {item.description && (
                        <div>
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Description
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.description}
                          </p>
                        </div>
                      )}
                      {highlights.length > 0 && (
                        <div>
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Menu Highlights
                          </p>
                          <ul className="space-y-0.5">
                            {highlights.map((h) => (
                              <li
                                key={h}
                                className="flex items-center gap-1.5 text-sm text-gray-600"
                              >
                                <span className="text-emerald-500">•</span> {h}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {cuisines.length > 0 && (
                        <div>
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Cuisine
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {cuisines.map((c) => (
                              <span
                                key={c}
                                className="rounded-full bg-white px-2 py-0.5 text-xs text-gray-600 ring-1 ring-gray-200"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Edit Dining Experience" : "Add Dining Experience"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium">Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="e.g. Bosphorus Rooftop Restaurant"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Type *</label>
                <select
                  value={form.diningType}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      diningType: e.target.value as DiningType,
                    })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  {Object.entries(DINING_TYPE_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Price Range
                </label>
                <select
                  value={form.priceRange}
                  onChange={(e) =>
                    setForm({ ...form, priceRange: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="">— Not set —</option>
                  {PRICE_RANGES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Capacity (covers)
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(e) =>
                    setForm({ ...form, capacity: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="e.g. 60"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Cuisine (comma-separated)
                </label>
                <input
                  value={form.cuisine}
                  onChange={(e) =>
                    setForm({ ...form, cuisine: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="Turkish, Mediterranean"
                />
              </div>
            </div>
            <div>
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
            <div>
              <label className="mb-1 block text-sm font-medium">
                Menu Highlights (comma-separated)
              </label>
              <input
                value={form.menuHighlights}
                onChange={(e) =>
                  setForm({ ...form, menuHighlights: e.target.value })
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="Grilled sea bass, Truffle risotto, Tasting menu"
              />
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
