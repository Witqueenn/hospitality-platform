"use client";

import { useState } from "react";
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
import { Car, Plus, Clock, Users, Star } from "lucide-react";

const MOBILITY_TYPES = [
  "TAXI",
  "TRANSFER",
  "RENTAL",
  "SHUTTLE",
  "CHAUFFEUR",
  "BICYCLE",
  "SCOOTER",
] as const;

const MOBILITY_TYPE_LABELS: Record<string, string> = {
  TAXI: "Taxi",
  TRANSFER: "Transfer",
  RENTAL: "Rental",
  SHUTTLE: "Shuttle",
  CHAUFFEUR: "Chauffeur",
  BICYCLE: "Bicycle",
  SCOOTER: "Scooter",
};

type ProductForm = {
  mobilityProviderId: string;
  name: string;
  code: string;
  mobilityType: string;
  description: string;
  capacity: string;
  vehicleClass: string;
};

const EMPTY_FORM: ProductForm = {
  mobilityProviderId: "",
  name: "",
  code: "",
  mobilityType: "TRANSFER",
  description: "",
  capacity: "",
  vehicleClass: "",
};

export default function HotelMobilityPage() {
  const { user } = useAuthStore();
  const hotelId = user?.hotelId ?? "";
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);

  const {
    data: products,
    isLoading,
    refetch,
  } = trpc.mobility.listForHotel.useQuery({ hotelId }, { enabled: !!hotelId });

  const { data: providers } = trpc.mobility.listProviders.useQuery({});

  const createMutation = (trpc.mobility.createProduct as any).useMutation({
    onSuccess: () => {
      toast.success("Service created!");
      setOpen(false);
      void refetch();
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      mobilityProviderId: form.mobilityProviderId,
      hotelId: hotelId || undefined,
      name: form.name,
      code: form.code,
      mobilityType: form.mobilityType as any,
      description: form.description || undefined,
      capacity: form.capacity ? Number(form.capacity) : undefined,
      vehicleClass: form.vehicleClass || undefined,
    });
  };

  const list = (products as any[]) ?? [];
  const providerList = (providers as any[]) ?? [];

  if (!hotelId) return <p className="text-gray-400">No hotel assigned.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Mobility Services
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Transfers & transportation for your guests
          </p>
        </div>
        <Button
          onClick={() => {
            setForm(EMPTY_FORM);
            setOpen(true);
          }}
          className="bg-[#1a1a2e] hover:bg-[#16213e]"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Service
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="py-20 text-center">
          <Car className="mx-auto mb-4 h-12 w-12 text-gray-200" />
          <p className="text-gray-500">
            No mobility services linked to this hotel.
          </p>
          <Button
            className="mt-4 bg-[#1a1a2e]"
            onClick={() => {
              setForm(EMPTY_FORM);
              setOpen(true);
            }}
          >
            Add first service
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((product: any) => (
            <div
              key={product.id}
              className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                <Car className="h-6 w-6 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{product.name}</p>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                    {MOBILITY_TYPE_LABELS[product.mobilityType] ??
                      product.mobilityType}
                  </span>
                </div>
                <div className="mt-0.5 flex gap-3 text-xs text-gray-400">
                  {product.capacity && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {product.capacity} pax
                    </span>
                  )}
                  {product.vehicleClass && <span>{product.vehicleClass}</span>}
                  {product.mobilityProvider?.name && (
                    <span>Provider: {product.mobilityProvider.name}</span>
                  )}
                  <span>{product._count?.reservations ?? 0} reservations</span>
                </div>
              </div>
              <span
                className={`text-xs font-medium ${product.isActive ? "text-emerald-600" : "text-gray-400"}`}
              >
                {product.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Mobility Service</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Provider *
              </label>
              <select
                required
                value={form.mobilityProviderId}
                onChange={(e) =>
                  setForm({ ...form, mobilityProviderId: e.target.value })
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value="">Select provider…</option>
                {providerList.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Service Name *
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="Airport Transfer"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Code *</label>
                <input
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="AIRPORT_TX"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Type *</label>
                <select
                  value={form.mobilityType}
                  onChange={(e) =>
                    setForm({ ...form, mobilityType: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  {MOBILITY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {MOBILITY_TYPE_LABELS[t]}
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
                  placeholder="4"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Vehicle Class
              </label>
              <input
                value={form.vehicleClass}
                onChange={(e) =>
                  setForm({ ...form, vehicleClass: e.target.value })
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="e.g. Economy, Business, Van"
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
