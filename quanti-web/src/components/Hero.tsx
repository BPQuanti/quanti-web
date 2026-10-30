"use client";

import WaitlistCapture from "@/components/WaitlistCapture";

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-slate-800/80 bg-[#0D0D0D] px-4 py-10 text-slate-50 sm:px-8 sm:py-14">
      <div className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-indigo-600/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />

      <div className="relative mx-auto max-w-3xl text-left sm:text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-5xl sm:leading-[1.08] lg:text-[2.85rem] xl:text-[3.15rem]">
          Your daily execution compass.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
          Name a 30-day destination target. A 10-second voice check-in plus optional HealthKit becomes one 15-word
          action card. Zero-dashboard. Under 30 seconds of daily screen time.
        </p>
        <div id="waitlist" className="mx-auto mt-8 w-full max-w-xl scroll-mt-24 text-left">
          <WaitlistCapture emailFieldId="hero-waitlist-email" submitLabel="Claim Early Access" />
          <article className="mt-5 rounded-2xl border border-white/10 bg-neutral-900/80 p-4 text-left shadow-xl sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
                Today&apos;s 1%
              </span>
              <span className="text-[11px] text-neutral-500">7:30 AM</span>
            </div>
            <p className="text-sm font-medium leading-relaxed text-neutral-100">
              &ldquo;Toward first revenue: send one paid-path email before noon. Sleep was short, so stop after that
              one move.&rdquo;
            </p>
            <p className="mt-3 border-t border-white/5 pt-3 text-[11px] text-neutral-400">
              30-day destination + 10s voice + optional HealthKit
            </p>
          </article>
          <p className="mt-3 text-center text-sm font-semibold leading-6 text-emerald-100">
            HealthKit optional • Voice transcribed at the edge, not retained • Zero data sales
          </p>
        </div>
      </div>
    </section>
  );
}
