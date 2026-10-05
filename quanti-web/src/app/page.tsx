"use client";

import { motion } from "framer-motion";
import { HeartPulse, Share2, Sparkles } from "lucide-react";
import WaitlistForm from "@/components/WaitlistForm";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

const features = [
  {
    title: "AI Verified Stats",
    body: "Turn everyday queries like 'How many times did I golf this year?' into verified collectible stamps.",
    icon: Sparkles,
  },
  {
    title: "Social Recaps",
    body: "Weekly, monthly, and yearly recaps built natively for sharing to Instagram Stories.",
    icon: Share2,
  },
  {
    title: "Bank & Health Integrations",
    body: "Seamlessly aggregate your health and financial progress into one deep purple dashboard.",
    icon: HeartPulse,
  },
];

export default function Home() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.18),_transparent_55%)]" />

      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6"
      >
        <a href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="h-2 w-2 rounded-full bg-[#8b5cf6] shadow-[0_0_12px_#8b5cf6]" />
          Quanti
        </a>
        <a
          href="#waitlist"
          className="rounded-full border border-[#8b5cf6]/40 bg-[#161124] px-4 py-2 text-sm font-medium text-[#f8fafc] transition hover:border-[#8b5cf6] hover:shadow-[0_0_20px_rgba(139,92,246,0.35)]"
        >
          Join Waitlist
        </a>
      </motion.header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-24">
        <motion.section
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.12 }}
          className="flex flex-col items-center pt-16 text-center sm:pt-24"
        >
          <motion.p
            variants={fadeUp}
            className="mb-4 rounded-full border border-[#8b5cf6]/30 bg-[#161124] px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-[#a78bfa]"
          >
            iOS • Verified Life
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="max-w-3xl text-4xl font-semibold tracking-tight text-[#f8fafc] sm:text-6xl sm:leading-[1.05]"
          >
            The Verified Social Ledger.
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-5 max-w-xl text-base leading-7 text-[#94a3b8] sm:text-lg"
          >
            Track your real life, log AI-verified stats, and share recaps that actually mean something.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 w-full max-w-lg">
            <WaitlistForm id="hero-waitlist" />
          </motion.div>
          <motion.p variants={fadeUp} className="mt-4 text-sm text-[#94a3b8]">
            Launching soon on iOS • quanti-app.com
          </motion.p>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ staggerChildren: 0.12 }}
          className="mt-24 grid gap-4 sm:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.article
              key={feature.title}
              variants={fadeUp}
              className="rounded-2xl border border-[#2d2442] bg-[#161124] p-6 text-left shadow-[0_0_0_1px_rgba(139,92,246,0.08),0_20px_50px_rgba(11,7,18,0.45)] transition hover:border-[#8b5cf6]/50 hover:shadow-[0_0_40px_rgba(139,92,246,0.18)]"
            >
              <feature.icon className="mb-4 h-5 w-5 text-[#a78bfa]" strokeWidth={1.75} />
              <h2 className="text-lg font-semibold tracking-tight text-[#f8fafc]">{feature.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#94a3b8]">{feature.body}</p>
            </motion.article>
          ))}
        </motion.section>

        <motion.section
          id="waitlist"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="mt-24 scroll-mt-24 rounded-3xl border border-[#8b5cf6]/25 bg-[#161124] px-6 py-12 text-center shadow-[0_0_60px_rgba(139,92,246,0.12)] sm:px-12"
        >
          <h2 className="text-3xl font-semibold tracking-tight">Get early access</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#94a3b8]">
            Be first in line when Quanti opens on iOS. No spam — just a note when the ledger goes live.
          </p>
          <div className="mx-auto mt-8 max-w-lg">
            <WaitlistForm id="waitlist-form" />
          </div>
        </motion.section>
      </main>

      <footer className="relative z-10 border-t border-[#2d2442] px-6 py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 text-sm text-[#94a3b8] sm:flex-row">
          <p>Copyright © 2026 Quanti LLC. All rights reserved.</p>
          <nav className="flex gap-5">
            <a href="/privacy" className="hover:text-[#f8fafc]">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-[#f8fafc]">
              Terms of Service
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
