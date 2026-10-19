import WaitlistCapture from "@/components/WaitlistCapture";

const QUESTIONS = [
  {
    q: "How is my financial and biometric data secured?",
    a: "On-device and read-only. Apple Health, Screen Time, Plaid, and voice reflections stay in the iOS sandbox. We never store, sell, or train models on raw health, bank, or voice data in a central cloud you don't control.",
  },
  {
    q: "Does Quanti lock my apps or force my calendar?",
    a: "No. Quanti uses smart friction: 5-second pause screens, suggested blocks, and pre-commitment nudges. You keep the last move. Never forced lockouts or rigid auto-scheduling.",
  },
  {
    q: "Am I stuck with Recovery, Deep Work, and Capital?",
    a: "No. Agency Arcs are yours to name—Founder Sprint, Creative Flow, Parenting Presence, or whatever season you're in. They adapt. They are not a hardcoded set of three.",
  },
  {
    q: "When does TestFlight open?",
    a: "Closed TestFlight is rolling out from the waitlist. Join now—spot order is based on signup plus referrals.",
  },
];

export default function FAQAndCTA() {
  return (
    <section className="mt-16 mb-8 text-slate-50" aria-labelledby="faq-cta-heading">
      <div className="overflow-hidden rounded-[28px] border border-indigo-400/25 bg-slate-950/80 px-5 py-10 shadow-[0_0_40px_rgba(99,102,241,0.16)] sm:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full border border-slate-600/80 bg-slate-900/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-300">
            Privacy-First Behavioral OS
          </p>
          <h2 id="faq-cta-heading" className="mt-4 text-2xl font-semibold tracking-tight text-slate-50 sm:text-4xl sm:leading-[1.12]">
            One 1% directive. Smart friction. Your agency.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
            Voice telemetry, on-device processing, then claim your spot.
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
          <p className="mt-3 text-center text-sm font-semibold leading-6 text-emerald-100">
            🔒 On-Device Processing • Zero Data Sales • Read-Only Integrations
          </p>
        </div>
      </div>
    </section>
  );
}
