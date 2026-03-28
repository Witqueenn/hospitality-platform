"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PackageSearch, Plus, ChevronDown, ChevronUp, X } from "lucide-react";

const ITEM_STATUS_BADGE: Record<string, string> = {
  FOUND: "bg-blue-100 text-blue-700",
  CLAIMED: "bg-green-100 text-green-700",
  RETURNED: "bg-gray-100 text-gray-600",
  DONATED: "bg-purple-100 text-purple-700",
  DISCARDED: "bg-red-50 text-red-600",
};

const CLAIM_STATUS_BADGE: Record<string, string> = {
  OPEN: "bg-yellow-100 text-yellow-700",
  MATCHED: "bg-blue-100 text-blue-700",
  COLLECTING: "bg-green-100 text-green-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  RESOLVED: "bg-gray-100 text-gray-600",
  CLOSED: "bg-gray-100 text-gray-400",
};

const TABS = [
  { label: "Found Items", value: "items" as const },
  { label: "Claims", value: "claims" as const },
] as const;

interface FoundItemForm {
  description: string;
  location: string;
  categoryTag: string;
  storageLocation: string;
}

const EMPTY_FORM: FoundItemForm = {
  description: "",
  location: "",
  categoryTag: "",
  storageLocation: "",
};

export default function HotelLostFoundPage() {
  const { user } = useAuthStore();
  const hotelId = user?.hotelId ?? "";
  const [activeTab, setActiveTab] = useState<"items" | "claims">("items");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FoundItemForm>(EMPTY_FORM);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [itemStatusFilter, setItemStatusFilter] = useState<string | undefined>(
    "FOUND",
  );

  const {
    data: itemsData,
    isLoading: itemsLoading,
    refetch: refetchItems,
  } = trpc.lostFound.listItems.useQuery(
    {
      hotelId,
      status: itemStatusFilter as
        | "STORED"
        | "CLAIMED"
        | "SHIPPED"
        | "RETURNED"
        | "DONATED"
        | "DISCARDED"
        | undefined,
      pageSize: 50,
    },
    { enabled: !!hotelId && activeTab === "items" },
  );

  const {
    data: claimsData,
    isLoading: claimsLoading,
    refetch: refetchClaims,
  } = trpc.lostFound.listClaims.useQuery(
    { hotelId, pageSize: 50 },
    { enabled: !!hotelId && activeTab === "claims" },
  );

  const logFoundMutation = trpc.lostFound.logFound.useMutation({
    onSuccess: () => {
      toast.success("Item logged.");
      void refetchItems();
      setForm(EMPTY_FORM);
      setShowForm(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const updateItemStatusMutation = trpc.lostFound.updateItemStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated.");
      void refetchItems();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateClaimStatusMutation =
    trpc.lostFound.updateClaimStatus.useMutation({
      onSuccess: () => {
        toast.success("Claim updated.");
        void refetchClaims();
      },
      onError: (err) => toast.error(err.message),
    });

  function handleLogFound() {
    if (!form.description || !form.location) {
      toast.error("Description and location are required.");
      return;
    }
    logFoundMutation.mutate({
      hotelId,
      description: form.description,
      foundAt: new Date().toISOString(),
      foundLocation: form.location,
      category: form.categoryTag || undefined,
      storageLocation: form.storageLocation || undefined,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PackageSearch className="h-6 w-6 text-[#1a1a2e]" />
          <h1 className="text-2xl font-bold text-gray-900">Lost & Found</h1>
        </div>
        {activeTab === "items" && !showForm && (
          <Button
            className="bg-[#1a1a2e] hover:bg-[#16213e]"
            onClick={() => setShowForm(true)}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Log Found Item
          </Button>
        )}
      </div>

      {/* Main tabs */}
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

      {/* Log Found Form */}
      {activeTab === "items" && showForm && (
        <div className="space-y-4 rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Log Found Item</h2>
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
                Description *
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="e.g. Black leather wallet, iPhone 14 Pro"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Found Location *
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Room 204, Pool area"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Category
              </label>
              <input
                type="text"
                value={form.categoryTag}
                onChange={(e) =>
                  setForm({ ...form, categoryTag: e.target.value })
                }
                placeholder="e.g. Electronics, Clothing"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Storage Location
              </label>
              <input
                type="text"
                value={form.storageLocation}
                onChange={(e) =>
                  setForm({ ...form, storageLocation: e.target.value })
                }
                placeholder="e.g. Front desk safe, Box #3"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              className="bg-[#1a1a2e] hover:bg-[#16213e]"
              onClick={handleLogFound}
              disabled={logFoundMutation.isPending}
            >
              {logFoundMutation.isPending ? "Logging..." : "Log Item"}
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

      {/* Items tab */}
      {activeTab === "items" && (
        <>
          {/* Status filter */}
          <div className="flex flex-wrap gap-2">
            {(
              ["FOUND", "CLAIMED", "RETURNED", "DONATED", undefined] as const
            ).map((s) => (
              <button
                key={String(s)}
                onClick={() => setItemStatusFilter(s)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  itemStatusFilter === s
                    ? "bg-[#1a1a2e] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s ?? "All"}
              </button>
            ))}
          </div>

          {itemsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : !itemsData?.items || itemsData.items.length === 0 ? (
            <div className="rounded-xl border bg-white py-12 text-center">
              <PackageSearch className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p className="text-gray-500">No items found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {itemsData.items.map((item) => {
                const isExpanded = expandedId === item.id;
                return (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-xl border bg-white shadow-sm"
                  >
                    <div
                      className="flex cursor-pointer items-start justify-between gap-3 p-4"
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${ITEM_STATUS_BADGE[item.status]}`}
                          >
                            {item.status}
                          </span>
                          {item.category && (
                            <span className="text-xs text-gray-400">
                              {item.category}
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-gray-900">
                          {item.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          Found at: {item.foundLocation}
                        </p>
                        <p className="font-mono text-xs text-gray-400">
                          {item.itemRef}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      )}
                    </div>
                    {isExpanded && (
                      <div className="space-y-2 border-t bg-gray-50 p-4">
                        {item.storageLocation && (
                          <p className="text-sm text-gray-600">
                            Storage: {item.storageLocation}
                          </p>
                        )}
                        <p className="text-xs text-gray-400">
                          Logged: {new Date(item.createdAt).toLocaleString()}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {item.status === "STORED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateItemStatusMutation.mutate({
                                  id: item.id,
                                  status: "RETURNED",
                                })
                              }
                              disabled={updateItemStatusMutation.isPending}
                            >
                              Mark Returned
                            </Button>
                          )}
                          {item.status === "STORED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateItemStatusMutation.mutate({
                                  id: item.id,
                                  status: "DONATED",
                                })
                              }
                              disabled={updateItemStatusMutation.isPending}
                            >
                              Mark Donated
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Claims tab */}
      {activeTab === "claims" && (
        <>
          {claimsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : !claimsData?.items || claimsData.items.length === 0 ? (
            <div className="rounded-xl border bg-white py-12 text-center">
              <PackageSearch className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p className="text-gray-500">No claims yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {claimsData.items.map((claim) => {
                const isExpanded = expandedId === `claim-${claim.id}`;
                return (
                  <div
                    key={claim.id}
                    className="overflow-hidden rounded-xl border bg-white shadow-sm"
                  >
                    <div
                      className="flex cursor-pointer items-start justify-between gap-3 p-4"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : `claim-${claim.id}`)
                      }
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${CLAIM_STATUS_BADGE[claim.status]}`}
                          >
                            {claim.status}
                          </span>
                        </div>
                        <p className="font-semibold text-gray-900">
                          {claim.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          Lost at: {claim.lostLocation ?? "Not specified"}
                        </p>
                        <p className="font-mono text-xs text-gray-400">
                          Claim #{claim.id.slice(-6).toUpperCase()}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      )}
                    </div>
                    {isExpanded && (
                      <div className="space-y-2 border-t bg-gray-50 p-4">
                        <p className="text-xs text-gray-400">
                          Submitted:{" "}
                          {new Date(claim.createdAt).toLocaleString()}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {claim.status === "OPEN" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateClaimStatusMutation.mutate({
                                    id: claim.id,
                                    status: "MATCHED",
                                  })
                                }
                                disabled={updateClaimStatusMutation.isPending}
                              >
                                Match Item
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:border-red-300"
                                onClick={() =>
                                  updateClaimStatusMutation.mutate({
                                    id: claim.id,
                                    status: "CLOSED",
                                  })
                                }
                                disabled={updateClaimStatusMutation.isPending}
                              >
                                Close
                              </Button>
                            </>
                          )}
                          {claim.status === "MATCHED" && (
                            <Button
                              size="sm"
                              className="bg-green-600 text-white hover:bg-green-700"
                              onClick={() =>
                                updateClaimStatusMutation.mutate({
                                  id: claim.id,
                                  status: "COLLECTING",
                                })
                              }
                              disabled={updateClaimStatusMutation.isPending}
                            >
                              Ready for Pickup
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
