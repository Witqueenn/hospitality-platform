"use client";

import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  Building2,
  Users,
  Hotel,
  ShieldAlert,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  ArrowRight,
} from "lucide-react";

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  SUSPENDED: "bg-red-100 text-red-700",
  TRIAL: "bg-yellow-100 text-yellow-700",
  INACTIVE: "bg-gray-100 text-gray-500",
};

const BILLING_LABELS: Record<string, string> = {
  starter: "Starter",
  professional: "Professional",
  enterprise: "Enterprise",
};

const QUICK_LINKS = [
  {
    label: "Tenants",
    href: "/admin/tenants",
    icon: Building2,
    description: "Manage hotel groups & billing",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "Hotels",
    href: "/admin/hotels",
    icon: Hotel,
    description: "Review & activate properties",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
    description: "Platform user management",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    label: "Support Cases",
    href: "/admin/cases",
    icon: ShieldAlert,
    description: "Escalated & critical cases",
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    label: "Settlements",
    href: "/admin/settlements",
    icon: TrendingUp,
    description: "Partner payouts & batches",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    label: "Partners",
    href: "/admin/partners",
    icon: Activity,
    description: "Mobility, amenity & experience partners",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
];

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  color = "text-gray-900",
  loading,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color?: string;
  loading?: boolean;
}) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      {loading ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        <>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
        </>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { data: tenantsRaw, isLoading: tenantsLoading } =
    trpc.tenant.list.useQuery();
  const tenants = tenantsRaw as
    | {
        id: string;
        name: string;
        slug: string;
        status: string;
        billingPlan: string;
        createdAt: Date | string;
      }[]
    | undefined;

  const { data: hotelsRaw, isLoading: hotelsLoading } =
    trpc.hotel.list.useQuery({ page: 1, pageSize: 5 });
  const hotels = hotelsRaw as
    | {
        items: {
          id: string;
          name: string;
          city: string;
          country: string;
          status: string;
          ratingAggregate: number | null;
        }[];
        total: number;
      }
    | undefined;

  const { data: casesRaw, isLoading: casesLoading } =
    trpc.supportCase.list.useQuery({
      status: "ESCALATED" as any,
      page: 1,
      pageSize: 5,
    });
  const cases = casesRaw as
    | {
        items: {
          id: string;
          caseRef: string;
          title: string;
          severity: string;
          createdAt: Date | string;
          guest: { name: string };
          hotel?: { name: string } | null;
        }[];
        total: number;
      }
    | undefined;

  const activeCount = tenants?.filter((t) => t.status === "ACTIVE").length ?? 0;
  const trialCount = tenants?.filter((t) => t.status === "TRIAL").length ?? 0;
  const suspendedCount =
    tenants?.filter((t) => t.status === "SUSPENDED").length ?? 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Platform Overview
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard
          label="Total Tenants"
          value={tenants?.length ?? 0}
          sub={`${activeCount} active · ${trialCount} trial`}
          icon={Building2}
          color="text-[#1a1a2e]"
          loading={tenantsLoading}
        />
        <MetricCard
          label="Active Hotels"
          value={hotels?.total ?? 0}
          sub="across all tenants"
          icon={Hotel}
          color="text-green-600"
          loading={hotelsLoading}
        />
        <MetricCard
          label="Suspended Tenants"
          value={suspendedCount}
          sub="require attention"
          icon={XCircle}
          color={suspendedCount > 0 ? "text-red-600" : "text-gray-400"}
          loading={tenantsLoading}
        />
        <MetricCard
          label="Escalated Cases"
          value={cases?.total ?? 0}
          sub="platform-wide"
          icon={ShieldAlert}
          color={(cases?.total ?? 0) > 0 ? "text-red-600" : "text-gray-400"}
          loading={casesLoading}
        />
      </div>

      {/* Quick links */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-gray-800">
          Quick Access
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex flex-col gap-2 rounded-xl border bg-white p-4 transition hover:border-[#1a1a2e]/30 hover:shadow-sm"
            >
              <div className={`w-fit rounded-lg p-2 ${link.bg}`}>
                <link.icon className={`h-5 w-5 ${link.color}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {link.label}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {link.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent tenants */}
      <div className="rounded-xl border bg-white">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-semibold text-gray-900">Tenants</h2>
          <Link
            href="/admin/tenants"
            className="flex items-center gap-1 text-xs text-[#1a1a2e] hover:underline"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {tenantsLoading ? (
          <div className="divide-y">
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-5 py-3">
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : !tenants?.length ? (
          <div className="px-5 py-8 text-center text-sm text-gray-400">
            No tenants yet.
          </div>
        ) : (
          <div className="divide-y">
            {tenants.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between px-5 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-500">
                    {t.slug} · {BILLING_LABELS[t.billingPlan] ?? t.billingPlan}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[t.status] ?? "bg-gray-100 text-gray-500"}`}
                >
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Escalated cases */}
      {(cases?.total ?? 0) > 0 && (
        <div className="rounded-xl border bg-white">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-semibold text-gray-900">Escalated Cases</h2>
            <Link
              href="/admin/cases"
              className="flex items-center gap-1 text-xs text-[#1a1a2e] hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y">
            {(casesLoading ? [] : (cases?.items ?? [])).map((c: any) => (
              <div key={c.id} className="flex items-center gap-3 px-5 py-3">
                <span
                  className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    c.severity === "CRITICAL"
                      ? "bg-red-100 text-red-700"
                      : c.severity === "HIGH"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {c.severity}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {c.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {c.guest?.name}
                    {c.hotel ? ` · ${c.hotel.name}` : ""}
                  </p>
                </div>
                <span className="flex-shrink-0 text-xs text-gray-400">
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent hotels */}
      {(hotels?.total ?? 0) > 0 && (
        <div className="rounded-xl border bg-white">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-semibold text-gray-900">Recent Hotels</h2>
            <Link
              href="/admin/hotels"
              className="flex items-center gap-1 text-xs text-[#1a1a2e] hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y">
            {(hotelsLoading ? [] : (hotels?.items ?? [])).map((h: any) => (
              <div
                key={h.id}
                className="flex items-center justify-between px-5 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{h.name}</p>
                  <p className="text-xs text-gray-500">
                    {h.city}, {h.country}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    h.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : h.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {h.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
