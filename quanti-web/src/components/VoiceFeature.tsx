import { Heart, Mic, Shield } from "lucide-react";

const BEATS = [
  {
    title: "Talk freely",
    body: "How you feel. What stressed you. What you’re proud of. No script.",
    icon: Mic,
  },
  {
    title: "Paired with your body",
    body: "Voice sits next to sleep, strain, and the day you actually lived.",
    icon: Heart,
  },
  {
    title: "Stays on your phone",
    body: "A private mirror of your growth. Clarity without an audience.",
    icon: Shield,
  },
];

export default function VoiceFeature() {
  return (
    <section
      className="relative mt-16 overflow-hidden rounded-[28px] border border-rose-400/20 bg-[#0D0D0D] px-4 py-12 text-slate-50 sm:px-8 sm:py-16"
      aria-labelledby="voice-feature-heading"
    >
      <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-rose-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-violet-600/15 blur-3xl" />

      <div className="relative mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div>
          <p className="inline-flex rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-200">
            15-Second Voice Checks
          </p>
          <h2 id="voice-feature-heading" className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            Your daily 15-second safe space.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
            Talk freely for 15 seconds. Tell Quanti how you&apos;re feeling, what stressed you out, or what you&apos;re
            proud of. Quanti pairs your voice with your biometric data to create a mirror of your growth—giving you
            clarity without judgment.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-3">
            {BEATS.map((beat) => {
              const Icon = beat.icon;
              return (
                <li key={beat.title} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-400/30 bg-rose-400/10 text-rose-200">
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <p className="mt-3 text-sm font-semibold tracking-tight text-slate-50">{beat.title}</p>
                  <p className="mt-1.5 text-sm leading-6 text-slate-400">{beat.body}</p>
                </li>
              );
            })}
          </ul>
        </div>

        <aside className="rounded-[28px] border border-rose-400/25 bg-slate-950/80 p-6 shadow-[0_0_40px_rgba(244,63,94,0.12)] sm:p-8">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-200/80">
            <span>On-device</span>
            <span>00:15</span>
          </div>
          <div className="mt-8 flex flex-col items-center text-center">
            <span className="inline-flex h-20 w-20 items-center justify-center rounded-full border border-rose-300/40 bg-rose-500/20 text-rose-100 shadow-[0_0_36px_rgba(244,63,94,0.35)]">
              <Mic className="h-8 w-8" strokeWidth={1.5} />
            </span>
            <p className="mt-6 text-lg font-semibold tracking-tight text-slate-50">Hold to speak. Release to keep it.</p>
            <p className="mt-2 max-w-xs text-sm leading-6 text-slate-400">
              “I got through the afternoon even though I was running on fumes. I’m proud of that—and I’m tired.”
            </p>
          </div>
          <p className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-center text-sm leading-6 text-emerald-50/90">
            Voice never leaves your phone. This is your safe space—not a feed.
          </p>
        </aside>
      </div>
    </section>
  );
}
