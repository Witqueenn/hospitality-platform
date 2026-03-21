"use client";

import { Sidebar } from "./Sidebar";
import { useAuthStore } from "@/stores/authStore";

const ADMIN_NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "🌐" },
  { href: "/admin/tenants", label: "Tenants", icon: "🏢" },
  { href: "/admin/hotels", label: "Hotels", icon: "🏨" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/cases", label: "All Cases", icon: "🎫" },
  { href: "/admin/agents/logs", label: "Agent Logs", icon: "🤖" },
  { href: "/admin/analytics", label: "Analytics", icon: "📈" },
  { href: "/admin/policies", label: "Policies", icon: "📋" },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar items={ADMIN_NAV} title="Admin Portal" accentColor="#f59e0b" />
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-3">
          <span className="text-sm font-medium text-amber-600">
            Platform Admin
          </span>
          <span className="text-sm text-gray-600">{user?.name}</span>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
