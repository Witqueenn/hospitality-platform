"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";
import { Compass, Clock, Users, Calendar } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  FREE_WALK: "Ücretsiz Tur",
  CITY_INTRO: "Şehir Turu",
  FOOD_TOUR: "Gastronomi",
  NIGHT_TOUR: "Gece Turu",
  BUSINESS_HELPER: "İş Desteği",
  CULTURAL: "Kültürel",
  SHOPPING: "Alışveriş",
  FAMILY: "Aile",
  OTHER: "Diğer",
};

const CATEGORY_BADGE_STYLES: Record<
  string,
  { background: string; color: string }
> = {
  FREE_WALK: { background: "rgba(16,185,129,0.2)", color: "#34d399" },
  CITY_INTRO: { background: "rgba(59,130,246,0.2)", color: "#60a5fa" },
  FOOD_TOUR: { background: "rgba(249,115,22,0.2)", color: "#fb923c" },
  NIGHT_TOUR: { background: "rgba(99,102,241,0.2)", color: "#a5b4fc" },
  BUSINESS_HELPER: { background: "rgba(100,116,139,0.2)", color: "#94a3b8" },
  CULTURAL: { background: "rgba(168,85,247,0.2)", color: "#c084fc" },
  SHOPPING: { background: "rgba(236,72,153,0.2)", color: "#f472b6" },
  FAMILY: { background: "rgba(6,182,212,0.2)", color: "#22d3ee" },
  OTHER: {
    background: "rgba(var(--nv-border) / 0.10)",
    color: "rgb(var(--nv-muted))",
  },
};

const CATEGORY_HEADER_GRADIENTS: Record<string, string> = {
  FREE_WALK:
    "linear-gradient(135deg, rgba(16,185,129,0.18), rgba(6,182,212,0.10))",
  CITY_INTRO:
    "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(99,102,241,0.10))",
  FOOD_TOUR:
    "linear-gradient(135deg, rgba(249,115,22,0.18), rgba(245,158,11,0.10))",
  NIGHT_TOUR:
    "linear-gradient(135deg, rgba(99,102,241,0.20), rgba(168,85,247,0.10))",
  BUSINESS_HELPER:
    "linear-gradient(135deg, rgba(100,116,139,0.18), rgba(71,85,105,0.10))",
  CULTURAL:
    "linear-gradient(135deg, rgba(168,85,247,0.18), rgba(236,72,153,0.10))",
  SHOPPING:
    "linear-gradient(135deg, rgba(236,72,153,0.18), rgba(249,115,22,0.10))",
  FAMILY:
    "linear-gradient(135deg, rgba(6,182,212,0.18), rgba(16,185,129,0.10))",
  OTHER:
    "linear-gradient(135deg, rgba(var(--nv-border) / 0.10), rgba(var(--nv-border) / 0.05))",
};

export default function ExperiencesPage() {
  const [category, setCategory] = useState<string | undefined>();
  const [bookingSlot, setBookingSlot] = useState<{
    expId: string;
    slotId: string;
    priceCents: number;
  } | null>(null);

  const {
    data: experiencesRaw,
    isLoading,
    refetch,
  } = trpc.localExperience.listExperiences.useQuery({
    category: category as any,
    limit: 30,
  });
  const experiences = experiencesRaw as any[] | undefined;

  const bookMutation = (trpc.localExperience.bookExperience as any).useMutation(
    {
      onSuccess: () => {
        toast.success(
          "Deneyim rezerve edildi! Profil sayfanızdan kontrol edin.",
        );
        setBookingSlot(null);
        void refetch();
      },
      onError: (e: any) => toast.error(e.message),
    },
  );

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "rgb(var(--nv-bg))" }}
    >
      {/* Hero */}
      <div className="nv-hero dot-grid relative overflow-hidden px-6 py-20">
        <div
          className="pointer-events-none absolute left-1/4 top-0 h-[300px] w-[300px] rounded-full blur-[100px]"
          style={{ backgroundColor: "rgb(124 58 237 / 0.10)" }}
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
              <Compass className="h-3.5 w-3.5" style={{ color: "#f97316" }} />
              Yerel Deneyimler
            </div>
            <h1
              className="mb-4 text-4xl font-bold md:text-6xl"
              style={{ color: "rgb(var(--nv-text))" }}
            >
              Yerel <span className="text-gradient">Deneyimler</span>
            </h1>
            <p
              className="mx-auto max-w-xl text-lg"
              style={{ color: "rgb(var(--nv-muted))" }}
            >
              Şehir rehberlerimizin özenle seçtiği kültürel, gastronomi ve
              macera deneyimleri
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Category filters */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 flex flex-wrap gap-2"
        >
          <button
            onClick={() => setCategory(undefined)}
            className="nv-pill"
            style={
              !category
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
          {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setCategory(category === val ? undefined : val)}
              className="nv-pill"
              style={
                category === val
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

        {/* Results */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-2xl"
                style={{ backgroundColor: "rgb(var(--nv-surface))" }}
              />
            ))}
          </div>
        ) : !experiences || experiences.length === 0 ? (
          <div className="py-20 text-center">
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{
                border: "1px solid rgb(var(--nv-border) / 0.12)",
                backgroundColor: "rgb(var(--nv-border) / 0.05)",
              }}
            >
              <Compass
                className="h-8 w-8"
                style={{ color: "rgb(var(--nv-dim))" }}
              />
            </div>
            <p style={{ color: "rgb(var(--nv-muted))" }}>Deneyim bulunamadı</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {experiences.map((exp, i) => {
              const slots = exp.slots ?? [];
              const nextSlot = slots[0] as any;
              const badgeStyle = (CATEGORY_BADGE_STYLES[exp.category] ??
                CATEGORY_BADGE_STYLES["OTHER"])!;
              const headerGradient =
                CATEGORY_HEADER_GRADIENTS[exp.category] ??
                CATEGORY_HEADER_GRADIENTS.OTHER;

              return (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="nv-card overflow-hidden"
                >
                  {/* Colored category header */}
                  <div
                    className="relative h-44"
                    style={{ background: headerGradient }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Compass
                        className="h-12 w-12 opacity-20"
                        style={{ color: "rgb(var(--nv-text))" }}
                      />
                    </div>
                    <div className="absolute left-3 top-3">
                      <span
                        className="rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-sm"
                        style={{
                          backgroundColor: badgeStyle.background,
                          color: badgeStyle.color,
                          border: `1px solid ${badgeStyle.color}30`,
                        }}
                      >
                        {CATEGORY_LABELS[exp.category] ?? exp.category}
                      </span>
                    </div>
                    {nextSlot && (
                      <div className="absolute right-3 top-3">
                        <span className="flex items-center gap-1 rounded-full bg-black/30 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                          <Calendar className="h-3 w-3" />
                          {new Date(nextSlot.date).toLocaleDateString("tr", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 p-4">
                    <h3
                      className="font-semibold"
                      style={{ color: "rgb(var(--nv-text))" }}
                    >
                      {exp.name}
                    </h3>

                    <div
                      className="flex flex-wrap gap-3 text-xs"
                      style={{ color: "rgb(var(--nv-dim))" }}
                    >
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {exp.durationMinutes} dk
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> Maks {exp.maxGuests} kişi
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className="text-xl font-bold"
                        style={{ color: "#f97316" }}
                      >
                        {exp.priceCents != null
                          ? `$${(exp.priceCents / 100).toFixed(0)}`
                          : "Ücretsiz"}
                        <span
                          className="text-xs font-normal"
                          style={{ color: "rgb(var(--nv-dim))" }}
                        >
                          {" "}
                          kişi başı
                        </span>
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/experiences/${exp.id}`}
                        className="flex-1 rounded-lg py-1.5 text-center text-sm font-medium transition"
                        style={{
                          border: "1px solid rgb(var(--nv-border) / 0.12)",
                          color: "rgb(var(--nv-muted))",
                        }}
                      >
                        Detaylar
                      </Link>
                      <button
                        className="flex-1 rounded-lg py-1.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ backgroundColor: "#f97316" }}
                        disabled={!nextSlot || bookMutation.isPending}
                        onClick={() => {
                          if (nextSlot) {
                            bookMutation.mutate({
                              localExperienceId: exp.id,
                              localExperienceSlotId: nextSlot.id,
                              partySize: 1,
                            });
                          }
                        }}
                      >
                        {nextSlot ? "Rezervasyon Yap" : "Slot yok"}
                      </button>
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
