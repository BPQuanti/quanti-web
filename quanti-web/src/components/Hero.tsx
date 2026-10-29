"use client";

import WaitlistCapture from "@/components/WaitlistCapture";

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-slate-800/80 bg-[#0D0D0D] px-4 py-10 text-slate-50 sm:px-8 sm:py-14">
      <div className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-indigo-600/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />

      <div className="relative mx-auto max-w-3xl text-left sm:text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-5xl sm:leading-[1.08] lg:text-[2.85rem] xl:text-[3.15rem]">
          Finally, an app that actually gets you.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
          Say where you are and where you want to go. Quanti turns last night’s signals and a 15-second check into one
          1% move for today.
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
              Destination + overnight signals + 15s check
            </p>
          </article>
          <p className="mt-3 text-center text-sm font-semibold leading-6 text-emerald-100">
            🔒 On-Device Privacy • Read-Only Sync • Zero Data Sales
          </p>
        </div>
      </div>
    </section>
  );
}
