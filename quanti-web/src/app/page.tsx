"use client";

import { motion } from "framer-motion";
import { HeartPulse, Share2, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import IPhoneMockup from "@/components/IPhoneMockup";
import InteractivePreview from "@/components/InteractivePreview";
import TrustSecurity from "@/components/TrustSecurity";
import VerifiedStamp from "@/components/VerifiedStamp";
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
          className="grid items-center gap-12 pt-16 sm:pt-20 lg:grid-cols-2"
        >
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
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
          </div>
          <motion.div variants={fadeUp} className="flex justify-center">
            <IPhoneMockup />
          </motion.div>
        </motion.section>

        <InteractivePreview />

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
              className="rounded-2xl border border-[#2d2442] bg-[#161124] p-6 text-left shadow-[0_0_0_1px_rgba(139,92,246,0.08),0_0_40px_rgba(139,92,246,0.12)] transition hover:border-[#8b5cf6]/50 hover:shadow-[0_0_50px_rgba(139,92,246,0.22)]"
            >
              <feature.icon className="mb-4 h-5 w-5 text-[#a78bfa]" strokeWidth={1.75} />
              <h2 className="text-lg font-semibold tracking-tight text-[#f8fafc]">{feature.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#94a3b8]">{feature.body}</p>
            </motion.article>
          ))}
        </motion.section>

        <TrustSecurity />

        <motion.section
          id="waitlist"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="mt-24 scroll-mt-24 rounded-3xl border border-[#8b5cf6]/25 bg-[#161124] px-6 py-12 text-center shadow-[0_0_60px_rgba(139,92,246,0.12)] sm:px-12"
        >
          <div className="mb-6 flex justify-center">
            <VerifiedStamp />
          </div>
          <h2 className="text-3xl font-semibold tracking-tight">Get early access</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#94a3b8]">
            Be first in line when Quanti opens on iOS. No spam — just a note when the ledger goes live.
          </p>
          <div className="mx-auto mt-8 max-w-lg">
            <WaitlistForm id="waitlist-form" />
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}
