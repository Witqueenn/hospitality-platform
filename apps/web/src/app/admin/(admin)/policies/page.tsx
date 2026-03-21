"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ShieldCheck, Plus, Pencil, Building2 } from "lucide-react";

const SUGGESTED_KEYS = [
  "max_cancellation_days",
  "auto_compensation_threshold_cents",
  "sla_response_hours",
  "sla_resolution_hours",
  "allow_guest_self_checkin",
  "review_auto_approve",
  "nightlife_age_minimum",
];

export default function PoliciesPage() {
  const [selectedTenantId, setSelectedTenantId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    policyKey: "",
    policyValue: "",
    description: "",
  });

  const { data: tenantsRaw, isLoading: loadingTenants } =
    trpc.tenant.list.useQuery();
  const tenants = tenantsRaw as
    | Array<{ id: string; name: string; slug: string }>
    | undefined;

  const {
    data: policies,
    isLoading: loadingPolicies,
    refetch,
  } = trpc.tenant.listPolicies.useQuery(
    { tenantId: selectedTenantId },
    { enabled: !!selectedTenantId },
  );

  const upsertMutation = trpc.tenant.upsertPolicy.useMutation({
    onSuccess: () => {
      toast.success("Policy saved!");
      setOpen(false);
      setForm({ policyKey: "", policyValue: "", description: "" });
      void refetch();
    },
    onError: (e: any) => toast.error(e.message || "An error occurred"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let parsed: unknown = form.policyValue;
    try {
      parsed = JSON.parse(form.policyValue);
    } catch {
      /* keep as string */
    }
    upsertMutation.mutate({
      tenantId: selectedTenantId,
      policyKey: form.policyKey,
      policyValue: parsed,
      description: form.description || undefined,
    });
  };

  const openEdit = (policy: {
    policyKey: string;
    policyValue: unknown;
    description?: string | null;
  }) => {
    setForm({
      policyKey: policy.policyKey,
      policyValue: JSON.stringify(policy.policyValue),
      description: policy.description ?? "",
    });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-[#1a1a2e]" />
          <h1 className="text-2xl font-bold text-gray-900">Tenant Policies</h1>
        </div>
        {selectedTenantId && (
          <Button
            onClick={() => {
              setForm({ policyKey: "", policyValue: "", description: "" });
              setOpen(true);
            }}
            className="bg-[#1a1a2e] hover:bg-[#16213e]"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Policy
          </Button>
        )}
      </div>

      {/* Tenant selector */}
      <div className="rounded-xl border bg-white p-4">
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
          <Building2 className="h-4 w-4" /> Select Tenant
        </label>
        {loadingTenants ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <select
            value={selectedTenantId}
            onChange={(e) => setSelectedTenantId(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">— Choose a tenant —</option>
            {tenants?.map((t: any) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.slug})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Policies list */}
      {!selectedTenantId ? (
        <div className="py-12 text-center">
          <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-gray-200" />
          <p className="text-gray-400">
            Select a tenant to manage their policies.
          </p>
        </div>
      ) : loadingPolicies ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : !policies?.length ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="text-sm text-gray-400">No policies configured yet.</p>
          <p className="mt-1 text-xs text-gray-300">
            Default platform policies apply.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <div className="divide-y">
            {policies.map((p: any) => (
              <div
                key={p.policyKey}
                className="flex items-center justify-between px-5 py-4"
              >
                <div>
                  <p className="font-mono text-sm font-medium text-gray-900">
                    {p.policyKey}
                  </p>
                  {p.description && (
                    <p className="text-xs text-gray-400">{p.description}</p>
                  )}
                  <p className="mt-1 inline-block rounded bg-gray-50 px-2 py-0.5 font-mono text-xs text-gray-600">
                    {JSON.stringify(p.policyValue)}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {form.policyKey &&
              policies?.some((p) => p.policyKey === form.policyKey)
                ? "Edit Policy"
                : "Add Policy"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Policy Key *
              </label>
              <input
                required
                value={form.policyKey}
                onChange={(e) =>
                  setForm({ ...form, policyKey: e.target.value })
                }
                className="w-full rounded-lg border px-3 py-2 font-mono text-sm"
                placeholder="e.g. sla_response_hours"
                list="policy-key-suggestions"
              />
              <datalist id="policy-key-suggestions">
                {SUGGESTED_KEYS.map((k) => (
                  <option key={k} value={k} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Value (JSON) *
              </label>
              <input
                required
                value={form.policyValue}
                onChange={(e) =>
                  setForm({ ...form, policyValue: e.target.value })
                }
                className="w-full rounded-lg border px-3 py-2 font-mono text-sm"
                placeholder='e.g. 24 or "strict" or true'
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Description
              </label>
              <input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="Human-readable explanation"
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
                disabled={upsertMutation.isPending}
              >
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
