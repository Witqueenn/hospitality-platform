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
import { PhotoManager, type Photo } from "@/components/ui/PhotoManager";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Music2,
  Users,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  Calendar,
  Ticket,
} from "lucide-react";

type NightType =
  | "DJ_NIGHT"
  | "LIVE_MUSIC"
  | "VIP_LOUNGE"
  | "COCKTAIL_PARTY"
  | "THEMED_NIGHT"
  | "POOL_PARTY"
  | "COMEDY_SHOW"
  | "OTHER";

const NIGHT_TYPE_LABELS: Record<NightType, string> = {
  DJ_NIGHT: "DJ Night",
  LIVE_MUSIC: "Live Music",
  VIP_LOUNGE: "VIP Lounge",
  COCKTAIL_PARTY: "Cocktail Party",
  THEMED_NIGHT: "Themed Night",
  POOL_PARTY: "Pool Party",
  COMEDY_SHOW: "Comedy Show",
  OTHER: "Other",
};

const NIGHT_COLORS: Record<NightType, string> = {
  DJ_NIGHT: "bg-purple-100 text-purple-700",
  LIVE_MUSIC: "bg-pink-100 text-pink-700",
  VIP_LOUNGE: "bg-amber-100 text-amber-700",
  COCKTAIL_PARTY: "bg-rose-100 text-rose-700",
  THEMED_NIGHT: "bg-indigo-100 text-indigo-700",
  POOL_PARTY: "bg-cyan-100 text-cyan-700",
  COMEDY_SHOW: "bg-yellow-100 text-yellow-700",
  OTHER: "bg-gray-100 text-gray-600",
};

type NightForm = {
  name: string;
  experienceType: NightType;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  priceCents: string;
  capacity: string;
  minAge: string;
  dressCode: string;
  features: string;
};

const EMPTY_FORM: NightForm = {
  name: "",
  experienceType: "DJ_NIGHT",
  description: "",
  date: "",
  startTime: "",
  endTime: "",
  priceCents: "",
  capacity: "",
  minAge: "",
  dressCode: "",
  features: "",
};

type NightItem = {
  id: string;
  name: string;
  experienceType: string;
  description: string | null;
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  priceCents: number | null;
  capacity: number | null;
  minAge: number | null;
  dressCode: string | null;
  features: unknown;
  photos: unknown;
  isActive: boolean;
};

function parseNightPhotos(raw: unknown): Photo[] {
  if (!Array.isArray(raw)) return [];
  return (raw as Record<string, unknown>[]).filter(
    (p) => typeof p.url === "string",
  ) as unknown as Photo[];
}

function formatDateDisplay(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function NightlifePage() {
  const { user } = useAuthStore();
  const hotelId = user?.hotelId ?? "";
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<NightForm>(EMPTY_FORM);
  const [activeTab, setActiveTab] = useState<"info" | "photos">("info");
  const [nightPhotos, setNightPhotos] = useState<Photo[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const {
    data: rawNight,
    isLoading,
    refetch,
  } = trpc.nightlife.list.useQuery({ hotelId }, { enabled: !!hotelId });
  const nights = (rawNight as NightItem[] | undefined) ?? [];

  const createMutation = trpc.nightlife.create.useMutation({
    onSuccess: (created: { id: string }) => {
      toast.success("Nightlife experience created!");
      setEditId(created.id);
      setActiveTab("photos");
      void refetch();
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const updateMutation = trpc.nightlife.update.useMutation({
    onSuccess: () => {
      toast.success("Updated successfully!");
      setOpen(false);
      void refetch();
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const deleteMutation = trpc.nightlife.delete.useMutation({
    onSuccess: () => void refetch(),
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const updatePhotosMutation = trpc.nightlife.updatePhotos.useMutation({
    onSuccess: () => {
      toast.success("Photos saved!");
      void refetch();
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const handleOpen = (item?: NightItem) => {
    if (item) {
      setEditId(item.id);
      setForm({
        name: item.name,
        experienceType: item.experienceType as NightType,
        description: item.description ?? "",
        date: item.date ? item.date.split("T")[0]! : "",
        startTime: item.startTime ?? "",
        endTime: item.endTime ?? "",
        priceCents: item.priceCents !== null ? String(item.priceCents) : "",
        capacity: item.capacity ? String(item.capacity) : "",
        minAge: item.minAge !== null ? String(item.minAge) : "",
        dressCode: item.dressCode ?? "",
        features: Array.isArray(item.features)
          ? (item.features as string[]).join(", ")
          : "",
      });
      setNightPhotos(parseNightPhotos(item.photos));
    } else {
      setEditId(null);
      setForm(EMPTY_FORM);
      setNightPhotos([]);
    }
    setActiveTab("info");
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      experienceType: form.experienceType,
      description: form.description || undefined,
      date: form.date || undefined,
      startTime: form.startTime || undefined,
      endTime: form.endTime || undefined,
      priceCents: form.priceCents ? Number(form.priceCents) : undefined,
      capacity: form.capacity ? Number(form.capacity) : undefined,
      minAge: form.minAge !== "" ? Number(form.minAge) : undefined,
      dressCode: form.dressCode || undefined,
      features: form.features
        ? form.features
            .split(",")
            .map((s: any) => s.trim())
            .filter(Boolean)
        : [],
    };

    if (editId) {
      updateMutation.mutate({ id: editId, ...payload });
    } else {
      createMutation.mutate({ hotelId, ...payload });
    }
  };

  const handleSavePhotos = () => {
    if (!editId) return;
    updatePhotosMutation.mutate({ id: editId, photos: nightPhotos });
  };

  const coverPhoto = (item: NightItem) => {
    const arr = parseNightPhotos(item.photos);
    return arr[0] ?? null;
  };

  if (!hotelId) {
    return (
      <div className="py-20 text-center text-gray-400">
        No hotel assigned to your account.
      </div>
    );
  }

  // Summary counts for top stat types
  const STAT_TYPES: NightType[] = [
    "DJ_NIGHT",
    "LIVE_MUSIC",
    "VIP_LOUNGE",
    "COCKTAIL_PARTY",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Nightlife Experiences
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Manage DJ nights, live music, VIP lounges, and special events.
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
      {!isLoading && nights.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STAT_TYPES.map((type) => {
            const count = nights.filter(
              (n) => n.experienceType === type && n.isActive,
            ).length;
            return (
              <div
                key={type}
                className="rounded-xl border bg-white p-4 text-center"
              >
                <p className="text-2xl font-bold text-[#1a1a2e]">{count}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {NIGHT_TYPE_LABELS[type]}
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
      ) : nights.length === 0 ? (
        <div className="py-20 text-center">
          <Music2 className="mx-auto mb-4 h-12 w-12 text-gray-200" />
          <p className="text-gray-500">No nightlife experiences yet.</p>
          <Button className="mt-4 bg-[#1a1a2e]" onClick={() => handleOpen()}>
            Add your first experience
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {(nights as unknown as NightItem[]).map((item: any) => {
            const isExpanded = expandedId === item.id;
            const photo = coverPhoto(item);
            const photoCount = parseNightPhotos(item.photos).length;
            const features = Array.isArray(item.features)
              ? (item.features as string[])
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
                        <Music2 className="h-6 w-6 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${NIGHT_COLORS[item.experienceType as NightType] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {NIGHT_TYPE_LABELS[item.experienceType as NightType] ??
                          item.experienceType}
                      </span>
                      {item.priceCents !== null &&
                        item.priceCents !== undefined && (
                          <span className="flex items-center gap-1 rounded-full bg-[#1a1a2e]/10 px-2 py-0.5 text-xs font-semibold text-[#1a1a2e]">
                            <Ticket className="h-3 w-3" /> $
                            {(item.priceCents / 100).toFixed(0)}
                          </span>
                        )}
                      {photoCount > 0 && (
                        <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                          <ImageIcon className="h-3 w-3" /> {photoCount}
                        </span>
                      )}
                      {!item.isActive && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
                      {item.date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />{" "}
                          {formatDateDisplay(item.date)}
                        </span>
                      )}
                      {item.capacity && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {item.capacity} guests
                        </span>
                      )}
                      {item.startTime && (
                        <span>
                          {item.startTime}
                          {item.endTime ? ` – ${item.endTime}` : ""}
                        </span>
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
                      {item.dressCode && (
                        <div>
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Dress Code
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.dressCode}
                          </p>
                        </div>
                      )}
                      {features.length > 0 && (
                        <div>
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Features
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {features.map((f) => (
                              <span
                                key={f}
                                className="rounded-full bg-white px-2 py-0.5 text-xs text-gray-600 ring-1 ring-gray-200"
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Photo strip */}
                      {parseNightPhotos(item.photos).length > 0 && (
                        <div className="sm:col-span-2">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Photos
                          </p>
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {parseNightPhotos(item.photos).map((p, idx) => (
                              <img
                                key={idx}
                                src={p.thumb || p.url}
                                alt={p.alt}
                                className="h-20 w-28 shrink-0 rounded-lg object-cover"
                              />
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editId
                ? "Edit Nightlife Experience"
                : "Add Nightlife Experience"}
            </DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex gap-1 border-b">
            <button
              type="button"
              onClick={() => setActiveTab("info")}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === "info"
                  ? "border-b-2 border-[#1a1a2e] text-[#1a1a2e]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("photos")}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition ${
                activeTab === "photos"
                  ? "border-b-2 border-[#1a1a2e] text-[#1a1a2e]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Photos
              {nightPhotos.length > 0 && (
                <span className="rounded-full bg-[#1a1a2e] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {nightPhotos.length}
                </span>
              )}
            </button>
          </div>

          {/* Info tab */}
          {activeTab === "info" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-medium">
                    Name *
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    placeholder="e.g. Saturday DJ Night with Thomas Gold"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Type *
                  </label>
                  <select
                    value={form.experienceType}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        experienceType: e.target.value as NightType,
                      })
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  >
                    {Object.entries(NIGHT_TYPE_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) =>
                      setForm({ ...form, startTime: e.target.value })
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) =>
                      setForm({ ...form, endTime: e.target.value })
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Ticket Price (cents)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.priceCents}
                    onChange={(e) =>
                      setForm({ ...form, priceCents: e.target.value })
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    placeholder="e.g. 2000 = $20.00"
                  />
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
                    placeholder="e.g. 200"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Minimum Age
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.minAge}
                    onChange={(e) =>
                      setForm({ ...form, minAge: e.target.value })
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    placeholder="e.g. 18"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Dress Code
                  </label>
                  <input
                    value={form.dressCode}
                    onChange={(e) =>
                      setForm({ ...form, dressCode: e.target.value })
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    placeholder="e.g. Smart casual"
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
                  Features (comma-separated)
                </label>
                <input
                  value={form.features}
                  onChange={(e) =>
                    setForm({ ...form, features: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="Open bar, VIP tables, Live DJ, Photo booth"
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
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {editId ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          )}

          {/* Photos tab */}
          {activeTab === "photos" && (
            <div className="space-y-4">
              {!editId && (
                <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  Save the nightlife experience first, then add photos.
                </p>
              )}
              {editId && (
                <>
                  <PhotoManager
                    photos={nightPhotos}
                    onChange={setNightPhotos}
                    saving={updatePhotosMutation.isPending}
                  />
                  <div className="flex gap-3 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setOpen(false)}
                    >
                      Close
                    </Button>
                    <Button
                      type="button"
                      className="flex-1 bg-[#1a1a2e]"
                      onClick={handleSavePhotos}
                      disabled={updatePhotosMutation.isPending}
                    >
                      Save Photos
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
