"use client";

import { useParams } from "next/navigation";
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
  ArrowLeft,
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

export default function HomesDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: unit, isLoading } = trpc.trustedStay.getUnit.useQuery({
    id: slug,
  });

  if (isLoading) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: "rgb(var(--nv-bg))" }}
      >
        <div
          className="h-[55vh] animate-pulse"
          style={{ backgroundColor: "rgb(var(--nv-surface))" }}
        />
        <div className="mx-auto max-w-5xl space-y-5 px-6 py-10">
          <div
            className="h-9 w-72 animate-pulse rounded-xl"
            style={{ backgroundColor: "rgb(var(--nv-surface))" }}
          />
          <div
            className="h-5 w-48 animate-pulse rounded-lg"
            style={{ backgroundColor: "rgb(var(--nv-surface))" }}
          />
          <div
            className="h-24 animate-pulse rounded-2xl"
            style={{ backgroundColor: "rgb(var(--nv-surface))" }}
          />
        </div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
        style={{ backgroundColor: "rgb(var(--nv-bg))" }}
      >
        <div
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{
            border: "1px solid rgb(var(--nv-border) / 0.1)",
            backgroundColor: "rgb(var(--nv-border) / 0.05)",
          }}
        >
          <Home className="h-8 w-8" style={{ color: "rgb(var(--nv-dim))" }} />
        </div>
        <h2
          className="mb-2 text-xl font-bold"
          style={{ color: "rgb(var(--nv-text))" }}
        >
          Konaklama bulunamadı
        </h2>
        <Link
          href="/homes"
          className="mt-4 flex items-center gap-2 text-sm font-medium hover:underline"
          style={{ color: "#f97316" }}
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
    <div
      className="min-h-screen"
      style={{ backgroundColor: "rgb(var(--nv-bg))" }}
    >
      {/* ── Photo Hero ── */}
      <div
        className="relative h-[60vh] min-h-[400px] overflow-hidden"
        style={{ backgroundColor: "rgb(var(--nv-surface))" }}
      >
        <img
          src={photos[0]}
          alt={u.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

        {/* Back button */}
        <div className="absolute left-6 top-6">
          <Link
            href="/homes"
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-white backdrop-blur-sm transition hover:bg-black/60"
            style={{
              backgroundColor: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <ArrowLeft className="h-4 w-4" /> Geri
          </Link>
        </div>

        {/* Title overlay on hero */}
        <div className="absolute bottom-0 left-0 right-0 px-8 pb-8">
          <div className="mx-auto max-w-5xl">
            <h1 className="text-3xl font-bold text-white drop-shadow-lg md:text-4xl">
              {u.name}
            </h1>
            {u.city && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-white/80">
                <MapPin className="h-4 w-4" />
                {u.city}
                {u.country ? `, ${u.country}` : ""}
              </p>
            )}
          </div>
        </div>

        {/* Thumbnail strip */}
        {photos.length > 1 && (
          <div className="absolute bottom-6 right-8 hidden gap-2 md:flex">
            {photos.slice(1, 5).map((src: string, i: number) => (
              <div
                key={i}
                className="h-16 w-24 overflow-hidden rounded-lg border-2 border-white/30 shadow-xl"
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* ── Left: main info ── */}
          <div className="space-y-8 lg:col-span-2">
            {/* Rating */}
            {u.ratingAggregate != null && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2"
                  style={{
                    border: "1px solid rgba(251,146,60,0.25)",
                    backgroundColor: "rgba(251,146,60,0.10)",
                  }}
                >
                  <Star className="h-4 w-4 fill-[#fb923c] text-[#fb923c]" />
                  <span
                    className="text-lg font-bold"
                    style={{ color: "rgb(var(--nv-text))" }}
                  >
                    {Number(u.ratingAggregate).toFixed(1)}
                  </span>
                  <span
                    className="text-sm"
                    style={{ color: "rgb(var(--nv-muted))" }}
                  >
                    / 5
                  </span>
                </div>
              </motion.div>
            )}

            {/* Host */}
            {u.host && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
              >
                <div
                  className="flex items-center gap-4 rounded-2xl p-4"
                  style={{
                    border: "1px solid rgb(var(--nv-border) / 0.08)",
                    backgroundColor: "rgb(var(--nv-surface))",
                    boxShadow: "0 2px 12px rgb(var(--nv-shadow) / 0.06)",
                  }}
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
                    style={{
                      background: "linear-gradient(135deg, #f97316, #fb923c)",
                    }}
                  >
                    {u.host.displayName?.[0] ?? "H"}
                  </div>
                  <div>
                    <p
                      className="font-semibold"
                      style={{ color: "rgb(var(--nv-text))" }}
                    >
                      {u.host.displayName}
                    </p>
                    {u.host.verificationStatus === "VERIFIED" ? (
                      <div
                        className="mt-0.5 flex items-center gap-1 text-xs"
                        style={{ color: "#67dc9f" }}
                      >
                        <Shield className="h-3 w-3" /> Doğrulanmış ev sahibi
                      </div>
                    ) : (
                      <p
                        className="mt-0.5 text-xs"
                        style={{ color: "rgb(var(--nv-dim))" }}
                      >
                        {u.host.verificationStatus}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Description */}
            {u.description && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <p
                  className="mb-3 text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "rgb(var(--nv-dim))" }}
                >
                  Hakkında
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "rgb(var(--nv-muted))" }}
                >
                  {u.description}
                </p>
              </motion.div>
            )}

            {/* Amenities */}
            {u.amenities?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
              >
                <p
                  className="mb-3 text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "rgb(var(--nv-dim))" }}
                >
                  Olanaklar
                </p>
                <div className="flex flex-wrap gap-2">
                  {(u.amenities as string[]).map((a: string) => (
                    <span
                      key={a}
                      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs"
                      style={{
                        border: "1px solid rgb(var(--nv-border) / 0.1)",
                        backgroundColor: "rgb(var(--nv-border) / 0.05)",
                        color: "rgb(var(--nv-muted))",
                      }}
                    >
                      <CheckCircle
                        className="h-3 w-3"
                        style={{ color: "#67dc9f" }}
                      />{" "}
                      {a}
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
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <p
                  className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "rgb(var(--nv-dim))" }}
                >
                  <Calendar className="h-3.5 w-3.5" /> Müsait Tarihler
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableDates.slice(0, 14).map((a: any) => (
                    <span
                      key={a.date}
                      className="rounded-xl px-3 py-1.5 text-xs font-medium"
                      style={{
                        border: "1px solid rgba(103,220,159,0.2)",
                        backgroundColor: "rgba(103,220,159,0.10)",
                        color: "#67dc9f",
                      }}
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

          {/* ── Right: Booking card ── */}
          <div className="space-y-4">
            {u.ratePlans?.map((plan: any, i: number) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.05 }}
              >
                <div
                  className="rounded-2xl p-6"
                  style={{
                    border: "1px solid rgb(var(--nv-border) / 0.1)",
                    backgroundColor: "rgb(var(--nv-surface))",
                    boxShadow: "0 4px 20px rgb(var(--nv-shadow) / 0.10)",
                  }}
                >
                  <p
                    className="text-xs uppercase tracking-widest"
                    style={{ color: "rgb(var(--nv-dim))" }}
                  >
                    {STAY_TERM_LABELS[plan.stayTerm] ?? plan.stayTerm} Fiyat
                  </p>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span
                      className="text-4xl font-bold"
                      style={{ color: "rgb(var(--nv-text))" }}
                    >
                      ${(plan.baseRateCents / 100).toFixed(0)}
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: "rgb(var(--nv-muted))" }}
                    >
                      / gece
                    </span>
                  </div>
                  {plan.minStayNights && (
                    <p
                      className="mt-1 flex items-center gap-1 text-xs"
                      style={{ color: "rgb(var(--nv-dim))" }}
                    >
                      <Clock className="h-3 w-3" /> Min. {plan.minStayNights}{" "}
                      gece
                    </p>
                  )}
                  <button className="mt-5 w-full rounded-xl bg-[#f97316] py-3 font-semibold text-white transition hover:opacity-90 active:scale-95">
                    Rezervasyon İste
                  </button>
                </div>
              </motion.div>
            ))}

            {(!u.ratePlans || u.ratePlans.length === 0) && (
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div
                  className="rounded-2xl p-6 text-center"
                  style={{
                    border: "1px solid rgb(var(--nv-border) / 0.1)",
                    backgroundColor: "rgb(var(--nv-surface))",
                  }}
                >
                  <p
                    className="mb-4 text-sm"
                    style={{ color: "rgb(var(--nv-muted))" }}
                  >
                    Fiyat için ev sahibiyle iletişime geç
                  </p>
                  <button className="w-full rounded-xl bg-[#f97316] py-3 font-semibold text-white transition hover:opacity-90">
                    Ev Sahibine Ulaş
                  </button>
                </div>
              </motion.div>
            )}

            {/* Trust signals */}
            <div
              className="space-y-3 rounded-2xl p-4"
              style={{
                border: "1px solid rgb(var(--nv-border) / 0.06)",
                backgroundColor: "rgb(var(--nv-surface))",
              }}
            >
              {[
                { icon: Shield, text: "Doğrulanmış mülk ve ev sahibi" },
                { icon: CheckCircle, text: "Güvenli ödeme sistemi" },
                {
                  icon: Calendar,
                  text: "Ücretsiz iptal (48 saat öncesine kadar)",
                },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-2 text-xs"
                  style={{ color: "rgb(var(--nv-muted))" }}
                >
                  <Icon
                    className="h-4 w-4 shrink-0"
                    style={{ color: "#67dc9f" }}
                  />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
