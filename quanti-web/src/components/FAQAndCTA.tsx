import { Lock } from "lucide-react";
import WaitlistCapture from "@/components/WaitlistCapture";

const QUESTIONS = [
  {
    q: "How is my financial and biometric data secured?",
    a: "On-device and read-only. Apple Health, Screen Time, and Plaid stay in the iOS sandbox. We never store, sell, or train models on raw health or bank data.",
  },
  {
    q: "When does TestFlight open?",
    a: "Closed TestFlight is rolling out from the waitlist. Join now—spot order is based on signup plus referrals.",
  },
  {
    q: "Do I have to log habits or meals?",
    a: "Zero manual tracking. Quanti correlates the telemetry you already generate and delivers one daily directive. No journals, no checkboxes, no second job.",
  },
];

export default function FAQAndCTA() {
  return (
    <section className="mt-16 mb-8 text-slate-50" aria-labelledby="faq-cta-heading">
      <div className="overflow-hidden rounded-[28px] border border-indigo-400/25 bg-slate-950/80 px-5 py-10 shadow-[0_0_40px_rgba(99,102,241,0.16)] sm:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full border border-slate-600/80 bg-slate-900/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-300">
            Automated Behavioral GPS
          </p>
          <h2 id="faq-cta-heading" className="mt-4 text-2xl font-semibold tracking-tight text-slate-50 sm:text-4xl sm:leading-[1.12]">
            One morning rule. Whatever arc you&apos;re in.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
            Privacy, TestFlight, and tracking—then claim your spot.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-3xl space-y-3">
          {QUESTIONS.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-4 open:border-indigo-400/30"
            >
              <summary className="cursor-pointer list-none text-left text-base font-semibold tracking-tight marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-start justify-between gap-4">
                  {item.q}
                  <span className="mt-0.5 text-indigo-300 group-open:hidden" aria-hidden>
                    +
                  </span>
                  <span className="mt-0.5 hidden text-indigo-300 group-open:inline" aria-hidden>
                    –
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-6 text-slate-400">{item.a}</p>
            </details>
          ))}
        </div>

        <div id="waitlist-footer" className="mx-auto mt-10 max-w-xl scroll-mt-24 text-left">
          <WaitlistCapture
            emailFieldId="footer-waitlist-email"
            submitLabel="Join the Waitlist"
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
