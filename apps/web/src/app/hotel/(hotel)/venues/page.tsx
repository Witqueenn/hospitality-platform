"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { formatCurrency } from "@repo/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Pencil, MapPin, Users } from "lucide-react";

const LAYOUT_TYPES = [
  "THEATER",
  "CLASSROOM",
  "U_SHAPE",
  "BOARDROOM",
  "BANQUET_ROUND",
  "COCKTAIL",
  "HOLLOW_SQUARE",
  "CUSTOM",
];

type VenueForm = {
  name: string;
  description: string;
  floorLevel: string;
  sizeSquareMeters: string;
  features: string;
  avEquipment: string;
  ratePerHour: string;
  ratePerDay: string;
  capacities: Record<string, string>;
};

const EMPTY_FORM: VenueForm = {
  name: "",
  description: "",
  floorLevel: "",
  sizeSquareMeters: "",
  features: "",
  avEquipment: "",
  ratePerHour: "",
  ratePerDay: "",
  capacities: {},
};

export default function VenuesPage() {
  const { user } = useAuthStore();
  const hotelId = user?.hotelId ?? "";
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<VenueForm>(EMPTY_FORM);

  const {
    data: venues,
    isLoading,
    refetch,
  } = trpc.venue.list.useQuery({ hotelId }, { enabled: !!hotelId });

  const createMutation = trpc.venue.create.useMutation({
    onSuccess: () => {
      toast.success("Venue created!");
      setOpen(false);
      void refetch();
    },
    onError: (e: any) => toast.error(e.message || "An error occurred"),
  });

  const updateMutation = trpc.venue.update.useMutation({
    onSuccess: () => {
      toast.success("Venue updated!");
      setOpen(false);
      void refetch();
    },
    onError: (e: any) => toast.error(e.message || "An error occurred"),
  });

  const handleOpen = (
    venue?: typeof venues extends (infer T)[] | undefined ? T : never,
  ) => {
    if (venue) {
      setEditId((venue as any).id);
      const caps = ((venue as any).capacities ?? {}) as Record<string, number>;
      setForm({
        name: venue.name,
        description: venue.description ?? "",
        floorLevel: venue.floorLevel ?? "",
        sizeSquareMeters: venue.sizeSquareMeters
          ? String(venue.sizeSquareMeters)
          : "",
        features: Array.isArray((venue as any).features)
          ? ((venue as any).features as string[]).join(", ")
          : "",
        avEquipment: Array.isArray((venue as any).avEquipment)
          ? ((venue as any).avEquipment as string[]).join(", ")
          : "",
        ratePerHour: venue.ratePerHour ? String(venue.ratePerHour) : "",
        ratePerDay: venue.ratePerDay ? String(venue.ratePerDay) : "",
        capacities: Object.fromEntries(
          Object.entries(caps).map(([k, v]) => [k, String(v)]),
        ),
      });
    } else {
      setEditId(null);
      setForm(EMPTY_FORM);
    }
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const capacities: Record<string, number> = {};
    for (const [layout, val] of Object.entries(form.capacities)) {
      if (val && Number(val) > 0) capacities[layout] = Number(val);
    }

    const payload = {
      hotelId,
      name: form.name,
      description: form.description || undefined,
      floorLevel: form.floorLevel || undefined,
      sizeSquareMeters: form.sizeSquareMeters
        ? Number(form.sizeSquareMeters)
        : undefined,
      features: form.features
        ? form.features
            .split(",")
            .map((s: any) => s.trim())
            .filter(Boolean)
        : [],
      avEquipment: form.avEquipment
        ? form.avEquipment
            .split(",")
            .map((s: any) => s.trim())
            .filter(Boolean)
        : [],
      ratePerHour: form.ratePerHour
        ? Number(form.ratePerHour) * 100
        : undefined,
      ratePerDay: form.ratePerDay ? Number(form.ratePerDay) * 100 : undefined,
      capacities,
      availableLayouts: Object.keys(capacities),
    };

    if (editId) {
      const { hotelId: _h, ...updatePayload } = payload;
      updateMutation.mutate({ id: editId, ...updatePayload });
    } else {
      createMutation.mutate(payload);
    }
  };

  if (!hotelId)
    return (
      <div className="py-20 text-center text-gray-400">No hotel assigned.</div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Venues</h1>
        <Button
          onClick={() => handleOpen()}
          className="bg-[#1a1a2e] hover:bg-[#16213e]"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Venue
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : !venues?.length ? (
        <div className="py-16 text-center">
          <MapPin className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">No venues yet.</p>
          <Button className="mt-4 bg-[#1a1a2e]" onClick={() => handleOpen()}>
            Add your first venue
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {venues.map((venue: any) => {
            const caps = (venue.capacities ?? {}) as Record<string, number>;
            const maxCap = Math.max(0, ...Object.values(caps));
            return (
              <div
                key={venue.id}
                className="rounded-xl border bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {venue.name}
                    </h3>
                    {venue.floorLevel && (
                      <p className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin className="h-3 w-3" /> Floor {venue.floorLevel}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpen(venue)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>

                {venue.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                    {venue.description}
                  </p>
                )}

                {maxCap > 0 && (
                  <div className="mt-3 flex items-center gap-1 text-sm text-gray-600">
                    <Users className="h-4 w-4 text-gray-400" />
                    Max {maxCap} guests
                    {venue.sizeSquareMeters && ` · ${venue.sizeSquareMeters}m²`}
                  </div>
                )}

                {Object.keys(caps).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {Object.entries(caps).map(([layout, cap]) => (
                      <Badge key={layout} variant="outline" className="text-xs">
                        {layout.replace("_", " ")}: {cap}
                      </Badge>
                    ))}
                  </div>
                )}

                {(venue.ratePerHour || venue.ratePerDay) && (
                  <div className="mt-3 flex gap-3 text-sm text-gray-600">
                    {venue.ratePerHour && (
                      <span>{formatCurrency(venue.ratePerHour)}/hr</span>
                    )}
                    {venue.ratePerDay && (
                      <span>{formatCurrency(venue.ratePerDay)}/day</span>
                    )}
                  </div>
                )}

                {Array.isArray(venue.features) &&
                  (venue.features as string[]).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {(venue.features as string[]).slice(0, 4).map((f) => (
                        <span
                          key={f}
                          className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-screen max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Venue" : "Add Venue"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="e.g. Grand Ballroom"
              />
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Floor Level
                </label>
                <input
                  value={form.floorLevel}
                  onChange={(e) =>
                    setForm({ ...form, floorLevel: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="e.g. Ground"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Size (m²)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={form.sizeSquareMeters}
                  onChange={(e) =>
                    setForm({ ...form, sizeSquareMeters: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Rate/Hour ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.ratePerHour}
                  onChange={(e) =>
                    setForm({ ...form, ratePerHour: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Rate/Day ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.ratePerDay}
                  onChange={(e) =>
                    setForm({ ...form, ratePerDay: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Capacities by Layout
              </label>
              <div className="grid grid-cols-2 gap-2">
                {LAYOUT_TYPES.map((layout) => (
                  <div key={layout} className="flex items-center gap-2">
                    <label className="w-32 text-xs text-gray-600">
                      {layout.replace("_", " ")}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.capacities[layout] ?? ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          capacities: {
                            ...form.capacities,
                            [layout]: e.target.value,
                          },
                        })
                      }
                      className="w-20 rounded-lg border px-2 py-1 text-sm"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Features (comma-separated)
              </label>
              <input
                value={form.features}
                onChange={(e) => setForm({ ...form, features: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="stage, dance floor, garden"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                A/V Equipment (comma-separated)
              </label>
              <input
                value={form.avEquipment}
                onChange={(e) =>
                  setForm({ ...form, avEquipment: e.target.value })
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="projector, microphone, PA system"
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
