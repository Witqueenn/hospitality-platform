"use client";

import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Home,
  Star,
  MapPin,
  Shield,
  CheckCircle,
  Calendar,
  Users,
  Wifi,
} from "lucide-react";

export default function HomesDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  const { data: unit, isLoading } = trpc.trustedStay.getUnit.useQuery({
    id: slug,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-72 w-full rounded-2xl" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="py-20 text-center">
        <Home className="mx-auto mb-4 h-12 w-12 text-gray-200" />
        <p className="text-gray-500">Stay not found.</p>
      </div>
    );
  }

  const u = unit as any;

  const availableDates =
    u.availability?.filter((a: any) => a.isAvailable && a.remainingUnits > 0) ??
    [];

  return (
    <div className="space-y-8">
      {/* Photos */}
      <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-2xl sm:grid-cols-3">
        {((u.photos as string[]) ?? [])
          .slice(0, 5)
          .map((src: string, i: number) => (
            <img
              key={i}
              src={src}
              alt={u.name}
              className={`h-44 w-full object-cover ${i === 0 ? "col-span-2 row-span-2 h-full sm:col-span-1" : ""}`}
            />
          ))}
        {(!u.photos || u.photos.length === 0) && (
          <div className="col-span-3 flex h-72 items-center justify-center rounded-2xl bg-gray-100">
            <Home className="h-16 w-16 text-gray-300" />
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main info */}
        <div className="space-y-6 lg:col-span-2">
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-gray-900">{u.name}</h1>
              {u.ratingAggregate != null && (
                <div className="flex items-center gap-1 text-lg font-semibold">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  {u.ratingAggregate.toFixed(1)}
                </div>
              )}
            </div>
            {u.city && (
              <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-4 w-4" /> {u.city}
                {u.country ? `, ${u.country}` : ""}
              </p>
            )}
          </div>

          {/* Host info */}
          {u.host && (
            <div className="flex items-center gap-3 rounded-xl border bg-white p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a1a2e]/10 font-bold text-[#1a1a2e]">
                {u.host.displayName?.[0] ?? "H"}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {u.host.displayName}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  {u.host.verificationStatus === "VERIFIED" ? (
                    <>
                      <Shield className="h-3 w-3 text-emerald-500" /> Verified
                      host
                    </>
                  ) : (
                    <span>{u.host.verificationStatus}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {u.description && (
            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
                About
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                {u.description}
              </p>
            </div>
          )}

          {/* Amenities */}
          {u.amenities && u.amenities.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
                Amenities
              </h2>
              <div className="flex flex-wrap gap-2">
                {(u.amenities as string[]).map((a: string) => (
                  <span
                    key={a}
                    className="flex items-center gap-1 rounded-full border px-3 py-1 text-xs text-gray-600"
                  >
                    <CheckCircle className="h-3 w-3 text-emerald-500" /> {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Availability */}
          {availableDates.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
                <Calendar className="mr-1 inline h-4 w-4" />
                Available Dates
              </h2>
              <div className="flex flex-wrap gap-2">
                {availableDates.slice(0, 14).map((a: any) => (
                  <span
                    key={a.date}
                    className="rounded-lg border bg-emerald-50 px-3 py-1 text-xs text-emerald-700"
                  >
                    {new Date(a.date).toLocaleDateString("en", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Booking card */}
        <div className="space-y-4">
          {u.ratePlans?.map((plan: any) => (
            <div
              key={plan.id}
              className="rounded-2xl border bg-white p-6 shadow-sm"
            >
              <p className="text-xs uppercase tracking-wide text-gray-400">
                {plan.stayTerm} rate
              </p>
              <p className="mt-1 text-3xl font-bold text-gray-900">
                ${(plan.baseRateCents / 100).toFixed(0)}
                <span className="text-base font-normal text-gray-400">
                  {" "}
                  / night
                </span>
              </p>
              {plan.minStayNights && (
                <p className="mt-1 text-xs text-gray-400">
                  Minimum {plan.minStayNights} nights
                </p>
              )}
              <Button className="mt-4 w-full bg-[#1a1a2e] hover:bg-[#16213e]">
                Request to Book
              </Button>
            </div>
          ))}

          {(!u.ratePlans || u.ratePlans.length === 0) && (
            <div className="rounded-2xl border bg-white p-6 text-center">
              <p className="text-sm text-gray-500">Contact host for pricing</p>
              <Button className="mt-4 w-full bg-[#1a1a2e]">Contact Host</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
