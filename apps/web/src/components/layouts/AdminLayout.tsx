"use client";

import { Sidebar } from "./Sidebar";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

const ADMIN_NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "🌐" },
  { href: "/admin/tenants", label: "Tenants", icon: "🏢" },
  { href: "/admin/hotels", label: "Hotels", icon: "🏨" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/partners", label: "Partners", icon: "🤝" },
  { href: "/admin/partner-verification", label: "Partner Verify", icon: "✔️" },
  { href: "/admin/trusted-stays", label: "Trusted Stays", icon: "🏠" },
  { href: "/admin/marketplace-moderation", label: "Marketplace", icon: "🛍" },
  { href: "/admin/settlements", label: "Settlements", icon: "💰" },
  { href: "/admin/cases", label: "All Cases", icon: "🎫" },
  { href: "/admin/agents/logs", label: "Agent Logs", icon: "🤖" },
  { href: "/admin/analytics", label: "Analytics", icon: "📈" },
  { href: "/admin/policies", label: "Policies", icon: "📋" },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar items={ADMIN_NAV} title="Admin Portal" accentColor="#f59e0b" />
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-3">
          <span className="text-sm font-medium text-amber-600">
            Platform Admin
          </span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{user?.name}</span>
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
    </div>
  );
}
