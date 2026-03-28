"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import {
  Home,
  Star,
  MapPin,
  Shield,
  CheckCircle,
  Calendar,
  Users,
  Wifi,
  ArrowLeft,
  ChevronRight,
  Bed,
  Clock,
} from "lucide-react";

const STAY_TERM_LABELS: Record<string, string> = {
  DAILY: "Gecelik",
  WEEKLY: "Haftalık",
  MONTHLY: "Aylık",
  FLEX: "Esnek",
};

const PLACEHOLDER_IMGS = [
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80",
  "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&q=80",
];

export default function HomesDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  const { data: unit, isLoading } = trpc.trustedStay.getUnit.useQuery({
    id: slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] px-6 py-16">
        <div className="mx-auto max-w-4xl space-y-5">
          <div className="h-80 animate-pulse rounded-2xl bg-[#0e0e10]" />
          <div className="h-8 w-64 animate-pulse rounded-xl bg-[#0e0e10]" />
          <div className="h-32 animate-pulse rounded-2xl bg-[#0e0e10]" />
        </div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] px-6 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <Home className="h-8 w-8 text-slate-500" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-white">
          Konaklama bulunamadı
        </h2>
        <Link
          href="/homes"
          className="mt-4 flex items-center gap-2 text-sm font-medium text-[#f97316] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Tüm konaklama yerlerine dön
        </Link>
      </div>
    );
  }

  const u = unit as any;

  const photos: string[] = u.photos?.length > 0 ? u.photos : PLACEHOLDER_IMGS;

  const availableDates =
    u.availability?.filter((a: any) => a.isAvailable && a.remainingUnits > 0) ??
    [];

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Photo Hero */}
      <div className="relative h-[55vh] min-h-[360px] overflow-hidden bg-[#0e0e10]">
        <img
          src={photos[0]}
          alt={u.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-transparent" />

        {/* Thumbnail strip */}
        {photos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {photos.slice(1, 5).map((src: string, i: number) => (
              <div
                key={i}
                className="h-14 w-20 overflow-hidden rounded-lg border border-white/20"
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}

        <div className="absolute left-6 top-6">
          <Link
            href="/homes"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-sm text-white backdrop-blur-sm transition hover:bg-black/60"
          >
            <ArrowLeft className="h-4 w-4" /> Geri
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left — Main info */}
          <div className="space-y-8 lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white md:text-3xl">
                    {u.name}
                  </h1>
                  {u.city && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-400">
                      <MapPin className="h-4 w-4" />
                      {u.city}
                      {u.country ? `, ${u.country}` : ""}
                    </p>
                  )}
                </div>
                {u.ratingAggregate != null && (
                  <div className="flex items-center gap-1.5 rounded-xl border border-[#fb923c]/20 bg-[#fb923c]/10 px-3 py-2">
                    <Star className="h-4 w-4 fill-[#fb923c] text-[#fb923c]" />
                    <span className="text-lg font-bold text-white">
                      {Number(u.ratingAggregate).toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Host */}
            {u.host && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="flex items-center gap-4 rounded-2xl border border-white/5 bg-[#0e0e10] p-4"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f97316]/10 text-lg font-bold text-[#f97316]">
                  {u.host.displayName?.[0] ?? "H"}
                </div>
                <div>
                  <p className="font-semibold text-white">
                    {u.host.displayName}
                  </p>
                  {u.host.verificationStatus === "VERIFIED" ? (
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-[#67dc9f]">
                      <Shield className="h-3 w-3" /> Doğrulanmış ev sahibi
                    </div>
                  ) : (
                    <p className="mt-0.5 text-xs text-slate-500">
                      {u.host.verificationStatus}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Description */}
            {u.description && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
              >
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Hakkında
                </p>
                <p className="text-sm leading-relaxed text-slate-300">
                  {u.description}
                </p>
              </motion.div>
            )}

            {/* Amenities */}
            {u.amenities?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Olanaklar
                </p>
                <div className="flex flex-wrap gap-2">
                  {(u.amenities as string[]).map((a: string) => (
                    <span
                      key={a}
                      className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300"
                    >
                      <CheckCircle className="h-3 w-3 text-[#67dc9f]" /> {a}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Available Dates */}
            {availableDates.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
              >
                <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                  <Calendar className="h-3.5 w-3.5" /> Müsait Tarihler
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableDates.slice(0, 14).map((a: any) => (
                    <span
                      key={a.date}
                      className="rounded-xl border border-[#67dc9f]/20 bg-[#67dc9f]/10 px-3 py-1.5 text-xs font-medium text-[#67dc9f]"
                    >
                      {new Date(a.date).toLocaleDateString("tr", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right — Booking card */}
          <div className="space-y-4">
            {u.ratePlans?.map((plan: any) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="rounded-2xl border border-white/10 bg-[#0e0e10] p-6"
              >
                <p className="text-xs uppercase tracking-widest text-slate-500">
                  {STAY_TERM_LABELS[plan.stayTerm] ?? plan.stayTerm} Fiyat
                </p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    ${(plan.baseRateCents / 100).toFixed(0)}
                  </span>
                  <span className="text-sm text-slate-400">/ gece</span>
                </div>
                {plan.minStayNights && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="h-3 w-3" /> Min. {plan.minStayNights} gece
                  </p>
                )}
                <button className="mt-5 w-full rounded-xl bg-[#f97316] py-3 font-semibold text-white transition hover:opacity-90 active:scale-95">
                  Rezervasyon İste
                </button>
              </motion.div>
            ))}

            {(!u.ratePlans || u.ratePlans.length === 0) && (
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="rounded-2xl border border-white/10 bg-[#0e0e10] p-6 text-center"
              >
                <p className="mb-4 text-sm text-slate-400">
                  Fiyat için ev sahibiyle iletişime geç
                </p>
                <button className="w-full rounded-xl bg-[#f97316] py-3 font-semibold text-white transition hover:opacity-90">
                  Ev Sahibine Ulaş
                </button>
              </motion.div>
            )}

            {/* Trust signals */}
            <div className="space-y-3 rounded-2xl border border-white/5 bg-[#0e0e10] p-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Shield className="h-4 w-4 text-[#67dc9f]" />
                <span>Doğrulanmış mülk ve ev sahibi</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle className="h-4 w-4 text-[#67dc9f]" />
                <span>Güvenli ödeme sistemi</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Calendar className="h-4 w-4 text-[#67dc9f]" />
                <span>Ücretsiz iptal (48 saat öncesine kadar)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
