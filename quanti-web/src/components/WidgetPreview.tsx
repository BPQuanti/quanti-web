const WIDGETS = [
  {
    arc: "⚡ Founder Sprint",
    arcTone: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    time: "8:15 AM",
    directive:
      "HRV recovered (+14ms), but calendar density is heavy today. Block 9 AM–12 PM for deep work—keep Slack closed until noon.",
    signals: [" Watch", "📅 4 Meetings", "🎙️ Energy: Focused"],
  },
  {
    arc: "🛡️ Recovery & Reset",
    arcTone: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    time: "7:45 AM",
    directive:
      "Elevated resting HR detected after late spend. Hard stop at 6 PM. Prioritize a 20-minute outdoor walk instead of evening work.",
    signals: [" Oura", "💳 Late Spend", "🎙️ Energy: Drained"],
  },
] as const;

export default function WidgetPreview() {
  return (
    <section
      className="relative mt-16 overflow-hidden rounded-[28px] border border-slate-800/80 bg-[#0D0D0D] px-4 py-12 text-slate-50 sm:px-8 sm:py-14"
      aria-labelledby="widget-preview-heading"
    >
      <div className="pointer-events-none absolute -right-12 top-0 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="relative mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">The End Result</p>
          <h2 id="widget-preview-heading" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            What it looks like on your screen
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-400">
            No dashboards to manage. No cold graphs to decipher. Just one clear, high-leverage directive delivered
            straight to your lockscreen or homescreen every morning.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          {WIDGETS.map((widget) => (
            <article
              key={widget.arc}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/80 p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium ${widget.arcTone}`}
                >
                  {widget.arc}
                </span>
                <span className="text-xs text-neutral-400">{widget.time}</span>
              </div>
              <p className="mb-6 text-base font-medium leading-relaxed text-neutral-100">
                &ldquo;{widget.directive}&rdquo;
              </p>
              <div className="flex flex-wrap gap-2 border-t border-white/5 pt-4 text-[11px] text-neutral-400">
                {widget.signals.map((signal) => (
                  <span
                    key={signal}
                    className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1"
                  >
                    {signal}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
