"use client";

import { ArrowDown, Mic, Activity, Sparkles, Compass } from "lucide-react";

const PASSIVE = [
  { icon: Compass, label: "One Active Destination (the plot)" },
  { icon: Activity, label: "Optional HealthKit: sleep & HRV size today’s window" },
  { icon: Mic, label: "Skippable 10–15s voice: fill the one blank sensors cannot see" },
];

export default function EngineVisual() {
  return (
    <section
      className="relative mt-16 overflow-hidden rounded-[28px] border border-slate-800/80 bg-[#0D0D0D] px-4 py-12 text-slate-50 sm:px-8 sm:py-14"
      aria-labelledby="engine-visual-heading"
    >
      <div className="pointer-events-none absolute -right-10 top-8 h-64 w-64 rounded-full bg-violet-600/15 blur-3xl" />
      <div className="relative mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">Under 30 seconds a day</p>
          <h2 id="engine-visual-heading" className="mt-3 text-3xl font-semibold tracking-tight">
            Destination + skippable voice + optional HealthKit = one card.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Name one Active Destination. A 10–15s voice check-in is skippable if last night already sized today.
            Evening mark: Executed / Partial / Shifted. Achieved archives it.
          </p>
          <p className="mx-auto mt-4 max-w-2xl rounded-2xl border border-indigo-400/20 bg-indigo-500/10 px-4 py-3 text-sm leading-6 text-slate-300">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-300">
              Private TestFlight is live
            </span>
            HealthKit is optional. Sleep and HRV only size how hard today can go. The card is still one 15–20 word 1%.
          </p>
        </div>

        <div className="mt-10 grid gap-3 lg:grid-cols-3">
          <article className="rounded-2xl border border-sky-400/25 bg-slate-950/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-300">Input A · What Quanti uses</p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight">The compass stack</h3>
            <ul className="mt-4 space-y-3">
              {PASSIVE.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label} className="flex items-center gap-3 text-sm leading-6 text-slate-300">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-400/25 bg-sky-400/10 text-sky-300">
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    {item.label}
                  </li>
                );
              })}
            </ul>
          </article>

          <article className="rounded-2xl border border-rose-400/25 bg-slate-950/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-200">Input B · One blank</p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight">
              <span aria-hidden>🎙️</span> Skippable voice check
            </h3>
            <div className="mt-4 flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-rose-400/30 bg-rose-400/10 text-rose-200">
                <Mic className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <p className="text-sm leading-6 text-slate-300">
                Answers the one fact sensors cannot see: what’s in the way, the next artifact, or who has to move.
              </p>
            </div>
            <p className="mt-4 rounded-full border border-rose-300/25 bg-rose-400/10 px-3 py-2 text-xs font-medium leading-5 text-rose-100">
              Quiet morning? Skip it. Last night’s mark can already size today.
            </p>
          </article>

          <article className="rounded-2xl border border-indigo-400/25 bg-slate-950/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-300">Input C · One first</p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight">One Active Destination</h3>
            <p className="mt-4 rounded-2xl border border-indigo-400/30 bg-indigo-500/10 px-4 py-3 text-sm leading-6 text-indigo-50">
              Close the enterprise pilot. Queue stays inert until you Swap. Achieved archives it.
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Vague goals make vague cards. Named targets make named moves. Secondary goals stay parked.
            </p>
          </article>
        </div>

        <div className="mt-4 flex justify-center" aria-hidden>
          <ArrowDown className="h-6 w-6 text-indigo-400/80" strokeWidth={1.75} />
        </div>

        <article className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-6 text-center sm:p-8">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
            <Sparkles className="h-4 w-4" strokeWidth={1.75} />
            Output · Daily directive
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-50">One 15–20 word physical 1%</h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-emerald-50/90 sm:text-base">
            Draft two custom security answers for the enterprise pilot. Stop after that one artifact.
          </p>
        </article>
      </div>
    </section>
  );
}
