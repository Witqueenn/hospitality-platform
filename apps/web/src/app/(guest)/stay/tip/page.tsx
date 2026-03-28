"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Heart, DollarSign } from "lucide-react";

const PRESET_AMOUNTS = [500, 1000, 2000, 5000]; // cents

export default function StaffTipPage() {
  const params = useSearchParams();
  const staffId = params.get("staffId") ?? "";
  const staffName = params.get("staffName")
    ? decodeURIComponent(params.get("staffName")!)
    : "this staff member";
  const bookingId = params.get("bookingId") ?? undefined;
  const router = useRouter();

  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [tipType, setTipType] = useState<
    "POST_SERVICE" | "POST_STAY" | "THANK_YOU"
  >("POST_STAY");

  const sendMutation = trpc.staffTip.send.useMutation({
    onSuccess: () => {
      toast.success(`Tip sent to ${staffName}. Thank you for your generosity!`);
      router.back();
    },
    onError: (err) => toast.error(err.message),
  });

  const finalAmountCents =
    amount ??
    (customAmount ? Math.round(parseFloat(customAmount) * 100) : null);

  const handleSend = () => {
    if (!staffId || !finalAmountCents || finalAmountCents <= 0) {
      toast.error("Please select or enter a tip amount.");
      return;
    }
    sendMutation.mutate({
      staffProfileId: staffId,
      bookingId,
      amountCents: finalAmountCents,
      message: message || undefined,
      tipType,
    });
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1a1a2e]">
          <Heart className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Send a Tip</h1>
        <p className="mt-1 text-sm text-gray-500">
          Show your appreciation to {staffName}
        </p>
      </div>

      <div className="space-y-5 rounded-xl border bg-white p-5 shadow-sm">
        {/* Tip type */}
        <div>
          <label className="mb-2 block text-xs font-medium text-gray-600">
            Occasion
          </label>
          <div className="flex gap-2">
            {(
              [
                { value: "POST_SERVICE", label: "After Service" },
                { value: "POST_STAY", label: "After Stay" },
                { value: "THANK_YOU", label: "Thank You" },
              ] as const
            ).map((t) => (
              <button
                key={t.value}
                onClick={() => setTipType(t.value)}
                className={`flex-1 rounded-lg border py-2 text-xs font-medium transition-colors ${
                  tipType === t.value
                    ? "border-[#1a1a2e] bg-[#1a1a2e]/5 text-[#1a1a2e]"
                    : "border-gray-200 text-gray-600"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Amount presets */}
        <div>
          <label className="mb-2 block text-xs font-medium text-gray-600">
            Amount
          </label>
          <div className="grid grid-cols-4 gap-2">
            {PRESET_AMOUNTS.map((cents) => (
              <button
                key={cents}
                onClick={() => {
                  setAmount(cents);
                  setCustomAmount("");
                }}
                className={`rounded-lg border py-2 text-sm font-semibold transition-colors ${
                  amount === cents && !customAmount
                    ? "border-[#1a1a2e] bg-[#1a1a2e] text-white"
                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                ${cents / 100}
              </button>
            ))}
          </div>

          <div className="mt-2 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <input
              type="number"
              min="1"
              step="0.01"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setAmount(null);
              }}
              placeholder="Custom amount"
              className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
            />
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Message <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="A personal note of thanks..."
            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
            rows={2}
          />
        </div>

        {finalAmountCents && finalAmountCents > 0 && (
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <p className="text-sm text-gray-500">You&apos;re sending</p>
            <p className="text-2xl font-bold text-gray-900">
              ${(finalAmountCents / 100).toFixed(2)}
            </p>
            <p className="text-xs text-gray-400">to {staffName}</p>
          </div>
        )}

        <Button
          className="w-full bg-[#1a1a2e] hover:bg-[#16213e]"
          onClick={handleSend}
          disabled={sendMutation.isPending || !finalAmountCents}
        >
          <Heart className="mr-1.5 h-4 w-4" />
          {sendMutation.isPending ? "Sending..." : "Send Tip"}
        </Button>
      </div>
    </div>
  );
}
