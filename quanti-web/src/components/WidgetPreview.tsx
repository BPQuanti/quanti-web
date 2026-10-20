const SCENARIOS = [
  {
    badge: "🌿 Physical Well-being",
    badgeTone: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    time: "7:15 AM",
    telemetry: " Watch: Low HRV (-16ms)",
    voice: "Stressed from work, but I desperately need to move to clear my head.",
    directive:
      "Biometrics show physical strain, but your mind needs an outlet. Swap heavy lifting for a 30-minute zone-2 incline walk and light mobility. Movement over intensity today.",
    signal: "Signal: Low Recovery + High Mental Load",
  },
  {
    badge: "💳 Capital & Intent",
    badgeTone: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    time: "8:00 AM",
    telemetry: "💳 Bank: 3 late DoorDash orders",
    voice: "Exhausted after work this week. Feeling tempted to just order takeout again.",
    directive:
      "Late-night convenience spend is your exhaustion tax. Pre-order dinner delivery now for 6:30 PM while your willpower is fresh—eliminate the 9 PM impulse friction.",
    signal: "Signal: Fatigue + Friction Vulnerability",
  },
  {
    badge: "⚡ Focus & Boundaries",
    badgeTone: "border-purple-500/20 bg-purple-500/10 text-purple-400",
    time: "8:30 AM",
    telemetry: "📅 Calendar: 6.5h meetings tomorrow",
    voice: "I feel like I'm drowning in meetings and making zero progress on my main goal.",
    directive:
      "Tomorrow's schedule will drain your battery. Decline the 2 PM status sync, block 10 AM–12 PM today for deep execution, and close Slack at 5 PM sharp.",
    signal: "Signal: Calendar Overload + Frustration",
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
            Data tracks your patterns. Voice honors your reality.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-400">
            Cold metrics don&apos;t tell the whole story. See how Quanti pairs passive background telemetry with your
            15-second morning check-in to deliver the exact directive you need.
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
                  <span className="inline-block max-w-full rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono leading-5 text-neutral-300">
                    {card.telemetry}
                  </span>
                  <p className="font-medium italic text-amber-400/90">
                    🎙️ &ldquo;{card.voice}&rdquo;
                  </p>
                </div>

                <p className="mb-4 text-base font-medium leading-relaxed text-neutral-100">
                  &ldquo;{card.directive}&rdquo;
                </p>
              </div>

              <p className="border-t border-white/5 pt-3 font-mono text-[11px] text-neutral-500">{card.signal}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
