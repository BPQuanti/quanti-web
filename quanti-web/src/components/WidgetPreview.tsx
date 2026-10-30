const SCENARIOS = [
  {
    badge: "At home → own place",
    badgeTone: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    time: "7:15 AM",
    telemetry: ["Destination: own place", " Watch: Low HRV", "Yesterday: shifted"],
    voice: "The listing is still open. I froze.",
    directive: "Send one listing follow-up in 20 minutes, then stop. Smaller because yesterday slipped.",
    alignment: "Destination is the plot. Recovery only sized the window.",
  },
  {
    badge: "Building → first revenue",
    badgeTone: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    time: "8:00 AM",
    telemetry: ["Destination: first revenue", "Sleep: 7.6h", "Yesterday: executed"],
    voice: "I keep polishing instead of charging.",
    directive: "Ship one paid-path screen before noon. That is the next 1% past yesterday’s win.",
    alignment: "Voice named the object. Telemetry said the window could hold it.",
  },
  {
    badge: "Stretched → present evenings",
    badgeTone: "border-purple-500/20 bg-purple-500/10 text-purple-400",
    time: "8:30 AM",
    telemetry: ["Destination: present evenings", "HealthKit: optional off", "Yesterday: partial"],
    voice: "Pickup chaos ate the evening.",
    directive: "Hard stop at 6:30. One protected hour at home—today’s 1% toward present evenings.",
    alignment: "The check filled why yesterday shifted. The rule is a clock, not a pep talk.",
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
            The 30-day destination target stays the plot. Optional HealthKit sizes the window. A 10-second voice
            check-in fills the blank. Evening outcome mark writes tomorrow.
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
