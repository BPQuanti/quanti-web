import { BarChart3, Compass, Minus, Plus } from "lucide-react";

const TRACKERS = [
  {
    title: "Demands Attention",
    body: "Spend 10–15 minutes a day managing habit grids, calendar blocks, and charts.",
  },
  {
    title: "Leaves Decisions on You",
    body: "Shows raw metrics (HRV down 12%, goal 30% complete), but leaves you to figure out what physical move to make next.",
  },
  {
    title: "Gamifies Guilt",
    body: "Penalizes missed days with broken streak warnings, red notifications, and artificial RPG points.",
  },
] as const;

const QUANTI = [
  {
    title: "Stays Out of Your Way",
    body: "Under 30 seconds of total daily screen time. No dashboards to hoard your attention.",
  },
  {
    title: "Compresses Decisions",
    body: "Combines your 30-day destination target, a 10-second morning voice check-in, and HealthKit biometrics to hand you one 15-word physical action card.",
  },
  {
    title: "Adapts Without Judgment",
    body: "Mark Executed / Partial / Shifted at night. Tomorrow’s directive adapts automatically—zero streak guilt.",
  },
] as const;

export default function WhyNoDashboards() {
  return (
    <section
      className="relative mt-16 overflow-hidden rounded-[28px] border border-slate-800/80 bg-[#0D0D0D] px-4 py-12 text-slate-50 sm:px-8 sm:py-14"
      aria-labelledby="why-no-dashboards-heading"
    >
      <div className="pointer-events-none absolute -left-12 top-8 h-56 w-56 rounded-full bg-slate-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />

      <div className="relative mx-auto max-w-5xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-300">
            Why we don&apos;t have dashboards
          </p>
          <h2
            id="why-no-dashboards-heading"
            className="mt-5 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl"
          >
            Built for execution, not database management.
          </h2>
        </div>

        <div className="mt-10 grid gap-3 lg:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-neutral-900/50 p-6 backdrop-blur-md">
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              <BarChart3 className="h-4 w-4" strokeWidth={1.75} />
              Traditional goal trackers
            </p>
            <h3 className="mt-3 text-xl font-semibold tracking-tight text-slate-300">The database approach</h3>
            <ul className="mt-6 space-y-5">
              {TRACKERS.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <Minus className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" strokeWidth={2} />
                  <div>
                    <p className="text-sm font-semibold text-slate-400">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-indigo-400/30 bg-indigo-500/5 p-6 shadow-[0_0_32px_rgba(99,102,241,0.12)] backdrop-blur-md">
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-300">
              <Compass className="h-4 w-4" strokeWidth={1.75} />
              Quanti
            </p>
            <h3 className="mt-3 text-xl font-semibold tracking-tight text-slate-50">The execution compass</h3>
            <ul className="mt-6 space-y-5">
              {QUANTI.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <Plus className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" strokeWidth={2} />
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <blockquote className="mx-auto mt-8 max-w-3xl rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5 text-center sm:px-8">
          <p className="text-sm font-medium leading-7 text-slate-300 sm:text-base">
            The difference: traditional goal apps make you the administrator of a tracking system. Quanti acts as a
            compass that gets you off your phone and into action.
          </p>
        </blockquote>
      </div>
    </section>
  );
}
