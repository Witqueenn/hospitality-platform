"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Users, Plus, Star, Globe, EyeOff, Pencil, X } from "lucide-react";

const DEPT_LABELS: Record<string, string> = {
  FRONT_DESK: "Front Desk",
  CONCIERGE: "Concierge",
  HOUSEKEEPING: "Housekeeping",
  DINING: "Dining",
  ROOM_SERVICE: "Room Service",
  MANAGEMENT: "Management",
  MAINTENANCE: "Maintenance",
  SPA: "Spa",
  SECURITY: "Security",
  OTHER: "Other",
};

const DEPARTMENTS = Object.keys(DEPT_LABELS) as (keyof typeof DEPT_LABELS)[];

interface StaffForm {
  name: string;
  role: string;
  department: string;
  bio: string;
  languages: string;
  isPublic: boolean;
  tipEnabled: boolean;
}

const EMPTY_FORM: StaffForm = {
  name: "",
  role: "",
  department: "FRONT_DESK",
  bio: "",
  languages: "",
  isPublic: true,
  tipEnabled: false,
};

export default function HotelStaffPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const hotelId = user?.hotelId ?? "";
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<StaffForm>(EMPTY_FORM);
  const [deptFilter, setDeptFilter] = useState<string | undefined>();

  const { data, isLoading, refetch } = trpc.staffProfile.listByHotel.useQuery(
    {
      hotelId,
      department: deptFilter as
        | "FRONT_DESK"
        | "CONCIERGE"
        | "HOUSEKEEPING"
        | "DINING"
        | "ROOM_SERVICE"
        | "MANAGEMENT"
        | "MAINTENANCE"
        | "SPA"
        | "SECURITY"
        | "OTHER"
        | undefined,
    },
    { enabled: !!hotelId },
  );

  const createMutation = trpc.staffProfile.create.useMutation({
    onSuccess: () => {
      toast.success("Staff profile created.");
      void refetch();
      resetForm();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.staffProfile.update.useMutation({
    onSuccess: () => {
      toast.success("Profile updated.");
      void refetch();
      resetForm();
    },
    onError: (err) => toast.error(err.message),
  });

  function resetForm() {
    setForm(EMPTY_FORM);
    setShowForm(false);
    setEditingId(null);
  }

  function startEdit(profile: NonNullable<typeof data>["items"][number]) {
    setForm({
      name: profile.name,
      role: profile.role ?? "",
      department: profile.department,
      bio: profile.bio ?? "",
      languages: profile.languages?.join(", ") ?? "",
      isPublic: profile.isPublic,
      tipEnabled: profile.tipEnabled,
    });
    setEditingId(profile.id);
    setShowForm(true);
  }

  function handleSubmit() {
    if (!form.name || !form.department) {
      toast.error("Name and department are required.");
      return;
    }
    const langs = form.languages
      ? form.languages
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean)
      : [];
    const payload = {
      hotelId,
      name: form.name,
      role: form.role || "Staff",
      department: form.department as Parameters<
        typeof createMutation.mutate
      >[0]["department"],
      bio: form.bio || undefined,
      languages: langs.length > 0 ? langs : undefined,
      isPublic: form.isPublic,
      tipEnabled: form.tipEnabled,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-[#1a1a2e]" />
          <h1 className="text-2xl font-bold text-gray-900">Staff Profiles</h1>
        </div>
        {!showForm && (
          <Button
            className="bg-[#1a1a2e] hover:bg-[#16213e]"
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setForm(EMPTY_FORM);
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Staff
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="space-y-4 rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              {editingId ? "Edit Profile" : "Add Staff Member"}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Full Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Role / Title
              </label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="e.g. Head Concierge"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Department *
              </label>
              <select
                value={form.department}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value })
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {DEPT_LABELS[d]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Languages
              </label>
              <input
                type="text"
                value={form.languages}
                onChange={(e) =>
                  setForm({ ...form, languages: e.target.value })
                }
                placeholder="English, Spanish, French"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Bio
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={2}
                placeholder="Short bio visible to guests"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
              />
            </div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.isPublic}
                onChange={(e) =>
                  setForm({ ...form, isPublic: e.target.checked })
                }
                className="rounded"
              />
              Public profile
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.tipEnabled}
                onChange={(e) =>
                  setForm({ ...form, tipEnabled: e.target.checked })
                }
                className="rounded"
              />
              Accept tips
            </label>
          </div>
          <div className="flex gap-2">
            <Button
              className="bg-[#1a1a2e] hover:bg-[#16213e]"
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending
                ? "Saving..."
                : editingId
                  ? "Update"
                  : "Create Profile"}
            </Button>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Department filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setDeptFilter(undefined)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            !deptFilter
              ? "bg-[#1a1a2e] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {DEPARTMENTS.map((d) => (
          <button
            key={d}
            onClick={() => setDeptFilter(d)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              deptFilter === d
                ? "bg-[#1a1a2e] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {DEPT_LABELS[d]}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : !data?.items || data.items.length === 0 ? (
        <div className="rounded-xl border bg-white py-12 text-center">
          <Users className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">No staff profiles yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.items.map((profile) => (
            <div
              key={profile.id}
              className="rounded-xl border bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#1a1a2e]/10 text-sm font-bold text-[#1a1a2e]">
                    {profile.name.charAt(0)}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">
                        {profile.name}
                      </p>
                      {!profile.isPublic && (
                        <EyeOff className="h-3.5 w-3.5 text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {profile.role ? `${profile.role} · ` : ""}
                      {DEPT_LABELS[profile.department] ?? profile.department}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {profile.avgRating && (
                        <span className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {Number(profile.avgRating).toFixed(1)} (
                          {profile.reviewCount})
                        </span>
                      )}
                      {profile.languages && profile.languages.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {profile.languages.join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => router.push(`/staff/${profile.slug}`)}
                    className="rounded-lg px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-100"
                  >
                    View
                  </button>
                  <button
                    onClick={() => startEdit(profile)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
