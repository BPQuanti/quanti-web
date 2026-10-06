"use client";

import { motion } from "framer-motion";
import { HeartPulse, Share2, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import BadgeShowcase from "@/components/BadgeShowcase";
import DigitalOGBadge from "@/components/DigitalOGBadge";
import Footer from "@/components/Footer";
import FounderNote from "@/components/FounderNote";
import Hero from "@/components/Hero";
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

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-24">
        <Hero />

        <InteractivePreview />

        <BadgeShowcase />

        <DigitalOGBadge />

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
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-left shadow-[0_0_40px_rgba(124,58,237,0.12)] transition hover:border-violet-500/50 hover:shadow-[0_0_50px_rgba(124,58,237,0.22)]"
            >
              <feature.icon className="mb-4 h-5 w-5 text-violet-400" strokeWidth={1.75} />
              <h2 className="text-lg font-semibold tracking-tight text-[#FAFAFA]">{feature.title}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{feature.body}</p>
            </motion.article>
          ))}
        </motion.section>

        <TrustSecurity />

        <FounderNote />

        <motion.section
          id="waitlist"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="mt-24 scroll-mt-24 rounded-3xl border border-violet-500/25 bg-zinc-900 px-6 py-12 text-center shadow-[0_0_60px_rgba(124,58,237,0.12)] sm:px-12"
        >
          <div className="mb-6 flex justify-center">
            <VerifiedStamp />
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-[#FAFAFA]">Get early access</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-400">
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
