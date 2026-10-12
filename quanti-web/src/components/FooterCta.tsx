import { Lock } from "lucide-react";
import WaitlistCapture from "@/components/WaitlistCapture";

export default function FooterCta() {
  return (
    <section id="waitlist-footer" className="mt-16 mb-8 scroll-mt-24">
      <div className="rounded-[28px] border border-indigo-400/25 bg-slate-950/80 px-5 py-10 text-center shadow-[0_0_40px_rgba(99,102,241,0.16)] sm:px-10">
        <h2 className="mx-auto max-w-3xl text-2xl font-semibold tracking-tight text-slate-50 sm:text-4xl sm:leading-[1.12]">
          An automated behavioral GPS for whatever arc you&apos;re in.
        </h2>
        <div className="mx-auto mt-8 max-w-xl text-left">
          <WaitlistCapture
            emailFieldId="footer-waitlist-email"
            submitLabel="Request Early Access"
            refreshOnMount={false}
          />
          <p className="mt-3 flex items-start justify-center gap-2 text-center text-sm font-semibold leading-6 text-emerald-100">
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
