"use client";

import { useState } from "react";
import WaitlistCapture from "@/components/WaitlistCapture";

const SEASONS = [
  { id: "founder-sprint", glyph: "⚡", label: "Founder Sprint" },
  { id: "recovery-reset", glyph: "🛡️", label: "Recovery & Reset" },
  { id: "capital-discipline", glyph: "💰", label: "Capital Discipline" },
  { id: "custom-arc", glyph: "✨", label: "Custom Arc" },
] as const;

type SeasonId = (typeof SEASONS)[number]["id"];

export default function Hero() {
  const [season, setSeason] = useState<SeasonId>("founder-sprint");

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-slate-800/80 bg-[#0D0D0D] px-4 py-10 text-slate-50 sm:px-8 sm:py-14">
      <div className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-indigo-600/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />

      <div className="relative mx-auto max-w-3xl text-left sm:text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-5xl sm:leading-[1.08] lg:text-[2.85rem] xl:text-[3.15rem]">
          Finally, an app that actually gets you.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg font-medium leading-7 text-slate-100">
          Quanti turns your daily noise into one clear rule each morning. It pairs your passive biometrics, calendar, and
          spending with a quick 15-second voice check that captures how you actually feel.
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-400">
          Built for whatever season you&apos;re in. Select your focus—from high-output sprints to recovery resets—and
          Quanti adapts its guidance to keep you grounded, present, and in control.
        </p>

        <div
          className="mt-6 flex flex-wrap justify-start gap-2 sm:justify-center"
          role="tablist"
          aria-label="Example seasons"
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
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  selected
                    ? "border-indigo-300/50 bg-indigo-500/20 text-indigo-100 shadow-[0_0_18px_rgba(99,102,241,0.28)]"
                    : "border-slate-700 bg-slate-900/80 text-slate-300 hover:border-slate-500"
                }`}
              >
                <span aria-hidden>{option.glyph}</span>
                {option.label}
              </button>
            );
          })}
        </div>

        <div id="waitlist" className="mx-auto mt-8 w-full max-w-xl scroll-mt-24 text-left">
          <WaitlistCapture emailFieldId="hero-waitlist-email" submitLabel="Claim Early Access" />
          <p className="mt-3 text-center text-sm font-semibold leading-6 text-emerald-100">
            🔒 On-Device Processing • Read-Only Integrations • Zero Data Sales
          </p>
        </div>
      </div>
    </section>
  );
}
