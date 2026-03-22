"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Package, Plus, Clock, CheckCircle2 } from "lucide-react";

const CLAIM_STATUS_BADGE: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  MATCHED: "bg-purple-100 text-purple-700",
  COLLECTING: "bg-yellow-100 text-yellow-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-600",
};

export default function LostFoundPage() {
  const { isAuthenticated } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    description: "",
    category: "",
    lostLocation: "",
  });

  const {
    data: claims,
    isLoading,
    refetch,
  } = trpc.lostFound.myClaims.useQuery(undefined, {
    enabled: isAuthenticated(),
  });

  const reportMutation = trpc.lostFound.reportLost.useMutation({
    onSuccess: () => {
      toast.success("Lost item reported. We'll check and contact you.");
      setShowForm(false);
      setForm({ description: "", category: "", lostLocation: "" });
      void refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = () => {
    if (!form.description) {
      toast.error("Please describe the lost item.");
      return;
    }
    reportMutation.mutate({
      description: form.description,
      category: form.category || undefined,
      lostLocation: form.lostLocation || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-purple-100 p-2">
            <Package className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Lost & Found</h1>
            <p className="text-sm text-gray-500">Missing something?</p>
          </div>
        </div>
        <Button
          size="sm"
          className="bg-[#1a1a2e] hover:bg-[#16213e]"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Report Lost Item
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">
            Describe what you lost
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Item Description *
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="e.g. Black leather wallet, Apple Watch Series 8..."
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Category
                </label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  placeholder="e.g. Electronics"
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Where did you lose it?
                </label>
                <input
                  type="text"
                  value={form.lostLocation}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, lostLocation: e.target.value }))
                  }
                  placeholder="e.g. Pool area"
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1 bg-[#1a1a2e] hover:bg-[#16213e]"
                onClick={handleSubmit}
                disabled={reportMutation.isPending}
              >
                {reportMutation.isPending ? "Submitting..." : "Submit Report"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Claims list */}
      {!claims || claims.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          <Package className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">No lost item reports yet.</p>
          <div className="mt-4 text-xs text-gray-400">
            <p className="flex items-center justify-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Items are stored for 30 days.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {claims.map((claim) => {
            const badge =
              CLAIM_STATUS_BADGE[claim.status] ?? CLAIM_STATUS_BADGE.OPEN;
            return (
              <div
                key={claim.id}
                className="rounded-xl border bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900">
                      {claim.description}
                    </p>
                    {claim.lostLocation && (
                      <p className="text-sm text-gray-500">
                        Lost at: {claim.lostLocation}
                      </p>
                    )}
                    {claim.item && (
                      <div className="flex items-center gap-1.5 text-xs text-green-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Matched to item: {claim.item.itemRef}
                      </div>
                    )}
                    <p className="text-xs text-gray-400">
                      Reported {new Date(claim.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge}`}
                  >
                    {claim.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
