"use client";

import { useState } from "react";
import WaitlistCapture from "@/components/WaitlistCapture";

const SEASONS = [
  {
    id: "founder-sprint",
    glyph: "⚡",
    label: "Founder Sprint",
    detail: "Prioritizes deep work & burn defense",
  },
  {
    id: "recovery-reset",
    glyph: "🛡️",
    label: "Recovery & Reset",
    detail: "Prioritizes sleep & stress speed bumps",
  },
  {
    id: "capital-discipline",
    glyph: "💰",
    label: "Capital Discipline",
    detail: "Prioritizes impulse spend defense",
  },
  {
    id: "custom-arc",
    glyph: "✨",
    label: "Your Custom Arc",
    detail: "Defined by you",
  },
] as const;

type SeasonId = (typeof SEASONS)[number]["id"];

export default function Hero() {
  const [season, setSeason] = useState<SeasonId>("founder-sprint");
  const active = SEASONS.find((item) => item.id === season) ?? SEASONS[0];

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-slate-800/80 bg-[#0D0D0D] px-4 py-10 text-slate-50 sm:px-8 sm:py-14">
      <div className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-indigo-600/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />

      <div className="relative mx-auto max-w-3xl text-left sm:text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-5xl sm:leading-[1.08] lg:text-[2.85rem] xl:text-[3.15rem]">
          The behavioral engine for whatever season you&apos;re in.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
          Quanti combines your biometrics, calendar, spending, and 15-second voice checks to understand your real
          capacity—delivering one tailored daily directive for the goals you set.
        </p>

        <div className="mt-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Select your season:</p>
          <div
            className="mt-3 flex flex-wrap justify-start gap-2 sm:justify-center"
            role="tablist"
            aria-label="Select your season"
          >
            {SEASONS.map((option) => {
              const selected = option.id === season;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setSeason(option.id)}
                  className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-left text-xs font-semibold transition ${
                    selected
                      ? "border-indigo-300/50 bg-indigo-500/20 text-indigo-100 shadow-[0_0_18px_rgba(99,102,241,0.28)]"
                      : "border-slate-700 bg-slate-900/80 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  <span aria-hidden>{option.glyph}</span>
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-sm leading-6 text-indigo-100/90">
            {active.glyph} {active.detail}
          </p>
        </div>

        <blockquote className="mx-auto mt-6 max-w-2xl rounded-2xl border border-indigo-400/25 bg-indigo-500/10 px-4 py-3 text-sm font-medium italic leading-6 text-indigo-50 sm:text-base">
          Cold telemetry tells us what happened. Your voice tells us how you feel. Your Arc tells us where you&apos;re
          going.
        </blockquote>

        <div id="waitlist" className="mx-auto mt-8 w-full max-w-xl scroll-mt-24 text-left">
          <WaitlistCapture emailFieldId="hero-waitlist-email" submitLabel="Claim Early Access" />
          <p className="mt-3 text-center text-sm font-semibold leading-6 text-emerald-100">
            🔒 On-Device Privacy • Read-Only Sync • Zero Data Sales
          </p>
        </div>
      </div>
    </section>
  );
}
