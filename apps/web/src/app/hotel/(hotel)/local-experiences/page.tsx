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
import { Compass, Plus, Clock, Users, Pencil } from "lucide-react";

const CATEGORIES = [
  "CULTURE",
  "FOOD",
  "NIGHTLIFE",
  "ADVENTURE",
  "WELLNESS",
  "SHOPPING",
  "FAMILY",
  "SPORTS",
  "NATURE",
  "ART",
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  CULTURE: "Culture",
  FOOD: "Food & Drink",
  NIGHTLIFE: "Nightlife",
  ADVENTURE: "Adventure",
  WELLNESS: "Wellness",
  SHOPPING: "Shopping",
  FAMILY: "Family",
  SPORTS: "Sports",
  NATURE: "Nature",
  ART: "Art",
};

type ExpForm = {
  name: string;
  category: string;
  description: string;
  durationMinutes: string;
  maxGroupSize: string;
  priceCents: string;
  meetingPoint: string;
};

const EMPTY_FORM: ExpForm = {
  name: "",
  category: "CULTURE",
  description: "",
  durationMinutes: "60",
  maxGroupSize: "10",
  priceCents: "",
  meetingPoint: "",
};

export default function LocalExperiencesAdminPage() {
  const { user } = useAuthStore();
  const hotelId = user?.hotelId ?? "";
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ExpForm>(EMPTY_FORM);

  const {
    data: experiences,
    isLoading,
    refetch,
  } = trpc.localExperience.listExperiences.useQuery(
    { hotelId, limit: 50 },
    { enabled: !!hotelId },
  );

  const createMutation = (
    trpc.localExperience.createExperience as any
  ).useMutation({
    onSuccess: () => {
      toast.success("Experience created!");
      setOpen(false);
      void refetch();
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      hotelId,
      name: form.name,
      category: form.category as any,
      description: form.description || undefined,
      slug: form.name.toLowerCase().replace(/\s+/g, "-"),
      durationMinutes: Number(form.durationMinutes),
      maxGuests: Number(form.maxGroupSize),
      priceCents: Math.round(Number(form.priceCents) * 100),
      meetingPoint: form.meetingPoint
        ? { address: form.meetingPoint }
        : undefined,
    });
  };

  const list = (experiences as any[]) ?? [];

  if (!hotelId) return <p className="text-gray-400">No hotel assigned.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Local Experiences
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Curate city experiences for your guests
          </p>
        </div>
        <Button
          onClick={() => {
            setForm(EMPTY_FORM);
            setOpen(true);
          }}
          className="bg-[#1a1a2e] hover:bg-[#16213e]"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Experience
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
          <Compass className="mx-auto mb-4 h-12 w-12 text-gray-200" />
          <p className="text-gray-500">No experiences yet.</p>
          <Button
            className="mt-4 bg-[#1a1a2e]"
            onClick={() => {
              setForm(EMPTY_FORM);
              setOpen(true);
            }}
          >
            Add first experience
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((exp: any) => (
            <div
              key={exp.id}
              className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                <Compass className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{exp.name}</p>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                    {CATEGORY_LABELS[exp.category] ?? exp.category}
                  </span>
                </div>
                <div className="mt-0.5 flex gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {exp.durationMinutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> Max {exp.maxGroupSize}
                  </span>
                  <span className="font-semibold text-[#1a1a2e]">
                    ${(exp.priceCents / 100).toFixed(0)} / person
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Local Experience</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Category *
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </option>
                  ))}
                </select>
              </div>
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
                  Duration (min)
                </label>
                <input
                  type="number"
                  min={15}
                  value={form.durationMinutes}
                  onChange={(e) =>
                    setForm({ ...form, durationMinutes: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Max Group Size
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.maxGroupSize}
                  onChange={(e) =>
                    setForm({ ...form, maxGroupSize: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium">
                  Meeting Point
                </label>
                <input
                  value={form.meetingPoint}
                  onChange={(e) =>
                    setForm({ ...form, meetingPoint: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="Hotel lobby"
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
