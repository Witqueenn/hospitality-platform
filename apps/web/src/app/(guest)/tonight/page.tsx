"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Clock, Tag, Users } from "lucide-react";

export default function TonightDealsPage() {
  const [date] = useState(() => new Date().toISOString().split("T")[0]);

  const { data: dealsRaw, isLoading } = trpc.flashInventory.listActive.useQuery(
    {
      date,
      limit: 20,
    },
  );
  const deals = dealsRaw as any[] | undefined;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "rgb(var(--nv-bg))" }}
    >
      {/* Hero — urgent, amber-infused */}
      <div className="nv-hero dot-grid relative overflow-hidden px-6 py-20">
        <div
          className="pointer-events-none absolute left-1/4 top-0 h-[300px] w-[300px] rounded-full blur-[100px]"
          style={{ backgroundColor: "rgb(245 158 11 / 0.12)" }}
        />
        <div
          className="pointer-events-none absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full blur-[100px]"
          style={{ backgroundColor: "rgb(249 115 22 / 0.10)" }}
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="nv-badge mb-6 inline-flex">
              <Zap className="h-3.5 w-3.5" style={{ color: "#f97316" }} />
              Flaş Fırsatlar
            </div>
            <h1
              className="mb-4 text-4xl font-bold md:text-6xl"
              style={{ color: "rgb(var(--nv-text))" }}
            >
              Bu Gece <span className="text-gradient">Fırsatları</span>
            </h1>
            <p
              className="mx-auto max-w-xl text-lg"
              style={{ color: "rgb(var(--nv-muted))" }}
            >
              Aynı gece ve gece kullanımı için özel fiyatlar — canlı
              güncelleniyor
            </p>
            <div
              className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm"
              style={{ color: "rgb(var(--nv-dim))" }}
            >
              <span className="flex items-center gap-1.5">
                <Tag className="h-4 w-4" /> Anlık onay
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> Sınırlı süre
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-2xl"
                style={{ backgroundColor: "rgb(var(--nv-surface))" }}
              />
            ))}
          </div>
        ) : !deals || deals.length === 0 ? (
          <div className="py-20 text-center">
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{
                border: "1px solid rgb(var(--nv-border) / 0.12)",
                backgroundColor: "rgb(var(--nv-border) / 0.05)",
              }}
            >
              <Zap
                className="h-8 w-8"
                style={{ color: "rgb(var(--nv-dim))" }}
              />
            </div>
            <h3
              className="mb-2 text-lg font-bold"
              style={{ color: "rgb(var(--nv-text))" }}
            >
              Aktif fırsat bulunamadı
            </h3>
            <p className="text-sm" style={{ color: "rgb(var(--nv-muted))" }}>
              Gün içinde yeni fırsatlar ekleniyor
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {deals.map((deal, i) => {
              const snapshot = deal.rateSnapshots?.[0];
              const hotel = deal.hotel as {
                name: string;
                slug: string;
                starRating?: number | null;
              };
              const roomType = deal.roomType as {
                name: string;
                capacity?: number | null;
              };
              const discountPct = snapshot
                ? Math.round(
                    ((snapshot.originalPriceCents - snapshot.flashPriceCents) /
                      snapshot.originalPriceCents) *
                      100,
                  )
                : 0;

              return (
                <motion.div
                  key={deal.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="nv-card overflow-hidden"
                >
                  {/* Header band — amber gradient */}
                  <div
                    className="px-4 py-3"
                    style={{
                      background:
                        "linear-gradient(to right, rgb(249 115 22 / 0.15), rgb(245 158 11 / 0.10))",
                      borderBottom: "1px solid rgb(var(--nv-border) / 0.06)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "rgb(var(--nv-muted))" }}
                      >
                        {deal.isVipEarlyAccess
                          ? "VIP Erken Erişim"
                          : "Flaş Fırsat"}
                      </span>
                      {discountPct > 0 && (
                        <span className="rounded-full bg-[#f59e0b] px-2 py-0.5 text-xs font-bold text-white">
                          -{discountPct}%
                        </span>
                      )}
                    </div>
                    <p
                      className="mt-1 text-lg font-bold"
                      style={{ color: "rgb(var(--nv-text))" }}
                    >
                      {deal.name}
                    </p>
                  </div>

                  <div className="space-y-3 p-4">
                    <div>
                      <p
                        className="font-semibold"
                        style={{ color: "rgb(var(--nv-text))" }}
                      >
                        {hotel.name}
                      </p>
                      {hotel.starRating && (
                        <p className="text-sm text-[#f59e0b]">
                          {"★".repeat(hotel.starRating)}
                        </p>
                      )}
                    </div>

                    <div
                      className="rounded-lg px-3 py-2"
                      style={{
                        backgroundColor: "rgb(var(--nv-bg))",
                        border: "1px solid rgb(var(--nv-border) / 0.06)",
                      }}
                    >
                      <p
                        className="text-xs"
                        style={{ color: "rgb(var(--nv-muted))" }}
                      >
                        {roomType.name}
                      </p>
                      {roomType.capacity && (
                        <p
                          className="mt-0.5 flex items-center gap-1 text-xs"
                          style={{ color: "rgb(var(--nv-dim))" }}
                        >
                          <Users className="h-3 w-3" /> En fazla{" "}
                          {roomType.capacity} misafir
                        </p>
                      )}
                    </div>

                    {snapshot && (
                      <div className="flex items-baseline gap-2">
                        <span
                          className="text-2xl font-bold"
                          style={{ color: "#f97316" }}
                        >
                          ${(snapshot.flashPriceCents / 100).toFixed(0)}
                        </span>
                        {discountPct > 0 && (
                          <span
                            className="text-sm line-through"
                            style={{ color: "rgb(var(--nv-dim))" }}
                          >
                            ${(snapshot.originalPriceCents / 100).toFixed(0)}
                          </span>
                        )}
                        <span
                          className="text-xs"
                          style={{ color: "rgb(var(--nv-dim))" }}
                        >
                          / gece
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span
                        className="flex items-center gap-1 text-xs"
                        style={{ color: "rgb(var(--nv-dim))" }}
                      >
                        <Clock className="h-3 w-3" />
                        Bitiş{" "}
                        {new Date(deal.endsAt).toLocaleTimeString("tr", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <Link
                        href={`/hotel/${hotel.slug}`}
                        className="nv-btn-primary rounded-lg px-3 py-1.5 text-xs"
                      >
                        Rezervasyon Yap
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
