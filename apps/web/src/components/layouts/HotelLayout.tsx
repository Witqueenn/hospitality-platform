"use client";

import { Sidebar } from "./Sidebar";
import { AiConcierge } from "@/components/ai-concierge/AiConcierge";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogOut } from "lucide-react";

const HOTEL_NAV = [
  // ── General
  { href: "/hotel/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/hotel/bookings", label: "Bookings", icon: "📅" },
  { href: "/hotel/rooms/types", label: "Rooms", icon: "🛏" },
  { href: "/hotel/events", label: "Events", icon: "🎭" },
  { href: "/hotel/venues", label: "Venues", icon: "🏛" },
  { href: "/hotel/dining", label: "Dining", icon: "🍽" },
  { href: "/hotel/nightlife", label: "Nightlife", icon: "🌙" },
  { href: "/hotel/amenities", label: "Amenities", icon: "🏊" },
  { href: "/hotel/local-experiences", label: "Experiences", icon: "🧭" },
  { href: "/hotel/partners/mobility", label: "Mobility", icon: "🚗" },
  { href: "/hotel/vip-offers", label: "VIP Offers", icon: "👑" },
  { href: "/hotel/revenue/flash-rules", label: "Flash Deals", icon: "⚡" },
  { href: "/hotel/finance/settlements", label: "Settlements", icon: "💰" },
  { href: "/hotel/support", label: "Support Cases", icon: "🎫" },
  { href: "/hotel/approvals", label: "Approvals", icon: "✅" },
  { href: "/hotel/reviews", label: "Reviews", icon: "⭐" },
  { href: "/hotel/analytics", label: "Analytics", icon: "📈" },
  { href: "/hotel/settings/hotel", label: "Settings", icon: "⚙️" },
  // ── Operations
  {
    href: "/hotel/operations/service-requests",
    label: "Service Requests",
    icon: "🔧",
    group: "Operations",
  },
  {
    href: "/hotel/operations/incidents",
    label: "Incidents",
    icon: "⚠️",
    group: "Operations",
  },
  {
    href: "/hotel/operations/lost-found",
    label: "Lost & Found",
    icon: "📦",
    group: "Operations",
  },
  {
    href: "/hotel/operations/stay-messaging",
    label: "Stay Messaging",
    icon: "💬",
    group: "Operations",
  },
  {
    href: "/hotel/operations/wifi",
    label: "Wi-Fi",
    icon: "📶",
    group: "Operations",
  },
  {
    href: "/hotel/operations/menus",
    label: "Menus",
    icon: "🍴",
    group: "Operations",
  },
  // ── Staff
  { href: "/hotel/staff", label: "Staff Profiles", icon: "👥", group: "Staff" },
  {
    href: "/hotel/staff/reviews",
    label: "Staff Reviews",
    icon: "🌟",
    group: "Staff",
  },
  {
    href: "/hotel/staff/conduct-notes",
    label: "Conduct Notes",
    icon: "🔒",
    group: "Staff",
  },
  { href: "/hotel/staff/tips", label: "Tips", icon: "💰", group: "Staff" },
  {
    href: "/hotel/staff/recognition",
    label: "Recognition",
    icon: "🏅",
    group: "Staff",
  },
  // ── HR
  { href: "/hotel/hr/jobs", label: "Job Postings", icon: "💼", group: "HR" },
  {
    href: "/hotel/hr/applications",
    label: "Applications",
    icon: "📋",
    group: "HR",
  },
];

export function HotelLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const router = useRouter();

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar items={HOTEL_NAV} title="Hotel Portal" />
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-3">
          <div />
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{user.name}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a1a2e] text-sm font-medium text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
            >
              <LogOut className="h-3.5 w-3.5" />
              Çıkış
            </button>
          </div>
        </div>
        <div className="p-6">{children}</div>
      </main>
      <AiConcierge />
    </div>
  );
}
