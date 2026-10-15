"use client";

import { Lock } from "lucide-react";
import WaitlistCapture from "@/components/WaitlistCapture";

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-slate-800/80 bg-[#0D0D0D] px-4 py-10 text-slate-50 sm:px-8 sm:py-14">
      <div className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-indigo-600/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />

      <div className="relative mx-auto max-w-3xl text-left sm:text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-5xl sm:leading-[1.08] lg:text-[2.85rem] xl:text-[3.15rem]">
          Turn your health, money, and screen time data into a single daily directive.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
          Quanti automatically correlates your biometrics, financial habits, and phone usage to uncover hidden patterns.
          Select your focus arc—Recovery, Deep Work, or Capital—and get one high-intent execution rule delivered every
          morning. Zero manual logging.
        </p>
        <div id="waitlist" className="mx-auto mt-8 w-full max-w-xl scroll-mt-24 text-left">
          <WaitlistCapture emailFieldId="hero-waitlist-email" submitLabel="Join the Waitlist" />
          <p className="mt-3 flex items-start gap-2 text-sm font-semibold leading-6 text-emerald-100 sm:justify-center">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" strokeWidth={2} />
            <span>
              <span aria-hidden>🔒 </span>
              100% On-Device Processing. We never store, transmit, or sell your raw health or bank data.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
