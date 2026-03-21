"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { formatCurrency } from "@repo/shared";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  CheckCircle,
  ChevronRight,
  Hotel,
  Calendar,
  Users,
} from "lucide-react";

const STEPS = ["Summary", "Requests", "Confirm"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
              i < current
                ? "bg-green-500 text-white"
                : i === current
                  ? "bg-[#1a1a2e] text-white"
                  : "bg-gray-200 text-gray-500"
            }`}
          >
            {i < current ? <CheckCircle className="h-4 w-4" /> : i + 1}
          </div>
          <span
            className={`text-sm ${i === current ? "font-semibold text-gray-900" : "text-gray-400"}`}
          >
            {label}
          </span>
          {i < STEPS.length - 1 && (
            <ChevronRight className="h-4 w-4 text-gray-300" />
          )}
        </div>
      ))}
    </div>
  );
}

import { Suspense } from "react";

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();

  const hotelId = searchParams.get("hotelId") ?? "";
  const roomTypeId = searchParams.get("roomTypeId") ?? "";
  const checkIn = searchParams.get("checkIn") ?? "";
  const checkOut = searchParams.get("checkOut") ?? "";
  const guestCount = Number(searchParams.get("guestCount") ?? "1");

  const [step, setStep] = useState(0);
  const [specialRequests, setSpecialRequests] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState<{
    bookingRef: string;
    id: string;
  } | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push(
        `/login?redirect=${encodeURIComponent(window.location.href)}`,
      );
    }
  }, [isAuthenticated, router]);

  // Fetch hotel info for display
  const { data: availability } = trpc.availability.check.useQuery(
    { hotelId, checkIn, checkOut, guestCount },
    { enabled: !!hotelId && !!checkIn && !!checkOut },
  );

  const selectedRoom = availability?.find(
    (a: { roomType: { id: string } }) => a.roomType.id === roomTypeId,
  );

  const nights =
    checkIn && checkOut
      ? Math.ceil(
          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
            86400000,
        )
      : 0;
  const subtotalCents = selectedRoom?.totalCents ?? 0;
  const taxCents = Math.floor(subtotalCents * 0.1);
  const totalCents = subtotalCents + taxCents;

  const createBooking = trpc.booking.create.useMutation({
    onSuccess: (data: { bookingRef: string; id: string }) => {
      toast.success("Booking confirmed!");
      setConfirmedBooking({ bookingRef: data.bookingRef, id: data.id });
      setStep(3);
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  const handleConfirm = () => {
    if (!hotelId || !roomTypeId || !checkIn || !checkOut) {
      toast.error("Missing booking details.");
      return;
    }
    createBooking.mutate({
      hotelId,
      roomTypeId,
      checkIn,
      checkOut,
      guestCount,
      childCount: 0,
      specialRequests: specialRequests || undefined,
    });
  };

  if (!isAuthenticated()) return null;

  // Success state
  if (step === 3 && confirmedBooking) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <div className="mb-6 flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h1>
        <p className="mt-2 text-gray-500">Your booking reference is:</p>
        <p className="mt-2 rounded-xl bg-gray-100 py-3 font-mono text-xl font-bold text-[#1a1a2e]">
          {confirmedBooking.bookingRef}
        </p>
        <p className="mt-4 text-sm text-gray-400">
          A confirmation will be sent to {user?.email}.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button variant="outline" onClick={() => router.push("/my/bookings")}>
            View My Bookings
          </Button>
          <Button
            onClick={() => router.push("/search")}
            className="bg-[#1a1a2e] hover:bg-[#16213e]"
          >
            Search More Hotels
          </Button>
        </div>
      </div>
    );
  }

  if (!selectedRoom && !!hotelId) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="text-gray-500">Room not available for selected dates.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.back()}
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Complete Your Booking
      </h1>
      <StepIndicator current={step} />

      {/* Step 0: Summary */}
      {step === 0 && (
        <div className="space-y-4 rounded-xl border bg-white p-6">
          <h2 className="font-semibold text-gray-900">Booking Summary</h2>

          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
              <Hotel className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {selectedRoom?.roomType.name ?? "Selected Room"}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedRoom?.roomType.bedType} ·{" "}
                  {selectedRoom?.roomType.capacity} guests
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(checkIn).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  {" → "}
                  {new Date(checkOut).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <p className="text-xs text-gray-500">
                  {nights} night{nights !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
              <Users className="h-5 w-5 text-gray-400" />
              <p className="text-sm text-gray-700">
                {guestCount} guest{guestCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="space-y-2 border-t pt-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal ({nights} nights)</span>
              <span>{formatCurrency(subtotalCents)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Taxes & fees (10%)</span>
              <span>{formatCurrency(taxCents)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span>{formatCurrency(totalCents)}</span>
            </div>
          </div>

          <Button
            className="w-full bg-[#1a1a2e] hover:bg-[#16213e]"
            onClick={() => setStep(1)}
          >
            Continue
          </Button>
        </div>
      )}

      {/* Step 1: Special requests */}
      {step === 1 && (
        <div className="space-y-4 rounded-xl border bg-white p-6">
          <h2 className="font-semibold text-gray-900">Special Requests</h2>
          <p className="text-sm text-gray-500">
            Let the hotel know about any special requirements (optional).
          </p>
          <Textarea
            placeholder="e.g. Early check-in, baby cot, dietary requirements..."
            rows={5}
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
          />
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setStep(0)}
            >
              Back
            </Button>
            <Button
              className="flex-1 bg-[#1a1a2e] hover:bg-[#16213e]"
              onClick={() => setStep(2)}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Confirm */}
      {step === 2 && (
        <div className="space-y-4 rounded-xl border bg-white p-6">
          <h2 className="font-semibold text-gray-900">Review & Confirm</h2>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Room</span>
              <span className="font-medium">
                {selectedRoom?.roomType.name ?? "Selected Room"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Dates</span>
              <span className="font-medium">
                {checkIn} → {checkOut}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Guests</span>
              <span className="font-medium">{guestCount}</span>
            </div>
            {specialRequests && (
              <div className="flex justify-between">
                <span>Requests</span>
                <span className="max-w-48 text-right font-medium">
                  {specialRequests}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-between border-t pt-3 font-bold text-gray-900">
            <span>Total</span>
            <span>{formatCurrency(totalCents)}</span>
          </div>

          <p className="text-xs text-gray-400">
            By confirming, you agree to the hotel cancellation policy. Payment
            is due at check-in.
          </p>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setStep(1)}
            >
              Back
            </Button>
            <Button
              className="flex-1 bg-[#1a1a2e] hover:bg-[#16213e]"
              onClick={handleConfirm}
              disabled={createBooking.isPending}
            >
              {createBooking.isPending ? "Confirming..." : "Confirm Booking"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingNewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingContent />
    </Suspense>
  );
}
