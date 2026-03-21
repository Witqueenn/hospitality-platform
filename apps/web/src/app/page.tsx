"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  CalendarDays,
  Sparkles,
  ChevronRight,
  Bot,
  ArrowRight,
  Shield,
  Zap,
  Heart,
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

const features = [
  {
    title: "Stay OS",
    desc: "A core engine handling the complexities of guest stays with real-time inventory sync, automated check-ins, and zero-friction bookings.",
    icon: Building2,
    color: "from-[#ffb2b7] to-[#fc536d]",
    textColor: "text-[#ffb2b7]",
  },
  {
    title: "Event OS",
    desc: "From weddings to corporate galas, manage every logistics touchpoint in a single unified timeline with AI-generated BEOs.",
    icon: CalendarDays,
    color: "from-[#d2bbff] to-[#6001d1]",
    textColor: "text-[#d2bbff]",
  },
  {
    title: "Experience OS",
    desc: "Curated dining, vibrant nightlife, and personalized guest experiences powered by smart preference tracking.",
    icon: Sparkles,
    color: "from-[#67dc9f] to-[#25a46d]",
    textColor: "text-[#67dc9f]",
  },
];

const stats = [
  { value: 500, suffix: "+", label: "Hotels" },
  { value: 2, suffix: "M+", label: "Bookings" },
  { value: 98, suffix: "%", label: "Uptime" },
  { value: 12, suffix: "", label: "AI Agents" },
];

export default function HomePage() {
  return (
    <div className="bg-[#09090b] text-white antialiased">
      {/* Navigation */}
      <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#09090b]/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4 text-sm">
          <div className="text-xl font-bold tracking-tighter text-white">
            HEO
          </div>
          <div className="hidden items-center gap-8 text-slate-400 md:flex">
            <span className="cursor-default border-b border-[#e94560] pb-0.5 text-white">
              Platform
            </span>
            <Link href="/search" className="transition-colors hover:text-white">
              Hotels
            </Link>
            <span className="cursor-default transition-colors hover:text-white">
              AI Agents
            </span>
            <span className="cursor-default transition-colors hover:text-white">
              Pricing
            </span>
          </div>
          <Link
            href="/hotel/login"
            className="rounded-full bg-[#e94560] px-6 py-2 text-xs font-bold uppercase tracking-widest text-white transition-all hover:opacity-90 active:scale-95"
          >
            Hotel Portal
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
        <div className="pointer-events-none absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-[#e94560]/20 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-[#7c3aed]/20 blur-[120px]" />
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-20" />

        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="mb-6 inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-gray-300 backdrop-blur-md">
              ✨ Where Hotels Meet Their Guests
            </div>
            <h1 className="mb-8 text-5xl font-bold leading-[0.95] tracking-tighter text-white md:text-8xl">
              Hospitality Experience <br />
              <span className="text-gradient">Orchestration</span>
            </h1>
            <p className="mx-auto mb-12 max-w-2xl text-lg font-medium leading-relaxed text-slate-400 md:text-xl">
              HEO bridges the gap between world-class hotels and the guests who
              deserve extraordinary experiences — powered by AI, built for
              scale.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-center justify-center gap-6 sm:flex-row"
          >
            <Link href="/search">
              <ShimmerButton
                shimmerColor="#e94560"
                background="rgba(233,69,96,0.9)"
                borderRadius="8px"
                className="gap-2 px-10 py-5 text-lg font-bold"
              >
                Find a Hotel <ChevronRight className="h-5 w-5" />
              </ShimmerButton>
            </Link>
            <Link
              href="/hotel/login"
              className="rounded-lg border border-white/20 px-10 py-5 text-lg font-bold text-white transition-all hover:bg-white/5 active:scale-95"
            >
              For Hotels
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
            One platform, two sides
          </h2>
          <p className="mx-auto max-w-xl text-lg text-slate-400">
            Hotels get operational excellence. Guests get extraordinary stays.
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
            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e94560]/30 bg-[#e94560]/20">
              <Building2 className="h-7 w-7 text-[#e94560]" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-white">For Hotels</h3>
            <p className="mb-8 leading-relaxed text-slate-400">
              Manage bookings, events, and guest experiences from one
              intelligent platform. Let AI handle the operational complexity.
            </p>
            <ul className="space-y-3">
              {[
                "AI-powered operations",
                "Real-time guest insights",
                "Automated support & recovery",
              ].map((item: any) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-sm text-slate-300"
                >
                  <Zap className="h-4 w-4 shrink-0 text-[#e94560]" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/hotel/login"
              className="mt-8 inline-flex items-center gap-2 font-bold text-[#e94560] transition-all hover:gap-3"
            >
              Join as Hotel Partner <ArrowRight className="h-4 w-4" />
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
              <Heart className="h-7 w-7 text-[#d2bbff]" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-white">For Guests</h3>
            <p className="mb-8 leading-relaxed text-slate-400">
              Discover and book extraordinary hotel experiences — rooms, events,
              dining, and nightlife — all in one place.
            </p>
            <ul className="space-y-3">
              {[
                "Personalized recommendations",
                "Seamless booking",
                "24/7 AI concierge",
              ].map((item: any) => (
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
              Explore Hotels <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="mx-auto max-w-7xl px-6 pb-32">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {features.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="glass-card group rounded-3xl border border-white/5 p-10 transition-all duration-500 hover:bg-white/5"
            >
              <div
                className={`h-16 w-16 rounded-full bg-gradient-to-br ${item.color} mb-8 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}
              >
                <item.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-white">
                {item.title}
              </h3>
              <p className="mb-8 leading-relaxed text-slate-400">{item.desc}</p>
              <span
                className={`inline-flex items-center gap-2 ${item.textColor} text-sm font-bold`}
              >
                Learn more <ArrowRight className="h-4 w-4" />
              </span>
            </motion.div>
          ))}
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
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 bg-[#e94560]/10 blur-[100px]" />
            <h2 className="mb-8 text-4xl font-bold leading-tight text-white md:text-6xl">
              Powered by 12 specialized{" "}
              <span className="text-gradient italic">AI agents</span>
            </h2>
            <p className="mb-12 text-lg text-slate-400">
              Instead of one general chatbot, HEO deploys a coordinated swarm of
              domain-specific agents — each trained on the nuances of luxury
              hospitality.
            </p>
            <div className="flex w-fit items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-6 py-4">
              <Bot className="h-5 w-5 text-[#e94560]" />
              <span className="text-sm font-bold text-white">
                12 agents, always on
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
            {/* fade masks */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#0e0e10] to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0e0e10] to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-6 py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20 text-center"
        >
          <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            How it works
          </h2>
          <p className="text-lg text-slate-400">
            Three steps to extraordinary hospitality.
          </p>
        </motion.div>

        <div className="relative grid gap-8 md:grid-cols-3">
          <div className="absolute left-1/3 right-1/3 top-10 hidden h-px bg-gradient-to-r from-transparent via-white/20 to-transparent md:block" />
          {[
            {
              step: "01",
              title: "Hotel joins HEO",
              desc: "Set up your property, rooms, venues, and configure AI policies in minutes.",
              icon: Building2,
            },
            {
              step: "02",
              title: "Guest discovers & books",
              desc: "Guests find and book personalized experiences matched to their preferences.",
              icon: Heart,
            },
            {
              step: "03",
              title: "AI orchestrates",
              desc: "12 agents coordinate every detail — from check-in to checkout and beyond.",
              icon: Bot,
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="glass-card rounded-3xl border border-white/10 p-8 text-center"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#e94560] to-[#7c3aed]">
                <span className="text-lg font-bold text-white">
                  {item.step}
                </span>
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-400">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/10 p-16 text-center"
        >
          <BorderBeam
            colorFrom="#e94560"
            colorTo="#7c3aed"
            duration={8}
            size={120}
          />
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#e94560]/20 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#7c3aed]/20 blur-[100px]" />
          <Shield className="relative z-10 mx-auto mb-6 h-10 w-10 text-[#e94560]" />
          <h2 className="relative z-10 mb-6 text-4xl font-bold leading-tight text-white md:text-6xl">
            Ready to transform <br /> your hotel?
          </h2>
          <p className="relative z-10 mb-10 text-lg text-slate-400">
            Join hundreds of hotels already delivering extraordinary guest
            experiences.
          </p>
          <div className="relative z-10 flex flex-col items-center justify-center gap-6 sm:flex-row">
            <Link
              href="/hotel/login"
              className="w-full rounded-lg bg-[#e94560] px-10 py-5 text-lg font-bold text-white transition-all hover:shadow-[0_0_30px_rgba(233,69,96,0.3)] active:scale-95 sm:w-auto"
            >
              Get Started
            </Link>
            <Link
              href="/register"
              className="w-full rounded-lg border border-white/20 px-10 py-5 text-lg font-bold text-white transition-all hover:bg-white/5 sm:w-auto"
            >
              Create Guest Account
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#09090b] px-6 py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
          <div className="text-2xl font-bold tracking-tighter text-white">
            HEO
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-500">
            <span className="cursor-pointer transition-colors hover:text-white">
              Privacy Policy
            </span>
            <span className="cursor-pointer transition-colors hover:text-white">
              Terms of Service
            </span>
            <Link href="/search" className="transition-colors hover:text-white">
              Explore Hotels
            </Link>
            <Link
              href="/hotel/login"
              className="transition-colors hover:text-white"
            >
              Hotel Portal
            </Link>
          </div>
          <p className="text-sm text-slate-600">
            © 2026 HEO. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
