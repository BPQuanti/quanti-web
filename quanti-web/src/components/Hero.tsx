"use client";

import WaitlistCapture from "@/components/WaitlistCapture";

const LOOP = [
  {
    glyph: "🎯",
    title: "One Active Destination",
    body: "One checkable object. The queue stays inert until you Swap. Achieved archives it.",
  },
  {
    glyph: "🎙️",
    title: "Optional voice + HealthKit",
    body: "A skippable 10–15s check fills one blank. Sleep and HRV only size the window.",
  },
  {
    glyph: "✓",
    title: "Evening mark writes tomorrow",
    body: "Done or Missed. No streaks. No dashboards.",
  },
] as const;

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0A0A0C] px-4 py-10 text-white sm:px-8 sm:py-14">
      <div className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-white/[0.04] blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-white/[0.03] blur-3xl" />

      <div className="relative mx-auto max-w-3xl text-left sm:text-center">
        <p className="inline-flex rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[11px] font-medium tracking-wide text-white/70">
          Private iOS TestFlight is live • Invite-only • Capped cohort
        </p>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-5xl sm:leading-[1.08] lg:text-[2.85rem] xl:text-[3.15rem]">
          Your daily execution compass.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/60 sm:text-lg">
          One Active Destination. One 15–20 word physical 1%. Optional HealthKit. Skippable voice. Last
          night&apos;s mark writes tomorrow.
        </p>
        <div id="waitlist" className="mx-auto mt-8 w-full max-w-xl scroll-mt-24 text-left">
          <WaitlistCapture emailFieldId="hero-waitlist-email" submitLabel="Request TestFlight Access" />
          <article className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-white/70">
                Today&apos;s 1%
              </span>
              <span className="text-[11px] text-white/40">7:30 AM</span>
            </div>
            <p className="text-sm font-medium leading-relaxed text-white">
              &ldquo;Draft two custom security answers for the enterprise pilot. Sleep was short, so stop after that
              one artifact.&rdquo;
            </p>
            <p className="mt-3 border-t border-white/10 pt-3 text-[11px] text-white/45">
              Active Destination + skippable voice + optional HealthKit
            </p>
          </article>
        </div>

        <div className="mx-auto mt-8 grid w-full max-w-3xl gap-3 text-left sm:grid-cols-3">
          {LOOP.map((step, index) => (
            <article
              key={step.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/40">Step {index + 1}</p>
              <h2 className="mt-2 text-sm font-semibold leading-5 text-white">
                <span aria-hidden>{step.glyph}</span> {step.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/55">{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
