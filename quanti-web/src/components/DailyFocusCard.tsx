"use client";

import { Compass, Sparkles } from "lucide-react";

const DIRECTIVE = "5.2 hrs sleep detected → Protect budget from impulse delivery spending today.";

function LockScreenWidget() {
  return (
    <div className="relative mx-auto w-[248px] sm:w-[268px]" aria-hidden>
      <div className="pointer-events-none absolute -inset-8 rounded-[3rem] bg-indigo-500/20 blur-3xl" />
      <div className="relative rounded-[2.5rem] border border-slate-700 bg-slate-950 p-2 shadow-[0_0_50px_rgba(99,102,241,0.22)]">
        <div className="relative overflow-hidden rounded-[2.1rem] bg-gradient-to-b from-indigo-950 via-slate-950 to-slate-950 px-3 pb-3 pt-7">
          <div className="absolute left-1/2 top-2 h-[18px] w-[72px] -translate-x-1/2 rounded-full bg-black" />

          <p className="mt-5 text-center text-[11px] font-medium tracking-wide text-slate-300">Thursday, October 10</p>
          <p className="text-center text-[44px] font-semibold leading-none tracking-tight text-slate-50">9:41</p>

          <div className="mt-6 rounded-[22px] border border-white/10 bg-slate-900/75 p-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-indigo-300">Quanti · Focus</p>
              <p className="text-[9px] font-semibold text-emerald-300">1,240</p>
            </div>
            <p className="mt-2 text-[13px] font-semibold leading-snug text-slate-50">Protect the budget today</p>
            <p className="mt-1.5 text-[10px] leading-4 text-slate-400">
              5.2h sleep · skip impulse delivery orders
            </p>
            <div className="mt-2.5 flex items-center justify-between">
              <p className="text-[9px] text-slate-500">14-day streak · +24 tomorrow</p>
              <span className="rounded-full bg-indigo-500 px-2 py-0.5 text-[8px] font-semibold text-white">Do this</span>
            </div>
          </div>

          <div className="mx-auto mt-8 h-1 w-24 rounded-full bg-white/25" />
        </div>
      </div>
    </div>
  );
}

export default function DailyFocusCard() {
  return (
    <section className="mt-16 text-slate-50" aria-labelledby="daily-focus-heading">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">Live Engine Preview</p>
        <h2 id="daily-focus-heading" className="mt-3 text-3xl font-semibold tracking-tight">
          One card. One move. On your Lock Screen.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
          Sleep, Screen Time, and spend become one morning directive—delivered as an iPhone widget, not another dashboard.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_auto]">
        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/25 bg-slate-900/80 p-6 shadow-[0_0_48px_rgba(99,102,241,0.16)]">
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-300">
                <Sparkles className="h-3.5 w-3.5" />
                Daily Focus Card
              </p>
              <h3 className="mt-3 text-lg font-semibold tracking-tight">Today&apos;s priority</h3>
              <p className="mt-3 max-w-xl text-base leading-7 text-slate-100">{DIRECTIVE}</p>
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                <Compass className="h-3.5 w-3.5 text-indigo-400" />
                Cross-domain: sleep · spending · late-night orders
              </p>
            </div>
            <div className="shrink-0 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">Momentum</p>
              <p className="mt-0.5 text-2xl font-bold tabular-nums text-emerald-200">1,240</p>
              <p className="mt-1 text-[10px] leading-4 text-emerald-100/80">uncapped</p>
            </div>
          </div>
          <p className="mt-5 text-xs leading-5 text-slate-500">
            Streak 14 · next day +24. Completing the directive compounds your score with no ceiling—misses decay it,
            the way real momentum works.
          </p>
        </div>

        <div className="flex flex-col items-center">
          <LockScreenWidget />
          <p className="mt-4 max-w-[240px] text-center text-xs leading-5 text-slate-500">
            The same Focus Directive, as a Lock Screen widget—one tap, before you open another app.
          </p>
        </div>
      </div>
    </section>
  );
}
