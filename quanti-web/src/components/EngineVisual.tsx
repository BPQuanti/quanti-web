"use client";

import { useState } from "react";
import { ArrowDown, Calendar, CreditCard, Mic, Activity, Smartphone, Sparkles } from "lucide-react";

const ARCS = [
  { id: "founder-sprint", glyph: "⚡", label: "Founder Sprint" },
  { id: "recovery-reset", glyph: "🛡️", label: "Recovery & Reset" },
  { id: "capital-discipline", glyph: "💰", label: "Capital Discipline" },
] as const;

const PASSIVE = [
  { icon: Activity, label: "Wearables / HealthKit" },
  { icon: Calendar, label: "Calendar schedule" },
  { icon: CreditCard, label: "Plaid capital outflows" },
  { icon: Smartphone, label: "Screen Time" },
];

export default function EngineVisual() {
  const [arc, setArc] = useState<(typeof ARCS)[number]["id"]>("founder-sprint");
  const selected = ARCS.find((item) => item.id === arc) ?? ARCS[0];

  return (
    <section
      className="relative mt-16 overflow-hidden rounded-[28px] border border-slate-800/80 bg-[#0D0D0D] px-4 py-12 text-slate-50 sm:px-8 sm:py-14"
      aria-labelledby="engine-visual-heading"
    >
      <div className="pointer-events-none absolute -right-10 top-8 h-64 w-64 rounded-full bg-violet-600/15 blur-3xl" />
      <div className="relative mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">The Signal Engine</p>
          <h2 id="engine-visual-heading" className="mt-3 text-3xl font-semibold tracking-tight">
            Passive data + how you feel + your Arc = one rule.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
            Cold telemetry, a 15-second voice check, and the season you choose—synthesized into one 1% directive.
          </p>
        </div>

        <div className="mt-10 grid gap-3 lg:grid-cols-3">
          <article className="rounded-2xl border border-sky-400/25 bg-slate-950/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-300">Input A · Passive data</p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight">What happened</h3>
            <ul className="mt-4 space-y-3">
              {PASSIVE.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label} className="flex items-center gap-3 text-sm leading-6 text-slate-300">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-sky-400/25 bg-sky-400/10 text-sky-300">
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    {item.label}
                  </li>
                );
              })}
            </ul>
          </article>

          <article className="rounded-2xl border border-rose-400/25 bg-slate-950/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-200">Input B · Emotional context</p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight">How you feel</h3>
            <div className="mt-4 flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-rose-400/30 bg-rose-400/10 text-rose-200">
                <Mic className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <p className="text-sm leading-6 text-slate-300">
                15-second morning voice check. Mood, stress, and intent—no journaling, no manual logging.
              </p>
            </div>
          </article>

          <article className="rounded-2xl border border-indigo-400/25 bg-slate-950/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-300">Input C · Your Arc</p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight">Where you&apos;re going</h3>
            <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Life season">
              {ARCS.map((option) => {
                const selectedArc = option.id === arc;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="tab"
                    aria-selected={selectedArc}
                    onClick={() => setArc(option.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      selectedArc
                        ? "border-indigo-300/50 bg-indigo-500/20 text-indigo-100"
                        : "border-slate-700 bg-slate-900/80 text-slate-300 hover:border-slate-500"
                    }`}
                  >
                    <span aria-hidden>{option.glyph}</span>
                    {option.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              {selected.glyph} Selected focus: {selected.label}
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
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-50">A + B + C = one 1% rule</h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-emerald-50/90 sm:text-base">
            One actionable morning rule, plus smart speed bumps when fatigue hits—adapted to {selected.label}.
          </p>
        </article>
      </div>
    </section>
  );
}
