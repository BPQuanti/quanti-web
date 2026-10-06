"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Activity, Landmark, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

type Preview = {
  prompt: string;
  cards: {
    kind: "plaid" | "health" | "ai";
    header: string;
    stat: string;
    subtext: string;
  }[];
  answer: string;
  badge: string;
};

const previews: Preview[] = [
  {
    prompt: "How many Amazon packages did I order this year?",
    cards: [
      {
        kind: "plaid",
        header: "Plaid Financial Stream",
        stat: "148 Purchases",
        subtext: "$4,820.50 Total • Avg: 12.3 orders/mo",
      },
      {
        kind: "health",
        header: "HealthKit Activity Sync",
        stat: "0.2 Miles Walked",
        subtext: "Doorstep to couch • 92% late-night delivery orders",
      },
    ],
    answer:
      "You opened 148 Amazon packages this year ($4,820 total). That's roughly 1 package every 2.4 days! On weeks you reported high work stress, your package velocity spiked by 65%.",
    badge: "Top 1% Amazonian",
  },
  {
    prompt: "How many steps did I take this year / workouts logged?",
    cards: [
      {
        kind: "health",
        header: "HealthKit Activity Sync",
        stat: "2,840,000 Steps",
        subtext: "214 Workouts Logged • Avg 7,780 steps/day",
      },
      {
        kind: "plaid",
        header: "Plaid Financial Stream",
        stat: "$1,680 Invested",
        subtext: "Gym membership, running shoes & supplements",
      },
    ],
    answer:
      "You logged 2.84 Million steps and 214 workouts this year! That's equivalent to walking from Phoenix to Tucson over 11 TIMES (or 1,290+ miles). Every $1 spent on wellness yielded 1,690 active steps.",
    badge: "Desert Marathoner",
  },
  {
    prompt: "How many times did I DoorDash this year?",
    cards: [
      {
        kind: "plaid",
        header: "Plaid Financial Stream",
        stat: "186 Deliveries",
        subtext: "$5,210.00 Total • Includes $940 in delivery fees",
      },
      {
        kind: "health",
        header: "HealthKit Activity Sync",
        stat: "Sleep: 5h 45m Avg",
        subtext: "74% of orders placed post-10 PM on low-sleep days",
      },
    ],
    answer:
      "You DoorDashed 186 times this year, spending $5,210 ($940 was just service fees and tips!). You could have bought round-trip flights to Paris twice with those delivery fees alone. You're officially keeping your local drivers employed!",
    badge: "VIP Delivery Sponsor",
  },
];

const cardEnter = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

function StreamIcon({ kind }: { kind: "plaid" | "health" | "ai" }) {
  const Icon = kind === "plaid" ? Landmark : kind === "health" ? Activity : Sparkles;
  return <Icon className="h-4 w-4 text-violet-400" strokeWidth={1.75} />;
}

function VerifiedBadge({ label }: { label: string }) {
  return (
    <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#7C3AED]/50 bg-gradient-to-b from-[#2a1650] to-[#09090B] px-3 py-1.5 shadow-[0_0_18px_rgba(124,58,237,0.45),inset_0_1px_0_rgba(255,255,255,0.12)]">
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-zinc-300/90 text-[#09090B] shadow-[0_0_8px_rgba(255,255,255,0.35)]">
        <ShieldCheck className="h-3 w-3" strokeWidth={2.5} />
      </span>
      <span className="text-[11px] font-semibold tracking-wide text-violet-300 [text-shadow:0_0_12px_rgba(167,139,250,0.85)]">
        {label}
      </span>
    </div>
  );
}

export default function InteractivePreview() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loading) {
      return;
    }
    const timer = window.setTimeout(() => setLoading(false), 600);
    return () => window.clearTimeout(timer);
  }, [loading, activeIndex]);

  function selectPrompt(index: number) {
    setActiveIndex(index);
    setLoading(true);
  }

  const preview = activeIndex !== null ? previews[activeIndex] : null;

  return (
    <section
      aria-labelledby="behind-the-ai-heading"
      className="mt-24 rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-6 shadow-[0_0_30px_rgba(124,58,237,0.12)] backdrop-blur-md md:p-8"
    >
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-violet-400">Behind the AI</p>
        <h2 id="behind-the-ai-heading" className="mt-3 text-3xl font-semibold tracking-tight text-[#FAFAFA]">
          Ask Quanti AI Anything About Your Year
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#A1A1AA] sm:text-base">
          Select a question below to see how Quanti synthesizes Plaid bank streams &amp; Apple HealthKit metrics in
          real time.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {previews.map((item, index) => {
          const selected = activeIndex === index && !loading;
          return (
            <button
              key={item.prompt}
              type="button"
              aria-pressed={activeIndex === index}
              onClick={() => selectPrompt(index)}
              className={`max-w-full rounded-full border px-4 py-2 text-left text-sm leading-5 transition ${
                selected
                  ? "border-[#7C3AED] bg-[#7C3AED] text-white shadow-[0_0_30px_rgba(124,58,237,0.2)]"
                  : "border-zinc-800 bg-zinc-900/80 text-[#A1A1AA] hover:border-[#7C3AED]/60 hover:text-[#FAFAFA]"
              }`}
            >
              {item.prompt}
            </button>
          );
        })}
      </div>

      <div className="mt-8 min-h-[12rem]" aria-live="polite">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950/50 px-6 py-12 text-center"
            >
              <span className="flex gap-1.5">
                {[0, 1, 2].map((dot) => (
                  <motion.span
                    key={dot}
                    className="h-1.5 w-1.5 rounded-full bg-violet-400"
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                    transition={{ duration: 0.7, repeat: Infinity, delay: dot * 0.12 }}
                  />
                ))}
              </span>
              <p className="mt-4 text-sm text-[#A1A1AA]">
                Quanti AI is processing 12 months of Plaid &amp; HealthKit streams...
              </p>
            </motion.div>
          ) : preview ? (
            <motion.div
              key={preview.prompt}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -8 }}
              transition={{ staggerChildren: 0.1 }}
              className="flex flex-col gap-4 lg:flex-row"
            >
              {preview.cards.map((card) => (
                <motion.article
                  key={card.header}
                  variants={cardEnter}
                  className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5 backdrop-blur-md"
                >
                  <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-violet-400">
                    <StreamIcon kind={card.kind} />
                    {card.header}
                  </p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight text-[#FAFAFA] sm:text-3xl">{card.stat}</p>
                  <p className="mt-2 text-sm leading-6 text-[#A1A1AA]">{card.subtext}</p>
                </motion.article>
              ))}
              <motion.article
                variants={cardEnter}
                className="flex-1 rounded-2xl border border-[#7C3AED]/50 bg-[#7C3AED]/10 p-5 shadow-[0_0_30px_rgba(124,58,237,0.2)] backdrop-blur-md"
              >
                <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-violet-400">
                  <StreamIcon kind="ai" />
                  Quanti AI Synthesis
                </p>
                <p className="mt-3 text-sm leading-6 text-[#FAFAFA]">{preview.answer}</p>
                <VerifiedBadge label={preview.badge} />
              </motion.article>
            </motion.div>
          ) : (
            <motion.p
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-dashed border-zinc-800 px-6 py-10 text-center text-sm text-[#A1A1AA]"
            >
              Choose a question to generate a live synthesis.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
