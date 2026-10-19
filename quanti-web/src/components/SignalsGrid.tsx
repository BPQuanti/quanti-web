import { Activity, Calendar, CreditCard, MapPin, Mic, Sparkles } from "lucide-react";

const SIGNALS = [
  {
    title: "🧬 Physical",
    body: "Sleep & HRV recovery.",
    icon: Activity,
    tone: "border-sky-400/25 text-sky-300",
  },
  {
    title: "📱 Digital & Schedule",
    body: "Screen habits + calendar meeting density.",
    icon: Calendar,
    tone: "border-purple-400/25 text-purple-300",
  },
  {
    title: "💳 Capital",
    body: "Spending velocity & impulse defense.",
    icon: CreditCard,
    tone: "border-emerald-400/25 text-emerald-300",
  },
  {
    title: "📍 Location",
    body: "On-device Home, Work, Gym transitions.",
    icon: MapPin,
    tone: "border-amber-400/25 text-amber-200",
  },
  {
    title: "🎙️ Voice Check",
    body: "15 seconds to say how you actually feel—paired with the numbers, never judged.",
    icon: Mic,
    tone: "border-rose-400/25 text-rose-300",
  },
] as const;

export default function SignalsGrid() {
  return (
    <section
      className="relative mt-16 overflow-hidden rounded-[28px] border border-slate-800/80 bg-[#0D0D0D] px-4 py-12 text-slate-50 sm:px-8 sm:py-14"
      aria-labelledby="signals-heading"
    >
      <div className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="relative mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">Five Signals</p>
          <h2 id="signals-heading" className="mt-3 text-3xl font-semibold tracking-tight">
            One picture of you. Not five apps.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
            Recovery, schedule, spend, place, and voice—so the morning rule can actually get you.
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SIGNALS.map((signal) => {
            const Icon = signal.icon;
            return (
              <article key={signal.title} className={`rounded-2xl border bg-slate-950/80 p-5 ${signal.tone}`}>
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${signal.tone}`}>
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-50">{signal.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{signal.body}</p>
              </article>
            );
          })}
        </div>

        <article className="mt-3 rounded-2xl border border-indigo-400/30 bg-indigo-500/10 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-indigo-400/30 bg-indigo-400/10 text-indigo-300">
              <Sparkles className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div>
              <h3 className="text-lg font-semibold tracking-tight">You name the season</h3>
              <p className="mt-1 text-sm leading-6 text-slate-300">
                Founder Sprint, Creative Flow, Parenting Presence—or your own. The 1% rule orients around this chapter.
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
