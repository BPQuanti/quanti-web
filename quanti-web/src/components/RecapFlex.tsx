"use client";

import { Flame, Moon, Share2 } from "lucide-react";

export default function RecapFlex() {
  return (
    <section className="mt-20 text-slate-50" aria-labelledby="recap-flex-heading">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">Shareable Recaps</p>
        <h2 id="recap-flex-heading" className="mt-3 text-3xl font-semibold tracking-tight">
          Weekly recaps worth posting
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
          Quanti turns verified weeklies into flex cards—not screenshots of spreadsheets. Share momentum. Own the
          correlation.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="relative overflow-hidden rounded-3xl border border-indigo-400/25 bg-slate-950 p-6 shadow-[0_0_40px_rgba(99,102,241,0.14)]">
          <div className="pointer-events-none absolute -right-8 top-0 h-32 w-32 rounded-full bg-indigo-500/20 blur-3xl" />
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-300">
            <Flame className="h-3.5 w-3.5" />
            Quanti Wrapped
          </p>
          <h3 className="mt-4 text-2xl font-semibold">Weekly Momentum Flex</h3>
          <p className="mt-2 text-sm text-slate-400">7-day engine recap · Plaid + HealthKit verified</p>
          <div className="mt-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-5xl font-bold tracking-tight text-emerald-300">91</p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">Momentum Score</p>
            </div>
            <div className="text-right text-sm text-slate-300">
              <p>6/7 directives completed</p>
              <p className="mt-1 text-slate-500">Sleep avg 7h 12m</p>
            </div>
          </div>
          <p className="mt-6 flex items-center gap-2 text-xs text-slate-400">
            <Share2 className="h-3.5 w-3.5" />
            Share to Stories · Download card
          </p>
        </article>

        <article className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-slate-950 p-6 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
          <div className="pointer-events-none absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-emerald-500/15 blur-3xl" />
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
            <Moon className="h-3.5 w-3.5" />
            Correlation Insight
          </p>
          <h3 className="mt-4 text-2xl font-semibold">Sleep vs. spend</h3>
          <p className="mt-4 text-lg leading-8 text-slate-200">
            Spent <span className="font-semibold text-emerald-300">80% less on coffee</span> on days with 7+ hours of
            sleep.
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            Verified across Apple HealthKit rest windows and Plaid café transactions. That's the GPS, not a chart dump.
          </p>
        </article>
      </div>
    </section>
  );
}
