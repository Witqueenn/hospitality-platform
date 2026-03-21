"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { formatDate, formatCurrency } from "@repo/shared";
import { ChevronDown, ChevronUp, Users, Bed } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  CHECKED_IN: "bg-green-100 text-green-700",
  CHECKED_OUT: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-100 text-red-700",
  NO_SHOW: "bg-red-100 text-red-700",
};

type RoomTypeRef = { id: string; name: string; bedType: string } | null;
type BookingItemLine = { id: string; roomType: RoomTypeRef };
type BookingItem = {
  id: string;
  bookingRef: string;
  status: string;
  checkIn: Date;
  checkOut: Date;
  guestCount: number;
  totalCents: number;
  currency: string;
  specialRequests: string | null;
  guest: { name: string; email: string };
  items: BookingItemLine[];
};

export default function HotelBookingsPage() {
  const { user } = useAuthStore();
  const hotelId = user?.hotelId;
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const {
    data: rawData,
    isLoading,
    refetch,
  } = trpc.booking.list.useQuery(
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

  const checkInMutation = trpc.booking.checkIn.useMutation({
    onSuccess: () => void refetch(),
  });
  const checkOutMutation = trpc.booking.checkOut.useMutation({
    onSuccess: () => void refetch(),
  });

  const nights = (b: BookingItem) => {
    if (!b.checkIn || !b.checkOut) return 0;
    return Math.round(
      (new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) /
        86_400_000,
    );
  };

  const roomNames = (b: BookingItem) =>
    b.items
      .map((i) => i.roomType?.name)
      .filter(Boolean)
      .join(", ");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          {data && (
            <p className="mt-0.5 text-sm text-gray-500">
              {data.total} total booking{data.total !== 1 ? "s" : ""}
            </p>
          )}
        </div>
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
          ].map((s: any) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-gray-400">Loading…</div>
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
                  Room
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Dates
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Guests
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
              {data.items.map((b) => {
                const isExpanded = expandedId === b.id;
                const n = nights(b);
                const rooms = roomNames(b);

                return (
                  <>
                    <tr
                      key={b.id}
                      className={`cursor-pointer hover:bg-gray-50 ${isExpanded ? "bg-gray-50" : ""}`}
                      onClick={() => setExpandedId(isExpanded ? null : b.id)}
                    >
                      <td className="px-4 py-3 font-mono text-sm font-semibold text-[#1a1a2e]">
                        {b.bookingRef}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">
                          {b.guest.name}
                        </p>
                        <p className="text-xs text-gray-400">{b.guest.email}</p>
                      </td>
                      <td className="max-w-[160px] px-4 py-3">
                        {rooms ? (
                          <span
                            className="block truncate text-sm text-gray-700"
                            title={rooms}
                          >
                            {rooms}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        <p>{b.checkIn ? formatDate(b.checkIn) : "—"}</p>
                        <p className="text-xs text-gray-400">
                          {b.checkOut ? formatDate(b.checkOut) : ""}{" "}
                          {n > 0 ? `· ${n}n` : ""}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-gray-600">
                          <Users className="h-3.5 w-3.5 text-gray-400" />
                          {b.guestCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {formatCurrency(b.totalCents, b.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLORS[b.status] ?? ""}`}
                        >
                          {b.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-2">
                          {b.status === "CONFIRMED" && (
                            <button
                              onClick={() =>
                                checkInMutation.mutate({ bookingId: b.id })
                              }
                              disabled={checkInMutation.isPending}
                              className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700 disabled:opacity-50"
                            >
                              Check In
                            </button>
                          )}
                          {b.status === "CHECKED_IN" && (
                            <button
                              onClick={() =>
                                checkOutMutation.mutate({ bookingId: b.id })
                              }
                              disabled={checkOutMutation.isPending}
                              className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                              Check Out
                            </button>
                          )}
                          <button
                            onClick={() =>
                              setExpandedId(isExpanded ? null : b.id)
                            }
                            className="rounded p-1 text-gray-400 hover:text-gray-600"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded detail row */}
                    {isExpanded && (
                      <tr key={`${b.id}-detail`}>
                        <td colSpan={8} className="bg-gray-50 px-4 py-4">
                          <div className="grid gap-4 sm:grid-cols-3">
                            {/* Room types */}
                            {b.items.length > 0 && (
                              <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                  Room(s)
                                </p>
                                <div className="space-y-1">
                                  {b.items.map((item: any) =>
                                    item.roomType ? (
                                      <div
                                        key={item.id}
                                        className="flex items-center gap-2 text-sm text-gray-700"
                                      >
                                        <Bed className="h-3.5 w-3.5 text-gray-400" />
                                        <span>{item.roomType.name}</span>
                                        <span className="text-gray-400">
                                          ·{" "}
                                          {item.roomType.bedType
                                            .charAt(0)
                                            .toUpperCase() +
                                            item.roomType.bedType.slice(1)}
                                        </span>
                                      </div>
                                    ) : null,
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Stay summary */}
                            <div>
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Stay
                              </p>
                              <div className="space-y-1 text-sm text-gray-700">
                                <p>
                                  <span className="text-gray-400">
                                    Check-in:{" "}
                                  </span>
                                  {b.checkIn ? formatDate(b.checkIn) : "—"}
                                </p>
                                <p>
                                  <span className="text-gray-400">
                                    Check-out:{" "}
                                  </span>
                                  {b.checkOut ? formatDate(b.checkOut) : "—"}
                                </p>
                                <p>
                                  <span className="text-gray-400">
                                    Duration:{" "}
                                  </span>
                                  {n} night{n !== 1 ? "s" : ""}
                                </p>
                                <p>
                                  <span className="text-gray-400">
                                    Guests:{" "}
                                  </span>
                                  {b.guestCount}
                                </p>
                              </div>
                            </div>

                            {/* Special requests */}
                            <div>
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Special Requests
                              </p>
                              {b.specialRequests ? (
                                <p className="rounded-lg bg-white p-3 text-sm text-gray-700 ring-1 ring-gray-200">
                                  {b.specialRequests}
                                </p>
                              ) : (
                                <p className="text-sm text-gray-400">None</p>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
          <div className="border-t px-4 py-3 text-sm text-gray-500">
            {data.total} bookings total
          </div>
        </div>
      )}
    </div>
  );
}
