"use client";

import { motion } from "framer-motion";
import { Activity, Fingerprint, Landmark, ShieldCheck } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

const pillars = [
  {
    title: "Bank-Level 256-bit Encryption",
    body: "Financial streams are protected with AES-256 at rest and in transit. Credentials never sit on Quanti servers.",
    icon: ShieldCheck,
  },
  {
    title: "Powered by Plaid",
    body: "Read-only connections to 12,000+ institutions. Quanti never sees or stores your bank login.",
    icon: Landmark,
  },
  {
    title: "Apple HealthKit",
    body: "Health metrics stay on-device first. We don't sell, broker, or ship biometric data to advertisers.",
    icon: Activity,
  },
  {
    title: "Read-Only Biometric Access",
    body: "HealthKit and bank links are ingest-only. Quanti can read signals to generate a directive—it cannot move money or change health records.",
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
          Bank-grade rails. Read-only by design.
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
        256-bit encryption • Verified Plaid • HealthKit on-device • Zero data selling
      </motion.p>
    </motion.section>
  );
}
