"use client";

import { BarChart2, Compass, ShieldCheck } from "lucide-react";

const MIRROR = [
  { title: "10 apps, zero synthesis", description: "Bank, sleep, workouts, and spend live in separate dashboards." },
  { title: "Data fatigue", description: "Raw charts stack up until you stop opening them." },
  { title: "No next move", description: "You see the past. You still don't get a directive for today." },
];

const GPS = [
  { title: "1 daily directive", description: "One priority action every morning from the full picture." },
  { title: "Unified intelligence", description: "Bank, health, and habits correlated into one engine." },
  { title: "Automated momentum", description: "Daily Momentum Score (0–100) tracks whether you're compounding." },
];

export default function MirrorVsGps() {
  return (
    <section className="mt-16 text-slate-50" aria-labelledby="mirror-gps-heading">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">The Shift</p>
        <h2 id="mirror-gps-heading" className="mt-3 text-3xl font-semibold tracking-tight">
          Mirror vs. GPS
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
          Most apps reflect your life. Quanti tells you the next right move.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            <BarChart2 className="h-4 w-4" />
            Traditional Apps
          </p>
          <h3 className="mt-3 text-xl font-semibold text-slate-200">The Passive Mirror</h3>
          <ul className="mt-5 space-y-4">
            {MIRROR.map((item) => (
              <li key={item.title} className="flex gap-3">
                <BarChart2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-slate-300">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-3xl border border-indigo-400/30 bg-indigo-500/5 p-6 shadow-[0_0_32px_rgba(99,102,241,0.12)] backdrop-blur-xl">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300">
            <Compass className="h-4 w-4" />
            Quanti Engine
          </p>
          <h3 className="mt-3 text-xl font-semibold text-slate-50">The Proactive GPS</h3>
          <ul className="mt-5 space-y-4">
            {GPS.map((item) => (
              <li key={item.title} className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                <div>
                  <p className="text-sm font-medium text-slate-100">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
