"use client";

import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Settings, MapPin, Star } from "lucide-react";

type AddressJson = {
  street?: string;
  city?: string;
  country?: string;
  state?: string;
  postalCode?: string;
};

type HotelForm = {
  name: string;
  description: string;
  shortDescription: string;
  starRating: number;
  timezone: string;
  currency: string;
  // address fields
  street: string;
  city: string;
  country: string;
  state: string;
  postalCode: string;
};

const EMPTY_FORM: HotelForm = {
  name: "",
  description: "",
  shortDescription: "",
  starRating: 3,
  timezone: "UTC",
  currency: "USD",
  street: "",
  city: "",
  country: "",
  state: "",
  postalCode: "",
};

export default function HotelSettingsPage() {
  const { user } = useAuthStore();
  const hotelId = user?.hotelId ?? "";
  const [form, setForm] = useState<HotelForm>(EMPTY_FORM);
  const [dirty, setDirty] = useState(false);

  const { data: hotel, isLoading } = trpc.hotel.getById.useQuery(
    { id: hotelId },
    { enabled: !!hotelId },
  );

  useEffect(() => {
    if (hotel) {
      const addr = ((hotel as any).address ?? {}) as AddressJson;
      setForm({
        name: (hotel as any).name ?? "",
        description: (hotel as any).description ?? "",
        shortDescription: hotel.shortDescription ?? "",
        starRating: hotel.starRating ?? 3,
        timezone: hotel.timezone ?? "UTC",
        currency: hotel.currency ?? "USD",
        street: addr.street ?? "",
        city: addr.city ?? "",
        country: addr.country ?? "",
        state: addr.state ?? "",
        postalCode: addr.postalCode ?? "",
      });
      setDirty(false);
    }
  }, [hotel]);

  const updateMutation = trpc.hotel.update.useMutation({
    onSuccess: () => {
      toast.success("Hotel settings saved!");
      setDirty(false);
    },
    onError: (e: any) => toast.error(e.message || "An error occurred"),
  });

  const handleChange = <K extends keyof HotelForm>(
    field: K,
    value: HotelForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      id: hotelId,
      name: form.name,
      description: form.description || undefined,
      shortDescription: form.shortDescription || undefined,
      starRating: Number(form.starRating),
      timezone: form.timezone,
      currency: form.currency,
      address: {
        street: form.street,
        city: form.city,
        country: form.country,
        state: form.state || undefined,
        postalCode: form.postalCode || undefined,
      },
    });
  };

  if (!hotelId)
    return (
      <div className="py-20 text-center text-gray-400">No hotel assigned.</div>
    );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-[#1a1a2e]" />
        <h1 className="text-2xl font-bold text-gray-900">Hotel Settings</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <section className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
            <Star className="h-4 w-4" /> Basic Information
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Hotel Name *
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Short Description
              </label>
              <input
                value={form.shortDescription}
                onChange={(e) =>
                  handleChange("shortDescription", e.target.value)
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="One-line tagline for search results"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Full Description
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Star Rating
              </label>
              <select
                value={form.starRating}
                onChange={(e) =>
                  handleChange("starRating", Number(e.target.value))
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                {[1, 2, 3, 4, 5].map((s: any) => (
                  <option key={s} value={s}>
                    {s} Star{s !== 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Currency</label>
              <select
                value={form.currency}
                onChange={(e) => handleChange("currency", e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                {["USD", "EUR", "GBP", "AED", "TRY", "JPY", "AUD", "CAD"].map(
                  (c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
            <MapPin className="h-4 w-4" /> Location
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Street Address *
              </label>
              <input
                value={form.street}
                onChange={(e) => handleChange("street", e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="123 Hotel Street"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">City *</label>
              <input
                value={form.city}
                onChange={(e) => handleChange("city", e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Country *
              </label>
              <input
                value={form.country}
                onChange={(e) => handleChange("country", e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                State / Region
              </label>
              <input
                value={form.state}
                onChange={(e) => handleChange("state", e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Postal Code
              </label>
              <input
                value={form.postalCode}
                onChange={(e) => handleChange("postalCode", e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={!dirty}
            onClick={() => setDirty(false)}
          >
            Discard
          </Button>
          <Button
            type="submit"
            className="bg-[#1a1a2e] hover:bg-[#16213e]"
            disabled={!dirty || updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
