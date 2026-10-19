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
          Stop letting bad days run your life. Quanti translates your daily signals into one gentle directive each
          morning so you stay in control.
        </p>
        <div id="waitlist" className="mx-auto mt-8 w-full max-w-xl scroll-mt-24 text-left">
          <WaitlistCapture emailFieldId="hero-waitlist-email" submitLabel="Claim Early Access" />
          <p className="mt-3 text-center text-sm font-semibold leading-6 text-emerald-100">
            🔒 On-Device Privacy • Read-Only Sync • Zero Data Sales
          </p>
        </div>
      </div>
    </section>
  );
}
