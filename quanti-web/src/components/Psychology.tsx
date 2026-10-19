import { Compass, Mic, Shield } from "lucide-react";

const ANCHORS = [
  {
    title: "Self-awareness",
    kicker: "Interoception",
    body: "Fifteen seconds to name fatigue or stress. That pause lowers background anxiety and keeps you present—not on autopilot.",
    icon: Mic,
    tone: "border-rose-400/25 text-rose-200",
  },
  {
    title: "Intention over overload",
    kicker: "One 1% rule",
    body: "Complex graphs become one daily anchor for energy and attention. Decision fatigue drops. Clarity stays.",
    icon: Compass,
    tone: "border-indigo-400/25 text-indigo-200",
  },
  {
    title: "Pre-commitment & presence",
    kicker: "Hold your ground",
    body: "Set a realistic boundary while you're clear. Speed bumps later remind you of that promise when fatigue hits.",
    icon: Shield,
    tone: "border-emerald-400/25 text-emerald-200",
  },
] as const;

export default function Psychology() {
  return (
    <section
      className="relative mt-16 overflow-hidden rounded-[28px] border border-slate-800/80 bg-zinc-900/80 px-4 py-12 text-slate-50 sm:px-8 sm:py-14"
      aria-labelledby="psychology-heading"
    >
      <div className="pointer-events-none absolute -left-16 top-8 h-56 w-56 rounded-full bg-indigo-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-5xl text-center">
        <p className="inline-flex rounded-full border border-slate-600/80 bg-slate-950/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-300">
          The Psychology
        </p>
        <h2 id="psychology-heading" className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
          Built on behavioral science, not brute force.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
          Voice checks and 1% directives build self-awareness, sharpen intention, and keep you present—so you stay in
          control of your day.
        </p>
      </div>

      <div className="relative mx-auto mt-10 grid max-w-5xl gap-3 lg:grid-cols-3">
        {ANCHORS.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.title} className={`rounded-2xl border bg-slate-950/80 p-5 ${card.tone}`}>
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${card.tone}`}>
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] opacity-80">{card.kicker}</p>
              <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-50">{card.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{card.body}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
