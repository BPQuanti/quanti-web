"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Image from "next/image";

const bubble = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1 },
};

export default function IPhoneMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="relative mx-auto w-[280px] sm:w-[300px]"
    >
      <div className="absolute -inset-8 rounded-[3rem] bg-[#7C3AED]/20 blur-3xl" />
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative rounded-[2.6rem] border border-[#2d2442] bg-[#09090B] p-2 shadow-[0_0_80px_rgba(124,58,237,0.28)]"
      >
        <div className="overflow-hidden rounded-[2.2rem] border border-[#7C3AED]/30 bg-[#09090B]">
          <div className="relative flex min-h-[520px] flex-col bg-[#09090B] px-3 pb-4 pt-8 sm:min-h-[548px]">
            <div className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />

            <div className="flex items-center gap-2.5 border-b border-white/10 px-1 pb-3">
              <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-[#7C3AED]/50 bg-[#161124] shadow-[0_0_12px_rgba(124,58,237,0.35)]">
                <Image
                  src="/logo-mark.svg"
                  alt=""
                  width={32}
                  height={32}
                  unoptimized
                  className="h-full w-full object-contain p-0.5"
                />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-[13px] font-semibold leading-tight text-[#f8fafc]">Quanti AI</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[#a78bfa]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80] shadow-[0_0_8px_#4ade80]" />
                  Online · Verified
                </p>
              </div>
            </div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.35 }}
              transition={{ staggerChildren: 0.22, delayChildren: 0.2 }}
              className="mt-3 flex flex-1 flex-col gap-2.5"
            >
              <motion.div variants={bubble} className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-br-md bg-[#7C3AED] px-3 py-2.5 text-left text-[11px] leading-4 text-white shadow-[0_8px_24px_rgba(124,58,237,0.35)]">
                  Hi Quanti, how many Amazon packages did I order this past year?
                </p>
              </motion.div>

              <motion.div variants={bubble} className="flex justify-start">
                <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-[#7C3AED]/35 bg-white/5 px-3 py-2.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
                  <p className="text-[11px] leading-4 text-[#e4e4e7]">
                    187 packages. 📦 That’s literally a delivery every 48 hours. Your local Amazon
                    driver knows your dog&apos;s name at this point.
                  </p>
                </div>
              </motion.div>

              <motion.div variants={bubble} className="flex justify-start">
                <div className="relative max-w-full overflow-hidden rounded-full p-[1px] shadow-[0_0_15px_rgba(124,58,237,0.3)]">
                  <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-[#7C3AED] via-[#C084FC] to-[#7C3AED]" />
                  <div className="relative flex items-center gap-1.5 rounded-full bg-[#09090B] px-2.5 py-1.5">
                    <Sparkles className="h-3 w-3 shrink-0 text-[#C084FC]" strokeWidth={2} />
                    <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[#f8fafc]">
                      ✦ Top 1% Amazonian Stamp
                    </p>
                    <span className="h-2.5 w-px shrink-0 bg-[#7C3AED]/50" />
                    <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[#C084FC]">
                      Verified Data
                    </p>
                    <span className="absolute right-3 top-0.5 text-[7px] text-[#C084FC]">✦</span>
                    <span className="absolute bottom-0.5 left-8 text-[6px] text-[#DDD6FE]">✦</span>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={bubble} className="mt-1 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full border border-[#7C3AED]/40 bg-white/5 px-2.5 py-1.5 text-[9px] font-medium text-[#f8fafc] backdrop-blur-md transition hover:border-[#7C3AED] hover:shadow-[0_0_12px_rgba(124,58,237,0.35)]"
                >
                  📊 Breakdown Spending
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full border border-[#7C3AED]/40 bg-white/5 px-2.5 py-1.5 text-[9px] font-medium text-[#f8fafc] backdrop-blur-md transition hover:border-[#7C3AED] hover:shadow-[0_0_12px_rgba(124,58,237,0.35)]"
                >
                  🔒 View Security Proof
                </button>
              </motion.div>
            </motion.div>

            <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-white/20" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
