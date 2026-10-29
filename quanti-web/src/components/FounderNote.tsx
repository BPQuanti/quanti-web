export default function FounderNote() {
  return (
    <section aria-labelledby="identity-quote-heading" className="mt-16">
      <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-indigo-400/25 bg-slate-900/50 p-8 text-center shadow-[0_0_48px_rgba(99,102,241,0.18)] backdrop-blur-xl md:p-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(129,140,248,0.16),_transparent_58%)]" />
        <div className="pointer-events-none absolute -left-12 top-0 h-32 w-32 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-28 w-28 rounded-full bg-violet-500/15 blur-3xl" />

        <p className="relative text-6xl font-light leading-none text-indigo-300/40" aria-hidden>
          “
        </p>
        <blockquote id="identity-quote-heading">
          <p className="relative mt-1 bg-gradient-to-b from-white via-slate-100 to-indigo-200 bg-clip-text text-2xl font-semibold leading-snug tracking-tight text-transparent sm:text-3xl md:text-[2.15rem] md:leading-[1.35]">
            Your identity isn&apos;t defined by your ambitions—it&apos;s forged by the hundreds of micro-decisions you
            make every day.
          </p>
        </blockquote>

        <div className="relative mt-8 flex flex-col items-center gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">Daily Synthesizer</p>
          <span className="inline-flex items-center rounded-full border border-indigo-400/35 bg-indigo-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-200">
            One 1% toward next
          </span>
        </div>
      </div>
    </section>
  );
}
