"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@repo/shared";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart2, TrendingUp, Users, Star, AlertCircle } from "lucide-react";

const today = new Date().toISOString().split("T")[0]!;
const monthAgo = new Date(Date.now() - 30 * 86400000)
  .toISOString()
  .split("T")[0]!;

export default function AdminAnalyticsPage() {
  const [selectedHotelId, setSelectedHotelId] = useState<string>("");

  const { data: hotelsData, isLoading: loadingHotels } =
    trpc.hotel.list.useQuery({ page: 1, pageSize: 100 });

  const { data: dashboard, isLoading: loadingDash } =
    trpc.analytics.hotelDashboard.useQuery(
      { hotelId: selectedHotelId },
      { enabled: !!selectedHotelId },
    );
  const { data: trend, isLoading: loadingTrend } =
    trpc.analytics.occupancyTrend.useQuery(
      { hotelId: selectedHotelId, days: 14 },
      { enabled: !!selectedHotelId },
    );
  const { data: caseMetrics, isLoading: loadingCases } =
    trpc.analytics.caseMetrics.useQuery(
      { hotelId: selectedHotelId, from: monthAgo, to: today },
      { enabled: !!selectedHotelId },
    );

  const maxBookings = trend ? Math.max(...trend.map((d) => d.bookings), 1) : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-6 w-6 text-[#1a1a2e]" />
          <h1 className="text-2xl font-bold text-gray-900">
            Platform Analytics
          </h1>
        </div>
        <div className="w-64">
          {loadingHotels ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={selectedHotelId} onValueChange={setSelectedHotelId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a hotel..." />
              </SelectTrigger>
              <SelectContent>
                {hotelsData?.items.map((h: { id: string; name: string }) => (
                  <SelectItem key={h.id} value={h.id}>
                    {h.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {!selectedHotelId ? (
        <div className="py-16 text-center">
          <BarChart2 className="mx-auto mb-4 h-12 w-12 text-gray-200" />
          <p className="text-gray-400">Select a hotel to view its analytics.</p>
        </div>
      ) : (
        <>
          {/* KPIs */}
          {loadingDash ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                {
                  label: "Guests In-House",
                  value: dashboard?.occupancyToday ?? 0,
                  sub: "today",
                  icon: Users,
                  color: "text-blue-600",
                },
                {
                  label: "Revenue MTD",
                  value: formatCurrency(dashboard?.revenueMtdCents ?? 0),
                  sub: "month to date",
                  icon: TrendingUp,
                  color: "text-green-600",
                },
                {
                  label: "Open Cases",
                  value: dashboard?.openCases ?? 0,
                  sub: `${dashboard?.criticalCases ?? 0} critical`,
                  icon: AlertCircle,
                  color:
                    (dashboard?.criticalCases ?? 0) > 0
                      ? "text-red-600"
                      : "text-gray-600",
                },
                {
                  label: "Cases (30d)",
                  value: caseMetrics?.total ?? 0,
                  sub: `avg ${caseMetrics?.avgResolutionHours ?? 0}h resolution`,
                  icon: Star,
                  color: "text-purple-600",
                },
              ].map(({ label, value, sub, icon: Icon, color }) => (
                <div key={label} className="rounded-xl border bg-white p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">{label}</p>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
                  <p className="mt-1 text-xs text-gray-400">{sub}</p>
                </div>
              ))}
            </div>
          )}

          {/* Occupancy trend */}
          <div className="rounded-xl border bg-white p-6">
            <h2 className="mb-4 font-semibold text-gray-900">
              14-Day Occupancy Trend
            </h2>
            {loadingTrend ? (
              <Skeleton className="h-40 w-full" />
            ) : !trend?.length ? (
              <p className="py-8 text-center text-gray-400">
                No data available.
              </p>
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
                      className="rotate-45 text-gray-400"
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

          {/* Case breakdown */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border bg-white p-6">
              <h2 className="mb-4 font-semibold text-gray-900">
                Cases by Severity
              </h2>
              {loadingCases ? (
                <Skeleton className="h-32" />
              ) : caseMetrics?.bySeverity &&
                Object.keys(caseMetrics.bySeverity).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(caseMetrics.bySeverity).map(
                    ([sev, count]) => {
                      const pct = Math.round(
                        (count / (caseMetrics.total || 1)) * 100,
                      );
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
                    },
                  )}
                </div>
              ) : (
                <p className="text-center text-sm text-gray-400">
                  No cases this period.
                </p>
              )}
            </div>
            <div className="rounded-xl border bg-white p-6">
              <h2 className="mb-4 font-semibold text-gray-900">
                Cases by Category
              </h2>
              {loadingCases ? (
                <Skeleton className="h-32" />
              ) : caseMetrics?.byCategory &&
                Object.keys(caseMetrics.byCategory).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(caseMetrics.byCategory)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 8)
                    .map(([cat, count]) => (
                      <div
                        key={cat}
                        className="flex items-center justify-between"
                      >
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
        </>
      )}
    </div>
  );
}
