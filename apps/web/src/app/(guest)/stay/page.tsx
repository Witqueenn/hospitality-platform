"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Wifi,
  UtensilsCrossed,
  Wrench,
  AlertTriangle,
  Package,
  Star,
  Calendar,
  Building2,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

const ACTIONS = [
  {
    icon: Wifi,
    label: "Wi-Fi",
    description: "Network name & password",
    href: "/stay/wifi",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: UtensilsCrossed,
    label: "Menus",
    description: "Restaurant & room service",
    href: "/stay/menus",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: Wrench,
    label: "Requests",
    description: "Housekeeping, maintenance",
    href: "/stay/requests",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    icon: AlertTriangle,
    label: "Report Issue",
    description: "Something wrong?",
    href: "/stay/issues",
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    icon: Package,
    label: "Lost & Found",
    description: "Missing something?",
    href: "/stay/lost-found",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: Star,
    label: "Rate Staff",
    description: "Share your appreciation",
    href: "/stay/staff-feedback",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
  },
];

export default function MyStayPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated()) router.push("/login");
  }, [isAuthenticated, router]);

  const { data: session, isLoading } = trpc.guestStay.myActive.useQuery(
    undefined,
    { enabled: isAuthenticated() },
  );

  if (!isAuthenticated()) return null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="py-20 text-center">
        <Building2 className="mx-auto mb-4 h-16 w-16 text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-700">No Active Stay</h2>
        <p className="mt-2 text-gray-500">
          You don&apos;t have an active check-in at the moment.
        </p>
        <Button
          className="mt-6 bg-[#1a1a2e] hover:bg-[#16213e]"
          onClick={() => router.push("/my/bookings")}
        >
          View My Bookings
        </Button>
      </div>
    );
  }

  const checkIn = session.booking?.checkIn
    ? new Date(session.booking.checkIn).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;
  const checkOut = session.booking?.checkOut
    ? new Date(session.booking.checkOut).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  const pendingRequests =
    session.messages?.filter((m) => !m.readAt).length ?? 0;

  return (
    <div className="space-y-6">
      {/* Stay Header */}
      <div className="rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-6 text-white shadow-lg">
        <p className="text-sm font-medium text-white/70">
          You are currently staying at
        </p>
        <h1 className="mt-1 text-2xl font-bold">{session.hotel?.name}</h1>
        {session.roomNumber && (
          <p className="mt-1 text-lg text-white/80">
            Room {session.roomNumber}
          </p>
        )}
        {checkIn && checkOut && (
          <div className="mt-3 flex items-center gap-2 text-sm text-white/60">
            <Calendar className="h-4 w-4" />
            <span>
              {checkIn} → {checkOut}
            </span>
          </div>
        )}
        {pendingRequests > 0 && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-yellow-400" />
            {pendingRequests} new message{pendingRequests > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-gray-800">
          What do you need?
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={`${action.href}?stayId=${session.id}`}
              className="flex flex-col items-start gap-2 rounded-xl border bg-white p-4 shadow-sm transition-all hover:border-[#1a1a2e]/30 hover:shadow-md"
            >
              <div className={`rounded-lg p-2 ${action.bg}`}>
                <action.icon className={`h-5 w-5 ${action.color}`} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{action.label}</p>
                <p className="text-xs text-gray-500">{action.description}</p>
              </div>
              <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Messages */}
      {session.messages && session.messages.length > 0 && (
        <div>
          <h2 className="mb-3 text-base font-semibold text-gray-800">
            Recent Messages
          </h2>
          <div className="space-y-2">
            {session.messages.slice(0, 3).map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 rounded-xl border p-4 ${
                  !msg.readAt ? "border-[#1a1a2e]/20 bg-blue-50" : "bg-white"
                }`}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {msg.subject ?? msg.category.replace(/_/g, " ")}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                    {msg.body}
                  </p>
                </div>
                {!msg.readAt && (
                  <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
