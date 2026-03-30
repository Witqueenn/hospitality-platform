"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Home, Star, MapPin, Shield, Sparkles } from "lucide-react";

const STAY_TYPE_LABELS: Record<string, string> = {
  APARTMENT: "Daire",
  VILLA: "Villa",
  BOUTIQUE_HOTEL: "Butik Otel",
  HOSTEL: "Hostel",
  GUESTHOUSE: "Misafir Evi",
  RESORT: "Resort",
};

const TYPE_FILTERS = [
  { label: "Tümü", value: "" },
  { label: "Daire", value: "APARTMENT" },
  { label: "Villa", value: "VILLA" },
  { label: "Butik Otel", value: "BOUTIQUE_HOTEL" },
  { label: "Misafir Evi", value: "GUESTHOUSE" },
];

const PLACEHOLDER_IMGS = [
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
  "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
];

export default function HomesPage() {
  const [stayType, setStayType] = useState<string>("");

  const { data: units, isLoading } = trpc.trustedStay.listUnits.useQuery({
    trustedStayType: (stayType as any) || undefined,
    limit: 20,
  });

  const list = (units as any[]) ?? [];

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "rgb(var(--nv-bg))" }}
    >
      {/* Hero */}
      <div className="nv-hero dot-grid relative overflow-hidden px-6 py-20">
        <div
          className="pointer-events-none absolute left-1/4 top-0 h-[320px] w-[320px] rounded-full blur-[120px]"
          style={{ backgroundColor: "rgb(var(--nv-accent-glow) / 0.08)" }}
        />
        <div
          className="pointer-events-none absolute bottom-0 right-1/4 h-[280px] w-[280px] rounded-full blur-[100px]"
          style={{ backgroundColor: "rgb(var(--nv-border) / 0.06)" }}
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="nv-badge mb-6 inline-flex">
              <Home className="h-3.5 w-3.5" style={{ color: "#f97316" }} />
              Güvenilir Konaklamalar
            </div>
            <h1
              className="mb-4 text-4xl font-bold md:text-6xl"
              style={{ color: "rgb(var(--nv-text))" }}
            >
              Ev gibi hisset,{" "}
              <span className="text-gradient">macera yaşa.</span>
            </h1>
            <p
              className="mx-auto max-w-xl text-lg"
              style={{ color: "rgb(var(--nv-muted))" }}
            >
              Doğrulanmış ev sahipleriyle butik daireler, villalar ve misafir
              evleri — uzun konaklamalar için ideal.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 flex flex-wrap items-center gap-2"
        >
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStayType(f.value)}
              className="nv-pill"
              style={
                stayType === f.value
                  ? {
                      backgroundColor: "#f97316",
                      borderColor: "transparent",
                      color: "white",
                    }
                  : {}
              }
            >
              {f.label}
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-2xl"
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
              <Sparkles className="h-8 w-8" style={{ color: "#f97316" }} />
            </div>
            <h3
              className="mb-2 text-lg font-bold"
              style={{ color: "rgb(var(--nv-text))" }}
            >
              Konaklama bulunamadı
            </h3>
            <p className="text-sm" style={{ color: "rgb(var(--nv-dim))" }}>
              Farklı bir filtre dene.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((unit: any, i: number) => {
              const photo =
                unit.photos?.[0] ??
                PLACEHOLDER_IMGS[i % PLACEHOLDER_IMGS.length];
              return (
                <motion.div
                  key={unit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                >
                  <Link
                    href={`/homes/${unit.id}`}
                    className="nv-card group block overflow-hidden"
                  >
                    <div
                      className="relative h-56 overflow-hidden"
                      style={{ backgroundColor: "rgb(var(--nv-surface-2))" }}
                    >
                      <img
                        src={photo}
                        alt={unit.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      {/* Verified badge */}
                      {unit.host?.verificationStatus === "VERIFIED" && (
                        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full border border-[#67dc9f]/30 bg-[#67dc9f]/20 px-2.5 py-1 text-xs font-semibold text-[#67dc9f] backdrop-blur-sm">
                          <Shield className="h-3 w-3" /> Doğrulandı
                        </span>
                      )}
                      {/* Price badge on image */}
                      {unit.ratePlans?.[0] && (
                        <div className="absolute bottom-3 right-3">
                          <span className="rounded-xl bg-black/70 px-3 py-1.5 text-sm font-bold text-white backdrop-blur-sm">
                            $
                            {(unit.ratePlans[0].baseRateCents / 100).toFixed(0)}
                            <span className="text-xs font-normal text-slate-300">
                              {" "}
                              / gece
                            </span>
                          </span>
                        </div>
                      )}
                      {/* Type pill on image */}
                      <div className="absolute bottom-3 left-3">
                        <span className="rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
                          {STAY_TYPE_LABELS[unit.stayType] ?? unit.stayType}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      {/* Title + rating row */}
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <p
                          className="line-clamp-1 font-semibold"
                          style={{ color: "rgb(var(--nv-text))" }}
                        >
                          {unit.name}
                        </p>
                        {unit.ratingAggregate != null && (
                          <div
                            className="flex shrink-0 items-center gap-1 text-sm font-semibold"
                            style={{ color: "rgb(var(--nv-text))" }}
                          >
                            <Star className="h-3.5 w-3.5 fill-[#fb923c] text-[#fb923c]" />
                            {Number(unit.ratingAggregate).toFixed(1)}
                          </div>
                        )}
                      </div>
                      {/* Location + type row */}
                      {unit.city && (
                        <div
                          className="flex items-center gap-1 text-xs"
                          style={{ color: "rgb(var(--nv-dim))" }}
                        >
                          <MapPin className="h-3 w-3" />
                          {unit.city}
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
