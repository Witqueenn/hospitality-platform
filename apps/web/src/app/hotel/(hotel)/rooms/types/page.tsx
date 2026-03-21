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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PhotoManager, type Photo } from "@/components/ui/PhotoManager";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Bed,
  Users,
  Maximize2,
  DollarSign,
  ImageIcon,
} from "lucide-react";

type RoomTypeForm = {
  name: string;
  description: string;
  capacity: number;
  bedType: string;
  sizeSqm: string;
  floor: string;
  features: string;
  noiseNotes: string;
};

const EMPTY_FORM: RoomTypeForm = {
  name: "",
  description: "",
  capacity: 2,
  bedType: "king",
  sizeSqm: "",
  floor: "",
  features: "",
  noiseNotes: "",
};

const BED_TYPES = ["king", "queen", "twin", "double", "suite", "single"];

type RoomTypeItem = {
  id: string;
  name: string;
  description: string | null;
  capacity: number;
  bedType: string;
  sizeSqm: unknown;
  floor: string | null;
  features: unknown;
  photos: unknown;
  noiseNotes: string | null;
  isActive: boolean;
  baseRateCents?: number | null;
};

export default function RoomTypesPage() {
  const { user } = useAuthStore();
  const hotelId = user?.hotelId ?? "";
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "photos">("info");
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<RoomTypeForm>(EMPTY_FORM);
  const [photos, setPhotos] = useState<Photo[]>([]);

  const {
    data: roomTypes,
    isLoading,
    refetch,
  } = trpc.roomType.list.useQuery({ hotelId }, { enabled: !!hotelId });

  const createMutation = trpc.roomType.create.useMutation({
    onSuccess: (created: { id: string }) => {
      toast.success("Room type created!");
      // If photos were staged, save them now
      if (photos.length > 0) {
        updatePhotosMutation.mutate({ id: created.id, photos });
      }
      setOpen(false);
      void refetch();
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const updateMutation = trpc.roomType.update.useMutation({
    onSuccess: () => {
      toast.success("Room type updated!");
      setOpen(false);
      void refetch();
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const updatePhotosMutation = trpc.roomType.updatePhotos.useMutation({
    onSuccess: () => {
      toast.success("Photos saved!");
      void refetch();
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const deactivateMutation = trpc.roomType.delete.useMutation({
    onSuccess: () => void refetch(),
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const handleOpen = (roomType?: RoomTypeItem) => {
    if (roomType) {
      setEditId(roomType.id);
      setForm({
        name: roomType.name,
        description: roomType.description ?? "",
        capacity: roomType.capacity,
        bedType: roomType.bedType,
        sizeSqm: roomType.sizeSqm ? String(roomType.sizeSqm) : "",
        floor: roomType.floor ?? "",
        features: Array.isArray(roomType.features)
          ? (roomType.features as string[]).join(", ")
          : "",
        noiseNotes: roomType.noiseNotes ?? "",
      });
      setPhotos(
        Array.isArray(roomType.photos) ? (roomType.photos as Photo[]) : [],
      );
    } else {
      setEditId(null);
      setForm(EMPTY_FORM);
      setPhotos([]);
    }
    setActiveTab("info");
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description || undefined,
      capacity: Number(form.capacity),
      bedType: form.bedType,
      sizeSqm: form.sizeSqm ? Number(form.sizeSqm) : undefined,
      floor: form.floor || undefined,
      features: form.features
        ? form.features
            .split(",")
            .map((s: any) => s.trim())
            .filter(Boolean)
        : [],
      noiseNotes: form.noiseNotes || undefined,
    };

    if (editId) {
      updateMutation.mutate({ id: editId, ...payload });
      // Also save photos if changed
      if (photos.length > 0 || editId) {
        updatePhotosMutation.mutate({ id: editId, photos });
      }
    } else {
      createMutation.mutate({ hotelId, ...payload });
    }
  };

  const handleSavePhotos = () => {
    if (!editId) return;
    updatePhotosMutation.mutate({ id: editId, photos });
  };

  if (!hotelId) {
    return (
      <div className="py-20 text-center text-gray-400">
        No hotel assigned to your account.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Room Types</h1>
        <Button
          onClick={() => handleOpen()}
          className="bg-[#1a1a2e] hover:bg-[#16213e]"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Room Type
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : !roomTypes?.length ? (
        <div className="py-16 text-center">
          <Bed className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">No room types yet.</p>
          <Button className="mt-4 bg-[#1a1a2e]" onClick={() => handleOpen()}>
            Add your first room type
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Bed Type</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Features</TableHead>
                <TableHead>Rate/night</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(roomTypes as unknown as RoomTypeItem[]).map((rt) => {
                const rtPhotos = Array.isArray(rt.photos)
                  ? (rt.photos as { thumb: string; alt: string }[])
                  : [];
                return (
                  <TableRow key={rt.id}>
                    <TableCell>
                      {rtPhotos[0] ? (
                        <img
                          src={rtPhotos[0].thumb}
                          alt={rtPhotos[0].alt}
                          className="h-12 w-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-gray-100">
                          <ImageIcon className="h-5 w-5 text-gray-300" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{rt.name}</p>
                        {rt.floor && (
                          <p className="text-xs text-gray-400">
                            Floor {rt.floor}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Bed className="h-3.5 w-3.5" />
                        {rt.bedType}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="h-3.5 w-3.5 text-gray-400" />
                        {rt.capacity}
                      </div>
                    </TableCell>
                    <TableCell>
                      {rt.sizeSqm ? (
                        <span className="flex items-center gap-1 text-sm text-gray-600">
                          <Maximize2 className="h-3.5 w-3.5" />
                          {String(rt.sizeSqm)}m²
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(rt.features) &&
                          (rt.features as string[]).slice(0, 3).map((f) => (
                            <Badge
                              key={f}
                              variant="outline"
                              className="text-xs"
                            >
                              {f}
                            </Badge>
                          ))}
                        {Array.isArray(rt.features) &&
                          (rt.features as string[]).length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{(rt.features as string[]).length - 3}
                            </Badge>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {rt.baseRateCents ? (
                        <span className="flex items-center gap-0.5 text-sm font-semibold text-gray-800">
                          <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                          {(rt.baseRateCents / 100).toFixed(0)}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => {
                          if (rt.isActive)
                            deactivateMutation.mutate({ id: rt.id });
                        }}
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${rt.isActive ? "cursor-pointer bg-green-100 text-green-700 hover:bg-green-200" : "cursor-default bg-gray-100 text-gray-500"}`}
                        title={rt.isActive ? "Click to deactivate" : "Inactive"}
                      >
                        {rt.isActive ? "Active" : "Inactive"}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpen(rt)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Edit Room Type" : "Add Room Type"}
            </DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              type="button"
              onClick={() => setActiveTab("info")}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "info"
                  ? "border-[#1a1a2e] text-[#1a1a2e]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Room Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("photos")}
              className={`-mb-px flex items-center gap-1.5 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "photos"
                  ? "border-[#1a1a2e] text-[#1a1a2e]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              Photos
              {photos.length > 0 && (
                <span className="rounded-full bg-[#1a1a2e] px-1.5 py-0.5 text-[10px] text-white">
                  {photos.length}
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
                    placeholder="e.g. Deluxe King Room"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Bed Type *
                  </label>
                  <select
                    value={form.bedType}
                    onChange={(e) =>
                      setForm({ ...form, bedType: e.target.value })
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  >
                    {BED_TYPES.map((b) => (
                      <option key={b} value={b}>
                        {b.charAt(0).toUpperCase() + b.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={form.capacity}
                    onChange={(e) =>
                      setForm({ ...form, capacity: Number(e.target.value) })
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Size (m²)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.sizeSqm}
                    onChange={(e) =>
                      setForm({ ...form, sizeSqm: e.target.value })
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Floor
                  </label>
                  <input
                    value={form.floor}
                    onChange={(e) =>
                      setForm({ ...form, floor: e.target.value })
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    placeholder="e.g. 3"
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
                  placeholder="balcony, sea-view, minibar, jacuzzi"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Noise Notes
                </label>
                <input
                  value={form.noiseNotes}
                  onChange={(e) =>
                    setForm({ ...form, noiseNotes: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="e.g. Street-facing, may have noise until midnight"
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
                    createMutation.isPending ||
                    updateMutation.isPending ||
                    updatePhotosMutation.isPending
                  }
                >
                  {editId ? "Save Changes" : "Create"}
                </Button>
              </div>
            </form>
          )}

          {/* Photos tab */}
          {activeTab === "photos" && (
            <div className="space-y-4">
              <PhotoManager
                photos={photos}
                onChange={setPhotos}
                saving={updatePhotosMutation.isPending}
              />
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setOpen(false)}
                >
                  Close
                </Button>
                {editId && (
                  <Button
                    type="button"
                    className="flex-1 bg-[#1a1a2e]"
                    onClick={handleSavePhotos}
                    disabled={updatePhotosMutation.isPending}
                  >
                    Save Photos
                  </Button>
                )}
                {!editId && (
                  <p className="flex-1 self-center text-center text-xs text-gray-400">
                    Save photos after creating the room type.
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
