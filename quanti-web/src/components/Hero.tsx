"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import IPhoneFocusFrame, { ARC_OPTIONS, type FocusArcId } from "@/components/IPhoneFocusFrame";
import TraceSignalCard from "@/components/TraceSignalCard";
import WaitlistCapture from "@/components/WaitlistCapture";

export default function Hero() {
  const [arc, setArc] = useState<FocusArcId>("deep-work");

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-slate-800/80 bg-[#0D0D0D] px-4 py-10 text-slate-50 sm:px-8 sm:py-14">
      <div className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-indigo-600/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.9fr)]">
        <div className="text-left">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-5xl sm:leading-[1.08] lg:text-[3.15rem]">
            An automated behavioral GPS for whatever arc you&apos;re in.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
            Find out exactly which late-night habit is destroying your morning focus. Quanti passively correlates your
            HealthKit, Screen Time, and Plaid signals into a single daily action. Zero manual logging.
          </p>
          <div id="waitlist" className="mt-8 w-full max-w-xl scroll-mt-24">
            <div className="mb-3 flex flex-wrap gap-2" role="tablist" aria-label="Arc selector">
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
            <WaitlistCapture emailFieldId="hero-waitlist-email" submitLabel="Request Early Access" />
            <p className="mt-3 flex items-start gap-2 text-sm font-semibold leading-6 text-emerald-100">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" strokeWidth={2} />
              <span>
                <span aria-hidden>🔒 </span>
                100% On-Device Processing. We never store, transmit, or sell your raw health or bank data.
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <IPhoneFocusFrame arc={arc} onArcChange={setArc} />
          <TraceSignalCard />
        </div>
      </div>
    </section>
  );
}
