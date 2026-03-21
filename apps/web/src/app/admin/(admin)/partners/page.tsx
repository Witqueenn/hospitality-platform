"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Handshake, Plus } from "lucide-react";

const PARTNER_TYPES = [
  "HOTEL",
  "MOBILITY",
  "EXPERIENCE",
  "AMENITY",
  "TRUSTED_STAY_HOST",
  "OTHER",
] as const;
const PARTNER_TYPE_LABELS: Record<string, string> = {
  HOTEL: "Hotel",
  MOBILITY: "Mobility",
  EXPERIENCE: "Experience",
  AMENITY: "Amenity",
  TRUSTED_STAY_HOST: "Trusted Stay",
  OTHER: "Other",
};

type PartnerForm = {
  name: string;
  slug: string;
  partnerType: string;
  contactEmail: string;
  contactName: string;
};

const EMPTY_FORM: PartnerForm = {
  name: "",
  slug: "",
  partnerType: "HOTEL",
  contactEmail: "",
  contactName: "",
};

export default function PartnersAdminPage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<PartnerForm>(EMPTY_FORM);

  const { data: partners, isLoading, refetch } = trpc.partner.list.useQuery();

  const createMutation = (trpc.partner.create as any).useMutation({
    onSuccess: () => {
      toast.success("Partner created!");
      setOpen(false);
      void refetch();
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: form.name,
      slug: form.slug,
      partnerType: form.partnerType as any,
      contactInfo: {
        name: form.contactName || undefined,
        email: form.contactEmail || undefined,
      },
    });
  };

  const list = (partners as any[]) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Handshake className="h-7 w-7 text-[#1a1a2e]" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Partner Management
            </h1>
            <p className="text-sm text-gray-500">
              Manage platform partners and commission rules
            </p>
          </div>
        </div>
        <Button
          onClick={() => {
            setForm(EMPTY_FORM);
            setOpen(true);
          }}
          className="bg-[#1a1a2e] hover:bg-[#16213e]"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Partner
        </Button>
      </div>

      {!isLoading && list.length > 0 && (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
          {PARTNER_TYPES.map((type) => (
            <div
              key={type}
              className="rounded-xl border bg-white p-3 text-center"
            >
              <p className="text-xl font-bold text-[#1a1a2e]">
                {list.filter((p: any) => p.partnerType === type).length}
              </p>
              <p className="text-xs text-gray-400">
                {PARTNER_TYPE_LABELS[type]}
              </p>
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="py-20 text-center">
          <Handshake className="mx-auto mb-4 h-12 w-12 text-gray-200" />
          <p className="text-gray-500">No partners yet.</p>
          <Button
            className="mt-4 bg-[#1a1a2e]"
            onClick={() => {
              setForm(EMPTY_FORM);
              setOpen(true);
            }}
          >
            Add first partner
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((p: any) => (
            <div
              key={p.id}
              className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1a1a2e]/10">
                <Handshake className="h-6 w-6 text-[#1a1a2e]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{p.name}</p>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                    {PARTNER_TYPE_LABELS[p.partnerType] ?? p.partnerType}
                  </span>
                  {p.isActive && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                      Active
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex gap-3 text-xs text-gray-400">
                  <span>Slug: {p.slug}</span>
                  <span>{p._count?.commissionRules ?? 0} commission rules</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Partner</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Slug *</label>
                <input
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="partner-slug"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Type *</label>
                <select
                  value={form.partnerType}
                  onChange={(e) =>
                    setForm({ ...form, partnerType: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  {PARTNER_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {PARTNER_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) =>
                    setForm({ ...form, contactEmail: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Contact Name
                </label>
                <input
                  value={form.contactName}
                  onChange={(e) =>
                    setForm({ ...form, contactName: e.target.value })
                  }
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
