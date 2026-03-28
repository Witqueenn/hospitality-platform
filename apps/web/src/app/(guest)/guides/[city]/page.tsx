"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import {
  MapPin,
  Compass,
  Clock,
  Users,
  ChevronRight,
  ArrowLeft,
  BookOpen,
  Camera,
  Star,
  Shield,
  Smartphone,
} from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  FREE_WALK: "Ücretsiz Tur",
  CITY_INTRO: "Şehir Keşfi",
  FOOD_TOUR: "Yeme & İçme",
  NIGHT_TOUR: "Gece Turu",
  BUSINESS_HELPER: "İş Seyahati",
  CULTURAL: "Kültür",
  SHOPPING: "Alışveriş",
  FAMILY: "Aile",
  OTHER: "Deneyim",
};

const CATEGORY_COLORS: Record<string, string> = {
  FREE_WALK: "text-[#67dc9f] border-[#67dc9f]/20 bg-[#67dc9f]/10",
  CITY_INTRO: "text-[#60a5fa] border-[#60a5fa]/20 bg-[#60a5fa]/10",
  FOOD_TOUR: "text-[#ffb2b7] border-[#f97316]/20 bg-[#f97316]/10",
  NIGHT_TOUR: "text-[#d2bbff] border-[#7c3aed]/20 bg-[#7c3aed]/10",
  BUSINESS_HELPER: "text-[#60a5fa] border-[#60a5fa]/20 bg-[#60a5fa]/10",
  CULTURAL: "text-[#fb923c] border-[#fb923c]/20 bg-[#fb923c]/10",
  SHOPPING: "text-[#f472b6] border-[#f472b6]/20 bg-[#f472b6]/10",
  FAMILY: "text-[#d2bbff] border-[#7c3aed]/20 bg-[#7c3aed]/10",
  OTHER: "text-[#67dc9f] border-[#67dc9f]/20 bg-[#67dc9f]/10",
};

export default function CityGuidePage({
  params,
}: {
  params: { city: string };
}) {
  const { city } = params;

  const { data: guide, isLoading } = trpc.cityGuide.getGuideByCity.useQuery({
    cityCode: city,
    languageCode: "en",
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] px-6 py-16">
        <div className="mx-auto max-w-3xl space-y-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-2xl bg-[#0e0e10]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] px-6 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <MapPin className="h-8 w-8 text-slate-500" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-white">Rehber bulunamadı</h2>
        <p className="mb-6 text-sm text-slate-500">
          Bu şehir için henüz bir rehber hazırlanmadı.
        </p>
        <Link
          href="/guides"
          className="flex items-center gap-2 text-sm font-medium text-[#f97316] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Tüm rehberlere dön
        </Link>
      </div>
    );
  }

  const g = guide as any;

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/5 bg-[#0e0e10] px-6 py-20">
        <div className="pointer-events-none absolute left-1/4 top-0 h-[300px] w-[300px] rounded-full bg-[#f97316]/10 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-[#7c3aed]/10 blur-[100px]" />

        <div className="relative mx-auto max-w-3xl">
          <Link
            href="/guides"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Tüm rehberler
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
              <MapPin className="h-4 w-4" />
              {g.countryCode && <span>{g.countryCode}</span>}
              <span>·</span>
              <BookOpen className="h-4 w-4" />
              <span>Destinasyon Rehberi</span>
            </div>
            <h1 className="mb-4 text-4xl font-bold text-white md:text-6xl">
              {g.cityName}
            </h1>
            {g.summary && (
              <p className="max-w-2xl text-base leading-relaxed text-slate-400">
                {g.summary}
              </p>
            )}
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-12 px-6 py-12">
        {/* Sections / Highlights */}
        {g.sections?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="mb-5 flex items-center gap-2">
              <Camera className="h-4 w-4 text-[#f97316]" />
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Öne Çıkanlar
              </p>
            </div>
            <div className="space-y-4">
              {g.sections.map((section: any, i: number) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="rounded-2xl border border-white/5 bg-[#0e0e10] p-6"
                >
                  <h3 className="mb-2 font-bold text-white">{section.title}</h3>
                  {section.body && (
                    <p className="text-sm leading-relaxed text-slate-400">
                      {section.body}
                    </p>
                  )}
                  {section.mediaUrls?.length > 0 && (
                    <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                      {(section.mediaUrls as string[])
                        .slice(0, 4)
                        .map((url: string, j: number) => (
                          <img
                            key={j}
                            src={url}
                            alt=""
                            className="h-28 w-44 shrink-0 rounded-xl object-cover"
                          />
                        ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Safety & Transport */}
        {(g.safetyNotes || g.transportTips) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid gap-4 sm:grid-cols-2"
          >
            {g.safetyNotes && (
              <div className="rounded-2xl border border-[#67dc9f]/20 bg-[#67dc9f]/5 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#67dc9f]" />
                  <p className="text-sm font-bold text-white">Güvenlik</p>
                </div>
                <p className="text-sm leading-relaxed text-slate-400">
                  {g.safetyNotes}
                </p>
              </div>
            )}
            {g.transportTips && (
              <div className="rounded-2xl border border-[#60a5fa]/20 bg-[#60a5fa]/5 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-[#60a5fa]" />
                  <p className="text-sm font-bold text-white">Ulaşım</p>
                </div>
                <p className="text-sm leading-relaxed text-slate-400">
                  {g.transportTips}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Experiences */}
        {g.experiences?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-5 flex items-center gap-2">
              <Compass className="h-4 w-4 text-[#f97316]" />
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Deneyimler
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {g.experiences.map((exp: any, i: number) => {
                const categoryStyle =
                  CATEGORY_COLORS[exp.category] ??
                  "text-slate-400 border-white/10 bg-white/5";
                return (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                  >
                    <Link
                      href={`/experiences/${exp.slug ?? exp.id}`}
                      className="group block rounded-2xl border border-white/5 bg-[#0e0e10] p-5 transition hover:border-white/10 hover:bg-[#141416]"
                    >
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-white">{exp.name}</p>
                          <span
                            className={`mt-1.5 inline-block rounded-full border px-2 py-0.5 text-xs ${categoryStyle}`}
                          >
                            {CATEGORY_LABELS[exp.category] ?? exp.category}
                          </span>
                        </div>
                        <span className="shrink-0 text-lg font-bold text-[#f97316]">
                          {exp.isFree || exp.priceCents === 0
                            ? "Ücretsiz"
                            : exp.priceCents != null
                              ? `$${(exp.priceCents / 100).toFixed(0)}`
                              : ""}
                        </span>
                      </div>
                      {exp.description && (
                        <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-slate-400">
                          {exp.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex gap-3 text-xs text-slate-500">
                          {exp.durationMinutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />{" "}
                              {exp.durationMinutes} dk
                            </span>
                          )}
                          {exp.maxGuests && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" /> Max {exp.maxGuests}{" "}
                              kişi
                            </span>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-600 transition group-hover:text-white" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-[#f97316]/20 bg-gradient-to-br from-[#f97316]/10 to-[#7c3aed]/5 p-8 text-center"
        >
          <Star className="mx-auto mb-3 h-7 w-7 text-[#f97316]" />
          <h3 className="mb-2 text-lg font-bold text-white">
            {g.cityName}&apos;da nerede kalacaksın?
          </h3>
          <p className="mb-5 text-sm text-slate-400">
            En iyi otelleri, fiyatları ve misafir yorumlarını keşfet.
          </p>
          <Link
            href={`/search?city=${encodeURIComponent(g.cityName)}`}
            className="inline-flex items-center gap-2 rounded-xl bg-[#f97316] px-6 py-3 font-semibold text-white transition hover:opacity-90"
          >
            {g.cityName} otellerini gör <ChevronRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
