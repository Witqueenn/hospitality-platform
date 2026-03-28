"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  Compass,
  Utensils,
  Music,
  Camera,
  TreePine,
  ChevronRight,
  BookOpen,
  Star,
} from "lucide-react";

const GUIDES = [
  {
    city: "istanbul",
    name: "İstanbul",
    country: "Türkiye",
    tagline: "İki kıtanın buluştuğu şehir",
    description:
      "Tarihin en derin katmanlarını modern bir şehirle yaşarken seziyorsun. Boğaz kenarında kahve, tarihi çarşılarda kaybolmak, gece hayatı — İstanbul hiç bitmez.",
    highlights: [
      "Kapalıçarşı",
      "Boğaz turu",
      "Balık ekmek",
      "Beyoğlu geceleri",
    ],
    tags: ["Kültür", "Gastronomi", "Gece hayatı", "Tarih"],
    emoji: "🕌",
    color: "from-[#e94560]/20 to-[#7c3aed]/10",
    border: "border-[#e94560]/20",
    accentColor: "text-[#ffb2b7]",
    readTime: "8 dk",
  },
  {
    city: "kapadokya",
    name: "Kapadokya",
    country: "Türkiye",
    tagline: "Peri bacaları ve sonsuz gökyüzü",
    description:
      "Şafakta balonlara binersin, taş oymalı odalarda uyursun, yeraltı şehirlerinde kaybolursun. Kapadokya dünyadan kopuk bir rüya gibi.",
    highlights: [
      "Balon turu",
      "Göreme Açıkhava Müzesi",
      "Yeraltı şehirleri",
      "Peri bacaları",
    ],
    tags: ["Macera", "Doğa", "Tarihi", "Romantik"],
    emoji: "🎈",
    color: "from-[#fb923c]/20 to-[#e94560]/10",
    border: "border-[#fb923c]/20",
    accentColor: "text-[#fb923c]",
    readTime: "6 dk",
  },
  {
    city: "bodrum",
    name: "Bodrum",
    country: "Türkiye",
    tagline: "Ege'nin incisi, yaz gününün kalbi",
    description:
      "Masmavi körfez, beyaz badanalı evler, gece boyunca devam eden tekne partileri. Bodrum hem dinlendiren hem coşturan nadir yerlerden biri.",
    highlights: [
      "Bodrum Kalesi",
      "Tekne turları",
      "Gümbet plajı",
      "Gece kulüpleri",
    ],
    tags: ["Plaj", "Gece hayatı", "Tekne", "Yaz"],
    emoji: "⛵",
    color: "from-[#60a5fa]/20 to-[#67dc9f]/10",
    border: "border-[#60a5fa]/20",
    accentColor: "text-[#60a5fa]",
    readTime: "5 dk",
  },
  {
    city: "antalya",
    name: "Antalya",
    country: "Türkiye",
    tagline: "Akdeniz'in altın kıyısı",
    description:
      "Antik Kaleiçi'nde gezinirken birden Akdeniz'e bakarsın. Lüks resort'lardan doğal plajlara, şelalelerden antik tiyatrolara uzanan bir şehir.",
    highlights: [
      "Kaleiçi",
      "Düden Şelalesi",
      "Konyaaltı plajı",
      "Perge Antik Kenti",
    ],
    tags: ["Tarih", "Plaj", "Doğa", "Aile"],
    emoji: "🌊",
    color: "from-[#67dc9f]/20 to-[#60a5fa]/10",
    border: "border-[#67dc9f]/20",
    accentColor: "text-[#67dc9f]",
    readTime: "7 dk",
  },
  {
    city: "izmir",
    name: "İzmir",
    country: "Türkiye",
    tagline: "Ege'nin en özgür şehri",
    description:
      "Kordon kenarında yürürken deniz rüzgarı yüzüne çarpar. Alsancak'ın arka sokaklarında küçük kafeler, Kemeraltı'nda köklü lezzetler — İzmir seni sarar.",
    highlights: ["Kordon", "Kemeraltı Çarşısı", "Efes Antik Kenti", "Çeşme"],
    tags: ["Gastronomi", "Kültür", "Antik", "Sahil"],
    emoji: "☀️",
    color: "from-[#d2bbff]/20 to-[#7c3aed]/10",
    border: "border-[#d2bbff]/20",
    accentColor: "text-[#d2bbff]",
    readTime: "6 dk",
  },
  {
    city: "trabzon",
    name: "Trabzon",
    country: "Türkiye",
    tagline: "Karadeniz'in gizli cenneti",
    description:
      "Bulutların içinde kalan Sümela Manastırı, Uzungöl'ün sakinliği, Karadeniz'in fırtınalı coşkusu. Trabzon seni şehrin gürültüsünden koparır.",
    highlights: ["Sümela Manastırı", "Uzungöl", "Boztepe", "Trabzon mutfağı"],
    tags: ["Doğa", "Dini", "Gastronomi", "Kaçamak"],
    emoji: "🏔️",
    color: "from-[#67dc9f]/20 to-[#60a5fa]/10",
    border: "border-[#67dc9f]/20",
    accentColor: "text-[#67dc9f]",
    readTime: "5 dk",
  },
];

const CATEGORIES = [
  {
    icon: Utensils,
    label: "Gastronomi",
    color: "text-[#ffb2b7]",
    bg: "bg-[#e94560]/10",
  },
  {
    icon: Music,
    label: "Gece Hayatı",
    color: "text-[#d2bbff]",
    bg: "bg-[#7c3aed]/10",
  },
  {
    icon: Camera,
    label: "Kültür & Tarih",
    color: "text-[#fb923c]",
    bg: "bg-[#fb923c]/10",
  },
  {
    icon: TreePine,
    label: "Doğa",
    color: "text-[#67dc9f]",
    bg: "bg-[#67dc9f]/10",
  },
  {
    icon: Star,
    label: "Gizli Cevherler",
    color: "text-[#60a5fa]",
    bg: "bg-[#60a5fa]/10",
  },
  {
    icon: Compass,
    label: "Macera",
    color: "text-[#fb923c]",
    bg: "bg-[#fb923c]/10",
  },
];

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/5 bg-[#0e0e10] px-6 py-20">
        <div className="pointer-events-none absolute left-1/4 top-0 h-[300px] w-[300px] rounded-full bg-[#e94560]/10 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-[#7c3aed]/10 blur-[100px]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-slate-400">
              <BookOpen className="h-3.5 w-3.5 text-[#e94560]" />
              Destinasyon Rehberleri
            </div>
            <h1 className="mb-4 text-4xl font-bold text-white md:text-6xl">
              Nereye gidersen git,{" "}
              <span className="text-gradient">hazırlıklı git.</span>
            </h1>
            <p className="mx-auto max-w-xl text-lg text-slate-400">
              Yerel lezzetler, gizli köşeler, en doğru zaman — her şehir için
              bir rehber hazırladık.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-14">
        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-14"
        >
          <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-slate-600">
            Kategoriye göre keşfet
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.label}
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-white/5 ${cat.bg} p-4 transition hover:border-white/10`}
              >
                <cat.icon className={`h-5 w-5 ${cat.color}`} />
                <span className="text-center text-xs font-medium text-slate-300">
                  {cat.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Guide Cards */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
            Tüm Rehberler
          </p>
          <span className="text-xs text-slate-600">
            {GUIDES.length} destinasyon
          </span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {GUIDES.map((guide, i) => (
            <motion.div
              key={guide.city}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
            >
              <Link
                href={`/guides/${guide.city}`}
                className={`group block rounded-3xl border ${guide.border} bg-gradient-to-br ${guide.color} p-6 transition-all hover:scale-[1.02] hover:shadow-xl`}
              >
                <div className="mb-4 flex items-start justify-between">
                  <span className="text-3xl">{guide.emoji}</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-400">
                    {guide.readTime} okuma
                  </span>
                </div>

                <div className="mb-1 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-xs text-slate-500">
                    {guide.country}
                  </span>
                </div>
                <h3 className="mb-1 text-xl font-bold text-white">
                  {guide.name}
                </h3>
                <p className={`mb-3 text-sm font-medium ${guide.accentColor}`}>
                  {guide.tagline}
                </p>
                <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-slate-400">
                  {guide.description}
                </p>

                {/* Highlights */}
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {guide.highlights.slice(0, 3).map((h) => (
                    <span
                      key={h}
                      className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-400"
                    >
                      {h}
                    </span>
                  ))}
                </div>

                <div
                  className={`flex items-center gap-1.5 text-sm font-bold ${guide.accentColor} transition-all group-hover:gap-2.5`}
                >
                  Rehberi oku <ChevronRight className="h-4 w-4" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-14 rounded-3xl border border-white/10 bg-[#0e0e10] p-10 text-center"
        >
          <Compass className="mx-auto mb-4 h-8 w-8 text-[#e94560]" />
          <h3 className="mb-2 text-xl font-bold text-white">
            Rehberler güncelleniyor
          </h3>
          <p className="mb-6 text-sm text-slate-400">
            Yakında daha fazla şehir, daha fazla gizli cevher. <br />
            Şimdilik keşfetmeye başla.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-xl bg-[#e94560] px-6 py-3 font-semibold text-white transition hover:opacity-90"
          >
            Otel ara <ChevronRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
