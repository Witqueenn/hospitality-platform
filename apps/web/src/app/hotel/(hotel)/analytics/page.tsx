"use client";

import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { formatCurrency } from "@repo/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Users, Star, AlertCircle, BarChart2 } from "lucide-react";

const today = new Date().toISOString().split("T")[0]!;
const monthAgo = new Date(Date.now() - 30 * 86400000)
  .toISOString()
  .split("T")[0]!;

function KPICard({
  label,
  value,
  sub,
  icon: Icon,
  color = "text-gray-900",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<any>;
  color?: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{label}</p>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const hotelId = user?.hotelId ?? "";

  const { data: dashboard, isLoading: loadingDash } =
    trpc.analytics.hotelDashboard.useQuery({ hotelId }, { enabled: !!hotelId });
  const { data: trend, isLoading: loadingTrend } =
    trpc.analytics.occupancyTrend.useQuery(
      { hotelId, days: 14 },
      { enabled: !!hotelId },
    );
  const { data: caseMetrics, isLoading: loadingCases } =
    trpc.analytics.caseMetrics.useQuery(
      { hotelId, from: monthAgo, to: today },
      { enabled: !!hotelId },
    );

  if (!hotelId) {
    return (
      <div className="py-20 text-center text-gray-400">No hotel assigned.</div>
    );
  }

  const isLoading = loadingDash || loadingTrend || loadingCases;
  const maxBookings = trend ? Math.max(...trend.map((d) => d.bookings), 1) : 1;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <BarChart2 className="h-6 w-6 text-[#1a1a2e]" />
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <span className="ml-2 text-sm text-gray-400">Last 30 days</span>
      </div>

      {/* KPIs */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <KPICard
            label="Guests In-House"
            value={dashboard?.occupancyToday ?? 0}
            sub="checked in today"
            icon={Users}
            color="text-blue-600"
          />
          <KPICard
            label="Revenue MTD"
            value={formatCurrency(dashboard?.revenueMtdCents ?? 0)}
            sub="month to date"
            icon={TrendingUp}
            color="text-green-600"
          />
          <KPICard
            label="Open Cases"
            value={dashboard?.openCases ?? 0}
            sub={`${dashboard?.criticalCases ?? 0} critical`}
            icon={AlertCircle}
            color={
              (dashboard?.criticalCases ?? 0) > 0
                ? "text-red-600"
                : "text-gray-600"
            }
          />
          <KPICard
            label="Support Cases (30d)"
            value={caseMetrics?.total ?? 0}
            sub={`avg ${caseMetrics?.avgResolutionHours ?? 0}h resolution`}
            icon={Star}
            color="text-purple-600"
          />
        </div>
      )}

      {/* Occupancy Trend */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 font-semibold text-gray-900">
          Occupancy Trend (14 days)
        </h2>
        {loadingTrend ? (
          <Skeleton className="h-40 w-full" />
        ) : !trend?.length ? (
          <p className="py-8 text-center text-gray-400">No data available.</p>
        ) : (
          <div className="flex items-end gap-1.5" style={{ height: 160 }}>
            {trend.map((d) => (
              <div
                key={d.date}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <div
                  className="w-full rounded-t bg-[#1a1a2e] transition-all"
                  style={{
                    height: `${(d.bookings / maxBookings) * 120}px`,
                    minHeight: 4,
                  }}
                  title={`${d.bookings} bookings`}
                />
                <p
                  className="rotate-45 text-xs text-gray-400"
                  style={{ fontSize: 9 }}
                >
                  {new Date(d.date!).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Case Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* By Severity */}
        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900">
            Cases by Severity (30d)
          </h2>
          {loadingCases ? (
            <Skeleton className="h-32 w-full" />
          ) : caseMetrics?.bySeverity &&
            Object.keys(caseMetrics.bySeverity).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(caseMetrics.bySeverity).map(([sev, count]) => {
                const total = caseMetrics.total || 1;
                const pct = Math.round((count / total) * 100);
                const colors: Record<string, string> = {
                  CRITICAL: "bg-red-500",
                  HIGH: "bg-orange-400",
                  MEDIUM: "bg-yellow-400",
                  LOW: "bg-gray-300",
                };
                return (
                  <div key={sev}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-gray-700">{sev}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${colors[sev] ?? "bg-gray-400"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-sm text-gray-400">
              No cases this period.
            </p>
          )}
        </div>

        {/* By Category */}
        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900">
            Cases by Category (30d)
          </h2>
          {loadingCases ? (
            <Skeleton className="h-32 w-full" />
          ) : caseMetrics?.byCategory &&
            Object.keys(caseMetrics.byCategory).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(caseMetrics.byCategory)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 8)
                .map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {cat.replace(/_/g, " ")}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-[#1a1a2e]"
                          style={{
                            width: `${(count / (caseMetrics.total || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="w-4 text-right text-sm font-medium text-gray-700">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-center text-sm text-gray-400">
              No cases this period.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
