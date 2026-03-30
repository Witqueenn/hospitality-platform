"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Car, Star, Clock, Users } from "lucide-react";

const MOBILITY_TYPE_LABELS: Record<string, string> = {
  TAXI: "Taksi",
  TRANSFER: "Transfer",
  RENTAL: "Kiralık",
  SHUTTLE: "Servis",
  CHAUFFEUR: "Şoförlü",
  BICYCLE: "Bisiklet",
  SCOOTER: "Scooter",
};

const MOBILITY_ICON_COLORS: Record<string, { bg: string; color: string }> = {
  TAXI: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b" },
  TRANSFER: { bg: "rgba(59,130,246,0.15)", color: "#60a5fa" },
  RENTAL: { bg: "rgba(34,197,94,0.15)", color: "#4ade80" },
  SHUTTLE: { bg: "rgba(99,102,241,0.15)", color: "#a5b4fc" },
  CHAUFFEUR: { bg: "rgba(168,85,247,0.15)", color: "#c084fc" },
  BICYCLE: { bg: "rgba(20,184,166,0.15)", color: "#2dd4bf" },
  SCOOTER: { bg: "rgba(249,115,22,0.15)", color: "#fb923c" },
};

export default function MobilityPage() {
  const [mobilityType, setMobilityType] = useState<string | undefined>();

  const { data: products, isLoading } = trpc.mobility.listProducts.useQuery({
    mobilityType: (mobilityType as any) || undefined,
    limit: 20,
  });

  const list = (products as any[]) ?? [];

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "rgb(var(--nv-bg))" }}
    >
      {/* Hero */}
      <div className="nv-hero dot-grid relative overflow-hidden px-6 py-20">
        <div
          className="pointer-events-none absolute left-1/4 top-0 h-[300px] w-[300px] rounded-full blur-[100px]"
          style={{ backgroundColor: "rgb(59 130 246 / 0.08)" }}
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
              <Car className="h-3.5 w-3.5" style={{ color: "#f97316" }} />
              Mobilite
            </div>
            <h1
              className="mb-4 text-4xl font-bold md:text-6xl"
              style={{ color: "rgb(var(--nv-text))" }}
            >
              <span className="text-gradient">Mobilite</span>
            </h1>
            <p
              className="mx-auto max-w-xl text-lg"
              style={{ color: "rgb(var(--nv-muted))" }}
            >
              Transfer, kiralık araç ve şoförlü hizmetler
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Filter pills */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 flex flex-wrap gap-2"
        >
          <button
            onClick={() => setMobilityType(undefined)}
            className="nv-pill"
            style={
              !mobilityType
                ? {
                    backgroundColor: "#f97316",
                    borderColor: "transparent",
                    color: "white",
                  }
                : {}
            }
          >
            Tümü
          </button>
          {Object.entries(MOBILITY_TYPE_LABELS).map(([val, label]) => (
            <button
              key={val}
              onClick={() =>
                setMobilityType(mobilityType === val ? undefined : val)
              }
              className="nv-pill"
              style={
                mobilityType === val
                  ? {
                      backgroundColor: "#f97316",
                      borderColor: "transparent",
                      color: "white",
                    }
                  : {}
              }
            >
              {label}
            </button>
          ))}
        </motion.div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
              <Car
                className="h-8 w-8"
                style={{ color: "rgb(var(--nv-dim))" }}
              />
            </div>
            <p style={{ color: "rgb(var(--nv-muted))" }}>
              Mobilite seçeneği bulunamadı.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((product: any, i: number) => {
              const iconStyle = (MOBILITY_ICON_COLORS[product.mobilityType] ??
                MOBILITY_ICON_COLORS["TRANSFER"])!;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                >
                  <a
                    href={`/mobility/${product.id}`}
                    className="nv-card group block p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                        style={{
                          backgroundColor: iconStyle.bg,
                          color: iconStyle.color,
                        }}
                      >
                        <Car className="h-6 w-6" />
                      </div>
                      <span
                        className="rounded-full px-2 py-0.5 text-xs"
                        style={{
                          border: "1px solid rgb(var(--nv-border) / 0.10)",
                          backgroundColor: "rgb(var(--nv-border) / 0.04)",
                          color: "rgb(var(--nv-muted))",
                        }}
                      >
                        {MOBILITY_TYPE_LABELS[product.mobilityType] ??
                          product.mobilityType}
                      </span>
                    </div>

                    <div className="mt-4">
                      <p
                        className="line-clamp-1 font-semibold"
                        style={{ color: "rgb(var(--nv-text))" }}
                      >
                        {product.name}
                      </p>
                      {product.mobilityProvider && (
                        <div
                          className="mt-1 flex items-center gap-1 text-xs"
                          style={{ color: "rgb(var(--nv-dim))" }}
                        >
                          <Star className="h-3 w-3 fill-[#fb923c] text-[#fb923c]" />
                          {product.mobilityProvider.ratingAggregate != null
                            ? Number(
                                product.mobilityProvider.ratingAggregate,
                              ).toFixed(1)
                            : "Yok"}
                          <span
                            className="ml-1"
                            style={{ color: "rgb(var(--nv-muted))" }}
                          >
                            {product.mobilityProvider.name}
                          </span>
                        </div>
                      )}
                    </div>

                    <div
                      className="mt-3 flex flex-wrap gap-3 text-xs"
                      style={{ color: "rgb(var(--nv-dim))" }}
                    >
                      {product.durationMinutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />{" "}
                          {product.durationMinutes} dk
                        </span>
                      )}
                      {product.capacity && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {product.capacity} yolcu
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span
                        className="text-xs"
                        style={{ color: "rgb(var(--nv-dim))" }}
                      >
                        talep üzerine
                      </span>
                      <span className="font-bold" style={{ color: "#f97316" }}>
                        {product.priceCents != null
                          ? `$${(product.priceCents / 100).toFixed(0)}`
                          : "Talep üzerine"}
                      </span>
                    </div>
                  </a>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
