"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { formatDate } from "@repo/shared";

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-700",
  HIGH: "bg-orange-100 text-orange-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-gray-100 text-gray-600",
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-purple-100 text-purple-700",
  AWAITING_HOTEL: "bg-yellow-100 text-yellow-700",
  AWAITING_GUEST: "bg-cyan-100 text-cyan-700",
  AWAITING_APPROVAL: "bg-orange-100 text-orange-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-600",
  ESCALATED: "bg-red-100 text-red-700",
};

type CaseItem = {
  id: string;
  caseRef: string;
  title: string;
  category: string;
  severity: string;
  status: string;
  createdAt: Date;
  guest: { name: string };
};

export default function SupportCasesPage() {
  const { user } = useAuthStore();
  const hotelId = user?.hotelId;
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [severityFilter, setSeverityFilter] = useState<string>("");

  const { data: rawData, isLoading } = trpc.supportCase.list.useQuery(
    {
      hotelId: hotelId ?? undefined,
      status: (statusFilter || undefined) as
        | "OPEN"
        | "IN_PROGRESS"
        | "AWAITING_APPROVAL"
        | "RESOLVED"
        | "CLOSED"
        | "ESCALATED"
        | undefined,
      severity: (severityFilter || undefined) as
        | "LOW"
        | "MEDIUM"
        | "HIGH"
        | "CRITICAL"
        | undefined,
    },
    { enabled: !!hotelId },
  );
  const data = rawData as { items: CaseItem[]; total: number } | undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Support Cases</h1>
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">All Status</option>
            {[
              "OPEN",
              "IN_PROGRESS",
              "AWAITING_HOTEL",
              "AWAITING_APPROVAL",
              "RESOLVED",
              "ESCALATED",
            ].map((s: any) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">All Severity</option>
            {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((s: any) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-gray-400">Loading cases...</div>
      ) : !data?.items.length ? (
        <div className="py-20 text-center text-gray-400">No cases found</div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Case
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Guest
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Category
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Severity
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Created
                </th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.items.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{c.caseRef}</p>
                    <p className="max-w-[200px] truncate text-xs text-gray-500">
                      {c.title}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{c.guest.name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.category.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${SEVERITY_COLORS[c.severity] ?? ""}`}
                    >
                      {c.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLORS[c.status] ?? ""}`}
                    >
                      {c.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(c.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/hotel/support/${c.id}`}
                      className="text-xs text-[#1a1a2e] hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t px-4 py-3 text-sm text-gray-500">
            {data.total} total cases
          </div>
        </div>
      )}
    </div>
  );
}
