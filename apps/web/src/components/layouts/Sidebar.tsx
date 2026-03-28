"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface SidebarProps {
  items: NavItem[];
  title: string;
  accentColor?: string;
}

export function Sidebar({
  items,
  title,
  accentColor = "#e94560",
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex min-h-screen w-64 flex-col bg-[#1a1a2e] text-white">
      <div className="border-b border-white/10 px-6 py-5">
        <h1 className="text-lg font-bold" style={{ color: accentColor }}>
          Nuvoya
        </h1>
        <p className="mt-0.5 text-xs text-gray-400">{title}</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-white/15 font-medium text-white"
                  : "text-gray-400 hover:bg-white/10 hover:text-white",
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
