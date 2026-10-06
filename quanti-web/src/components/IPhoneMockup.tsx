"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

const spendBars = [28, 40, 34, 52, 46, 64, 48, 72, 58, 80, 70, 88];
const activityBars = [36, 48, 42, 60, 54, 44, 70, 62, 78, 66, 84, 74];

export default function IPhoneMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="relative mx-auto w-full max-w-[340px] sm:max-w-[380px]"
    >
      <div className="pointer-events-none absolute -inset-8 rounded-[3rem] bg-[#7C3AED]/20 blur-3xl" />

      <div className="relative flex flex-col items-center sm:block">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 mx-auto w-[260px] sm:w-[280px]"
        >
          <div className="rounded-[2.6rem] border border-[#2d2442] bg-[#09090B] p-2 shadow-[0_0_50px_rgba(124,58,237,0.25)]">
            <div className="overflow-hidden rounded-[2.2rem] border border-[#7C3AED]/30 bg-[#09090B]">
              <div className="relative flex min-h-[500px] flex-col bg-[#09090B] px-3 pb-4 pt-8 sm:min-h-[528px]">
                <div className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />

                <p className="text-left text-[15px] font-semibold tracking-tight text-[#FAFAFA]">
                  Year in Review: Golf
                </p>
                <p className="mt-0.5 text-left text-[10px] text-[#A1A1AA]">Summary — Your Golf Year 2026</p>

                <div className="mt-3 rounded-2xl border border-[#7C3AED]/35 bg-[#7C3AED]/10 p-3 text-left shadow-[0_0_20px_rgba(124,58,237,0.2)]">
                  <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-violet-400">Major stat</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-[#FAFAFA]">73 Rounds Played</p>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-left backdrop-blur-md">
                    <p className="text-[8px] font-medium uppercase tracking-[0.12em] text-violet-400">
                      Money Spent on Rounds
                    </p>
                    <p className="mt-1.5 text-lg font-semibold text-[#FAFAFA]">$12,450</p>
                    <p className="mt-0.5 text-[8px] text-[#A1A1AA]">Plaid financial sync</p>
                  </div>
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-left backdrop-blur-md">
                    <p className="text-[8px] font-medium uppercase tracking-[0.12em] text-violet-400">
                      Total Steps Taken on Course
                    </p>
                    <p className="mt-1.5 text-lg font-semibold text-[#FAFAFA]">1.2M Steps</p>
                    <p className="mt-0.5 text-[8px] text-[#A1A1AA]">HealthKit activity</p>
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-2.5 backdrop-blur-md">
                    <p className="text-left text-[8px] font-medium uppercase tracking-[0.12em] text-[#A1A1AA]">
                      Golf Spending Over Time
                    </p>
                    <div className="mt-3 flex h-12 items-end gap-0.5">
                      {spendBars.map((height, index) => (
                        <motion.div
                          key={`spend-${index}`}
                          initial={{ height: 6 }}
                          whileInView={{ height }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.06 * index, duration: 0.4 }}
                          className="flex-1 rounded-t bg-gradient-to-t from-[#7C3AED] to-[#C084FC]"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-2.5 backdrop-blur-md">
                    <p className="text-left text-[8px] font-medium uppercase tracking-[0.12em] text-[#A1A1AA]">
                      Activity Patterns
                    </p>
                    <div className="mt-3 flex h-12 items-end gap-0.5">
                      {activityBars.map((height, index) => (
                        <motion.div
                          key={`activity-${index}`}
                          initial={{ height: 6 }}
                          whileInView={{ height }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.06 * index, duration: 0.4 }}
                          className="flex-1 rounded-t bg-gradient-to-t from-zinc-700 to-violet-300"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mx-auto mt-auto h-1 w-24 rounded-full bg-white/20" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35, duration: 0.45 }}
          className="relative z-20 mt-4 sm:absolute sm:-right-2 sm:top-20 sm:mt-0 lg:-right-6"
        >
          <div className="flex items-center gap-2.5 rounded-2xl border border-[#7C3AED] bg-zinc-950/95 px-3 py-2.5 shadow-[0_0_50px_rgba(124,58,237,0.25)] backdrop-blur-md">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#C084FC]/50 bg-gradient-to-b from-zinc-300 to-zinc-500 text-[#09090B] shadow-[0_0_12px_rgba(196,132,252,0.45)]">
              <ShieldCheck className="h-4 w-4" strokeWidth={2.4} />
            </span>
            <div className="text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#FAFAFA]">2026 Golf Obsessed</p>
              <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-violet-400">
                Quanti Verified
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
