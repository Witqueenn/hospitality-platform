"use client";

import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { motion } from "framer-motion";
import { Tag, Clock, CheckCircle, ArrowRight, Package } from "lucide-react";

export default function OffersPage() {
  const { data: bundles, isLoading } = trpc.bundle.listActive.useQuery({
    limit: 20,
  });

  const list = (bundles as any[]) ?? [];

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "rgb(var(--nv-bg))" }}
    >
      {/* Hero */}
      <div className="nv-hero dot-grid relative overflow-hidden px-6 py-20">
        <div
          className="pointer-events-none absolute left-1/4 top-0 h-[300px] w-[300px] rounded-full blur-[100px]"
          style={{ backgroundColor: "rgb(34 197 94 / 0.08)" }}
        />
        <div
          className="pointer-events-none absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full blur-[100px]"
          style={{ backgroundColor: "rgb(249 115 22 / 0.08)" }}
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="nv-badge mb-6 inline-flex">
              <Tag className="h-3.5 w-3.5" style={{ color: "#f97316" }} />
              Özel Teklifler
            </div>
            <h1
              className="mb-4 text-4xl font-bold md:text-6xl"
              style={{ color: "rgb(var(--nv-text))" }}
            >
              Özel <span className="text-gradient">Teklifler</span>
            </h1>
            <p
              className="mx-auto max-w-xl text-lg"
              style={{ color: "rgb(var(--nv-muted))" }}
            >
              Seçilmiş paketler ve fırsatlar — konaklama, deneyim ve daha
              fazlası bir arada
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-12">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-2xl"
                style={{ backgroundColor: "rgb(var(--nv-surface))" }}
              />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="py-20 text-center">
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{
                border: "1px solid rgb(var(--nv-border) / 0.12)",
                backgroundColor: "rgb(var(--nv-border) / 0.05)",
              }}
            >
              <Package
                className="h-8 w-8"
                style={{ color: "rgb(var(--nv-dim))" }}
              />
            </div>
            <p style={{ color: "rgb(var(--nv-muted))" }}>Aktif teklif yok</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {list.map((bundle: any, i: number) => (
              <motion.div
                key={bundle.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
              >
                <Link
                  href={`/offers/${bundle.id}`}
                  className="nv-card group block overflow-hidden"
                >
                  {/* Header gradient banner */}
                  <div
                    className="p-5"
                    style={{
                      background:
                        "linear-gradient(to right, rgb(249 115 22 / 0.14), rgb(251 146 60 / 0.08))",
                      borderBottom: "1px solid rgb(var(--nv-border) / 0.06)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p
                          className="text-xs font-semibold uppercase tracking-wide"
                          style={{ color: "rgb(var(--nv-muted))" }}
                        >
                          {bundle.hotel?.name ?? "Platform Teklifi"}
                        </p>
                        <h2
                          className="mt-1 text-lg font-bold"
                          style={{ color: "rgb(var(--nv-text))" }}
                        >
                          {bundle.name}
                        </h2>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {bundle.subtotalCents &&
                          bundle.totalCents &&
                          bundle.subtotalCents > bundle.totalCents && (
                            <span className="rounded-full bg-[#22c55e] px-2 py-0.5 text-xs font-bold text-white">
                              -
                              {Math.round(
                                ((bundle.subtotalCents - bundle.totalCents) /
                                  bundle.subtotalCents) *
                                  100,
                              )}
                              %
                            </span>
                          )}
                        {bundle.isVipOnly && (
                          <span className="rounded-full bg-[#f59e0b] px-2 py-0.5 text-xs font-bold text-white">
                            VIP
                          </span>
                        )}
                      </div>
                    </div>
                    {bundle.description && (
                      <p
                        className="mt-2 line-clamp-2 text-sm"
                        style={{ color: "rgb(var(--nv-muted))" }}
                      >
                        {bundle.description}
                      </p>
                    )}
                  </div>

                  <div className="p-5">
                    {/* Checklist items */}
                    {bundle.items?.length > 0 && (
                      <div className="mb-4 space-y-2">
                        {bundle.items.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2 text-sm"
                            style={{ color: "rgb(var(--nv-muted))" }}
                          >
                            <CheckCircle className="h-4 w-4 shrink-0 text-[#22c55e]" />
                            {item.metadata?.itemLabel ??
                              item.itemLabel ??
                              item.itemType}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        {bundle.totalCents && (
                          <p
                            className="font-bold"
                            style={{ color: "rgb(var(--nv-text))" }}
                          >
                            {bundle.currency === "EUR" ? "€" : "$"}
                            {(bundle.totalCents / 100).toFixed(0)}
                            {bundle.subtotalCents &&
                              bundle.subtotalCents > bundle.totalCents && (
                                <span
                                  className="ml-1.5 text-xs font-normal line-through"
                                  style={{ color: "rgb(var(--nv-dim))" }}
                                >
                                  {bundle.currency === "EUR" ? "€" : "$"}
                                  {(bundle.subtotalCents / 100).toFixed(0)}
                                </span>
                              )}
                          </p>
                        )}
                        {bundle.endsAt && (
                          <span
                            className="flex items-center gap-1 text-xs"
                            style={{ color: "rgb(var(--nv-dim))" }}
                          >
                            <Clock className="h-3 w-3" />
                            itibaren{" "}
                            {new Date(bundle.endsAt).toLocaleDateString("tr")}
                          </span>
                        )}
                      </div>
                      <span
                        className="inline-flex items-center gap-1 text-sm font-semibold transition-all group-hover:gap-2"
                        style={{ color: "#f97316" }}
                      >
                        Teklifi İncele
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
