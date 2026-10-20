const QUESTIONS = [
  {
    q: "Is my data processed on-device?",
    a: "Yes. Sleep, screens, calendar, spend, location, and voice stay in the iOS sandbox. We never sell data.",
  },
  {
    q: "How is voice processing secured?",
    a: "The 15-second voice check is processed on your phone. Voice never leaves the device. It is not used to train models in a cloud you don't control.",
  },
  {
    q: "How does Quanti synthesize my voice and biometrics?",
    a: "Quanti uses local, on-device AI models to parse your morning voice note and correlate it with your background signals (like Apple Watch data or calendar density). Because processing happens directly on your phone, your personal thoughts and health metrics never leave your device or get trained on external servers.",
  },
  {
    q: "What if I can't speak out loud every morning?",
    a: "No problem. While a 15-second voice check-in is the fastest way to capture qualitative context, Quanti includes 1-tap emoji state check-ins and quick text notes for quiet or busy mornings so your daily habit loop never breaks.",
  },
  {
    q: "Are integrations read-only?",
    a: "Yes. Apple Health, calendar, phone usage, and bank activity are read-only. Quanti cannot move money or lock your apps.",
  },
  {
    q: "Does Quanti lock my apps or force my calendar?",
    a: "No. You get skippable speed bumps and one morning rule. Never forced lockouts.",
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
