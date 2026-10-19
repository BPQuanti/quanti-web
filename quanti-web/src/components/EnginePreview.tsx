"use client";

import { useState } from "react";
import { Activity, CreditCard, Mic, Shield, Smartphone } from "lucide-react";
import IPhoneFocusFrame, { ARC_OPTIONS, type FocusArcId } from "@/components/IPhoneFocusFrame";

const PILLARS = [
  {
    title: "Physical",
    body: "HealthKit / wearables: sleep efficiency and HRV.",
    icon: Activity,
  },
  {
    title: "Digital",
    body: "Screen Time APIs: pickups and doomscroll loops.",
    icon: Smartphone,
  },
  {
    title: "Capital",
    body: "Plaid read-only: outflow velocity and impulse categories.",
    icon: CreditCard,
  },
  {
    title: "Emotional",
    body: "15-second voice telemetry: the why behind the numbers.",
    icon: Mic,
  },
  {
    title: "Privacy",
    body: "On-device local processing. Zero data sales. Read-only integrations.",
    icon: Shield,
  },
] as const;

export default function EnginePreview() {
  const [arc, setArc] = useState<FocusArcId>("founder-sprint");

  return (
    <section
      className="relative mt-16 overflow-hidden rounded-[28px] border border-slate-800/80 bg-[#0D0D0D] px-4 py-10 text-slate-50 sm:px-8 sm:py-14"
      aria-labelledby="engine-preview-heading"
    >
      <div className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-64 w-64 rounded-full bg-violet-600/15 blur-3xl" />

      <div className="relative mx-auto max-w-5xl">
        <div className="text-center lg:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">Interactive Engine Preview</p>
          <h2 id="engine-preview-heading" className="mt-3 text-3xl font-semibold tracking-tight">
            Name the season. Watch the 1% daily rule move.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base lg:mx-0">
            These are example Agency Arcs you could define—Founder Sprint, Creative Flow, Parenting Presence. Quanti
            reorients the directive, voice context, and smart friction around the season you&apos;re in. You are not
            locked to three presets.
          </p>
          <div
            className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start"
            role="tablist"
            aria-label="Example Agency Arcs"
          >
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

        <div className="mt-10 grid items-center gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <IPhoneFocusFrame arc={arc} onArcChange={setArc} />
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <li
                  key={pillar.title}
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 transition-all duration-300 hover:border-indigo-400/40 hover:shadow-[0_0_24px_rgba(99,102,241,0.16)]"
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-indigo-400/25 bg-indigo-400/10">
                      <Icon className="h-5 w-5 text-indigo-300" strokeWidth={1.75} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold tracking-tight text-slate-50">{pillar.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-400">{pillar.body}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
