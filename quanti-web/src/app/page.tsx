"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import DailyFocusCard from "@/components/DailyFocusCard";
import Footer from "@/components/Footer";
import FounderNote from "@/components/FounderNote";
import Hero from "@/components/Hero";
import MirrorVsGps from "@/components/MirrorVsGps";
import TrustSecurity from "@/components/TrustSecurity";

export default function Home() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-x-hidden bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.2),_transparent_55%)]" />

      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6"
      >
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/logo-full.svg"
            alt="Quanti"
            width={220}
            height={56}
            priority
            unoptimized
            className="h-8 w-auto max-w-[148px] object-contain object-left sm:h-10 sm:max-w-[220px]"
          />
        </Link>
        <a
          href="#waitlist"
          className="rounded-full border border-indigo-400/40 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-50 transition hover:border-indigo-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.35)] active:scale-95"
        >
          Join Waitlist
        </a>
      </motion.header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-8">
        <Hero />

        <MirrorVsGps />

        <DailyFocusCard />

        <TrustSecurity />

        <FounderNote />

        <section className="mt-16 mb-8 text-center">
          <a
            href="#waitlist"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-indigo-500 px-6 text-sm font-semibold text-white shadow-[0_0_24px_rgba(99,102,241,0.4)] transition hover:bg-indigo-400 active:scale-95"
          >
            Get TestFlight Access
          </a>
          <p className="mt-3 text-xs text-slate-400">First 500 waitlist members lock in $49/yr OG Founder pricing.</p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
