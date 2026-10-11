import { Activity, Clock, Landmark, Moon } from "lucide-react";

const PROTOCOL = [
  "Limit high-cognitive work to a 9:30 AM – 11:30 AM deep work window.",
  "Hard cutoff for caffeine at 12:00 PM.",
  "Schedule a 20-minute NSDR (Non-Sleep Deep Rest) session at 2:00 PM to offset circadian lag.",
];

const SOURCES = [
  { label: "HealthKit", detail: "HRV: 32ms | -38%", icon: Activity },
  { label: "Screen Time", detail: "1h 20m after 1 AM", icon: Clock },
  { label: "Plaid", detail: "$34.50 Late-Night Order", icon: Landmark },
];

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
            <div className="flex items-center justify-between gap-2">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-indigo-300">Quanti · Focus</p>
              <p className="text-[9px] font-semibold tabular-nums text-emerald-300">1,240</p>
            </div>
            <p className="mt-2 text-[13px] font-semibold leading-snug text-slate-50">NSDR at 2:00 PM</p>
            <p className="mt-1.5 text-[10px] leading-4 text-slate-400">
              20-minute Non-Sleep Deep Rest to offset last night
            </p>
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
          HealthKit, Screen Time, and Plaid become one morning directive—delivered as an iPhone widget, not another
          dashboard.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_auto]">
        <article className="relative overflow-hidden rounded-3xl border border-indigo-500/25 bg-slate-900/80 p-5 shadow-[0_0_48px_rgba(99,102,241,0.16)] sm:p-6">
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-amber-500/10 blur-3xl" />

          <div className="flex items-start justify-between gap-3">
            <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full border border-amber-400/35 bg-amber-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-200 sm:px-3 sm:text-[11px] sm:tracking-[0.14em]">
              <Moon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
              <span className="whitespace-nowrap leading-tight">RECOVERY DEFICIT DETECTED</span>
            </span>
            <div className="shrink-0 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">Momentum</p>
              <p className="mt-0.5 text-2xl font-bold tabular-nums text-emerald-200">1,240</p>
              <p className="mt-1 text-[10px] leading-4 text-emerald-100/80">uncapped</p>
            </div>
          </div>

          <ul className="mt-4 flex flex-wrap gap-2">
            {SOURCES.map((source) => {
              const Icon = source.icon;
              return (
                <li
                  key={source.label}
                  className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-700 bg-slate-950/70 px-2.5 py-1 text-[11px] font-medium text-slate-300"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-indigo-300" strokeWidth={1.75} />
                  <span className="text-slate-200">{source.label}</span>
                  <span className="text-slate-500">·</span>
                  <span className="truncate text-slate-400">{source.detail}</span>
                </li>
              );
            })}
          </ul>

          <h3 className="mt-5 text-xl font-semibold tracking-tight sm:text-2xl">Circadian Phase Delay</h3>
          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
            Late-night digestive load combined with high-arousal screen exposure delayed melatonin synthesis by 2.2
            hours, reducing deep sleep by 55%.
          </p>

          <div className="mt-6 rounded-2xl border border-indigo-400/30 bg-indigo-500/10 p-4 sm:p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-300">
              Recommended Protocol for Today
            </p>
            <ul className="mt-3 space-y-2.5">
              {PROTOCOL.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm leading-6 text-slate-100">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-300" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>

        <div className="flex flex-col items-center">
          <LockScreenWidget />
          <p className="mt-4 max-w-[240px] text-center text-xs leading-5 text-slate-500">
            Today&apos;s move on the Lock Screen. Open the app for the pattern behind it.
          </p>
        </div>
      </div>
    </section>
  );
}
