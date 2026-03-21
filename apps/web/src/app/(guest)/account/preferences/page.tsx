"use client";

import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Settings2,
  Globe,
  BedDouble,
  Wifi,
  Dumbbell,
  Sparkles,
} from "lucide-react";

export default function PreferencesPage() {
  const { data: profile, isLoading } = trpc.preferenceProfile.get.useQuery();

  const [form, setForm] = useState({
    preferredBedType: "",
    preferredFloor: "",
    preferredRoomTemp: "",
    prefersQuietRoom: false,
    prefersHighFloor: false,
    needsStrongWifi: false,
    likesGymAccess: false,
    likesSpaAccess: false,
    languagePreferences: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        preferredBedType: profile.preferredBedType ?? "",
        preferredFloor: profile.preferredFloor ?? "",
        preferredRoomTemp: profile.preferredRoomTemp
          ? String(profile.preferredRoomTemp)
          : "",
        prefersQuietRoom: profile.prefersQuietRoom ?? false,
        prefersHighFloor: profile.prefersHighFloor ?? false,
        needsStrongWifi: profile.needsStrongWifi ?? false,
        likesGymAccess: profile.likesGymAccess ?? false,
        likesSpaAccess: profile.likesSpaAccess ?? false,
        languagePreferences: (
          ((profile as any).languagePreferences ?? []) as string[]
        ).join(", "),
      });
    }
  }, [profile]);

  /* eslint-disable */
  const upsertMutation = (trpc.preferenceProfile.upsert as any).useMutation({
    onSuccess: () => toast.success("Preferences saved!"),
    onError: (e: any) => toast.error(e.message),
  });
  /* eslint-enable */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertMutation.mutate({
      preferredBedType: form.preferredBedType || undefined,
      preferredFloor: form.preferredFloor || undefined,
      preferredRoomTemp: form.preferredRoomTemp
        ? Number(form.preferredRoomTemp)
        : undefined,
      prefersQuietRoom: form.prefersQuietRoom,
      prefersHighFloor: form.prefersHighFloor,
      needsStrongWifi: form.needsStrongWifi,
      likesGymAccess: form.likesGymAccess,
      likesSpaAccess: form.likesSpaAccess,
      languagePreferences: form.languagePreferences
        ? form.languagePreferences
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const Toggle = ({
    label,
    icon,
    value,
    onChange,
  }: {
    label: string;
    icon: React.ReactNode;
    value: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <label className="flex cursor-pointer items-center justify-between rounded-xl border bg-white p-4">
      <div className="flex items-center gap-3">
        <span className="text-[#1a1a2e]">{icon}</span>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <div
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition-colors ${value ? "bg-[#1a1a2e]" : "bg-gray-200"}`}
      >
        <div
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${value ? "translate-x-6" : "translate-x-1"}`}
        />
      </div>
    </label>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings2 className="h-7 w-7 text-[#1a1a2e]" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stay Preferences</h1>
          <p className="text-sm text-gray-500">
            Your preferences help us personalize every stay
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Room preferences */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            Room Preferences
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Preferred Bed Type
              </label>
              <select
                value={form.preferredBedType}
                onChange={(e) =>
                  setForm({ ...form, preferredBedType: e.target.value })
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value="">No preference</option>
                <option value="KING">King</option>
                <option value="QUEEN">Queen</option>
                <option value="TWIN">Twin</option>
                <option value="DOUBLE">Double</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Preferred Floor
              </label>
              <select
                value={form.preferredFloor}
                onChange={(e) =>
                  setForm({ ...form, preferredFloor: e.target.value })
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value="">No preference</option>
                <option value="LOW">Low floor</option>
                <option value="MID">Middle floor</option>
                <option value="HIGH">High floor</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Preferred Room Temperature (°C)
              </label>
              <input
                type="number"
                min={16}
                max={28}
                value={form.preferredRoomTemp}
                onChange={(e) =>
                  setForm({ ...form, preferredRoomTemp: e.target.value })
                }
                placeholder="e.g. 21"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Language Preferences (comma-separated)
              </label>
              <input
                value={form.languagePreferences}
                onChange={(e) =>
                  setForm({ ...form, languagePreferences: e.target.value })
                }
                placeholder="en, tr, fr"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            Quick Preferences
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle
              label="Quiet room preferred"
              icon={<BedDouble className="h-5 w-5" />}
              value={form.prefersQuietRoom}
              onChange={(v) => setForm({ ...form, prefersQuietRoom: v })}
            />
            <Toggle
              label="High floor preferred"
              icon={<Globe className="h-5 w-5" />}
              value={form.prefersHighFloor}
              onChange={(v) => setForm({ ...form, prefersHighFloor: v })}
            />
            <Toggle
              label="Strong WiFi required"
              icon={<Wifi className="h-5 w-5" />}
              value={form.needsStrongWifi}
              onChange={(v) => setForm({ ...form, needsStrongWifi: v })}
            />
            <Toggle
              label="Gym access appreciated"
              icon={<Dumbbell className="h-5 w-5" />}
              value={form.likesGymAccess}
              onChange={(v) => setForm({ ...form, likesGymAccess: v })}
            />
            <Toggle
              label="Spa access appreciated"
              icon={<Sparkles className="h-5 w-5" />}
              value={form.likesSpaAccess}
              onChange={(v) => setForm({ ...form, likesSpaAccess: v })}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-[#1a1a2e] px-8 hover:bg-[#16213e]"
            disabled={upsertMutation.isPending}
          >
            {upsertMutation.isPending ? "Saving…" : "Save Preferences"}
          </Button>
        </div>
      </form>
    </div>
  );
}
