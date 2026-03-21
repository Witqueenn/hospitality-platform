"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { formatDate } from "@repo/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Star,
  MessageSquare,
  CheckCircle,
  XCircle,
  ThumbsUp,
} from "lucide-react";

type ModerationStatus = "PENDING" | "APPROVED" | "FLAGGED" | "REJECTED";

const STATUS_STYLE: Record<ModerationStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  FLAGGED: "bg-orange-100 text-orange-700",
  REJECTED: "bg-red-100 text-red-600",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${s <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const { user } = useAuthStore();
  const hotelId = user?.hotelId ?? "";
  const [filterStatus, setFilterStatus] = useState<
    "ALL" | "PENDING" | "APPROVED" | "FLAGGED" | "REJECTED"
  >("ALL");
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const { data: stats } = trpc.review.stats.useQuery(
    { hotelId },
    { enabled: !!hotelId },
  );

  const { data, isLoading, refetch } = trpc.review.list.useQuery(
    {
      hotelId,
      moderationStatus:
        filterStatus !== "ALL"
          ? (filterStatus as "PENDING" | "APPROVED" | "FLAGGED" | "REJECTED")
          : undefined,
      page: 1,
      pageSize: 50,
    },
    { enabled: !!hotelId },
  );

  const respondMutation = trpc.review.respond.useMutation({
    onSuccess: () => {
      toast.success("Response published!");
      setReplyId(null);
      setReplyText("");
      void refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const moderateMutation = trpc.review.moderate.useMutation({
    onSuccess: () => {
      toast.success("Review updated!");
      void refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  if (!hotelId)
    return (
      <div className="py-20 text-center text-gray-400">No hotel assigned.</div>
    );

  const avg = stats?.avg ?? 0;
  const dist = stats?.distribution ?? {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Guest Reviews</h1>
        <Select
          value={filterStatus}
          onValueChange={(v) => setFilterStatus(v as ModerationStatus | "ALL")}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Reviews</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="FLAGGED">Flagged</SelectItem>
            <SelectItem value="REJECTED">Removed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      {stats && (
        <div className="rounded-xl border bg-white p-6">
          <div className="flex flex-wrap items-center gap-8">
            <div className="text-center">
              <p className="text-5xl font-bold text-gray-900">
                {avg.toFixed(1)}
              </p>
              <div className="mt-1 flex justify-center">
                <StarRating rating={Math.round(avg)} />
              </div>
              <p className="mt-1 text-sm text-gray-400">
                {stats.count} reviews
              </p>
            </div>
            <div className="min-w-[180px] flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count =
                  (dist as Record<string, number>)[String(star)] ?? 0;
                const pct = stats.count > 0 ? (count / stats.count) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="w-4 text-xs text-gray-500">{star}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <div className="h-2 flex-1 rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-yellow-400 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-6 text-xs text-gray-400">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Reviews list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : !data?.items.length ? (
        <div className="py-16 text-center">
          <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">No reviews found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.items.map((review) => {
            const status = review.moderationStatus as ModerationStatus;
            const isReplying = replyId === review.id;

            return (
              <div key={review.id} className="rounded-xl border bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StarRating rating={review.overallScore} />
                      <span className="text-sm font-semibold text-gray-900">
                        {review.overallScore}/5
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[status] ?? ""}`}
                      >
                        {status}
                      </span>
                      {review.sentiment && (
                        <Badge variant="outline" className="text-xs">
                          {review.sentiment}
                        </Badge>
                      )}
                    </div>
                    <p className="font-medium text-gray-900">
                      {review.title ?? "Untitled Review"}
                    </p>
                    <p className="text-sm text-gray-500">{review.text}</p>
                    <p className="text-xs text-gray-400">
                      {review.guest?.name ?? "Anonymous"} ·{" "}
                      {formatDate(review.createdAt)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {status === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-200 text-xs text-green-700 hover:bg-green-50"
                          onClick={() =>
                            moderateMutation.mutate({
                              reviewId: review.id,
                              status: "APPROVED",
                            })
                          }
                        >
                          <CheckCircle className="mr-1 h-3.5 w-3.5" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-xs text-red-600 hover:bg-red-50"
                          onClick={() =>
                            moderateMutation.mutate({
                              reviewId: review.id,
                              status: "REJECTED",
                            })
                          }
                        >
                          <XCircle className="mr-1 h-3.5 w-3.5" /> Remove
                        </Button>
                      </>
                    )}
                    {status === "APPROVED" && !review.hotelResponse && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => {
                          setReplyId(review.id);
                          setReplyText("");
                        }}
                      >
                        <ThumbsUp className="mr-1 h-3.5 w-3.5" /> Respond
                      </Button>
                    )}
                    {status === "FLAGGED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-200 text-xs text-red-600 hover:bg-red-50"
                        onClick={() =>
                          moderateMutation.mutate({
                            reviewId: review.id,
                            status: "REJECTED",
                          })
                        }
                      >
                        <XCircle className="mr-1 h-3.5 w-3.5" /> Remove
                      </Button>
                    )}
                  </div>
                </div>

                {/* Hotel response */}
                {review.hotelResponse && (
                  <div className="mt-4 rounded-lg bg-blue-50 p-3">
                    <p className="text-xs font-semibold text-blue-700">
                      Hotel Response
                    </p>
                    <p className="mt-1 text-sm text-blue-900">
                      {review.hotelResponse}
                    </p>
                  </div>
                )}

                {/* Reply box */}
                {isReplying && (
                  <div className="mt-4 space-y-2">
                    <Textarea
                      placeholder="Write your response..."
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="resize-none"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-[#1a1a2e] hover:bg-[#16213e]"
                        disabled={
                          !replyText.trim() || respondMutation.isPending
                        }
                        onClick={() =>
                          respondMutation.mutate({
                            reviewId: review.id,
                            response: replyText.trim(),
                          })
                        }
                      >
                        Publish Response
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setReplyId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {data && (
        <p className="text-center text-sm text-gray-400">
          {data.total} total review{data.total !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
