import {
  Activity,
  ArrowDown,
  ArrowRight,
  Clock,
  Cpu,
  Landmark,
  Lock,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "On-Device Ingestion",
    badge: "iOS Local Sandbox",
    badgeClass: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    icon: Smartphone,
    body: "Raw health logs, app usage, and transaction names are processed locally inside your phone's sandbox memory. They NEVER leave your device.",
    sources: [
      { label: "Apple HealthKit", icon: Activity },
      { label: "Screen Time", icon: Clock },
      { label: "Plaid (Read-Only)", icon: Landmark },
    ],
  },
  {
    number: "02",
    title: "Local Anonymization Engine",
    badge: "On-Device Processing",
    badgeClass: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    icon: Cpu,
    body: "Your phone computes abstract signal vectors (e.g., Recovery Deficit: -35%). All personal identifiers, raw timestamps, and specific transaction details are stripped.",
    sources: [] as { label: string; icon: typeof Activity }[],
  },
  {
    number: "03",
    title: "Transient Card Generation",
    badge: "256-bit Encrypted Cloud",
    badgeClass: "border-sky-400/30 bg-sky-400/10 text-sky-300",
    icon: Sparkles,
    body: "Only normalized summary vectors reach our backend to synthesize your Daily Focus Card. No raw health or financial data is ever stored, sold, or used for AI training.",
    sources: [] as { label: string; icon: typeof Activity }[],
  },
];

function FlowArrow() {
  return (
    <div className="flex items-center justify-center py-1 lg:px-1 lg:py-0" aria-hidden>
      <ArrowDown className="h-5 w-5 text-indigo-400/70 lg:hidden" strokeWidth={1.75} />
      <ArrowRight className="hidden h-5 w-5 text-indigo-400/70 lg:block" strokeWidth={1.75} />
    </div>
  );
}

export default function PrivacyPipeline() {
  return (
    <section
      id="privacy-architecture"
      aria-labelledby="privacy-pipeline-heading"
      className="mt-16 text-slate-50"
    >
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">Privacy & Data Flow</p>
        <h2 id="privacy-pipeline-heading" className="mt-3 text-3xl font-semibold tracking-tight">
          Privacy First Architecture
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
          How your data moves from raw telemetry to your Daily Focus Card—without ever compromising privacy.
        </p>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-2">
        {steps.flatMap((step, index) => {
          const Icon = step.icon;
          const card = (
            <article
              key={step.title}
              className="flex min-w-0 flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-left shadow-[0_0_20px_rgba(99,102,241,0.08)] backdrop-blur-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-indigo-400/25 bg-indigo-400/10">
                  <Icon className="h-5 w-5 text-indigo-300" strokeWidth={1.75} />
                </div>
                <span className="font-mono text-[11px] tracking-widest text-slate-500">{step.number}</span>
              </div>
              <span
                className={`mt-4 inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide ${step.badgeClass}`}
              >
                {step.badge}
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-tight">{step.title}</h3>
              {step.sources.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {step.sources.map((source) => {
                    const SourceIcon = source.icon;
                    return (
                      <li
                        key={source.label}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-950/60 px-2.5 py-1 text-[11px] font-medium text-slate-300"
                      >
                        <SourceIcon className="h-3.5 w-3.5 text-indigo-300" strokeWidth={1.75} />
                        {source.label}
                      </li>
                    );
                  })}
                </ul>
              ) : null}
              <p className="mt-3 text-sm leading-6 text-slate-400">{step.body}</p>
            </article>
          );
          if (index === steps.length - 1) {
            return [card];
          }
          return [card, <FlowArrow key={`${step.title}-arrow`} />];
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-emerald-400/25 bg-emerald-400/5 px-5 py-4 text-center shadow-[0_0_28px_rgba(16,185,129,0.12)] sm:px-8">
        <p className="flex flex-col items-center justify-center gap-2 text-sm font-semibold leading-6 text-emerald-100 sm:flex-row sm:gap-3">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10">
            <Lock className="h-4 w-4 text-emerald-300" strokeWidth={1.75} />
          </span>
          <span>
            <span className="mr-1" aria-hidden>
              🔒
            </span>
            Strict Guarantee: Zero raw transaction or health log storage. Zero data selling. 100% user-owned telemetry.
          </span>
        </p>
        <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" strokeWidth={1.75} />
          On-device · Encrypted in transit · Never trained on · Never sold
        </p>
      </div>
    </section>
  );
}
