"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Star } from "lucide-react";

const REVIEW_TYPES = [
  { value: "FRONT_DESK", label: "Front Desk" },
  { value: "CONCIERGE", label: "Concierge" },
  { value: "HOUSEKEEPING", label: "Housekeeping" },
  { value: "DINING", label: "Dining" },
  { value: "ROOM_SERVICE", label: "Room Service" },
  { value: "MANAGEMENT", label: "Management" },
] as const;

export default function StaffFeedbackPage() {
  const params = useSearchParams();
  const staffId = params.get("staffId") ?? "";
  const bookingId = params.get("bookingId") ?? undefined;
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewType, setReviewType] = useState<string>("FRONT_DESK");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const submitMutation = trpc.staffReview.create.useMutation({
    onSuccess: () => {
      toast.success("Thank you for your feedback!");
      router.back();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = () => {
    if (!staffId) {
      toast.error("No staff member selected.");
      return;
    }
    if (rating === 0) {
      toast.error("Please select a rating.");
      return;
    }
    submitMutation.mutate({
      staffProfileId: staffId,
      bookingId,
      reviewType: reviewType as Parameters<
        typeof submitMutation.mutate
      >[0]["reviewType"],
      rating,
      title: title || undefined,
      body: body || undefined,
    });
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Rate a Staff Member</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your feedback helps us recognize exceptional service.
        </p>
      </div>

      <div className="space-y-5 rounded-xl border bg-white p-5 shadow-sm">
        {/* Department */}
        <div>
          <label className="mb-2 block text-xs font-medium text-gray-600">
            Department
          </label>
          <div className="flex flex-wrap gap-2">
            {REVIEW_TYPES.map((rt) => (
              <button
                key={rt.value}
                onClick={() => setReviewType(rt.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  reviewType === rt.value
                    ? "bg-[#1a1a2e] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {rt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Star rating */}
        <div>
          <label className="mb-2 block text-xs font-medium text-gray-600">
            Rating
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(s)}
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    s <= (hoverRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-200"
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
            </p>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Title <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Exceptional service!"
            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
          />
        </div>

        {/* Body */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Your experience <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Tell us what made this staff member stand out..."
            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
            rows={3}
          />
        </div>

        <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
          Reviews are moderated before being published. Your name is not shared
          publicly.
        </div>

        <Button
          className="w-full bg-[#1a1a2e] hover:bg-[#16213e]"
          onClick={handleSubmit}
          disabled={submitMutation.isPending || rating === 0}
        >
          {submitMutation.isPending ? "Submitting..." : "Submit Review"}
        </Button>
      </div>
    </div>
  );
}
