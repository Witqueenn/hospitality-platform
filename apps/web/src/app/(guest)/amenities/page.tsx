"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { motion } from "framer-motion";
import { Dumbbell, Waves, Sparkles, Users, MapPin } from "lucide-react";

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  GYM: <Dumbbell className="h-5 w-5" />,
  POOL: <Waves className="h-5 w-5" />,
  SPA: <Sparkles className="h-5 w-5" />,
  SAUNA: <Sparkles className="h-5 w-5" />,
  HAMMAM: <Sparkles className="h-5 w-5" />,
};

const AMENITY_LABELS: Record<string, string> = {
  GYM: "Spor Salonu",
  POOL: "Havuz",
  TENNIS: "Tenis",
  SPA: "Spa",
  SAUNA: "Sauna",
  HAMMAM: "Hammam",
  CO_WORKING: "Co-Working",
  KIDS_CLUB: "Çocuk Kulübü",
  BEACH_ACCESS: "Plaj",
  OTHER: "Diğer",
};

const AMENITY_BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  GYM: { bg: "rgba(59,130,246,0.15)", color: "#60a5fa" },
  POOL: { bg: "rgba(6,182,212,0.15)", color: "#22d3ee" },
  TENNIS: { bg: "rgba(34,197,94,0.15)", color: "#4ade80" },
  SPA: { bg: "rgba(168,85,247,0.15)", color: "#c084fc" },
  SAUNA: { bg: "rgba(249,115,22,0.15)", color: "#fb923c" },
  HAMMAM: { bg: "rgba(245,158,11,0.15)", color: "#fbbf24" },
  CO_WORKING: { bg: "rgba(100,116,139,0.15)", color: "#94a3b8" },
  KIDS_CLUB: { bg: "rgba(236,72,153,0.15)", color: "#f472b6" },
  BEACH_ACCESS: { bg: "rgba(20,184,166,0.15)", color: "#2dd4bf" },
  OTHER: { bg: "rgba(var(--nv-border) / 0.08)", color: "rgb(var(--nv-muted))" },
};

const AMENITY_HEADER_GRADIENTS: Record<string, string> = {
  GYM: "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(99,102,241,0.10))",
  POOL: "linear-gradient(135deg, rgba(6,182,212,0.18), rgba(59,130,246,0.10))",
  TENNIS: "linear-gradient(135deg, rgba(34,197,94,0.18), rgba(6,182,212,0.10))",
  SPA: "linear-gradient(135deg, rgba(168,85,247,0.18), rgba(236,72,153,0.10))",
  SAUNA:
    "linear-gradient(135deg, rgba(249,115,22,0.18), rgba(245,158,11,0.10))",
  HAMMAM:
    "linear-gradient(135deg, rgba(245,158,11,0.18), rgba(249,115,22,0.10))",
  CO_WORKING:
    "linear-gradient(135deg, rgba(100,116,139,0.18), rgba(71,85,105,0.10))",
  KIDS_CLUB:
    "linear-gradient(135deg, rgba(236,72,153,0.18), rgba(168,85,247,0.10))",
  BEACH_ACCESS:
    "linear-gradient(135deg, rgba(20,184,166,0.18), rgba(6,182,212,0.10))",
  OTHER: "linear-gradient(135deg, rgba(var(--nv-border) / 0.10), transparent)",
};

export default function AmenitiesPage() {
  const [filterType, setFilterType] = useState<string | undefined>();

  const { data: amenitiesRaw, isLoading } = trpc.amenity.listPublic.useQuery({
    amenityType: filterType as any,
  });
  const amenities = amenitiesRaw as any[] | undefined;

  const types = Object.keys(AMENITY_LABELS);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "rgb(var(--nv-bg))" }}
    >
      {/* Hero */}
      <div className="nv-hero dot-grid relative overflow-hidden px-6 py-20">
        <div
          className="pointer-events-none absolute left-1/4 top-0 h-[300px] w-[300px] rounded-full blur-[100px]"
          style={{ backgroundColor: "rgb(13 148 136 / 0.08)" }}
        />
        <div
          className="pointer-events-none absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full blur-[100px]"
          style={{ backgroundColor: "rgb(124 58 237 / 0.08)" }}
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="nv-badge mb-6 inline-flex">
              <Sparkles className="h-3.5 w-3.5" style={{ color: "#f97316" }} />
              Olanaklar Marketi
            </div>
            <h1
              className="mb-4 text-4xl font-bold md:text-6xl"
              style={{ color: "rgb(var(--nv-text))" }}
            >
              Olanaklar <span className="text-gradient">Marketi</span>
            </h1>
            <p
              className="mx-auto max-w-xl text-lg"
              style={{ color: "rgb(var(--nv-muted))" }}
            >
              Otel konaklaması olmadan da spor, spa, havuz ve daha fazlası
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Type filters */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 flex flex-wrap gap-2"
        >
          <button
            onClick={() => setFilterType(undefined)}
            className="nv-pill"
            style={
              !filterType
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
          {types.map((type) => (
            <button
              key={type}
              onClick={() =>
                setFilterType(filterType === type ? undefined : type)
              }
              className="nv-pill flex items-center gap-1.5"
              style={
                filterType === type
                  ? {
                      backgroundColor: "#f97316",
                      borderColor: "transparent",
                      color: "white",
                    }
                  : {}
              }
            >
              {AMENITY_ICONS[type]}
              {AMENITY_LABELS[type]}
            </button>
          ))}
        </motion.div>

        {/* Results */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-56 animate-pulse rounded-2xl"
                style={{ backgroundColor: "rgb(var(--nv-surface))" }}
              />
            ))}
          </div>
        ) : !amenities || amenities.length === 0 ? (
          <div className="py-20 text-center">
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{
                border: "1px solid rgb(var(--nv-border) / 0.12)",
                backgroundColor: "rgb(var(--nv-border) / 0.05)",
              }}
            >
              <Dumbbell
                className="h-8 w-8"
                style={{ color: "rgb(var(--nv-dim))" }}
              />
            </div>
            <p style={{ color: "rgb(var(--nv-muted))" }}>Bulunamadı</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {amenities.map((asset, i) => {
              const hotel = asset.hotel as { name: string; slug: string };
              const activePlans = asset.passPlans ?? [];
              const badge = (AMENITY_BADGE_COLORS[asset.amenityType] ??
                AMENITY_BADGE_COLORS["OTHER"])!;
              const headerGradient =
                AMENITY_HEADER_GRADIENTS[asset.amenityType] ??
                AMENITY_HEADER_GRADIENTS.OTHER;

              return (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="nv-card overflow-hidden"
                >
                  {/* Icon area with colored tint */}
                  <div
                    className="flex h-40 items-center justify-center"
                    style={{ background: headerGradient }}
                  >
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-2xl"
                      style={{
                        backgroundColor: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.color}30`,
                      }}
                    >
                      {AMENITY_ICONS[asset.amenityType] ?? (
                        <Sparkles className="h-7 w-7" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 p-4">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className="font-semibold"
                          style={{ color: "rgb(var(--nv-text))" }}
                        >
                          {asset.name}
                        </h3>
                        <span
                          className="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
                          style={{
                            backgroundColor: badge.bg,
                            color: badge.color,
                          }}
                        >
                          {AMENITY_LABELS[asset.amenityType] ??
                            asset.amenityType}
                        </span>
                      </div>
                      <p
                        className="mt-0.5 flex items-center gap-1 text-xs"
                        style={{ color: "rgb(var(--nv-dim))" }}
                      >
                        <MapPin className="h-3 w-3" /> {hotel.name}
                      </p>
                      {asset.locationLabel && (
                        <p
                          className="text-xs"
                          style={{ color: "rgb(var(--nv-dim))" }}
                        >
                          {asset.locationLabel}
                        </p>
                      )}
                    </div>

                    {asset.capacity && (
                      <p
                        className="flex items-center gap-1 text-xs"
                        style={{ color: "rgb(var(--nv-muted))" }}
                      >
                        <Users className="h-3 w-3" /> Kapasite: {asset.capacity}
                      </p>
                    )}

                    {activePlans.length > 0 && (
                      <div className="space-y-1">
                        <p
                          className="text-xs font-semibold"
                          style={{ color: "rgb(var(--nv-muted))" }}
                        >
                          Pass Planları
                        </p>
                        {activePlans.slice(0, 2).map((plan: any) => (
                          <div
                            key={plan.id}
                            className="flex items-center justify-between"
                          >
                            <span
                              className="text-xs"
                              style={{ color: "rgb(var(--nv-muted))" }}
                            >
                              {plan.name}
                            </span>
                            <span
                              className="text-xs font-semibold"
                              style={{ color: "#f97316" }}
                            >
                              ${(plan.priceCents / 100).toFixed(0)} /{" "}
                              {plan.accessUnit.toLowerCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <Link
                      href={`/amenities/${asset.id}`}
                      className="nv-btn-primary block w-full rounded-lg py-2 text-center text-sm"
                    >
                      İncele &amp; Rezervasyon
                    </Link>
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
