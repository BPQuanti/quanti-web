"use client";

import { useState } from "react";
import IPhoneFocusFrame, { ARC_OPTIONS, type FocusArcId } from "@/components/IPhoneFocusFrame";

export default function FocusDemoSection() {
  const [arc, setArc] = useState<FocusArcId>("deep-work");

  return (
    <section
      className="relative mt-16 overflow-hidden rounded-[28px] border border-slate-800/80 bg-[#0D0D0D] px-4 py-10 text-slate-50 sm:px-8 sm:py-14"
      aria-labelledby="focus-demo-heading"
    >
      <div className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-64 w-64 rounded-full bg-violet-600/15 blur-3xl" />

      <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">Live Engine Preview</p>
          <h2 id="focus-demo-heading" className="mt-3 text-3xl font-semibold tracking-tight">
            One daily directive. Switch the Arc. Watch the telemetry move.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
            Recovery, Deep Work, or Capital. The Daily Focus Card reorients HealthKit, Screen Time, and Plaid around the
            arc you&apos;re actually in.
          </p>
          <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Arc selector">
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
        <IPhoneFocusFrame arc={arc} onArcChange={setArc} />
      </div>
    </section>
  );
}
