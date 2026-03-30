"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { LogOut, User, MapPin } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { PageTransition } from "@/components/ui/page-transition";

const navLinks = [
  { href: "/search", label: "Oteller" },
  { href: "/homes", label: "Kalacak Yerler" },
  { href: "/experiences", label: "Deneyimler" },
  { href: "/tonight", label: "Bu Gece" },
  { href: "/offers", label: "Teklifler" },
  { href: "/guides", label: "Rehberler" },
];

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, clearAuth, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isAuth = mounted ? isAuthenticated() : false;

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "rgb(var(--nv-bg))",
        color: "rgb(var(--nv-text))",
      }}
    >
      <header
        style={{
          backgroundColor: scrolled
            ? "rgb(var(--nv-bg) / 0.85)"
            : "transparent",
          borderBottom: scrolled
            ? "1px solid rgb(var(--nv-border) / 0.1)"
            : "1px solid transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
          boxShadow: scrolled
            ? "0 4px 24px rgb(var(--nv-shadow) / 0.10)"
            : "none",
        }}
        className="sticky top-0 z-50 transition-all duration-300"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#f97316] to-[#fb923c] shadow-[0_2px_8px_rgba(249,115,22,0.4)]">
              <MapPin className="h-3.5 w-3.5 text-white" />
            </div>
            <span
              className="text-lg font-bold tracking-tight"
              style={{ color: "rgb(var(--nv-text))" }}
            >
              Nuvoya
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map(({ href, label }) => {
              const active =
                pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className="relative rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                  style={{
                    color: active
                      ? "rgb(var(--nv-text))"
                      : "rgb(var(--nv-muted))",
                    backgroundColor: active
                      ? "rgb(var(--nv-border) / 0.06)"
                      : "transparent",
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {!mounted ? (
              <div className="h-8 w-20" />
            ) : isAuth ? (
              <>
                <span
                  className="flex items-center gap-1.5 text-sm"
                  style={{ color: "rgb(var(--nv-muted))" }}
                >
                  <User className="h-3.5 w-3.5" />
                  {user?.name}
                </span>
                <button
                  onClick={() => {
                    clearAuth();
                    router.push("/login");
                  }}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition"
                  style={{
                    border: "1px solid rgb(var(--nv-border) / 0.12)",
                    color: "rgb(var(--nv-muted))",
                  }}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Çıkış
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-full px-5 py-2 text-xs font-bold uppercase tracking-widest text-white transition hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "#f97316" }}
              >
                Giriş Yap
              </Link>
            )}
          </div>
        </div>
      </header>

      <main>
        <PageTransition>{children}</PageTransition>
      </main>

      <footer
        className="mt-24 px-6 py-14"
        style={{
          borderTop: "1px solid rgb(var(--nv-border) / 0.08)",
          backgroundColor: "rgb(var(--nv-surface-2))",
        }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#f97316] to-[#fb923c]">
                  <MapPin className="h-3.5 w-3.5 text-white" />
                </div>
                <span
                  className="text-lg font-bold tracking-tight"
                  style={{ color: "rgb(var(--nv-text))" }}
                >
                  Nuvoya
                </span>
              </div>
              <p
                className="mt-3 text-sm leading-relaxed"
                style={{ color: "rgb(var(--nv-dim))" }}
              >
                Her konaklama bir maceradır. Doğrulanmış oteller, butik evler ve
                unutulmaz deneyimler.
              </p>
            </div>
            <div>
              <p
                className="mb-4 text-xs font-semibold uppercase tracking-widest"
                style={{ color: "rgb(var(--nv-dim))" }}
              >
                Keşfet
              </p>
              <div className="grid grid-cols-2 gap-2">
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="text-sm transition hover:underline"
                    style={{ color: "rgb(var(--nv-muted))" }}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p
                className="mb-4 text-xs font-semibold uppercase tracking-widest"
                style={{ color: "rgb(var(--nv-dim))" }}
              >
                Hesabım
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/my/bookings"
                  className="text-sm transition hover:underline"
                  style={{ color: "rgb(var(--nv-muted))" }}
                >
                  Rezervasyonlarım
                </Link>
                <Link
                  href="/vip"
                  className="text-sm transition hover:underline"
                  style={{ color: "rgb(var(--nv-muted))" }}
                >
                  VIP Üyelik
                </Link>
                <Link
                  href="/my/support"
                  className="text-sm transition hover:underline"
                  style={{ color: "rgb(var(--nv-muted))" }}
                >
                  Destek
                </Link>
              </div>
            </div>
          </div>
          <div
            className="mt-12 flex flex-col items-center justify-between gap-3 pt-6 text-xs md:flex-row"
            style={{
              borderTop: "1px solid rgb(var(--nv-border) / 0.06)",
              color: "rgb(var(--nv-dim))",
            }}
          >
            <span>
              © {new Date().getFullYear()} Nuvoya. Tüm hakları saklıdır.
            </span>
            <div className="flex gap-4">
              <Link href="#" className="hover:underline">
                Gizlilik
              </Link>
              <Link href="#" className="hover:underline">
                Kullanım Şartları
              </Link>
              <Link href="#" className="hover:underline">
                Çerezler
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
