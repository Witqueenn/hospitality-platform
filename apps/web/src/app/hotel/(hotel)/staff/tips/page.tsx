"use client";

import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DollarSign, CheckCircle2 } from "lucide-react";

const TIP_TYPE_LABELS: Record<string, string> = {
  CASH_EQUIVALENT: "Cash Equivalent",
  COMPLIMENT: "Compliment",
  VOUCHER: "Voucher",
};

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  SETTLED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-600",
};

export default function HotelStaffTipsPage() {
  const { user } = useAuthStore();
  const hotelId = user?.hotelId ?? "";

  const { data, isLoading, refetch } = trpc.staffTip.listByHotel.useQuery(
    { hotelId, pageSize: 100 },
    { enabled: !!hotelId },
  );

  const settleMutation = trpc.staffTip.settle.useMutation({
    onSuccess: () => {
      toast.success("Tip settled.");
      void refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const pendingTotal =
    data?.items
      .filter((t) => t.status === "PENDING")
      .reduce((sum, t) => sum + t.amountCents, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <DollarSign className="h-6 w-6 text-[#1a1a2e]" />
        <h1 className="text-2xl font-bold text-gray-900">Tips</h1>
      </div>

      {/* Summary */}
      {pendingTotal > 0 && (
        <div className="rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-5 text-white">
          <p className="text-sm text-white/70">Pending Settlement</p>
          <p className="mt-1 text-3xl font-bold">
            ${(pendingTotal / 100).toFixed(2)}
          </p>
          <p className="mt-0.5 text-xs text-white/50">
            {data?.items.filter((t) => t.status === "PENDING").length} tips
            awaiting settlement
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : !data?.items || data.items.length === 0 ? (
        <div className="rounded-xl border bg-white py-12 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">No tips yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.items.map((tip) => (
            <div
              key={tip.id}
              className="rounded-xl border bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[tip.status]}`}
                    >
                      {tip.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {TIP_TYPE_LABELS[tip.tipType] ?? tip.tipType}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {tip.staffProfile?.name}
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      · {tip.staffProfile?.department.replace(/_/g, " ")}
                    </span>
                  </p>
                  {tip.message && (
                    <p className="text-sm italic text-gray-500">
                      &ldquo;{tip.message}&rdquo;
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    {new Date(tip.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    ${(tip.amountCents / 100).toFixed(2)}
                  </p>
                  {tip.status === "PENDING" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-1 text-xs"
                      onClick={() =>
                        settleMutation.mutate({
                          staffProfileId: tip.staffProfileId,
                          tipIds: [tip.id],
                        })
                      }
                      disabled={settleMutation.isPending}
                    >
                      Settle
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
