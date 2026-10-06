"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import BadgeShowcase from "@/components/BadgeShowcase";
import Footer from "@/components/Footer";
import FounderNote from "@/components/FounderNote";
import Hero from "@/components/Hero";
import InteractivePreview from "@/components/InteractivePreview";
import TrustSecurity from "@/components/TrustSecurity";

export default function Home() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.18),_transparent_55%)]" />

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
          className="rounded-full border border-violet-500/40 bg-zinc-900 px-4 py-2 text-sm font-medium text-[#FAFAFA] transition hover:border-violet-500 hover:shadow-[0_0_20px_rgba(124,58,237,0.35)]"
        >
          Join Waitlist
        </a>
      </motion.header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-8">
        <Hero />

        <InteractivePreview />

        <BadgeShowcase />

        <TrustSecurity />

        <FounderNote />
      </main>

      <Footer />
    </div>
  );
}
