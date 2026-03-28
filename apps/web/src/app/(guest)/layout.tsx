"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import {
  Search,
  BookOpen,
  MessageSquare,
  LogOut,
  User,
  Home,
  Car,
  Compass,
  Tag,
  Crown,
  MapPin,
  Map,
} from "lucide-react";

const navLinks = [
  { href: "/search", label: "Oteller", icon: Search },
  { href: "/homes", label: "Kalacak Yerler", icon: Home },
  { href: "/experiences", label: "Deneyimler", icon: Compass },
  { href: "/guides", label: "Rehberler", icon: Map },
  { href: "/offers", label: "Teklifler", icon: Tag },
];

const authLinks = [
  { href: "/vip", label: "VIP", icon: Crown },
  { href: "/my/bookings", label: "Rezervasyonlar", icon: BookOpen },
  { href: "/my/support", label: "Destek", icon: MessageSquare },
];

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, clearAuth, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  const isAuth = mounted ? isAuthenticated() : false;

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Header */}
      <header
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? "border-white/10 bg-[#09090b]/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] backdrop-blur-xl"
            : "border-transparent bg-[#09090b]"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#e94560]" />
            <span className="text-xl font-bold tracking-tighter text-white">
              Nuvoya
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            ))}
            {isAuth &&
              authLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Link>
              ))}
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {!mounted ? null : isAuth ? (
              <>
                <span className="flex items-center gap-1.5 text-sm text-slate-400">
                  <User className="h-4 w-4" />
                  {user?.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-400 transition hover:border-white/20 hover:text-white"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Çıkış
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-[#e94560] px-5 py-2 text-xs font-bold uppercase tracking-widest text-white transition hover:opacity-90 active:scale-95"
              >
                Giriş Yap
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="mt-24 border-t border-white/5 bg-[#09090b] px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#e94560]" />
              <span className="text-lg font-bold tracking-tighter text-white">
                Nuvoya
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-600">
              Her konaklama bir maceradır.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="transition hover:text-white"
              >
                {label}
              </Link>
            ))}
          </div>
          <p className="text-xs text-slate-700">
            © {new Date().getFullYear()} Nuvoya. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
