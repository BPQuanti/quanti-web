const QUESTIONS = [
  {
    q: "Do you store or sell my health or voice data?",
    a: "HealthKit is optional. Voice is transcribed at the encrypted edge and not retained. We never sell data or train models on your day.",
  },
  {
    q: "When does TestFlight open?",
    a: "Closed TestFlight is rolling out from the waitlist. Request early access now—spot order is based on signup plus referrals.",
  },
  {
    q: "Do I have to log habits or meals?",
    a: "No. Quanti is an execution compass, not a tracker. A 10-second voice check-in and an evening outcome mark. Zero habit grids, streaks, or dashboards.",
  },
];

export default function Faq() {
  return (
    <section className="mt-16 text-slate-50" aria-labelledby="faq-heading">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">FAQ</p>
        <h2 id="faq-heading" className="mt-3 text-3xl font-semibold tracking-tight">
          Privacy, TestFlight, and the daily loop.
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
