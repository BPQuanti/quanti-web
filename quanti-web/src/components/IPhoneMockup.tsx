"use client";

import { motion } from "framer-motion";

const bars = [18, 32, 24, 44, 36, 52, 28];

export default function IPhoneMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="relative mx-auto w-[280px] sm:w-[300px]"
    >
      <div className="absolute -inset-8 rounded-[3rem] bg-[#8b5cf6]/20 blur-3xl" />
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative rounded-[2.6rem] border border-[#2d2442] bg-[#0b0712] p-2 shadow-[0_0_80px_rgba(139,92,246,0.28)]"
      >
        <div className="overflow-hidden rounded-[2.2rem] border border-[#8b5cf6]/25 bg-[#0b0712]">
          <div className="relative bg-[#0b0712] px-4 pb-5 pt-8">
            <div className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a78bfa]">For Me</p>
            <h3 className="mt-1 text-left text-lg font-semibold text-[#f8fafc]">Today</h3>
            <div className="mt-4 rounded-2xl border border-[#2d2442] bg-[#161124] p-3 text-left">
              <p className="text-[10px] uppercase tracking-wide text-[#94a3b8]">Net cash</p>
              <p className="mt-1 text-2xl font-semibold text-[#f8fafc]">$2,847</p>
              <div className="mt-4 flex h-16 items-end gap-1.5">
                {bars.map((height, index) => (
                  <motion.div
                    key={index}
                    initial={{ height: 8 }}
                    whileInView={{ height }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 * index, duration: 0.5 }}
                    className="flex-1 rounded-t bg-gradient-to-t from-[#7c3aed] to-[#a78bfa]"
                  />
                ))}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-[#2d2442] bg-[#161124] p-3 text-left">
                <p className="text-[10px] text-[#94a3b8]">Steps</p>
                <p className="mt-1 text-sm font-semibold text-[#f8fafc]">8,420</p>
                <p className="mt-1 text-[10px] text-[#a78bfa]">Top 12%</p>
              </div>
              <div className="rounded-2xl border border-[#2d2442] bg-[#161124] p-3 text-left">
                <p className="text-[10px] text-[#94a3b8]">Verified</p>
                <p className="mt-1 text-sm font-semibold text-[#f8fafc]">18 golf</p>
                <p className="mt-1 text-[10px] text-[#a78bfa]">Quanti AI</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
