"use client";

import { motion } from "framer-motion";
import { Activity, Fingerprint, Mic, Lock } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

const pillars = [
  {
    title: "On-Device Tokenization",
    body: "Optional HealthKit summaries stay on-device first. Quanti works from recovery size and a 10-second voice check-in—not a surveillance feed.",
    icon: Lock,
  },
  {
    title: "Edge voice, zero retention",
    body: "The 10-second voice check-in is transcribed in-memory at the encrypted edge. Audio is not kept and is not used to train models.",
    icon: Mic,
  },
  {
    title: "Apple HealthKit",
    body: "Health metrics stay on-device first. Biometrics are never sold, brokered, or used for advertising.",
    icon: Activity,
  },
  {
    title: "Read-Only by Design",
    body: "HealthKit is optional and read-only. It sizes the window for a 15-word action card. It cannot change health records or become an ad graph.",
    icon: Fingerprint,
  },
];

export default function TrustSecurity() {
  return (
    <motion.section
      aria-labelledby="trust-security-heading"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ staggerChildren: 0.12 }}
      className="mt-16 text-slate-50"
    >
      <motion.div variants={fadeUp} className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">Trust & Security</p>
        <h2 id="trust-security-heading" className="mt-3 text-3xl font-semibold tracking-tight">
          Tokenized on-device. Read-only. Never sold.
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {pillars.map((pillar) => (
          <motion.article
            key={pillar.title}
            variants={fadeUp}
            className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-left shadow-[0_0_20px_rgba(99,102,241,0.08)] backdrop-blur-md"
          >
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-indigo-400/25 bg-indigo-400/10">
              <pillar.icon className="h-5 w-5 text-indigo-300" strokeWidth={1.75} />
            </div>
            <h3 className="text-lg font-semibold tracking-tight">{pillar.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">{pillar.body}</p>
          </motion.article>
        ))}
      </div>

      <motion.p
        variants={fadeUp}
        className="mx-auto mt-8 w-fit max-w-full rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-center text-[11px] font-medium tracking-wide text-slate-400"
      >
        On-device HealthKit summaries • Edge voice, zero retention • Never sold for ads
      </motion.p>
    </motion.section>
  );
}
