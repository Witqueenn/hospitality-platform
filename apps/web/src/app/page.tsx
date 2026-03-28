"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const ThreeDEnvironment = dynamic(
  () =>
    import("@/components/ui/ThreeDEnvironment").then(
      (mod) => mod.ThreeDEnvironment,
    ),
  { ssr: false },
);
import {
  Building2,
  CalendarDays,
  Sparkles,
  ChevronRight,
  Bot,
  ArrowRight,
  Zap,
  Heart,
  MapPin,
  Star,
  Utensils,
  Music,
  Waves,
  TreePine,
  Mountain,
  Coffee,
} from "lucide-react";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { BorderBeam } from "@/components/magicui/border-beam";
import { Marquee } from "@/components/magicui/marquee";

const agents = [
  {
    name: "Matchmaking Agent",
    desc: "Scores hotel-guest fit based on preferences and history.",
    color: "#ffb2b7",
    shadow: "#ffb2b7",
  },
  {
    name: "Pre-Stay Concierge",
    desc: "Personalized arrival messages and curated upsells.",
    color: "#d2bbff",
    shadow: "#d2bbff",
  },
  {
    name: "Booking Integrity",
    desc: "Pre-booking risk validation and fraud prevention.",
    color: "#67dc9f",
    shadow: "#67dc9f",
  },
  {
    name: "Recovery & Compensation",
    desc: "AI-powered service recovery with smart compensation.",
    color: "#60a5fa",
    shadow: "#60a5fa",
  },
  {
    name: "BEO Automation",
    desc: "Auto-generated Banquet Event Orders and run-of-show.",
    color: "#fb923c",
    shadow: "#fb923c",
  },
  {
    name: "Insight Agent",
    desc: "Operational patterns and recurring issue detection.",
    color: "#f472b6",
    shadow: "#f472b6",
  },
];

const moods = [
  {
    label: "Şehrin Kalbinde",
    sublabel: "Urban Pulse",
    icon: Coffee,
    gradient: "from-[#f97316]/30 to-[#7c3aed]/20",
    border: "border-[#f97316]/20",
    iconColor: "text-[#ffb2b7]",
    desc: "Işıkların hiç söndüğü yerde, tarihin dokusuna dokunarak uyan.",
    image: "/images/urban_pulse.png",
  },
  {
    label: "Sahil Sakinliği",
    sublabel: "Coastal Escape",
    icon: Waves,
    gradient: "from-[#60a5fa]/20 to-[#67dc9f]/10",
    border: "border-[#60a5fa]/20",
    iconColor: "text-[#67dc9f]",
    desc: "Dalgaların sesi uyanışın müziği olsun. Her sabah yeniden başla.",
    image: "/images/coastal_escape.png",
  },
  {
    label: "Dağ Kaçamağı",
    sublabel: "Alpine Retreat",
    icon: Mountain,
    gradient: "from-[#d2bbff]/20 to-[#60a5fa]/10",
    border: "border-[#d2bbff]/20",
    iconColor: "text-[#d2bbff]",
    desc: "Sessizliğin en saf hali. Zirvede nefes al, aşağıda bırak her şeyi.",
    image: "/images/alpine_retreat.png",
  },
  {
    label: "Orman Sığınağı",
    sublabel: "Forest Hideaway",
    icon: TreePine,
    gradient: "from-[#67dc9f]/20 to-[#60a5fa]/10",
    border: "border-[#67dc9f]/20",
    iconColor: "text-[#67dc9f]",
    desc: "Ekranlardan uzak, ağaçların arasında gerçekten dinlen.",
    image: "/images/forest_hideaway.png",
  },
];

const experiences = [
  {
    icon: Utensils,
    title: "Gastronomi",
    desc: "Otelin şefiyle buluş, yerel lezzetleri keşfet, damağının macerası başlasın.",
    color: "text-[#ffb2b7]",
    bg: "bg-[#f97316]/10",
    border: "border-[#f97316]/20",
  },
  {
    icon: Music,
    title: "Gece Hayatı",
    desc: "Curated rooftop barlar, canlı performanslar, şehrin nabzını hisset.",
    color: "text-[#d2bbff]",
    bg: "bg-[#7c3aed]/10",
    border: "border-[#7c3aed]/20",
  },
  {
    icon: CalendarDays,
    title: "Etkinlikler",
    desc: "Özel davetler, kurumsal zirveler ya da unutulmaz bir düğün — hepsi burada.",
    color: "text-[#67dc9f]",
    bg: "bg-[#25a46d]/10",
    border: "border-[#67dc9f]/20",
  },
  {
    icon: Star,
    title: "VIP Deneyim",
    desc: "Öncelikli erişim, kişisel konsiyerj, sınırlı teklifler. Farkı hisset.",
    color: "text-[#fb923c]",
    bg: "bg-[#fb923c]/10",
    border: "border-[#fb923c]/20",
  },
];

const testimonials = [
  {
    quote:
      "Bu sadece bir otel rezervasyonu değildi. Kapıdan girmeden önce her şey hazırdı — tercihlerim, masa rezervasyonum, hatta odamdaki müzik listesi.",
    name: "Elif K.",
    location: "İstanbul → Kapadokya",
    rating: 5,
  },
  {
    quote:
      "İlk kez bir platforma güvenerek seyahat ettim. Şikayet etmem gerektiğinde yapay zeka beni saatlerce beklettirmedi, 10 dakikada çözüldü.",
    name: "Marcus T.",
    location: "Berlin → Bodrum",
    rating: 5,
  },
  {
    quote:
      "Gece 23:00'da bir restoran rezervasyonu, sabah erken çıkış için valiz servisi, özel doğum günü sürprizi. Hepsi tek platformdan.",
    name: "Aisha M.",
    location: "Dubai → İzmir",
    rating: 5,
  },
];

const stats = [
  { value: 500, suffix: "+", label: "Destinasyon" },
  { value: 2, suffix: "M+", label: "Misafir" },
  { value: 48, suffix: "K+", label: "Deneyim" },
  { value: 12, suffix: "", label: "AI Ajan" },
];

export default function HomePage() {
  return (
    <div className="bg-[#09090b] text-white antialiased">
      {/* Navigation */}
      <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#09090b]/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4 text-sm">
          <div className="text-xl font-bold tracking-tighter text-white">
            Nuvoya
          </div>
          <div className="hidden items-center gap-8 text-slate-400 md:flex">
            <Link href="/search" className="transition-colors hover:text-white">
              Oteller
            </Link>
            <Link
              href="/experiences"
              className="transition-colors hover:text-white"
            >
              Deneyimler
            </Link>
            <Link
              href="/tonight"
              className="transition-colors hover:text-white"
            >
              Bu Gece
            </Link>
            <Link href="/vip" className="transition-colors hover:text-white">
              VIP
            </Link>
          </div>
          <Link
            href="/hotel/login"
            className="rounded-full bg-[#f97316] px-6 py-2 text-xs font-bold uppercase tracking-widest text-white transition-all hover:opacity-90 active:scale-95"
          >
            Otel Portali
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
        <ThreeDEnvironment />

        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-gray-300 backdrop-blur-md">
              <MapPin className="h-3.5 w-3.5 text-[#f97316]" />
              Her konaklama bir maceradır
            </div>
            <h1 className="mb-6 text-5xl font-bold leading-[0.92] tracking-tighter text-white md:text-8xl">
              Sıradanı bırak, <br />
              <span className="text-gradient">olağanüstüyü</span>
              <br />
              yaşa.
            </h1>
            <p className="mx-auto mb-12 max-w-2xl text-lg font-medium leading-relaxed text-slate-400 md:text-xl">
              Bir oda rezervasyonundan fazlası — sabahın ilk ışığından geceye
              uzanan, kişiselleştirilmiş, yapay zeka destekli bir konaklama
              macerası.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/search">
              <ShimmerButton
                shimmerColor="#f97316"
                background="rgba(249,115,22,0.9)"
                borderRadius="8px"
                className="gap-2 px-10 py-5 text-lg font-bold"
              >
                Maceraya Başla <ChevronRight className="h-5 w-5" />
              </ShimmerButton>
            </Link>
            <Link
              href="/tonight"
              className="rounded-lg border border-white/20 px-10 py-5 text-lg font-bold text-white transition-all hover:bg-white/5 active:scale-95"
            >
              Bu Gece Kaçamak ⚡
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-20 mx-auto -mt-16 max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-2 gap-8 rounded-2xl border border-white/10 bg-[#0e0e10]/80 p-10 backdrop-blur-md md:grid-cols-4"
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center border-r border-white/5 last:border-0"
            >
              <span className="mb-1 flex items-baseline gap-0.5 text-3xl font-bold text-white">
                <NumberTicker value={stat.value} className="text-white" />
                <span>{stat.suffix}</span>
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Mood / Destination Cards */}
      <section className="mx-auto max-w-7xl px-6 py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="heo-label mb-4">Ruhuna göre seç</p>
          <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            Hangi macera seni çağırıyor?
          </h2>
          <p className="mx-auto max-w-xl text-lg text-slate-400">
            Her konaklama bir his taşır. Seninkini bul.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {moods.map((mood, i) => (
            <motion.div
              key={mood.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className={`group cursor-pointer rounded-3xl border ${mood.border} relative overflow-hidden bg-[#0e0e10] p-8 transition-all duration-500`}
            >
              <div className="absolute inset-0 z-0">
                <Image
                  src={mood.image}
                  alt={mood.label}
                  fill
                  className="object-cover opacity-30 transition-all duration-700 group-hover:scale-105 group-hover:opacity-60"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${mood.gradient} mix-blend-overlay`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e10] via-[#0e0e10]/80 to-transparent" />
              </div>

              <div className="relative z-10">
                <div
                  className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 backdrop-blur-md`}
                >
                  <mood.icon className={`h-6 w-6 ${mood.iconColor}`} />
                </div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
                  {mood.sublabel}
                </p>
                <h3 className="mb-3 text-xl font-bold text-white">
                  {mood.label}
                </h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  {mood.desc}
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-slate-400 transition-all group-hover:gap-3 group-hover:text-white">
                  Keşfet <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Experience Showcase */}
      <section className="border-y border-white/5 bg-[#0e0e10] py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <p className="heo-label mb-4">Bir odadan fazlası</p>
            <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
              Konaklama boyunca her an{" "}
              <span className="text-gradient">senin için</span>
            </h2>
            <p className="mx-auto max-w-xl text-lg text-slate-400">
              Check-in&apos;den check-out&apos;a kadar her detay düşünüldü.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {experiences.map((exp, i) => (
              <motion.div
                key={exp.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`rounded-2xl border ${exp.border} ${exp.bg} p-8`}
              >
                <div className="mb-5">
                  <exp.icon className={`h-8 w-8 ${exp.color}`} />
                </div>
                <h3 className="mb-3 text-lg font-bold text-white">
                  {exp.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  {exp.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Props — For Hotels / For Guests */}
      <section className="mx-auto max-w-7xl px-6 py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            İki taraf, tek platform
          </h2>
          <p className="mx-auto max-w-xl text-lg text-slate-400">
            Oteller mükemmelliği yönetir. Misafirler macerayı yaşar.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card rounded-3xl border border-white/10 p-10 transition-all duration-500 hover:bg-white/5"
          >
            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#f97316]/30 bg-[#f97316]/20">
              <Heart className="h-7 w-7 text-[#f97316]" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-white">
              Misafirler için
            </h3>
            <p className="mb-8 leading-relaxed text-slate-400">
              Kapıdan girmeden önce seni tanıyoruz. Oda tercihinden yemek
              alerjine, gece planından sabah rutinine kadar her şey hazır.
            </p>
            <ul className="space-y-3">
              {[
                "Kişiselleştirilmiş öneri motoru",
                "Gerçek zamanlı AI konsiyerj",
                "Tek tıkla tüm konaklama deneyimi",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-sm text-slate-300"
                >
                  <Sparkles className="h-4 w-4 shrink-0 text-[#d2bbff]" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/search"
              className="mt-8 inline-flex items-center gap-2 font-bold text-[#d2bbff] transition-all hover:gap-3"
            >
              Maceraya başla <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card rounded-3xl border border-white/10 p-10 transition-all duration-500 hover:bg-white/5"
          >
            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#7c3aed]/30 bg-[#7c3aed]/20">
              <Building2 className="h-7 w-7 text-[#d2bbff]" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-white">Oteller için</h3>
            <p className="mb-8 leading-relaxed text-slate-400">
              Operasyonel karmaşayı bize bırak. Rezervasyon, etkinlik, destek ve
              gelir yönetimi — tek akıllı platformda.
            </p>
            <ul className="space-y-3">
              {[
                "AI destekli operasyon yönetimi",
                "Gerçek zamanlı misafir içgörüleri",
                "Otomatik destek ve telafi sistemi",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-sm text-slate-300"
                >
                  <Zap className="h-4 w-4 shrink-0 text-[#f97316]" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/hotel/login"
              className="mt-8 inline-flex items-center gap-2 font-bold text-[#f97316] transition-all hover:gap-3"
            >
              Otel partneri ol <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* AI Agent Section */}
      <section className="overflow-hidden border-y border-white/5 bg-[#0e0e10]">
        <div className="mx-auto grid max-w-7xl items-center gap-20 px-6 py-32 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 bg-[#f97316]/10 blur-[100px]" />
            <p className="heo-label mb-6">Sahne arkası</p>
            <h2 className="mb-8 text-4xl font-bold leading-tight text-white md:text-6xl">
              12 AI ajan, <span className="text-gradient italic">her an</span>{" "}
              senin için çalışıyor
            </h2>
            <p className="mb-12 text-lg text-slate-400">
              Genel bir chatbot değil — lüks konaklama dünyasının her nüansını
              bilen, birbirleriyle koordineli 12 uzmandan oluşan bir ekip.
            </p>
            <div className="flex w-fit items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-6 py-4">
              <Bot className="h-5 w-5 text-[#f97316]" />
              <span className="text-sm font-bold text-white">
                Nuvoya AI — 12 ajan, 7/24 aktif
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-2xl"
          >
            <Marquee
              vertical
              pauseOnHover
              repeat={2}
              className="h-[420px] [--duration:20s]"
            >
              {agents.map((agent) => (
                <div
                  key={agent.name}
                  className="group flex items-center gap-6 rounded-xl border border-transparent p-5 transition-all hover:border-white/10 hover:bg-white/5"
                >
                  <div
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{
                      backgroundColor: agent.color,
                      boxShadow: `0 0 10px ${agent.shadow}`,
                    }}
                  />
                  <div>
                    <h4 className="font-bold text-white">{agent.name}</h4>
                    <p className="text-sm text-slate-500">{agent.desc}</p>
                  </div>
                </div>
              ))}
            </Marquee>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#0e0e10] to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0e0e10] to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-6 py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="heo-label mb-4">Gerçek hikayeler</p>
          <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            Onlar yaşadı, sen de yaşa
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card rounded-3xl border border-white/10 p-8"
            >
              <div className="mb-6 flex gap-1">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star
                    key={j}
                    className="h-4 w-4 fill-[#fb923c] text-[#fb923c]"
                  />
                ))}
              </div>
              <p className="mb-8 text-sm italic leading-relaxed text-slate-300">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#f97316] to-[#7c3aed] text-xs font-bold text-white">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{t.name}</p>
                  <p className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="h-3 w-3" /> {t.location}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Adventure CTA */}
      <section className="px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/10 p-16 text-center"
        >
          <BorderBeam
            colorFrom="#f97316"
            colorTo="#7c3aed"
            duration={8}
            size={120}
          />
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#f97316]/20 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#7c3aed]/20 blur-[100px]" />
          <p className="heo-label relative z-10 mb-6">Sıra sende</p>
          <h2 className="relative z-10 mb-6 text-4xl font-bold leading-tight text-white md:text-6xl">
            Bir sonraki maceran
            <br />
            <span className="text-gradient">seni bekliyor.</span>
          </h2>
          <p className="relative z-10 mb-10 text-lg text-slate-400">
            Nereye gideceğini bilmesen de olur — biz sana göre bir deneyim
            buluruz.
          </p>
          <div className="relative z-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/search"
              className="w-full rounded-lg bg-[#f97316] px-10 py-5 text-lg font-bold text-white transition-all hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] active:scale-95 sm:w-auto"
            >
              Keşfetmeye Başla
            </Link>
            <Link
              href="/hotel/login"
              className="w-full rounded-lg border border-white/20 px-10 py-5 text-lg font-bold text-white transition-all hover:bg-white/5 sm:w-auto"
            >
              Otel Ortağı Ol
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#09090b] px-6 py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
          <div>
            <div className="mb-2 text-2xl font-bold tracking-tighter text-white">
              Nuvoya
            </div>
            <p className="text-xs text-slate-600">
              Her konaklama bir maceradır.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-500">
            <Link href="/search" className="transition-colors hover:text-white">
              Oteller
            </Link>
            <Link
              href="/experiences"
              className="transition-colors hover:text-white"
            >
              Deneyimler
            </Link>
            <Link
              href="/tonight"
              className="transition-colors hover:text-white"
            >
              Bu Gece
            </Link>
            <Link href="/vip" className="transition-colors hover:text-white">
              VIP
            </Link>
            <Link
              href="/hotel/login"
              className="transition-colors hover:text-white"
            >
              Otel Portali
            </Link>
          </div>
          <p className="text-sm text-slate-600">
            © 2026 Nuvoya. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
