"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { formatDate, formatCurrency } from "@repo/shared";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  CHECKED_IN: "bg-green-100 text-green-700",
  CHECKED_OUT: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-100 text-red-700",
  NO_SHOW: "bg-red-100 text-red-700",
};

type BookingItem = {
  id: string;
  bookingRef: string;
  status: string;
  checkIn: Date;
  checkOut: Date;
  guestCount: number;
  totalCents: number;
  currency: string;
  guest: { name: string };
};

export default function HotelBookingsPage() {
  const { user } = useAuthStore();
  const hotelId = user?.hotelId;
  const [statusFilter, setStatusFilter] = useState("");

  const { data: rawData, isLoading } = trpc.booking.list.useQuery(
    {
      hotelId: hotelId ?? undefined,
      status: (statusFilter || undefined) as
        | "PENDING"
        | "CONFIRMED"
        | "CHECKED_IN"
        | "CHECKED_OUT"
        | "CANCELLED"
        | "NO_SHOW"
        | undefined,
    },
    { enabled: !!hotelId },
  );
  const data = rawData as { items: BookingItem[]; total: number } | undefined;

  const checkIn = trpc.booking.checkIn.useMutation();
  const checkOut = trpc.booking.checkOut.useMutation();
  const utils = trpc.useUtils();

  const handleCheckIn = async (bookingId: string) => {
    await checkIn.mutateAsync({ bookingId });
    await utils.booking.list.invalidate();
  };

  const handleCheckOut = async (bookingId: string) => {
    await checkOut.mutateAsync({ bookingId });
    await utils.booking.list.invalidate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">All Status</option>
          {[
            "PENDING",
            "CONFIRMED",
            "CHECKED_IN",
            "CHECKED_OUT",
            "CANCELLED",
            "NO_SHOW",
          ].map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-gray-400">Loading...</div>
      ) : !data?.items.length ? (
        <div className="py-20 text-center text-gray-400">No bookings found</div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Ref
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Guest
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Check-in
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Check-out
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Total
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.items.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">
                    {b.bookingRef}
                  </td>
                  <td className="px-4 py-3">{b.guest.name}</td>
                  <td className="px-4 py-3">
                    {b.checkIn ? formatDate(b.checkIn) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {b.checkOut ? formatDate(b.checkOut) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {formatCurrency(b.totalCents, b.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLORS[b.status] ?? ""}`}
                    >
                      {b.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {b.status === "CONFIRMED" && (
                        <button
                          onClick={() => handleCheckIn(b.id)}
                          className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
                        >
                          Check In
                        </button>
                      )}
                      {b.status === "CHECKED_IN" && (
                        <button
                          onClick={() => handleCheckOut(b.id)}
                          className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                        >
                          Check Out
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t px-4 py-3 text-sm text-gray-500">
            {data.total} bookings
          </div>
        </div>
      )}
    </div>
  );
}
