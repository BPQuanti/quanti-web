"use client";

import { useId, useState } from "react";
import { Search } from "lucide-react";

export default function TraceSignalCard() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <article className="w-full rounded-2xl border border-indigo-400/25 bg-slate-900/80 p-5 shadow-[0_0_40px_rgba(99,102,241,0.16)] backdrop-blur-md">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-300">
        Daily Focus Card // Oct 12 • Active Arc: Deep Work
      </p>
      <p className="mt-4 text-base font-semibold leading-7 text-slate-50 sm:text-lg">
        Shift last caloric intake 45 mins earlier → Reclaim 15ms HRV | Cap caffeine at 11:30 AM
      </p>

      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-300/50 bg-indigo-500/20 px-4 py-3 text-sm font-semibold text-indigo-100 shadow-[0_0_28px_rgba(99,102,241,0.35)] transition hover:bg-indigo-500/30 hover:shadow-[0_0_36px_rgba(99,102,241,0.5)] active:scale-[0.99]"
      >
        <Search className="h-4 w-4" strokeWidth={2} />
        Trace Signal — Click to reveal pattern
      </button>

      <div
        id={panelId}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className={`overflow-hidden ${open ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}>
          <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950/80 p-4 text-left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-300">
              📊 Trace Signal Data
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
              <li>Plaid Signal: Late delivery ($45.80 at 10:15 PM)</li>
              <li>HealthKit Response: Delayed core cooling by 2.1 hrs</li>
              <li>Deep Sleep Impact: −35% reduction</li>
            </ul>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-200">🎯 Arc Impact</p>
            <p className="mt-1.5 text-sm leading-6 text-slate-300">
              Protecting tomorrow&apos;s 9:00 AM flow state window by preventing circadian drift tonight.
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
