import {
  Activity,
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Calendar,
  Flame,
  MapPin,
  Mic,
  Pause,
  Shield,
  Smartphone,
  Sparkles,
  XCircle,
} from "lucide-react";

const CASCADE = [
  {
    domain: "Physical Strain",
    title: "Sleep & HRV Slip",
    body: "Poor sleep makes it harder to think clearly and say no.",
    icon: Activity,
    glow: "hover:border-sky-400/40 hover:shadow-[0_0_28px_rgba(56,189,248,0.18)]",
    iconWrap: "border-sky-400/30 bg-sky-400/10 text-sky-300",
    kicker: "text-sky-300",
  },
  {
    domain: "Digital Friction",
    title: "Late-Night Loops",
    body: "Late-night scrolling shows up when you're already tired.",
    icon: Smartphone,
    glow: "hover:border-purple-400/40 hover:shadow-[0_0_28px_rgba(168,85,247,0.18)]",
    iconWrap: "border-purple-400/30 bg-purple-400/10 text-purple-300",
    kicker: "text-purple-300",
  },
  {
    domain: "Capital Outflow",
    title: "Impulse Spend",
    body: "One-tap checkout hits in that same tired window.",
    icon: CreditCard,
    glow: "hover:border-emerald-400/40 hover:shadow-[0_0_28px_rgba(52,211,153,0.18)]",
    iconWrap: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    kicker: "text-emerald-300",
  },
  {
    domain: "Burnout",
    title: "The Crash",
    body: "You're fried, you regret it, and tomorrow starts behind.",
    icon: Flame,
    glow: "hover:border-amber-400/40 hover:shadow-[0_0_28px_rgba(251,191,36,0.16)]",
    iconWrap: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    kicker: "text-amber-200",
  },
] as const;

const PILLARS = [
  {
    title: "🧬 Physical",
    body: "Sleep efficiency and recovery tracking from HealthKit and wearables.",
    icon: Activity,
    tone: "border-sky-400/25 text-sky-300",
  },
  {
    title: "📱 Digital & Schedule",
    body: "Screen habits plus calendar meeting density—how packed (or empty) your day actually is.",
    icon: Calendar,
    tone: "border-purple-400/25 text-purple-300",
  },
  {
    title: "💳 Capital",
    body: "Spending velocity and impulse-buy defenses. Plaid is read-only.",
    icon: CreditCard,
    tone: "border-emerald-400/25 text-emerald-300",
  },
  {
    title: "📍 Location Context",
    body: "On-device transition awareness—Home, Work, Gym—never sent to a cloud map of your life.",
    icon: MapPin,
    tone: "border-amber-400/25 text-amber-200",
  },
  {
    title: "🎙️ Voice Checks",
    body: "15-second audio notes to capture how you actually feel—the why behind the numbers.",
    icon: Mic,
    tone: "border-rose-400/25 text-rose-300",
  },
] as const;

const STATUS_QUO = [
  "Isolated graphs after the damage is done",
  "Insight fatigue from context-switching across 3+ apps",
  "Forced locks and rigid auto-schedules that take the wheel",
];

const QUANTI_ENGINE = [
  "Sleep, screens, calendar, spend, location, and voice—connected on your phone",
  "Cuts the noise down to one simple morning rule",
  "Gentle speed bumps when willpower dips—never forced lockouts",
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
          Sleep, scrolling, meetings, and spending don&apos;t live in separate boxes. Quanti spots the daily burnout
          chain before a rough night becomes a rough week.
        </p>
      </div>

      <div className="relative mx-auto mt-12 max-w-5xl">
        <h3 className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">The Daily Burnout Chain</h3>
        <div className="mt-6 flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
          {CASCADE.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="flex flex-1 flex-col items-stretch lg:flex-row lg:items-center">
                <article
                  className={`flex-1 rounded-2xl border border-slate-700/80 bg-slate-950/80 p-5 transition-all duration-300 hover:-translate-y-0.5 ${card.glow}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${card.iconWrap}`}>
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${card.kicker}`}>{card.domain}</p>
                  </div>
                  <h4 className="mt-4 text-lg font-semibold tracking-tight text-slate-50">{card.title}</h4>
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
        <p className="mt-6 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 px-4 py-3 text-center text-sm font-medium italic leading-6 text-indigo-100">
          Tired body → late scrolling → impulse spend → burnout. A money leak is often a sleep problem in disguise.
        </p>
      </div>

      <div className="relative mx-auto mt-12 max-w-5xl">
        <h3 className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">Five Signals Quanti Reads</h3>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article
                key={pillar.title}
                className={`rounded-2xl border bg-slate-950/80 p-5 transition-all duration-300 hover:-translate-y-0.5 ${pillar.tone}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${pillar.tone}`}>
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <h4 className="text-lg font-semibold tracking-tight text-slate-50">{pillar.title}</h4>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">{pillar.body}</p>
              </article>
            );
          })}
        </div>
      </div>

      <div className="relative mx-auto mt-12 grid max-w-5xl gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-rose-400/25 bg-slate-950/80 p-6 transition-all duration-300 hover:border-rose-300/40 hover:shadow-[0_0_28px_rgba(251,113,133,0.14)]">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-400/30 bg-rose-400/10 text-rose-300">
            <Mic className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <h3 className="mt-4 text-lg font-semibold tracking-tight">15-Second Voice Checks</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            A quick audio note captures how you actually feel—so the numbers (sleep, screens, spend) have a <em>why</em>.
            Processed on your phone.
          </p>
        </article>
        <article className="rounded-2xl border border-indigo-400/25 bg-slate-950/80 p-6 transition-all duration-300 hover:border-indigo-300/40 hover:shadow-[0_0_28px_rgba(99,102,241,0.16)]">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-indigo-400/30 bg-indigo-400/10 text-indigo-300">
            <Pause className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <h3 className="mt-4 text-lg font-semibold tracking-tight">Gentle Speed Bumps</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            A 5-second pause, a suggested calendar block, a nudge you can skip. Never a forced lock. You stay in control
            of your day.
          </p>
        </article>
        <article className="rounded-2xl border border-emerald-400/25 bg-slate-950/80 p-6 transition-all duration-300 hover:border-emerald-300/40 hover:shadow-[0_0_28px_rgba(52,211,153,0.14)]">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
            <Sparkles className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <h3 className="mt-4 text-lg font-semibold tracking-tight">You Name the Season</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Founder Sprint, Creative Flow, Parenting Presence—or whatever this chapter is. It can change. You&apos;re not
            stuck with three presets.
          </p>
        </article>
      </div>

      <div className="relative mx-auto mt-12 grid max-w-5xl gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-amber-500/20 bg-slate-950/70 p-6 transition-all duration-300 hover:border-amber-400/35">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-300/90">The Status Quo</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-amber-100">Vitamins After the Damage</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">Raw graphs. Forced locks. You stitch the story.</p>
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-300">The Quanti OS</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-50">Stay in Control of Your Day</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">15-second voice checks + gentle speed bumps. One morning rule.</p>
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

      <article className="relative mx-auto mt-12 max-w-5xl rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
            <Shield className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">Privacy Architecture</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-50">On-Device Local Processing</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-emerald-50/80">
              Sleep, screens, calendar, spend, location, and voice stay on your phone. Location and voice never leave
              the device. Integrations are read-only. Nothing is sold. You keep the keys.
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}
