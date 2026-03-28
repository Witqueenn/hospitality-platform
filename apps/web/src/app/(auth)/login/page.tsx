"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { isHotelStaff, isPlatformAdmin } from "@/lib/auth";
import { Suspense } from "react";
import { MapPin } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "1";
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const login = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      setAuth(data.user as Parameters<typeof setAuth>[0], data.token);
      if (isPlatformAdmin(data.user.role)) {
        router.push("/admin/dashboard");
      } else if (isHotelStaff(data.user.role)) {
        router.push("/hotel/dashboard");
      } else {
        router.push("/search");
      }
    },
    onError: (e) => setError(e.message),
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090b] p-4">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-[400px] w-[400px] rounded-full bg-[#e94560]/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-[#7c3aed]/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#e94560]" />
            <span className="text-2xl font-bold tracking-tighter text-white">
              Nuvoya
            </span>
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0e0e10]/80 p-8 shadow-2xl backdrop-blur-md">
          {registered && (
            <div className="mb-6 rounded-lg border border-[#67dc9f]/30 bg-[#67dc9f]/10 px-4 py-3 text-sm text-[#67dc9f]">
              ✓ Hesabın oluşturuldu! Giriş yapabilirsin.
            </div>
          )}

          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white">Tekrar hoş geldin</h1>
            <p className="mt-1 text-sm text-slate-400">
              Macerana kaldığın yerden devam et
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              login.mutate({ email, password });
            }}
            className="space-y-4"
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                E-posta
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 outline-none transition focus:border-[#e94560]/50 focus:ring-1 focus:ring-[#e94560]/30"
                placeholder="sen@ornek.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 outline-none transition focus:border-[#e94560]/50 focus:ring-1 focus:ring-[#e94560]/30"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-[#e94560]/30 bg-[#e94560]/10 px-4 py-3 text-sm text-[#ffb2b7]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={login.isPending}
              className="mt-2 w-full rounded-lg bg-[#e94560] py-3 font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:opacity-60"
            >
              {login.isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Hesabın yok mu?{" "}
            <Link
              href="/register"
              className="font-medium text-[#e94560] hover:underline"
            >
              Kayıt ol
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/hotel/login"
            className="text-xs text-slate-600 transition hover:text-slate-400"
          >
            Otel portalına gitmek mi istiyorsun? →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090b]" />}>
      <LoginContent />
    </Suspense>
  );
}
