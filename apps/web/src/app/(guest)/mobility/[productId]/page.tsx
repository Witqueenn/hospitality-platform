"use client";

import { use, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import {
  Car,
  Star,
  Users,
  MapPin,
  CheckCircle,
  Luggage,
  Wifi,
  Wind,
  Baby,
  ArrowLeft,
  Clock,
  CreditCard,
  Phone,
} from "lucide-react";

const MOBILITY_TYPE_LABELS: Record<string, string> = {
  AIRPORT_TRANSFER: "Airport Transfer",
  RENTAL_CAR: "Rental Car",
  CHAUFFEUR: "Chauffeur",
  CITY_TRANSFER: "City Transfer",
  HOURLY_DRIVER: "Hourly Driver",
};

const MOBILITY_TYPE_COLORS: Record<string, string> = {
  AIRPORT_TRANSFER: "bg-blue-100 text-blue-700",
  RENTAL_CAR: "bg-green-100 text-green-700",
  CHAUFFEUR: "bg-purple-100 text-purple-700",
  CITY_TRANSFER: "bg-orange-100 text-orange-700",
  HOURLY_DRIVER: "bg-indigo-100 text-indigo-700",
};

function getPricingDisplay(product: any): {
  label: string;
  amount: string;
  breakdown: string[];
} {
  const cfg = product.pricingConfig ?? {};
  const currency = product.currency ?? cfg.currency ?? "USD";
  const sym = currency === "EUR" ? "€" : "$";

  if (cfg.flatRate) {
    return {
      label: "Flat rate",
      amount: `${sym}${(cfg.flatRate / 100).toFixed(0)}`,
      breakdown: [
        "Fixed price regardless of traffic or wait time",
        "Includes all tolls and airport surcharges",
      ],
    };
  }
  if (cfg.hourlyRate) {
    const min = cfg.minimumHours ?? 1;
    return {
      label: `Per hour (min ${min}h)`,
      amount: `${sym}${(cfg.hourlyRate / 100).toFixed(0)}/hr`,
      breakdown: [
        `Minimum booking: ${min} hour${min > 1 ? "s" : ""}`,
        `${sym}${((cfg.hourlyRate * min) / 100).toFixed(0)} minimum charge`,
      ],
    };
  }
  if (cfg.dailyRate) {
    return {
      label: "Per day",
      amount: `${sym}${(cfg.dailyRate / 100).toFixed(0)}/day`,
      breakdown: [
        "Unlimited mileage",
        cfg.insuranceIncluded
          ? "Full insurance included"
          : "Insurance available at checkout",
      ],
    };
  }
  if (cfg.halfDayRate || cfg.fullDayRate) {
    const breakdown = [];
    if (cfg.halfDayRate)
      breakdown.push(`Half day: ${sym}${(cfg.halfDayRate / 100).toFixed(0)}`);
    if (cfg.fullDayRate)
      breakdown.push(`Full day: ${sym}${(cfg.fullDayRate / 100).toFixed(0)}`);
    return {
      label: "From",
      amount: `${sym}${((cfg.halfDayRate ?? cfg.fullDayRate ?? 0) / 100).toFixed(0)}`,
      breakdown,
    };
  }
  if (product.priceCents) {
    return {
      label: "Per trip",
      amount: `${sym}${(product.priceCents / 100).toFixed(0)}`,
      breakdown: [],
    };
  }
  return { label: "Price", amount: "On request", breakdown: [] };
}

export default function MobilityDetailPage({
  params,
}: {
  params: { productId: string };
}) {
  const { productId } = params;
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [pickup, setPickup] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data: product, isLoading } = trpc.mobility.getProduct.useQuery({
    id: productId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 py-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-56 w-full rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center">
        <Car className="mx-auto mb-4 h-12 w-12 text-gray-200" />
        <p className="text-gray-500">Product not found.</p>
        <Link
          href="/mobility"
          className="mt-4 inline-block text-sm text-blue-600 hover:underline"
        >
          Back to mobility
        </Link>
      </div>
    );
  }

  const p = product as any;
  const pricing = getPricingDisplay(p);
  const cfg = p.pricingConfig ?? {};

  // Derive vehicle specs from data
  const specs = [
    p.capacity && {
      icon: Users,
      label: "Passengers",
      value: `${p.capacity} pax`,
    },
    p.baggageCapacity && {
      icon: Luggage,
      label: "Luggage",
      value: `${p.baggageCapacity} bags`,
    },
    { icon: Wind, label: "Air Conditioning", value: "Included" },
    p.mobilityType !== "RENTAL_CAR" && {
      icon: Wifi,
      label: "WiFi Hotspot",
      value: "On board",
    },
    p.mobilityType === "RENTAL_CAR" && {
      icon: Baby,
      label: "Child Seat",
      value: "On request",
    },
  ].filter(Boolean) as { icon: any; label: string; value: string }[];

  const inclusions =
    p.mobilityType === "AIRPORT_TRANSFER"
      ? [
          "Meet & greet at arrivals",
          "Flight tracking",
          "Free waiting time (60 min)",
          "Bottled water on board",
          "All tolls & surcharges included",
        ]
      : p.mobilityType === "HOURLY_DRIVER"
        ? [
            "Professional uniformed chauffeur",
            "WiFi hotspot on board",
            "Bottled water & newspapers",
            "Flexible route — your itinerary",
          ]
        : p.mobilityType === "RENTAL_CAR"
          ? [
              "Unlimited mileage",
              "Full insurance coverage",
              "24/7 roadside assistance",
              "GPS navigation",
              "Child seat available on request",
            ]
          : [
              "Professional driver",
              "Air conditioned vehicle",
              "Bottled water included",
            ];

  const handleBooking = () => {
    if (!date || !time || !pickup) {
      toast.error("Please fill in all booking fields.");
      return;
    }
    setSubmitted(true);
    toast.success(
      "Booking request sent! Our team will confirm within 30 minutes.",
    );
  };

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        href="/mobility"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        All Mobility Services
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: main info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Hero card */}
          <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] p-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    <Car className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        MOBILITY_TYPE_COLORS[p.mobilityType] ??
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {MOBILITY_TYPE_LABELS[p.mobilityType] ?? p.mobilityType}
                    </span>
                    <h1 className="mt-1 text-xl font-bold">{p.name}</h1>
                  </div>
                </div>
                {p.mobilityProvider?.ratingAggregate != null && (
                  <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">
                      {Number(p.mobilityProvider.ratingAggregate).toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              {p.mobilityProvider && (
                <p className="mt-3 text-sm text-white/60">
                  Operated by {p.mobilityProvider.name}
                </p>
              )}
            </div>

            {p.description && (
              <div className="p-6">
                <p className="leading-relaxed text-gray-600">{p.description}</p>
              </div>
            )}
          </div>

          {/* Vehicle specs */}
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
              Vehicle Specs
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex flex-col items-center gap-2 rounded-xl border bg-white p-4 text-center"
                >
                  <spec.icon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {spec.value}
                    </p>
                    <p className="text-xs text-gray-400">{spec.label}</p>
                  </div>
                </div>
              ))}
              {p.vehicleClass && (
                <div className="col-span-2 flex flex-col items-center gap-2 rounded-xl border bg-white p-4 text-center sm:col-span-1">
                  <Car className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {p.vehicleClass}
                    </p>
                    <p className="text-xs text-gray-400">Vehicle class</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* What's included */}
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
              What&apos;s Included
            </h2>
            <div className="rounded-2xl border bg-white p-5">
              <div className="grid gap-2 sm:grid-cols-2">
                {inclusions.map((inc) => (
                  <div
                    key={inc}
                    className="flex items-center gap-2.5 text-sm text-gray-600"
                  >
                    <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                    {inc}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Price breakdown */}
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
              Price Breakdown
            </h2>
            <div className="space-y-3 rounded-2xl border bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{pricing.label}</span>
                <span className="text-lg font-bold text-gray-900">
                  {pricing.amount}
                </span>
              </div>
              {pricing.breakdown.map((line) => (
                <div
                  key={line}
                  className="flex items-center gap-2 text-sm text-gray-500"
                >
                  <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-gray-300" />
                  {line}
                </div>
              ))}
              {cfg.currency && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CreditCard className="h-4 w-4 shrink-0 text-gray-300" />
                  Priced in {cfg.currency}
                </div>
              )}
            </div>
          </div>

          {/* Pickup info */}
          {p.hotel && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
                Pickup & Service Area
              </h2>
              <div className="flex items-start gap-3 rounded-2xl border bg-white p-5">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                <div>
                  <p className="font-semibold text-gray-900">{p.hotel.name}</p>
                  {p.hotel.address && (
                    <p className="mt-0.5 text-sm text-gray-500">
                      {p.hotel.address}
                    </p>
                  )}
                  {p.city && (
                    <p className="mt-1 text-xs text-gray-400">
                      Service area: {p.city}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Provider contact */}
          {p.mobilityProvider && (
            <div className="flex items-center gap-3 rounded-xl border bg-gray-50 px-4 py-3 text-sm text-gray-600">
              <Phone className="h-4 w-4 shrink-0 text-gray-400" />
              <span>
                Operated by{" "}
                <span className="font-medium text-gray-900">
                  {p.mobilityProvider.name}
                </span>
                {" — "}verified partner
              </span>
              <CheckCircle className="ml-auto h-4 w-4 shrink-0 text-emerald-500" />
            </div>
          )}
        </div>

        {/* Right: booking form */}
        <div className="space-y-4">
          <div className="sticky top-4 rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-4 border-b pb-4">
              <p className="text-xs uppercase tracking-wide text-gray-400">
                {pricing.label}
              </p>
              <p className="mt-1 text-3xl font-bold text-gray-900">
                {pricing.amount}
              </p>
            </div>

            {submitted ? (
              <div className="rounded-xl bg-emerald-50 p-4 text-center">
                <CheckCircle className="mx-auto mb-2 h-8 w-8 text-emerald-500" />
                <p className="font-semibold text-emerald-700">Request Sent!</p>
                <p className="mt-1 text-xs text-emerald-600">
                  We&apos;ll confirm within 30 minutes.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">
                    Time
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">
                    {p.mobilityType === "AIRPORT_TRANSFER"
                      ? "Pickup location / flight number"
                      : "Pickup address or hotel name"}
                  </label>
                  <input
                    type="text"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    placeholder={
                      p.mobilityType === "AIRPORT_TRANSFER"
                        ? "e.g. IST Terminal 1, Flight TK123"
                        : "e.g. Hotel lobby, Grand Palace Istanbul"
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
                  />
                </div>

                <Button
                  className="w-full bg-[#1a1a2e] hover:bg-[#16213e]"
                  onClick={handleBooking}
                >
                  Request Booking
                </Button>
                <p className="text-center text-xs text-gray-400">
                  <Clock className="mr-1 inline h-3 w-3" />
                  Confirmed within 30 minutes
                </p>
              </div>
            )}

            <div className="mt-4 space-y-2 border-t pt-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                Free cancellation up to 2h before
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                No hidden fees
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
