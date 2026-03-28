"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import {
  Home,
  Star,
  MapPin,
  Calendar,
  ChevronRight,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";

const STAY_TYPE_LABELS: Record<string, string> = {
  APARTMENT: "Daire",
  VILLA: "Villa",
  BOUTIQUE_HOTEL: "Butik Otel",
  HOSTEL: "Hostel",
  GUESTHOUSE: "Misafir Evi",
  RESORT: "Resort",
};

const STAY_TERM_LABELS: Record<string, string> = {
  DAILY: "Gecelik",
  WEEKLY: "Haftalık",
  MONTHLY: "Aylık",
  FLEX: "Esnek",
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
    <div className="min-h-screen bg-[#09090b]">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/5 bg-[#0e0e10] px-6 py-20">
        <div className="pointer-events-none absolute left-1/4 top-0 h-[300px] w-[300px] rounded-full bg-[#7c3aed]/10 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-[#f97316]/10 blur-[100px]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-slate-400">
              <Home className="h-3.5 w-3.5 text-[#f97316]" />
              Güvenilir Konaklamalar
            </div>
            <h1 className="mb-4 text-4xl font-bold text-white md:text-6xl">
              Ev gibi hisset,{" "}
              <span className="text-gradient">macera yaşa.</span>
            </h1>
            <p className="mx-auto max-w-xl text-lg text-slate-400">
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
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                stayType === f.value
                  ? "bg-[#f97316] text-white"
                  : "border border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
              }`}
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
                className="h-72 animate-pulse rounded-2xl bg-[#0e0e10]"
              />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <Sparkles className="h-8 w-8 text-[#f97316]" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-white">
              Konaklama bulunamadı
            </h3>
            <p className="text-sm text-slate-500">Farklı bir filtre dene.</p>
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
                    className="group block overflow-hidden rounded-2xl border border-white/5 bg-[#0e0e10] transition hover:border-white/10"
                  >
                    {/* Photo */}
                    <div className="relative h-48 overflow-hidden bg-[#141416]">
                      <img
                        src={photo}
                        alt={unit.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      {unit.host?.verificationStatus === "VERIFIED" && (
                        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full border border-[#67dc9f]/30 bg-[#67dc9f]/20 px-2.5 py-1 text-xs font-semibold text-[#67dc9f] backdrop-blur-sm">
                          <Shield className="h-3 w-3" /> Doğrulandı
                        </span>
                      )}
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
                    </div>

                    <div className="p-4">
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <p className="line-clamp-1 font-semibold text-white">
                          {unit.name}
                        </p>
                        {unit.ratingAggregate != null && (
                          <div className="flex shrink-0 items-center gap-1 text-sm font-semibold text-white">
                            <Star className="h-3.5 w-3.5 fill-[#fb923c] text-[#fb923c]" />
                            {Number(unit.ratingAggregate).toFixed(1)}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          {unit.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {unit.city}
                            </span>
                          )}
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                            {STAY_TYPE_LABELS[unit.stayType] ?? unit.stayType}
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-600 transition group-hover:text-white" />
                      </div>
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
