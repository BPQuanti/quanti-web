"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import IPhoneMockup from "@/components/IPhoneMockup";
import WaitlistForm from "@/components/WaitlistForm";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

export default function Hero() {
  return (
    <motion.section
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: 0.12 }}
      className="grid items-center gap-12 pt-16 sm:pt-20 lg:grid-cols-2"
    >
      <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
        <motion.p
          variants={fadeUp}
          className="mb-4 rounded-full border border-violet-500/30 bg-zinc-900 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-violet-400"
        >
          iOS • Verified Life
        </motion.p>
        <motion.h1
          variants={fadeUp}
          className="max-w-3xl text-4xl font-semibold tracking-tight text-[#FAFAFA] sm:text-6xl sm:leading-[1.05]"
        >
          The Verified Social Ledger.
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-5 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg">
          Track your real life, log AI-verified stats, and share recaps that actually mean something.
        </motion.p>
        <motion.div id="waitlist" variants={fadeUp} className="mt-8 w-full max-w-lg scroll-mt-24">
          <Suspense fallback={<div className="h-[88px] rounded-2xl border border-zinc-800 bg-zinc-900/80" />}>
            <WaitlistForm id="hero-waitlist" />
          </Suspense>
        </motion.div>
        <motion.p variants={fadeUp} className="mt-4 text-sm text-zinc-400">
          Launching soon on iOS • quanti-app.com
        </motion.p>
      </div>
      <motion.div variants={fadeUp} className="flex justify-center overflow-visible">
        <IPhoneMockup />
      </motion.div>
    </motion.section>
  );
}
