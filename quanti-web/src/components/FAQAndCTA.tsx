const QUESTIONS = [
  {
    q: "What is Quanti?",
    a: "Your daily execution compass. You name a 30-day destination target. A 10-second voice check-in plus optional HealthKit becomes one 15-word action card. Evening outcome mark: Executed / Partial / Shifted. Zero-dashboard. Under 30 seconds of daily screen time.",
  },
  {
    q: "How is voice processing secured?",
    a: "Voice processed securely in-memory via encrypted edge transcription with zero data retention. The transcript fills one blank on today’s card. Audio is not kept and is not used to train models.",
  },
  {
    q: "Where does the daily directive come from?",
    a: "30-day destination target + 10-second voice check-in + optional HealthKit (sleep & HRV) + evening outcome mark (Executed / Partial / Shifted). The synthesizer does not use calendar, bank, location, or Screen Time.",
  },
  {
    q: "Do I have to connect HealthKit?",
    a: "No. HealthKit is optional. Without it, Quanti still writes a 15-word action card from your destination and voice. Sleep and HRV only size how hard today can go—they never rewrite the target.",
  },
  {
    q: "What if I can't speak out loud every morning?",
    a: "Skip check-in still works, but the card will be blunter. A short typed note can name the same object, person, or clock time.",
  },
  {
    q: "Does Quanti lock my apps or force my calendar?",
    a: "No. There are no app locks, streaks, habit grids, or analytics dashboards. One 15-word action card. Then it gets out of the way.",
  },
  {
    q: "When does TestFlight open?",
    a: "Closed TestFlight rolls out from this waitlist. Spot order is signup plus referrals.",
  },
];

export default function FAQAndCTA() {
  return (
    <section className="mt-16 text-slate-50" aria-labelledby="faq-cta-heading">
      <div className="overflow-hidden rounded-[28px] border border-slate-800/80 bg-slate-950/80 px-5 py-10 sm:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full border border-slate-600/80 bg-slate-900/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-300">
            FAQ
          </p>
          <h2 id="faq-cta-heading" className="mt-4 text-2xl font-semibold tracking-tight sm:text-4xl sm:leading-[1.12]">
            A few things, plainly.
          </h2>
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
      </div>
    </section>
  );
}
