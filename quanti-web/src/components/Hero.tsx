"use client";

import WaitlistCapture from "@/components/WaitlistCapture";

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-slate-800/80 bg-[#0D0D0D] px-4 py-10 text-slate-50 sm:px-8 sm:py-14">
      <div className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-indigo-600/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />

      <div className="relative mx-auto max-w-3xl text-left sm:text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-5xl sm:leading-[1.08] lg:text-[2.85rem] xl:text-[3.15rem]">
          Stop Behavioral Burnout Before It Starts.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
          Quanti is a privacy-first behavioral OS that connects your biometrics, screen habits, finances, and voice logs
          to protect your agency—delivering one 1% daily directive and smart friction when willpower falters.
        </p>
        <div id="waitlist" className="mx-auto mt-8 w-full max-w-xl scroll-mt-24 text-left">
          <WaitlistCapture emailFieldId="hero-waitlist-email" submitLabel="Join the Waitlist" />
          <p className="mt-3 text-center text-sm font-semibold leading-6 text-emerald-100">
            🔒 On-Device Processing • Zero Data Sales • Read-Only Integrations
          </p>
        </div>
      </div>
    </section>
  );
}
