import { ArrowDown, ArrowRight, Cpu, Radio, Sparkles } from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "Passive Background Ingestion",
    body: "HealthKit, Screen Time, and Plaid stream in while you live your day. No journals. No checkboxes.",
    icon: Radio,
  },
  {
    number: "02",
    title: "Local Vector Processing",
    body: "Your phone turns raw telemetry into abstract signals—recovery, arousal, late-night load—inside the iOS sandbox.",
    icon: Cpu,
  },
  {
    number: "03",
    title: "Daily Focus Card",
    body: "You wake up to one action. The pattern stays on-device; only the directive reaches your Lock Screen.",
    icon: Sparkles,
  },
];

export default function HowItWorks() {
  return (
    <section className="mt-16 text-slate-50" aria-labelledby="how-it-works-heading">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">How It Works</p>
        <h2 id="how-it-works-heading" className="mt-3 text-3xl font-semibold tracking-tight">
          From background telemetry to one morning move.
        </h2>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)]">
        {STEPS.flatMap((step, index) => {
          const Icon = step.icon;
          const card = (
            <article
              key={step.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_0_20px_rgba(99,102,241,0.08)]"
            >
              <div className="flex items-center justify-between">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-indigo-400/25 bg-indigo-400/10">
                  <Icon className="h-5 w-5 text-indigo-300" strokeWidth={1.75} />
                </div>
                <span className="font-mono text-[11px] tracking-widest text-slate-500">{step.number}</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{step.body}</p>
            </article>
          );
          if (index === STEPS.length - 1) {
            return [card];
          }
          return [
            card,
            <div key={`${step.title}-arrow`} className="flex items-center justify-center py-1" aria-hidden>
              <ArrowDown className="h-5 w-5 text-indigo-400/70 lg:hidden" />
              <ArrowRight className="hidden h-5 w-5 text-indigo-400/70 lg:block" />
            </div>,
          ];
        })}
      </div>
    </section>
  );
}
