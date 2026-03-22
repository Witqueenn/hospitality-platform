"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Award, Plus, X, Heart, Star } from "lucide-react";

const BADGE_TYPE_LABELS: Record<string, string> = {
  TOP_RATED: "Top Rated",
  MOST_TIPPED: "Most Tipped",
  GUEST_FAVORITE: "Guest Favorite",
  HOSPITALITY_STAR: "Hospitality Star",
  FAST_RESPONDER: "Fast Responder",
  PROBLEM_SOLVER: "Problem Solver",
  ROOKIE_OF_MONTH: "Rookie of the Month",
  CUSTOM: "Custom",
};

const BADGE_TYPES = Object.keys(
  BADGE_TYPE_LABELS,
) as (keyof typeof BADGE_TYPE_LABELS)[];

const TABS = [
  { label: "Badges", value: "badges" as const },
  { label: "Gratitude Wall", value: "gratitude" as const },
] as const;

interface BadgeForm {
  staffProfileId: string;
  badgeType: string;
  label: string;
  notes: string;
}

const EMPTY_FORM: BadgeForm = {
  staffProfileId: "",
  badgeType: "GUEST_FAVORITE",
  label: "",
  notes: "",
};

export default function HotelRecognitionPage() {
  const { user } = useAuthStore();
  const hotelId = user?.hotelId ?? "";
  const [activeTab, setActiveTab] = useState<"badges" | "gratitude">("badges");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<BadgeForm>(EMPTY_FORM);
  const [staffFilter, setStaffFilter] = useState<string | undefined>();

  const { data: staffData } = trpc.staffProfile.listByHotel.useQuery(
    { hotelId },
    { enabled: !!hotelId },
  );

  const {
    data: badgesData,
    isLoading: badgesLoading,
    refetch: refetchBadges,
  } = trpc.staffRecognition.listBadges.useQuery(
    { staffProfileId: staffFilter ?? "" },
    { enabled: !!hotelId && !!staffFilter && activeTab === "badges" },
  );

  const {
    data: gratitudeData,
    isLoading: gratitudeLoading,
    refetch: refetchGratitude,
  } = trpc.staffRecognition.gratitudeWall.useQuery(
    { hotelId, pageSize: 50 },
    { enabled: !!hotelId && activeTab === "gratitude" },
  );

  const awardMutation = trpc.staffRecognition.awardBadge.useMutation({
    onSuccess: () => {
      toast.success("Badge awarded.");
      void refetchBadges();
      setForm(EMPTY_FORM);
      setShowForm(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const revokeMutation = trpc.staffRecognition.revokeBadge.useMutation({
    onSuccess: () => {
      toast.success("Badge revoked.");
      void refetchBadges();
    },
    onError: (err) => toast.error(err.message),
  });

  const toggleWallMutation =
    trpc.staffRecognition.toggleGratitudeWall.useMutation({
      onSuccess: () => {
        toast.success("Wall entry updated.");
        void refetchGratitude();
      },
      onError: (err) => toast.error(err.message),
    });

  function handleAward() {
    if (!form.staffProfileId || !form.badgeType) {
      toast.error("Staff member and badge type are required.");
      return;
    }
    awardMutation.mutate({
      staffProfileId: form.staffProfileId,
      badgeType: form.badgeType as Parameters<
        typeof awardMutation.mutate
      >[0]["badgeType"],
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Award className="h-6 w-6 text-[#1a1a2e]" />
          <h1 className="text-2xl font-bold text-gray-900">Recognition</h1>
        </div>
        {activeTab === "badges" && !showForm && (
          <Button
            className="bg-[#1a1a2e] hover:bg-[#16213e]"
            onClick={() => setShowForm(true)}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Award Badge
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "border-[#1a1a2e] text-[#1a1a2e]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Award Badge Form */}
      {activeTab === "badges" && showForm && (
        <div className="space-y-4 rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Award Badge</h2>
            <button
              onClick={() => {
                setShowForm(false);
                setForm(EMPTY_FORM);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Staff Member *
              </label>
              <select
                value={form.staffProfileId}
                onChange={(e) =>
                  setForm({ ...form, staffProfileId: e.target.value })
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value="">Select staff member...</option>
                {staffData?.items.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Badge Type *
              </label>
              <select
                value={form.badgeType}
                onChange={(e) =>
                  setForm({ ...form, badgeType: e.target.value })
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                {BADGE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {BADGE_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Custom Label
              </label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="e.g. Star of the Month"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Notes
              </label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Optional internal notes"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              className="bg-[#1a1a2e] hover:bg-[#16213e]"
              onClick={handleAward}
              disabled={awardMutation.isPending}
            >
              {awardMutation.isPending ? "Awarding..." : "Award Badge"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setForm(EMPTY_FORM);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Badges Tab */}
      {activeTab === "badges" && (
        <>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">Filter by staff:</label>
            <select
              value={staffFilter ?? ""}
              onChange={(e) => setStaffFilter(e.target.value || undefined)}
              className="rounded-lg border px-3 py-1.5 text-sm"
            >
              <option value="">All Staff</option>
              {staffData?.items.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {badgesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : !badgesData || badgesData.length === 0 ? (
            <div className="rounded-xl border bg-white py-12 text-center">
              <Award className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p className="text-gray-500">No badges awarded yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {badgesData.map((badge) => (
                <div
                  key={badge.id}
                  className="rounded-xl border bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-50">
                        <Award className="h-5 w-5 text-amber-500" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-semibold text-gray-900">
                          {BADGE_TYPE_LABELS[badge.badgeType] ??
                            badge.badgeType}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(badge.awardedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm("Revoke this badge?"))
                          revokeMutation.mutate({ id: badge.id });
                      }}
                      className="text-xs text-gray-400 hover:text-red-500"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Gratitude Wall Tab */}
      {activeTab === "gratitude" && (
        <>
          {gratitudeLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : !gratitudeData?.items || gratitudeData.items.length === 0 ? (
            <div className="rounded-xl border bg-white py-12 text-center">
              <Heart className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p className="text-gray-500">No gratitude wall entries yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {gratitudeData.items.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-xl border bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-3.5 w-3.5 ${
                                s <= (entry.review.rating ?? 0)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {entry.review.title && (
                        <p className="font-medium text-gray-900">
                          {entry.review.title}
                        </p>
                      )}
                      {entry.review.body && (
                        <p className="text-sm italic text-gray-600">
                          &ldquo;{entry.review.body}&rdquo;
                        </p>
                      )}
                      <p className="text-sm font-medium text-gray-900">
                        {entry.staffProfile.name}
                        <span className="ml-1 text-xs font-normal text-gray-500">
                          · {entry.staffProfile.department.replace(/_/g, " ")}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        toggleWallMutation.mutate({
                          reviewId: entry.reviewId,
                          hotelId,
                          staffProfileId: entry.staffProfile.id,
                          active: false,
                        })
                      }
                      className="text-xs text-gray-400 hover:text-red-500"
                      disabled={toggleWallMutation.isPending}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
