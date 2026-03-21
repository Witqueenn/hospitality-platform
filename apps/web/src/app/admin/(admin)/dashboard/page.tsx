"use client";

import { trpc } from "@/lib/trpc";

type TenantItem = {
  id: string;
  name: string;
  slug: string;
  status: string;
  billingPlan: string;
};

export default function AdminDashboard() {
  const { data: tenantsRaw } = trpc.tenant.list.useQuery();
  const tenants = tenantsRaw as TenantItem[] | undefined;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Total Tenants</p>
          <p className="text-3xl font-bold text-amber-600">
            {tenants?.length ?? 0}
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-white">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">Tenants</h2>
        </div>
        <div className="divide-y">
          {tenants?.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between px-5 py-3"
            >
              <div>
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-xs text-gray-500">
                  {t.slug} · {t.billingPlan}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs ${
                  t.status === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : t.status === "SUSPENDED"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {t.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
