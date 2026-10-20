const SCENARIOS = [
  {
    badge: "🌿 Physical Well-being",
    badgeTone: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    time: "7:15 AM",
    telemetry: [" Watch: Low HRV (-16ms)"],
    voice: "Stressed from work, but I desperately need to move to clear my head.",
    directive:
      "Wanting to clear your head after a heavy work week makes total sense. Your body is carrying physical strain today, so let's protect it: swap heavy lifting for a restorative 30-minute incline walk. Let's give your mind a break without beating up your body.",
    alignment: "Validates mental stress and adapts physical load so movement heals rather than drains.",
  },
  {
    badge: "💳 Capital & Intent",
    badgeTone: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    time: "8:00 AM",
    telemetry: [
      "💳 Bank: $180 retail/shopping spend at 11:30 PM",
      "⌚ Apple Watch: High late-night stress spikes",
    ],
    voice: "Overwhelmed with work and felt like treating myself to feel better.",
    directive:
      "It's completely valid to want a reward after an overwhelming day. But late-night impulse buys usually leave you feeling worse tomorrow. Let's protect your peace and capital tonight: set a gentle lock on shopping apps after 9 PM and get to bed early instead.",
    alignment: "Meets emotional burnout with empathy while creating smart friction against impulse habits.",
  },
  {
    badge: "⚡ Focus & Boundaries",
    badgeTone: "border-purple-500/20 bg-purple-500/10 text-purple-400",
    time: "8:30 AM",
    telemetry: ["📅 Calendar: 6.5h meetings tomorrow"],
    voice: "I feel like I'm drowning in meetings and making zero real progress.",
    directive:
      "Feeling like you're drowning in meetings is exhausting, and your frustration is totally justified. Looking ahead, tomorrow will drain you if we don't protect your space now. Decline the 2 PM status sync today, block 2 hours for real progress, and log off at 5 PM.",
    alignment: "Validates cognitive overload and steps in to protect time before burnout takes over.",
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
            Cold metrics don&apos;t tell the whole story. Quanti truly gets to know you—bridging your background signals
            with your real-time voice context to shift and adapt to what you need to feel fully aligned.
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
                <span className="mb-0.5 block font-medium text-neutral-500">ALIGNMENT ENGINE:</span>
                {card.alignment}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
