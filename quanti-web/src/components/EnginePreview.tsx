"use client";

import { useState } from "react";
import { ArrowDown, ArrowRight, Compass, Link2, Pause } from "lucide-react";
import IPhoneFocusFrame, { ARC_OPTIONS, type FocusArcId } from "@/components/IPhoneFocusFrame";

const STEPS = [
  {
    number: "01",
    title: "Sync",
    body: "Read-only signals, on-device.",
    icon: Link2,
  },
  {
    number: "02",
    title: "Name your arc",
    body: "The season you're in right now.",
    icon: Compass,
  },
  {
    number: "03",
    title: "Daily directive",
    body: "One 1% rule + skippable speed bumps.",
    icon: Pause,
  },
];

export default function EnginePreview() {
  const [arc, setArc] = useState<FocusArcId>("founder-sprint");

  return (
    <section
      className="relative mt-16 overflow-hidden rounded-[28px] border border-slate-800/80 bg-[#0D0D0D] px-4 py-10 text-slate-50 sm:px-8 sm:py-14"
      aria-labelledby="engine-preview-heading"
    >
      <div className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="relative mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">The Mirror Card</p>
          <h2 id="engine-preview-heading" className="mt-3 text-3xl font-semibold tracking-tight">
            Low sleep. Heavy calendar. One gentle rule.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
            A tired voice note plus the day you actually lived—turned into one energy defense, so you stay in the
            driver&apos;s seat.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Example seasons">
            {ARC_OPTIONS.map((option) => {
              const active = option.id === arc;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setArc(option.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    active
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
        </div>

        <div className="mt-10 flex justify-center">
          <IPhoneFocusFrame arc={arc} onArcChange={setArc} />
        </div>

        <div className="mt-10 grid grid-cols-1 items-stretch gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)]">
          {STEPS.flatMap((step, index) => {
            const Icon = step.icon;
            const card = (
              <article key={step.title} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-indigo-400/25 bg-indigo-400/10">
                    <Icon className="h-4 w-4 text-indigo-300" strokeWidth={1.75} />
                  </span>
                  <span className="font-mono text-[11px] tracking-widest text-slate-500">{step.number}</span>
                </div>
                <h3 className="mt-3 text-base font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-400">{step.body}</p>
              </article>
            );
            if (index === STEPS.length - 1) {
              return [card];
            }
            return [
              card,
              <div key={`${step.title}-arrow`} className="flex items-center justify-center py-1" aria-hidden>
                <ArrowDown className="h-5 w-5 text-indigo-400/70 lg:hidden" />
                <ArrowRight className="hidden h-5 w-5 text-indigo-400/70 lg:block" />
              </div>,
            ];
          })}
        </div>
      </div>
    </section>
  );
}
