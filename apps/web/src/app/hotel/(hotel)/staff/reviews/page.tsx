"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Star, CheckCircle2, XCircle, Flag, MessageSquare } from "lucide-react";

const TABS = [
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Flagged", value: "FLAGGED" },
] as const;

const REVIEW_TYPE_LABELS: Record<string, string> = {
  GUEST_TO_STAFF: "Guest Review",
  MANAGEMENT_COMMENDATION: "Commendation",
};

export default function HotelStaffReviewsPage() {
  const { user } = useAuthStore();
  const hotelId = user?.hotelId ?? "";
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");

  const { data, isLoading, refetch } = trpc.staffReview.listByHotel.useQuery(
    {
      hotelId,
      moderationStatus: statusFilter as
        | "PENDING"
        | "APPROVED"
        | "REJECTED"
        | "FLAGGED",
      pageSize: 50,
    },
    { enabled: !!hotelId },
  );

  const moderateMutation = trpc.staffReview.moderate.useMutation({
    onSuccess: (_, vars) => {
      toast.success(`Review ${vars.status.toLowerCase()}.`);
      void refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-6 w-6 text-[#1a1a2e]" />
        <h1 className="text-2xl font-bold text-gray-900">Staff Reviews</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === tab.value
                ? "border-[#1a1a2e] text-[#1a1a2e]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : !data?.items || data.items.length === 0 ? (
        <div className="rounded-xl border bg-white py-12 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">No reviews in this category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.items.map((review) => (
            <div
              key={review.id}
              className="space-y-3 rounded-xl border bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                      {REVIEW_TYPE_LABELS[review.reviewType] ??
                        review.reviewType}
                    </span>
                    {review.isGratitudeWall && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Gratitude Wall
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-900">
                    {review.staffProfile?.name}
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      · {review.staffProfile?.department.replace(/_/g, " ")}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-4 w-4 ${
                        s <= (review.rating ?? 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {review.title && (
                <p className="font-medium text-gray-900">{review.title}</p>
              )}
              {review.body && (
                <p className="text-sm leading-relaxed text-gray-600">
                  &ldquo;{review.body}&rdquo;
                </p>
              )}

              <p className="text-xs text-gray-400">
                {new Date(review.createdAt).toLocaleString()}
              </p>

              {statusFilter === "PENDING" && (
                <div className="flex gap-2 border-t pt-3">
                  <Button
                    size="sm"
                    className="bg-green-600 text-white hover:bg-green-700"
                    onClick={() =>
                      moderateMutation.mutate({
                        id: review.id,
                        status: "APPROVED",
                      })
                    }
                    disabled={moderateMutation.isPending}
                  >
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:border-red-300"
                    onClick={() =>
                      moderateMutation.mutate({
                        id: review.id,
                        status: "REJECTED",
                      })
                    }
                    disabled={moderateMutation.isPending}
                  >
                    <XCircle className="mr-1 h-3.5 w-3.5" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-orange-600 hover:border-orange-300"
                    onClick={() =>
                      moderateMutation.mutate({
                        id: review.id,
                        status: "FLAGGED",
                      })
                    }
                    disabled={moderateMutation.isPending}
                  >
                    <Flag className="mr-1 h-3.5 w-3.5" />
                    Flag
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
