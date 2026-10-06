"use client";

import { motion } from "framer-motion";
import { Activity, Landmark, ShieldCheck } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

const pillars = [
  {
    title: "Bank-Grade Encryption",
    body: "Your financial data is protected with end-to-end 256-bit AES encryption at rest and in transit. Your security is uncompromised.",
    icon: ShieldCheck,
  },
  {
    title: "Powered by Plaid",
    body: "We connect seamlessly to over 12,000 financial institutions. Quanti never sees, stores, or touches your login credentials.",
    icon: Landmark,
  },
  {
    title: "On-Device Health Privacy",
    body: "Apple HealthKit metrics are processed strictly locally on your iPhone. We never sell, monetize, or transmit health data to third parties.",
    icon: Activity,
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
      className="mt-24"
    >
      <motion.div variants={fadeUp} className="mb-8 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-violet-400">
          Trust & Security
        </p>
        <h2
          id="trust-security-heading"
          className="mt-3 text-3xl font-semibold tracking-tight text-[#FAFAFA]"
        >
          Built to protect what you verify.
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {pillars.map((pillar) => (
          <motion.article
            key={pillar.title}
            variants={fadeUp}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-left shadow-[0_0_15px_rgba(124,58,237,0.15)] backdrop-blur-md"
          >
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-violet-400/25 bg-violet-400/10 shadow-[0_0_15px_rgba(124,58,237,0.15)]">
              <pillar.icon className="h-5 w-5 text-violet-400" strokeWidth={1.75} />
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-[#FAFAFA]">{pillar.title}</h3>
            <p className="mt-3 text-sm leading-6 text-[#A1A1AA]">{pillar.body}</p>
          </motion.article>
        ))}
      </div>

      <motion.p
        variants={fadeUp}
        className="mx-auto mt-8 w-fit max-w-full rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-center text-[11px] font-medium tracking-wide text-[#A1A1AA] shadow-[0_0_15px_rgba(124,58,237,0.15)] backdrop-blur-md"
      >
        Protected by 256-bit SSL • Verified Plaid Integration • Zero Data Selling
      </motion.p>
    </motion.section>
  );
}
