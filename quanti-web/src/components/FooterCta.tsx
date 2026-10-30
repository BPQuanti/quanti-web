"use client";

import WaitlistCapture from "@/components/WaitlistCapture";

export default function FooterCta() {
  return (
    <section
      className="relative mt-16 overflow-hidden rounded-[28px] border border-slate-800/80 bg-[#0D0D0D] px-6 py-16 text-center text-slate-50 sm:px-10 sm:py-20"
      aria-labelledby="closing-cta-heading"
    >
      <div className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-rose-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />

      <div className="relative mx-auto max-w-3xl">
        <h2 id="closing-cta-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
          Built to stand in your corner.
        </h2>
        <p className="mx-auto mt-5 text-lg leading-relaxed text-slate-400">
          Trackers make you the administrator. Quanti is an execution compass: a 30-day destination target, a 10-second
          voice check-in, and one 15-word action card. Evening outcome mark writes tomorrow. Zero-dashboard. Under 30
          seconds of daily screen time.
        </p>

        <div id="waitlist-footer" className="mx-auto mt-8 max-w-xl scroll-mt-24 text-left">
          <WaitlistCapture
            emailFieldId="footer-waitlist-email"
            submitLabel="Join the Waitlist"
            refreshOnMount={false}
          />
        </div>

        <p className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-slate-400">
          <span> Coming soon to iOS</span>
          <span aria-hidden>•</span>
          <span>HealthKit optional • Zero data sales</span>
        </p>
      </div>
    </section>
  );
}
