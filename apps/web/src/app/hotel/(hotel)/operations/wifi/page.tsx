"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Wifi,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  X,
  Check,
} from "lucide-react";

interface WifiFormData {
  networkName: string;
  zone: string;
  password: string;
  isActive: boolean;
  description: string;
}

const EMPTY_FORM: WifiFormData = {
  networkName: "",
  zone: "",
  password: "",
  isActive: true,
  description: "",
};

export default function HotelWifiPage() {
  const { user } = useAuthStore();
  const hotelId = user?.hotelId ?? "";
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<WifiFormData>(EMPTY_FORM);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>(
    {},
  );

  const { data, isLoading, refetch } = trpc.hotelWifi.list.useQuery(
    { hotelId },
    { enabled: !!hotelId },
  );

  const createMutation = trpc.hotelWifi.create.useMutation({
    onSuccess: () => {
      toast.success("Wi-Fi credential added.");
      void refetch();
      resetForm();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.hotelWifi.update.useMutation({
    onSuccess: () => {
      toast.success("Wi-Fi credential updated.");
      void refetch();
      resetForm();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.hotelWifi.delete.useMutation({
    onSuccess: () => {
      toast.success("Wi-Fi credential deleted.");
      void refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  function resetForm() {
    setForm(EMPTY_FORM);
    setShowForm(false);
    setEditingId(null);
  }

  function startEdit(cred: NonNullable<typeof data>[number]) {
    setForm({
      networkName: cred.networkName,
      zone: cred.zone ?? "",
      password: cred.password ?? "",
      isActive: cred.isActive,
      description: cred.description ?? "",
    });
    setEditingId(cred.id);
    setShowForm(true);
  }

  function handleSubmit() {
    if (!form.networkName || !form.password) {
      toast.error("Network name and password are required.");
      return;
    }
    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        ...form,
        zone: form.zone || undefined,
        description: form.description || undefined,
      });
    } else {
      createMutation.mutate({
        hotelId,
        ...form,
        zone: form.zone || undefined,
        description: form.description || undefined,
      });
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wifi className="h-6 w-6 text-[#1a1a2e]" />
          <h1 className="text-2xl font-bold text-gray-900">
            Wi-Fi Credentials
          </h1>
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
            Add Network
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="space-y-4 rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              {editingId ? "Edit Network" : "Add Wi-Fi Network"}
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
                Network Name (SSID) *
              </label>
              <input
                type="text"
                value={form.networkName}
                onChange={(e) =>
                  setForm({ ...form, networkName: e.target.value })
                }
                placeholder="e.g. GrandPalace_Guest"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Zone
              </label>
              <input
                type="text"
                value={form.zone}
                onChange={(e) => setForm({ ...form, zone: e.target.value })}
                placeholder="e.g. Lobby, Pool, All Areas"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Password *
              </label>
              <input
                type="text"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Wi-Fi password"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Description
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Optional description"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Active (visible to guests)
            </label>
          </div>

          <div className="flex gap-2">
            <Button
              className="bg-[#1a1a2e] hover:bg-[#16213e]"
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending ? "Saving..." : editingId ? "Update" : "Add Network"}
            </Button>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="rounded-xl border bg-white py-12 text-center">
          <Wifi className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">No Wi-Fi networks configured.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((cred) => (
            <div
              key={cred.id}
              className="rounded-xl border bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">
                      {cred.networkName}
                    </p>
                    {!cred.isActive && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                        Inactive
                      </span>
                    )}
                  </div>
                  {cred.zone && (
                    <p className="text-xs text-gray-500">Zone: {cred.zone}</p>
                  )}
                  {cred.password && (
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm text-gray-500">
                        Key:{" "}
                        {showPasswords[cred.id]
                          ? cred.password
                          : String("∙").repeat(8)}
                      </p>
                      <button
                        onClick={() =>
                          setShowPasswords((s) => ({
                            ...s,
                            [cred.id]: !s[cred.id],
                          }))
                        }
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords[cred.id] ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                  {cred.description && (
                    <p className="text-xs text-gray-400">{cred.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => startEdit(cred)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this Wi-Fi credential?")) {
                        deleteMutation.mutate({ id: cred.id });
                      }
                    }}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
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
