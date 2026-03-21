"use client";

import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { formatCurrency, formatDate } from "@repo/shared";
import Link from "next/link";

function MetricCard({
  label,
  value,
  sub,
  color = "text-gray-900",
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <p className="mb-1 text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="mt-1 text-sm text-gray-400">{sub}</p>}
    </div>
  );
}

export default function HotelDashboard() {
  const { user } = useAuthStore();
  const hotelId = user?.hotelId;

  type DashboardData = {
    occupancyRate: number;
    occupancyToday: number;
    revenueMTDCents: number;
    revenueMtdCents: number;
    openCasesCount: number;
    openCases: number;
    criticalCases: number;
    upcomingEvents: {
      id: string;
      title: string;
      eventDate: Date;
      guestCount: number;
      beo?: { status: string } | null;
    }[];
    insights: {
      id: string;
      insightType: string;
      description: string;
      createdAt: Date;
    }[];
    recentInsights: {
      id: string;
      title: string;
      insightType: string;
      description: string;
      severity: string;
      createdAt: Date;
    }[];
    currency: string;
  };

  const { data: rawData, isLoading } = trpc.analytics.hotelDashboard.useQuery(
    { hotelId: hotelId! },
    { enabled: !!hotelId },
  );
  const data = rawData as DashboardData | undefined;

  if (!hotelId) {
    return (
      <div className="py-20 text-center text-gray-500">
        No hotel assigned to your account. Contact your administrator.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-20 text-center text-gray-400">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <span className="text-sm text-gray-400">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          label="Guests In-House"
          value={data?.occupancyToday ?? 0}
          sub="checked in today"
          color="text-blue-600"
        />
        <MetricCard
          label="Revenue (MTD)"
          value={formatCurrency(data?.revenueMtdCents ?? 0)}
          sub="month to date"
          color="text-green-600"
        />
        <MetricCard
          label="Open Cases"
          value={data?.openCases ?? 0}
          sub={`${data?.criticalCases ?? 0} critical`}
          color={
            (data?.criticalCases ?? 0) > 0 ? "text-red-600" : "text-gray-900"
          }
        />
      </div>

      {/* Upcoming Events */}
      {(data?.upcomingEvents?.length ?? 0) > 0 && (
        <div className="rounded-xl border bg-white">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold text-gray-900">Upcoming Events</h2>
          </div>
          <div className="divide-y">
            {data!.upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between px-5 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {event.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(event.eventDate)} · {event.guestCount} guests
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {event.beo ? (
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        event.beo.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : event.beo.status === "DRAFT"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      BEO: {event.beo.status}
                    </span>
                  ) : (
                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-600">
                      No BEO
                    </span>
                  )}
                  <Link
                    href={`/hotel/events/${event.id}`}
                    className="text-xs text-[#1a1a2e] underline"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      {(data?.recentInsights?.length ?? 0) > 0 && (
        <div className="rounded-xl border bg-white">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold text-gray-900">
              Operational Insights
            </h2>
          </div>
          <div className="divide-y">
            {data!.recentInsights.map((insight) => (
              <div key={insight.id} className="px-5 py-3">
                <div className="flex items-start gap-3">
                  <span className="text-lg">
                    {insight.severity === "critical"
                      ? "🔴"
                      : insight.severity === "warning"
                        ? "⚠️"
                        : "ℹ️"}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {insight.title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "View Bookings", href: "/hotel/bookings", icon: "📅" },
          { label: "Support Queue", href: "/hotel/support", icon: "🎫" },
          { label: "Approvals", href: "/hotel/approvals", icon: "✅" },
          { label: "Analytics", href: "/hotel/analytics", icon: "📈" },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group rounded-xl border bg-white p-4 text-center transition-colors hover:border-[#1a1a2e]"
          >
            <div className="mb-2 text-2xl">{action.icon}</div>
            <p className="text-sm font-medium text-gray-700 group-hover:text-[#1a1a2e]">
              {action.label}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
