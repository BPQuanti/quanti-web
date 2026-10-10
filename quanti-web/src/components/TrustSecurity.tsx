"use client";

import { motion } from "framer-motion";
import { Activity, Fingerprint, Landmark, Lock } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

const pillars = [
  {
    title: "On-Device Tokenization",
    body: "Sensitive telemetry is tokenized on-device. Raw Screen Time, health samples, and bank credentials stay local—Quanti works from summaries, not a surveillance feed.",
    icon: Lock,
  },
  {
    title: "Read-Only Financial Access",
    body: "Plaid links are ingest-only across 12,000+ institutions. Quanti never stores your bank login, never moves money, and never sells financial data for ads.",
    icon: Landmark,
  },
  {
    title: "Apple HealthKit",
    body: "Health metrics stay on-device first. Biometrics are never sold, brokered, or used for advertising.",
    icon: Activity,
  },
  {
    title: "Read-Only by Design",
    body: "HealthKit and bank links generate a directive. They cannot change health records, post on your behalf, or become an ad graph.",
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
        On-device tokenization • Read-only Plaid & HealthKit • Never sold for ads
      </motion.p>
    </motion.section>
  );
}
