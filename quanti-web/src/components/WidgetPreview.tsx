export default function WidgetPreview() {
  return (
    <section
      className="relative mt-16 overflow-hidden rounded-[28px] border border-slate-800/80 bg-[#0D0D0D] px-4 py-12 text-slate-50 sm:px-8 sm:py-14"
      aria-labelledby="widget-preview-heading"
    >
      <div className="pointer-events-none absolute -right-12 top-0 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="relative mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
            The Emotional Context Difference
          </p>
          <h2 id="widget-preview-heading" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Data tells us where you are. Voice tells us who you need to be today.
          </h2>
        </div>

        <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/90 p-6 shadow-2xl sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-6 text-xs">
            <div className="flex flex-wrap items-center gap-2 text-neutral-300">
              <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5"> Watch: Low HRV (-18ms)</span>
              <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5">📅 6 Focus Hours</span>
            </div>
            <p className="flex flex-wrap items-center gap-1.5 font-medium text-amber-400">
              <span>🎙️ Voice Check:</span>
              <span className="italic text-amber-200/90">
                &ldquo;Big investor pitch at 10 AM. Nervous energy.&rdquo;
              </span>
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400">
                ⚡ Founder Sprint Arc Directive
              </span>
              <span className="text-xs text-neutral-500">Delivered at 7:30 AM</span>
            </div>
            <p className="text-lg font-medium leading-relaxed text-neutral-100">
              &ldquo;HRV is low, but you&apos;re locked in for the pitch. Protect your nervous system before 10 AM: no
              caffeine until after the meeting, execute the pitch, then force a 30-minute quiet walk at 2 PM.&rdquo;
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
