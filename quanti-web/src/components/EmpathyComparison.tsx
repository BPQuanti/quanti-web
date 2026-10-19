import { HeartHandshake, Scale, XCircle, CheckCircle2 } from "lucide-react";

const COLD = [
  {
    title: "The scoreboard",
    body: "“You slept 5 hours. Streak broken.” As if a hard week were a character flaw.",
  },
  {
    title: "The lecture",
    body: "“Over budget. 8 meetings you should have declined.” More homework after a full day.",
  },
  {
    title: "You become the analyst",
    body: "Three dashboards. Zero comfort. You still have to stitch the story yourself.",
  },
];

const SEEN = [
  {
    title: "It notices the load",
    body: "Packed calendar. Short sleep. Quanti names the weight—without making you defend it.",
  },
  {
    title: "One kind next step",
    body: "Not a guilt trip. One empathetic morning rule that lightens the load you already carried.",
  },
  {
    title: "Your effort counts",
    body: "You showed up tired and still did the work. The directive starts there—not from a perfect baseline.",
  },
];

export default function EmpathyComparison() {
  return (
    <section
      className="relative mt-16 overflow-hidden rounded-[28px] border border-slate-800/80 bg-zinc-900/80 px-4 py-12 text-slate-50 sm:px-8 sm:py-16"
      aria-labelledby="empathy-comparison-heading"
    >
      <div className="pointer-events-none absolute -left-16 top-8 h-56 w-56 rounded-full bg-rose-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />

      <div className="relative mx-auto max-w-5xl text-center">
        <p className="inline-flex rounded-full border border-slate-600/80 bg-slate-950/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-300">
          Intimacy Contrast
        </p>
        <h2 id="empathy-comparison-heading" className="mt-5 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
          Knows you better than a best friend—without the judgment.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
          Cold tools tally what you did wrong. Quanti puts recovery, schedule, spend, and how you said you felt in the
          same picture—so the morning rule can relieve cognitive burden instead of adding shame.
        </p>
      </div>

      <div className="relative mx-auto mt-10 grid max-w-5xl gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-amber-500/20 bg-slate-950/70 p-6">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-300/90">
            <Scale className="h-4 w-4" strokeWidth={1.75} />
            Most apps
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-amber-100">Cold. Fragmented. Guilty.</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">They see a number. They miss the person carrying it.</p>
          <ul className="mt-5 space-y-4">
            {COLD.map((item) => (
              <li key={item.title} className="flex items-start gap-3">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400/80" strokeWidth={1.75} />
                <div>
                  <p className="text-sm font-semibold text-slate-200">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-indigo-400/40 bg-slate-950/80 p-6 shadow-[0_0_36px_rgba(99,102,241,0.18)]">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-300">
            <HeartHandshake className="h-4 w-4" strokeWidth={1.75} />
            Quanti
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-50">Seen. Held. Directed kindly.</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Heavy workload + low sleep is named as load—not as failure.
          </p>
          <ul className="mt-5 space-y-4">
            {SEEN.map((item) => (
              <li key={item.title} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" strokeWidth={1.75} />
                <div>
                  <p className="text-sm font-semibold text-slate-100">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <blockquote className="relative mx-auto mt-8 max-w-5xl rounded-2xl border border-indigo-400/20 bg-indigo-500/10 px-5 py-4 text-center text-sm font-medium italic leading-7 text-indigo-100 sm:text-base">
        “You ran a full day on almost no sleep. That counts. Today’s 1% is one boundary—not a redo of yesterday.”
      </blockquote>
    </section>
  );
}
