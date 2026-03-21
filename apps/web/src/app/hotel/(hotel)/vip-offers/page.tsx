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
import { Crown, Plus, Calendar, Pencil } from "lucide-react";

type OfferForm = {
  title: string;
  description: string;
  offerType: string;
  startsAt: string;
  endsAt: string;
};

const EMPTY_FORM: OfferForm = {
  title: "",
  description: "",
  offerType: "DISCOUNT",
  startsAt: "",
  endsAt: "",
};

export default function VipOffersPage() {
  const { user } = useAuthStore();
  const hotelId = user?.hotelId ?? "";
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<OfferForm>(EMPTY_FORM);

  const {
    data: offers,
    isLoading,
    refetch,
  } = trpc.vip.listOffers.useQuery({ hotelId }, { enabled: !!hotelId });

  const createMutation = (trpc.vip.createOffer as any).useMutation({
    onSuccess: () => {
      toast.success("VIP offer created!");
      setOpen(false);
      void refetch();
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      hotelId,
      title: form.title,
      description: form.description || undefined,
      offerType: form.offerType,
      startsAt: form.startsAt
        ? new Date(form.startsAt).toISOString()
        : undefined,
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
    });
  };

  const list = (offers as any[]) ?? [];

  if (!hotelId) return <p className="text-gray-400">No hotel assigned.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">VIP Offers</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Create exclusive offers and perks for VIP members
          </p>
        </div>
        <Button
          onClick={() => {
            setForm(EMPTY_FORM);
            setOpen(true);
          }}
          className="bg-[#1a1a2e] hover:bg-[#16213e]"
        >
          <Plus className="mr-2 h-4 w-4" /> New Offer
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
          <Crown className="mx-auto mb-4 h-12 w-12 text-gray-200" />
          <p className="text-gray-500">No VIP offers yet.</p>
          <Button
            className="mt-4 bg-[#1a1a2e]"
            onClick={() => {
              setForm(EMPTY_FORM);
              setOpen(true);
            }}
          >
            Create first offer
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((offer: any) => (
            <div
              key={offer.id}
              className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                <Crown className="h-6 w-6 text-amber-500" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{offer.title}</p>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                    {offer.offerType}
                  </span>
                  {offer.isActive && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                      Active
                    </span>
                  )}
                </div>
                {(offer.startsAt || offer.endsAt) && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="h-3 w-3" />
                    {offer.startsAt
                      ? new Date(offer.startsAt).toLocaleDateString()
                      : "—"}
                    {" — "}
                    {offer.endsAt
                      ? new Date(offer.endsAt).toLocaleDateString()
                      : "Ongoing"}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New VIP Offer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Title *</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="e.g. Complimentary Late Check-out"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Offer Type
              </label>
              <select
                value={form.offerType}
                onChange={(e) =>
                  setForm({ ...form, offerType: e.target.value })
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value="DISCOUNT">Discount</option>
                <option value="UPGRADE">Room Upgrade</option>
                <option value="PERK">Free Perk</option>
                <option value="ACCESS">Special Access</option>
                <option value="OTHER">Other</option>
              </select>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Starts At
                </label>
                <input
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) =>
                    setForm({ ...form, startsAt: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Ends At
                </label>
                <input
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
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
