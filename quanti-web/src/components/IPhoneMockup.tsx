"use client";

import { motion } from "framer-motion";
import { Share2, ShieldCheck } from "lucide-react";

function InstagramMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" />
    </svg>
  );
}

function XMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
      <path d="M14.7 10.4 21 3h-1.9l-5.5 6.4L9.2 3H3.5l6.7 9.7L3.5 21h1.9l6-7 4.8 7h5.7l-7.2-10.6ZM8.4 4.4h1.7l9.4 15.2h-1.7L8.4 4.4Z" />
    </svg>
  );
}

function IMessageMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
      <path d="M12 3.5c-4.9 0-8.8 3.3-8.8 7.4 0 2.5 1.5 4.8 3.8 6.2-.1.7-.5 1.8-1.6 3.1 1.8-.3 3.3-1.1 4.3-1.8.7.1 1.5.2 2.3.2 4.9 0 8.8-3.3 8.8-7.4S16.9 3.5 12 3.5Z" />
    </svg>
  );
}

export default function IPhoneMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="relative mx-auto w-[280px] sm:w-[300px]"
    >
      <div className="pointer-events-none absolute -inset-8 rounded-[3rem] bg-[#7C3AED]/20 blur-3xl" />
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative rounded-[2.6rem] border border-zinc-800 bg-zinc-950 p-2 shadow-[0_0_50px_rgba(124,58,237,0.2)]"
      >
        <div className="overflow-hidden rounded-[2.2rem] border border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
          <div className="relative flex min-h-[540px] flex-col bg-zinc-950/80 px-3 pb-3 pt-8 sm:min-h-[560px]">
            <div className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />

            <p className="text-left text-[15px] font-semibold tracking-tight text-[#FAFAFA]">
              Year in Review: Golf
            </p>
            <p className="mt-0.5 text-left text-[10px] leading-4 text-[#A1A1AA]">
              Plaid Financial + Apple HealthKit Sync
            </p>

            <div className="mt-3 flex items-center gap-2.5 rounded-2xl border border-violet-500/50 bg-zinc-900/90 px-3 py-2.5 shadow-[0_0_18px_rgba(124,58,237,0.25),inset_0_1px_0_rgba(255,255,255,0.08)]">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-zinc-200 to-zinc-500 text-[#09090B] shadow-[0_0_10px_rgba(196,132,252,0.4)]">
                <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
              <div className="min-w-0 text-left">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#FAFAFA]">
                  2026 Golf Obsessed
                </p>
                <p className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.16em] text-violet-400">
                  Quanti Verified Badge
                </p>
              </div>
            </div>

            <div className="mt-2 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 text-left backdrop-blur-md">
              <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-violet-400">Major Stat</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-[#FAFAFA]">73 Rounds Played</p>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-left backdrop-blur-md">
                <p className="text-[8px] font-medium uppercase tracking-[0.1em] text-violet-400">
                  Money Spent on Rounds
                </p>
                <p className="mt-1.5 text-lg font-semibold text-[#FAFAFA]">$12,450</p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-left backdrop-blur-md">
                <p className="text-[8px] font-medium uppercase tracking-[0.1em] text-violet-400">
                  Total Steps Taken on Course
                </p>
                <p className="mt-1.5 text-lg font-semibold text-[#FAFAFA]">1.2M Steps</p>
              </div>
            </div>

            <div className="mt-auto rounded-2xl border border-zinc-800 bg-zinc-900/70 p-2.5 shadow-[0_0_20px_rgba(124,58,237,0.18)]">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2.5 text-[10px] font-semibold leading-tight text-white shadow-[0_0_18px_rgba(124,58,237,0.45)] transition hover:bg-violet-500"
              >
                <Share2 className="h-3.5 w-3.5" strokeWidth={2} />
                Share Recap to Story / Group Chat
              </button>
              <div className="mt-2 flex items-center justify-center gap-2 text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <InstagramMark />
                  <XMark />
                  <IMessageMark />
                </span>
              </div>
              <p className="mt-1 text-center text-[8px] leading-3 text-[#A1A1AA]">
                Export as high-res card or IG Story format
              </p>
            </div>

            <div className="mx-auto mt-2 h-1 w-24 rounded-full bg-white/20" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
