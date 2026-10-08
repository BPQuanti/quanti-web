"use client";

import { Compass, Sparkles } from "lucide-react";

export default function DailyFocusCard() {
  return (
    <section className="mt-16 text-slate-50" aria-labelledby="daily-focus-heading">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">Live Engine Preview</p>
        <h2 id="daily-focus-heading" className="mt-3 text-3xl font-semibold tracking-tight">
          One card. One move.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
          Quanti correlates sleep, spend, and habits into a single morning directive—not another dashboard.
        </p>
      </div>

      <div className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-indigo-500/25 bg-slate-900/80 p-6 shadow-[0_0_48px_rgba(99,102,241,0.16)]">
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              Daily Focus Card
            </p>
            <h3 className="mt-3 text-lg font-semibold tracking-tight">Today's priority</h3>
            <p className="mt-3 max-w-xl text-base leading-7 text-slate-100">
              5.2 hrs sleep detected → Protect budget from impulse delivery spending today.
            </p>
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-400">
              <Compass className="h-3.5 w-3.5 text-indigo-400" />
              Cross-domain: sleep · spending · late-night orders
            </p>
          </div>
          <div className="shrink-0 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">Momentum</p>
            <p className="mt-0.5 text-2xl font-bold text-emerald-200">88/100</p>
          </div>
        </div>
      </div>
    </section>
  );
}
