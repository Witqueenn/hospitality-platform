"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

const options = [
  { value: "light", label: "Açık", icon: Sun },
  { value: "system", label: "Sistem", icon: Monitor },
  { value: "dark", label: "Koyu", icon: Moon },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-8 w-[120px]" />;

  return (
    <div className="border-nv-border/10 bg-nv-surface/60 flex items-center gap-0.5 rounded-xl border p-1 backdrop-blur-sm">
      {options.map(({ value, label, icon: Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            aria-label={label}
            title={label}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-200 ${
              active
                ? "bg-nv-bg text-nv-text shadow-sm"
                : "text-nv-dim hover:text-nv-muted"
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
