"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Building2, AlertCircle, CheckCircle } from "lucide-react";

type TenantStatus = "ACTIVE" | "SUSPENDED" | "TRIAL";

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  SUSPENDED: "bg-red-100 text-red-600",
  TRIAL: "bg-yellow-100 text-yellow-700",
};

const BILLING_PLANS = ["starter", "professional", "enterprise"];

export default function TenantsPage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    billingPlan: "starter",
  });

  const { data: tenantsRaw, isLoading, refetch } = trpc.tenant.list.useQuery();
  const tenants = tenantsRaw as
    | Array<{
        id: string;
        name: string;
        slug: string;
        status: string;
        billingPlan: string;
        createdAt: string;
      }>
    | undefined;

  const createMutation = trpc.tenant.create.useMutation({
    onSuccess: () => {
      toast.success("Tenant created!");
      setOpen(false);
      setForm({ name: "", slug: "", billingPlan: "starter" });
      void refetch();
    },
    onError: (e: any) => toast.error(e.message || "An error occurred"),
  });

  const suspendMutation = trpc.tenant.suspend.useMutation({
    onSuccess: () => {
      toast.success("Tenant suspended.");
      void refetch();
    },
    onError: (e: any) => toast.error(e.message || "An error occurred"),
  });

  const activateMutation = trpc.tenant.activate.useMutation({
    onSuccess: () => {
      toast.success("Tenant activated!");
      void refetch();
    },
    onError: (e: any) => toast.error(e.message || "An error occurred"),
  });

  const handleSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
        <Button
          onClick={() => setOpen(true)}
          className="bg-[#1a1a2e] hover:bg-[#16213e]"
        >
          <Plus className="mr-2 h-4 w-4" /> New Tenant
        </Button>
      </div>

      {/* Summary */}
      {tenants && (
        <div className="grid grid-cols-3 gap-4">
          {(["ACTIVE", "SUSPENDED", "TRIAL"] as TenantStatus[]).map(
            (s: any) => {
              const count = tenants.filter((t) => t.status === s).length;
              return (
                <div key={s} className="rounded-xl border bg-white p-4">
                  <p className="text-sm text-gray-500">
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </p>
                  <p
                    className={`text-2xl font-bold ${s === "ACTIVE" ? "text-green-600" : s === "SUSPENDED" ? "text-red-600" : "text-yellow-600"}`}
                  >
                    {count}
                  </p>
                </div>
              );
            },
          )}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : !tenants?.length ? (
        <div className="py-16 text-center">
          <Building2 className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">No tenants yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <div className="divide-y">
            {tenants.map((t: any) => (
              <div
                key={t.id}
                className="flex items-center justify-between px-5 py-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{t.name}</p>
                    <Badge variant="outline" className="text-xs">
                      {t.billingPlan}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400">
                    /{t.slug} · ID: {t.id.slice(0, 8)}...
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[t.status] ?? ""}`}
                  >
                    {t.status}
                  </span>
                  {t.status === "ACTIVE" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-xs text-red-600 hover:bg-red-50"
                      onClick={() => suspendMutation.mutate({ id: t.id })}
                      disabled={suspendMutation.isPending}
                    >
                      <AlertCircle className="mr-1 h-3.5 w-3.5" /> Suspend
                    </Button>
                  ) : t.status === "SUSPENDED" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-200 text-xs text-green-700 hover:bg-green-50"
                      onClick={() => activateMutation.mutate({ id: t.id })}
                      disabled={activateMutation.isPending}
                    >
                      <CheckCircle className="mr-1 h-3.5 w-3.5" /> Activate
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Tenant</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate(form);
            }}
          >
            <div>
              <label className="mb-1 block text-sm font-medium">Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                    slug: handleSlug(e.target.value),
                  })
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="Acme Hotels"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Slug *</label>
              <input
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 font-mono text-sm"
                placeholder="acme-hotels"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Billing Plan
              </label>
              <select
                value={form.billingPlan}
                onChange={(e) =>
                  setForm({ ...form, billingPlan: e.target.value })
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                {BILLING_PLANS.map((p: any) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
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
