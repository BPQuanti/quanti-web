const SCENARIOS = [
  {
    badge: "Ship TestFlight to 10 testers",
    badgeTone: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    time: "8:00 PM mark",
    telemetry: ["Active Destination: TestFlight", " Watch: Low HRV", "Yesterday: shifted"],
    voice: "The invite list is still open. I froze.",
    directive: "Send one tester invite before noon, then stop. Smaller because yesterday slipped.",
    alignment: "Active Destination is the plot. Recovery only sized the window.",
  },
  {
    badge: "Close the enterprise pilot",
    badgeTone: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    time: "8:00 AM optional",
    telemetry: ["Active Destination: enterprise pilot", "Sleep: 7.6h", "Yesterday: executed"],
    voice: "I keep polishing instead of sending security answers.",
    directive: "Draft two custom security answers before noon. That is the next 1% past yesterday’s win.",
    alignment: "Voice named the artifact. HealthKit said the window could hold it.",
  },
  {
    badge: "Partial → smaller scope",
    badgeTone: "border-purple-500/20 bg-purple-500/10 text-purple-400",
    time: "Same destination",
    telemetry: ["Active Destination: enterprise pilot", "HealthKit: optional off", "Yesterday: partial"],
    voice: "The full proposal was too big.",
    directive: "Draft two custom security answers. Same destination. Smaller physical scope.",
    alignment: "Partial does not write pep. It scales the leftover down.",
  },
] as const;

export default function WidgetPreview() {
  return (
    <section
      className="relative mt-16 overflow-hidden rounded-[28px] border border-slate-800/80 bg-[#0D0D0D] px-4 py-12 text-slate-50 sm:px-8 sm:py-16"
      aria-labelledby="widget-preview-heading"
    >
      <div className="pointer-events-none absolute -right-12 top-0 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="relative mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">Real-World Adaptation</p>
          <h2 id="widget-preview-heading" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Same destination. Different 1%. Because yesterday and last night changed.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-400">
            The Active Destination stays the plot. Optional HealthKit sizes the window. A skippable 10–15s
            voice check fills the blank. Evening outcome mark writes tomorrow.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {SCENARIOS.map((card) => (
            <article
              key={card.badge}
              className="flex flex-col justify-between rounded-2xl border border-white/10 bg-neutral-900/90 p-6 shadow-xl transition hover:border-white/20"
            >
              <div>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${card.badgeTone}`}
                  >
                    {card.badge}
                  </span>
                  <span className="text-xs text-neutral-500">{card.time}</span>
                </div>

                <div className="mb-6 space-y-2 border-b border-white/10 pb-4 text-xs">
                  <div className="flex flex-col items-start gap-1.5">
                    {card.telemetry.map((signal) => (
                      <span
                        key={signal}
                        className="inline-block max-w-full rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono leading-5 text-neutral-300"
                      >
                        {signal}
                      </span>
                    ))}
                  </div>
                  <p className="font-medium italic text-amber-400/90">
                    🎙️ &ldquo;{card.voice}&rdquo;
                  </p>
                </div>

                <p className="mb-4 text-base font-medium leading-relaxed text-neutral-100">
                  &ldquo;{card.directive}&rdquo;
                </p>
              </div>

              <p className="border-t border-white/5 pt-3 text-[11px] leading-snug text-neutral-400/80">
                <span className="mb-0.5 block font-medium text-neutral-500">DAILY SYNTHESIZER:</span>
                {card.alignment}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
