const QUESTIONS = [
  {
    q: "Do you store or sell my health or bank data?",
    a: "No. Raw HealthKit logs, Screen Time, and Plaid transaction details are processed on-device. We never store, sell, or train models on raw health or financial data.",
  },
  {
    q: "When does TestFlight open?",
    a: "Closed TestFlight is rolling out from the waitlist. Request early access now—spot order is based on signup plus referrals.",
  },
  {
    q: "Do I have to log habits or meals?",
    a: "Zero manual tracking. Quanti correlates the telemetry you already generate and gives you one daily action. No journals, no checkboxes, no second job.",
  },
];

export default function Faq() {
  return (
    <section className="mt-16 text-slate-50" aria-labelledby="faq-heading">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">FAQ</p>
        <h2 id="faq-heading" className="mt-3 text-3xl font-semibold tracking-tight">
          Privacy, TestFlight, and tracking.
        </h2>
      </div>
      <div className="mx-auto max-w-3xl space-y-3">
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
    </section>
  );
}
