import { Activity, ArrowRight, Clock, Landmark, Shield } from "lucide-react";

const SOURCES = [
  { label: "HealthKit", detail: "Sleep, HRV, recovery", icon: Activity },
  { label: "Screen Time", detail: "Late-night exposure", icon: Clock },
  { label: "Plaid", detail: "Read-only spend signals", icon: Landmark },
];

export default function ArchitectureBanner() {
  return (
    <section className="mt-16 text-slate-50" aria-labelledby="architecture-heading">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">Social Proof / Architecture</p>
        <h2 id="architecture-heading" className="mt-3 text-3xl font-semibold tracking-tight">
          Three signals. One on-device sandbox.
        </h2>
      </div>

      <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
        <div className="grid flex-1 gap-3 sm:grid-cols-3">
          {SOURCES.map((source) => {
            const Icon = source.icon;
            return (
              <article
                key={source.label}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-center shadow-[0_0_20px_rgba(99,102,241,0.08)]"
              >
                <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-indigo-400/25 bg-indigo-400/10">
                  <Icon className="h-5 w-5 text-indigo-300" strokeWidth={1.75} />
                </div>
                <h3 className="mt-3 text-base font-semibold">{source.label}</h3>
                <p className="mt-1 text-sm text-slate-400">{source.detail}</p>
              </article>
            );
          })}
        </div>

        <div className="flex items-center justify-center px-1" aria-hidden>
          <ArrowRight className="hidden h-6 w-6 text-indigo-400/80 lg:block" />
        </div>

        <article className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5 text-center lg:w-[240px] lg:shrink-0">
          <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10">
            <Shield className="h-5 w-5 text-emerald-300" strokeWidth={1.75} />
          </div>
          <h3 className="mt-3 text-base font-semibold text-emerald-100">100% On-Device Sandbox</h3>
          <p className="mt-1 text-sm text-emerald-100/80">Raw health and bank data never leave the phone.</p>
        </article>
      </div>
    </section>
  );
}
