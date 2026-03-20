"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Building2, CalendarDays, Sparkles, ChevronRight } from "lucide-react";

const features = [
  {
    title: "Stay OS",
    desc: "Seamless room management, intuitive bookings, and frictionless check-ins.",
    icon: Building2,
    delay: 0.1,
  },
  {
    title: "Event OS",
    desc: "Complete venue control, Banquet Event Orders, and run-of-show orchestration.",
    icon: CalendarDays,
    delay: 0.2,
  },
  {
    title: "Experience OS",
    desc: "Curated dining, vibrant nightlife, and unforgettable guest experiences.",
    icon: Sparkles,
    delay: 0.3,
  },
];

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-950 p-6 text-slate-50 md:p-12">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute left-[-10%] top-[-10%] h-[50%] w-[50%] animate-pulse rounded-full bg-[#e94560] opacity-20 mix-blend-screen blur-[150px] filter" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] animate-pulse rounded-full bg-[#4c1d95] opacity-30 mix-blend-screen blur-[150px] filter delay-1000" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="mb-6 inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-gray-300 backdrop-blur-md">
            ✨ The future of hospitality management
          </div>
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight md:text-7xl">
            Hospitality Experience <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-[#e94560] to-purple-400 bg-clip-text text-transparent">
              Orchestration
            </span>
          </h1>
          <p className="mx-auto mb-12 max-w-2xl text-lg font-light leading-relaxed text-gray-400 md:text-2xl">
            The complete platform for modern hotels. AI-powered, guest-first,
            and designed for extraordinary operational excellence.
          </p>
        </motion.div>

        <div className="mb-16 grid grid-cols-1 gap-6 text-left md:grid-cols-3">
          {features.map((item) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: item.delay }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:bg-white/10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-[#e94560]/20 to-purple-600/20 transition-colors group-hover:border-[#e94560]/50">
                <item.icon className="h-7 w-7 text-[#e94560]" />
              </div>
              <h3 className="mb-3 text-2xl font-semibold">{item.title}</h3>
              <p className="font-light leading-relaxed text-gray-400">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col items-center justify-center gap-5 sm:flex-row"
        >
          <Link
            href="/search"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-[#e94560] px-8 py-4 font-semibold text-white transition-all duration-200 hover:bg-[#c73652] hover:shadow-[0_0_40px_-10px_#e94560]"
          >
            <span className="relative z-10 flex items-center gap-2">
              Find a Hotel{" "}
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
          <Link
            href="/hotel/login"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-md transition-all duration-200 hover:border-white/20 hover:bg-white/10"
          >
            Hotel Portal
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center bg-transparent px-8 py-4 font-semibold text-white transition-all duration-200 hover:text-[#e94560]"
          >
            Sign Up
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
