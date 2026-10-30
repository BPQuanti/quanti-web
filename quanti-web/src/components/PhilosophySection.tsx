import { Hourglass, Mic, ScanEye, Timer } from "lucide-react";

const PILLARS = [
  {
    title: "30-day destination",
    body: "You name a checkable 30-day destination target. That finish line is the plot. Sensors never replace it.",
    icon: Hourglass,
  },
  {
    title: "One 15-word card",
    body: "The morning output is a single 15-word action card—one physical move—then Quanti gets off the phone.",
    icon: Timer,
  },
  {
    title: "10-second voice check-in",
    body: "A 10-second voice check-in names the stall. Optional HealthKit sleep and HRV only size the window.",
    icon: Mic,
  },
  {
    title: "Evening outcome mark",
    body: "Executed / Partial / Shifted writes tomorrow. Zero streaks. Zero-dashboard. Under 30 seconds of daily screen time.",
    icon: ScanEye,
  },
] as const;

export default function PhilosophySection() {
  return (
    <section
      className="relative mt-16 overflow-hidden rounded-[28px] border border-slate-800/80 bg-[#0D0D0D] px-4 py-12 text-slate-50 sm:px-8 sm:py-14"
      aria-labelledby="philosophy-heading"
    >
      <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="relative mx-auto max-w-5xl">
        <div className="max-w-3xl">
          <p className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-300">
            Our Philosophy
          </p>
          <h2
            id="philosophy-heading"
            className="mt-5 text-3xl font-semibold tracking-tight text-neutral-100 sm:text-4xl"
          >
            Built for execution, not attention.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-400 sm:text-lg">
            Most software hoards your time with grids and charts. Quanti is a quiet execution compass: one 15-word
            action card, then it gets out of the way.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article
                key={pillar.title}
                className="rounded-2xl border border-white/10 bg-neutral-900/50 p-5 shadow-2xl backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-white/20"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-indigo-200">
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-tight text-neutral-100">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">{pillar.body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
