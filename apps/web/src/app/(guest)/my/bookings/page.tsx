"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { formatCurrency, formatDate } from "@repo/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { BookOpen, Calendar, Hotel, Star } from "lucide-react";

type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "CHECKED_OUT"
  | "CANCELLED"
  | "NO_SHOW";

type BookingItem = {
  id: string;
  bookingRef: string;
  status: string;
  checkIn: string | null;
  checkOut: string | null;
  totalCents: number;
  hotel?: { name: string } | null;
};

const STATUS_BADGE: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-700" },
  CONFIRMED: { label: "Confirmed", className: "bg-green-100 text-green-700" },
  CHECKED_IN: { label: "Checked In", className: "bg-blue-100 text-blue-700" },
  CHECKED_OUT: { label: "Checked Out", className: "bg-gray-100 text-gray-600" },
  CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-600" },
  NO_SHOW: { label: "No Show", className: "bg-red-100 text-red-600" },
};

const TABS = [
  { label: "All", value: undefined },
  { label: "Upcoming", value: "CONFIRMED" },
  { label: "Active", value: "CHECKED_IN" },
  { label: "Past", value: "CHECKED_OUT" },
  { label: "Cancelled", value: "CANCELLED" },
] as const;

export default function MyBookingsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<BookingStatus | undefined>(
    undefined,
  );
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const { data, isLoading, refetch } = trpc.booking.list.useQuery(
    { status: activeTab, page: 1, pageSize: 50 },
    { enabled: isAuthenticated() },
  );

  const cancelMutation = trpc.booking.cancel.useMutation({
    onSuccess: () => {
      toast.success("Booking cancelled.");
      setCancellingId(null);
      void refetch();
    },
    onError: (err: { message: string }) => {
      toast.error(err.message);
      setCancellingId(null);
    },
  });

  const handleCancel = (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setCancellingId(bookingId);
    cancelMutation.mutate({
      bookingId,
      reason: "Guest requested cancellation",
    });
  };

  if (!isAuthenticated()) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="h-6 w-6 text-[#1a1a2e]" />
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b">
        {TABS.map((tab) => (
          <button
            key={String(tab.value)}
            onClick={() => setActiveTab(tab.value as BookingStatus | undefined)}
            className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "border-[#1a1a2e] text-[#1a1a2e]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!data?.items || data.items.length === 0) && (
        <div className="py-16 text-center">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">No bookings found.</p>
          <Button
            className="mt-4 bg-[#1a1a2e] hover:bg-[#16213e]"
            onClick={() => router.push("/search")}
          >
            Find a Hotel
          </Button>
        </div>
      )}

      {/* Bookings list */}
      {!isLoading && data?.items && data.items.length > 0 && (
        <div className="space-y-4">
          {(data.items as unknown as BookingItem[]).map((booking: any) => {
            const status = booking.status as BookingStatus;
            const badge = STATUS_BADGE[status] ?? {
              label: status,
              className: "bg-gray-100 text-gray-600",
            };
            const canCancel = status === "PENDING" || status === "CONFIRMED";
            const canReview = status === "CHECKED_OUT";

            return (
              <div
                key={booking.id}
                className="rounded-xl border bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <p className="font-mono text-sm font-bold text-[#1a1a2e]">
                        {booking.bookingRef}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Hotel className="h-4 w-4 text-gray-400" />
                      <span>{booking.hotel?.name ?? "Hotel"}</span>
                    </div>

                    {booking.checkIn && booking.checkOut && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>
                          {formatDate(booking.checkIn)} →{" "}
                          {formatDate(booking.checkOut)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(booking.totalCents)}
                    </p>
                    <div className="flex gap-2">
                      {canReview && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/search`)}
                        >
                          <Star className="mr-1.5 h-3.5 w-3.5" />
                          Review
                        </Button>
                      )}
                      {canCancel && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancellingId === booking.id}
                        >
                          {cancellingId === booking.id
                            ? "Cancelling..."
                            : "Cancel"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {data && data.total > 0 && (
        <p className="text-center text-sm text-gray-400">
          Showing {data.items.length} of {data.total} bookings
        </p>
      )}
    </div>
  );
}
