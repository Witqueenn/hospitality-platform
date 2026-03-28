"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { MapPin } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);

  const register = trpc.auth.register.useMutation({
    onSuccess: () => router.push("/login?registered=1"),
    onError: (e) => setError(e.message),
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090b] p-4">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-[400px] w-[400px] rounded-full bg-[#7c3aed]/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-[#f97316]/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#f97316]" />
            <span className="text-2xl font-bold tracking-tighter text-white">
              Nuvoya
            </span>
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0e0e10]/80 p-8 shadow-2xl backdrop-blur-md">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white">Maceraya katıl</h1>
            <p className="mt-1 text-sm text-slate-400">
              Hesap oluştur, keşfetmeye başla
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              register.mutate(form);
            }}
            className="space-y-4"
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Ad Soyad
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 outline-none transition focus:border-[#7c3aed]/50 focus:ring-1 focus:ring-[#7c3aed]/30"
                placeholder="Adın Soyadın"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                E-posta
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 outline-none transition focus:border-[#7c3aed]/50 focus:ring-1 focus:ring-[#7c3aed]/30"
                placeholder="sen@ornek.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Şifre
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                required
                minLength={8}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 outline-none transition focus:border-[#7c3aed]/50 focus:ring-1 focus:ring-[#7c3aed]/30"
                placeholder="En az 8 karakter"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-[#f97316]/30 bg-[#f97316]/10 px-4 py-3 text-sm text-[#ffb2b7]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={register.isPending}
              className="mt-2 w-full rounded-lg bg-[#f97316] py-3 font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:opacity-60"
            >
              {register.isPending ? "Hesap oluşturuluyor..." : "Hesap Oluştur"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Zaten hesabın var mı?{" "}
            <Link
              href="/login"
              className="font-medium text-[#f97316] hover:underline"
            >
              Giriş yap
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
