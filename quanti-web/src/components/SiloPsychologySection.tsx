import { Activity, ArrowDown, ArrowRight, CheckCircle2, CreditCard, Smartphone, Sparkles, XCircle } from "lucide-react";

const CASCADE = [
  {
    domain: "Biometrics",
    title: "Suppressed Sleep & HRV",
    body: "Executive function and impulse control drop below baseline.",
    icon: Activity,
    glow: "hover:border-sky-400/40 hover:shadow-[0_0_28px_rgba(56,189,248,0.18)]",
    iconWrap: "border-sky-400/30 bg-sky-400/10 text-sky-300",
    kicker: "text-sky-300",
  },
  {
    domain: "Digital Habits",
    title: "Late-Night Doomscrolling",
    body: "Vulnerability window opens during high-fatigue hours.",
    icon: Smartphone,
    glow: "hover:border-purple-400/40 hover:shadow-[0_0_28px_rgba(168,85,247,0.18)]",
    iconWrap: "border-purple-400/30 bg-purple-400/10 text-purple-300",
    kicker: "text-purple-300",
  },
  {
    domain: "Capital",
    title: "Reactive Impulse Spend",
    body: "Micro-stressors elevate evening cortisol and restart the cycle.",
    icon: CreditCard,
    glow: "hover:border-emerald-400/40 hover:shadow-[0_0_28px_rgba(52,211,153,0.18)]",
    iconWrap: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    kicker: "text-emerald-300",
  },
] as const;

const STATUS_QUO = [
  "Passive data dumps with isolated graphs",
  "Insight fatigue from context switching across 3+ apps",
  "Reactive alerts after the friction has already occurred",
];

const QUANTI_ENGINE = [
  "AI-powered cross-domain telemetry correlation",
  "Filters out 99% of noisy charts to deliver your 1% daily rule",
  "Aligns your entire system to your active Arc: Recovery, Deep Work, or Capital",
];

export default function SiloPsychologySection() {
  return (
    <section
      className="relative mt-16 overflow-hidden rounded-[28px] border border-slate-800/80 bg-zinc-900/80 px-4 py-12 text-slate-50 sm:px-8 sm:py-16"
      aria-labelledby="silo-psychology-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_80%)]" />
      <div className="pointer-events-none absolute -left-16 top-10 h-56 w-56 rounded-full bg-sky-500/15 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-24 h-64 w-64 rounded-full bg-purple-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-5xl text-center">
        <p className="inline-flex rounded-full border border-slate-600/80 bg-slate-950/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-300">
          The Behavioral Gap
        </p>
        <h2 id="silo-psychology-heading" className="mt-5 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
          Your life isn&apos;t compartmentalized. Why track it in silos?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
          Human behavior operates as a single interconnected system. Staring at three separate dashboards forces you to
          act as the manual processing layer.
        </p>
      </div>

      <div className="relative mx-auto mt-12 max-w-5xl">
        <h3 className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
          The Cross-Domain Cascade
        </h3>

        <div className="mt-6 flex flex-col items-stretch gap-3 md:flex-row md:items-center">
          {CASCADE.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="flex flex-1 flex-col items-stretch md:flex-row md:items-center">
                <article
                  className={`flex-1 rounded-2xl border border-slate-700/80 bg-slate-950/80 p-5 transition-all duration-300 hover:-translate-y-0.5 ${card.glow}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${card.iconWrap}`}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${card.kicker}`}>{card.domain}</p>
                  </div>
                  <h4 className="mt-4 text-lg font-semibold tracking-tight text-slate-50">{card.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{card.body}</p>
                </article>
                {index < CASCADE.length - 1 ? (
                  <div className="flex items-center justify-center py-1 md:px-2 md:py-0" aria-hidden>
                    <ArrowDown className="h-5 w-5 text-slate-500 md:hidden" strokeWidth={1.75} />
                    <ArrowRight className="hidden h-5 w-5 text-slate-500 md:block" strokeWidth={1.75} />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <p className="mt-6 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 px-4 py-3 text-center text-sm font-medium italic leading-6 text-indigo-100">
          A financial leak is often a biometric recovery issue in disguise.
        </p>
      </div>

      <div className="relative mx-auto mt-12 grid max-w-5xl gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-amber-500/20 bg-slate-950/70 p-6 transition-all duration-300 hover:border-amber-400/35">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-300/90">The Status Quo</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-amber-100">Disconnected Tracking</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">Traditional trackers. Isolated graphs. You do the stitching.</p>
          <ul className="mt-5 space-y-3">
            {STATUS_QUO.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-300">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400/80" strokeWidth={1.75} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-indigo-400/40 bg-slate-950/80 p-6 shadow-[0_0_36px_rgba(99,102,241,0.18)] transition-all duration-300 hover:border-indigo-300/60 hover:shadow-[0_0_48px_rgba(99,102,241,0.28)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-300">The Quanti Engine</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-50">Cross-Domain Intelligence</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">AI noise filtering. One correlated directive. One morning rule.</p>
          <ul className="mt-5 space-y-3">
            {QUANTI_ENGINE.map((item, index) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-200">
                {index === 0 ? (
                  <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-indigo-300" strokeWidth={1.75} />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" strokeWidth={1.75} />
                )}
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
