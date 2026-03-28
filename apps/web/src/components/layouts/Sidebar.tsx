"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  group?: string;
}

interface SidebarProps {
  items: NavItem[];
  title: string;
  accentColor?: string;
}

export function Sidebar({
  items,
  title,
  accentColor = "#f97316",
}: SidebarProps) {
  const pathname = usePathname();

  // Group items by their `group` field, preserving insertion order
  const grouped: { group: string | null; items: NavItem[] }[] = [];
  for (const item of items) {
    const g = item.group ?? null;
    const last = grouped[grouped.length - 1];
    if (last && last.group === g) {
      last.items.push(item);
    } else {
      grouped.push({ group: g, items: [item] });
    }
  }

  return (
    <aside className="flex min-h-screen w-64 flex-col bg-[#1a1a2e] text-white">
      <div className="border-b border-white/10 px-6 py-5">
        <h1 className="text-lg font-bold" style={{ color: accentColor }}>
          Nuvoya
        </h1>
        <p className="mt-0.5 text-xs text-gray-400">{title}</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {grouped.map(({ group, items: groupItems }, gi) => (
          <div key={gi} className={gi > 0 ? "mt-4" : ""}>
            {group && (
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                {group}
              </p>
            )}
            <div className="space-y-0.5">
              {groupItems.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-white/15 font-medium text-white"
                        : "text-gray-400 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <span className="text-base leading-none">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
