import {
  Activity,
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Flame,
  Smartphone,
  XCircle,
} from "lucide-react";

const CASCADE = [
  {
    title: "Physical strain",
    body: "Short sleep. Heavy load. Willpower dips.",
    icon: Activity,
    iconWrap: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  },
  {
    title: "Screen loops",
    body: "Late scrolling fills the tired hours.",
    icon: Smartphone,
    iconWrap: "border-purple-400/30 bg-purple-400/10 text-purple-300",
  },
  {
    title: "Burnout",
    body: "Tomorrow starts behind. You feel unseen.",
    icon: Flame,
    iconWrap: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  },
] as const;

const COLD = [
  "Raw charts after the damage is done",
  "Guilt for a week that was already hard",
  "You still have to figure out the next move",
];

const SEEN = [
  "Sees sleep, calendar, spend, and how you felt",
  "Names the load. Validates the effort.",
  "One simple rule. Zero judgment.",
];

export default function SiloPsychologySection() {
  return (
    <section
      className="relative mt-16 overflow-hidden rounded-[28px] border border-slate-800/80 bg-zinc-900/80 px-4 py-12 text-slate-50 sm:px-8 sm:py-14"
      aria-labelledby="burnout-chain-heading"
    >
      <div className="pointer-events-none absolute -left-16 top-10 h-56 w-56 rounded-full bg-sky-500/15 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-24 h-64 w-64 rounded-full bg-purple-500/15 blur-3xl" />

      <div className="relative mx-auto max-w-5xl text-center">
        <p className="inline-flex rounded-full border border-slate-600/80 bg-slate-950/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-300">
          The Burnout Chain
        </p>
        <h2 id="burnout-chain-heading" className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
          Tired body. Packed calendar. Then the crash.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
          Most tools tally the wreckage. Quanti sees the full context—and still treats you like a person.
        </p>
      </div>

      <div className="relative mx-auto mt-10 flex max-w-5xl flex-col items-stretch gap-3 lg:flex-row lg:items-center">
        {CASCADE.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="flex flex-1 flex-col items-stretch lg:flex-row lg:items-center">
              <article className="flex-1 rounded-2xl border border-slate-700/80 bg-slate-950/80 p-5">
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${card.iconWrap}`}>
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{card.body}</p>
              </article>
              {index < CASCADE.length - 1 ? (
                <div className="flex items-center justify-center py-1 lg:px-1.5 lg:py-0" aria-hidden>
                  <ArrowDown className="h-5 w-5 text-slate-500 lg:hidden" strokeWidth={1.75} />
                  <ArrowRight className="hidden h-5 w-5 text-slate-500 lg:block" strokeWidth={1.75} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="relative mx-auto mt-10 grid max-w-5xl gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-amber-500/20 bg-slate-950/70 p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-300/90">Cold dashboards</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-amber-100">Charts. Guilt. Homework.</h3>
          <ul className="mt-5 space-y-3">
            {COLD.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-300">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400/80" strokeWidth={1.75} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-2xl border border-indigo-400/40 bg-slate-950/80 p-6 shadow-[0_0_36px_rgba(99,102,241,0.18)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-300">Quanti OS</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight">Full context. One kind rule.</h3>
          <ul className="mt-5 space-y-3">
            {SEEN.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-200">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" strokeWidth={1.75} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
