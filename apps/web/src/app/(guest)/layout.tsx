"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import {
  Hotel,
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
} from "lucide-react";

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, clearAuth, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  const isAuth = mounted ? isAuthenticated() : false;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-[#1a1a2e]"
          >
            <Hotel className="h-6 w-6" />
            <span>HEO Platform</span>
          </Link>

          <nav className="hidden items-center gap-5 md:flex">
            <Link
              href="/search"
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#1a1a2e]"
            >
              <Search className="h-4 w-4" /> Search
            </Link>
            <Link
              href="/homes"
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#1a1a2e]"
            >
              <Home className="h-4 w-4" /> Stays
            </Link>
            <Link
              href="/experiences"
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#1a1a2e]"
            >
              <Compass className="h-4 w-4" /> Experiences
            </Link>
            <Link
              href="/mobility"
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#1a1a2e]"
            >
              <Car className="h-4 w-4" /> Mobility
            </Link>
            <Link
              href="/offers"
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#1a1a2e]"
            >
              <Tag className="h-4 w-4" /> Offers
            </Link>
            {isAuth && (
              <>
                <Link
                  href="/vip"
                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#1a1a2e]"
                >
                  <Crown className="h-4 w-4" /> VIP
                </Link>
                <Link
                  href="/my/bookings"
                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#1a1a2e]"
                >
                  <BookOpen className="h-4 w-4" /> Bookings
                </Link>
                <Link
                  href="/my/support"
                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#1a1a2e]"
                >
                  <MessageSquare className="h-4 w-4" /> Support
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {!mounted ? null : isAuth ? (
              <>
                <span className="flex items-center gap-1.5 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  {user?.name}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="mr-1.5 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button size="sm">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>

      <footer className="mt-16 border-t bg-white py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Hospitality Experience Orchestration
        Platform
      </footer>
    </div>
  );
}
