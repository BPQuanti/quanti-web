const QUESTIONS = [
  {
    q: "What is Quanti right now?",
    a: "A private iOS TestFlight of a daily execution compass. You name one Active Destination — a checkable object, not a 30-day calendar box. You get one 15–20 word physical 1%. Optional HealthKit sleep/HRV sizes the window. A skippable 10–15s voice check fills one blank. Evening mark: Executed / Partial / Shifted. Achieved archives the destination.",
  },
  {
    q: "Is TestFlight live?",
    a: "Yes. Private iOS TestFlight is live and invite-only. We enroll in small cohorts from this waitlist and send a direct Apple TestFlight link as spots open. It is not on the public App Store yet.",
  },
  {
    q: "Can I keep more than one destination?",
    a: "You can park names in an inert queue. Only one destination is Active. Swap moves a parked name into the Active slot. Achieved archives it. The daily card stays locked to the morning destination if you swap mid-day.",
  },
  {
    q: "What is the North Star?",
    a: "A static vision label. The engine does not compute from it. It is a boundary, not a second goal.",
  },
  {
    q: "How is voice processing secured?",
    a: "Voice is transcribed in-memory at the encrypted edge with zero data retention. Audio is not kept and is not used to train models. You can skip voice if last night’s mark already sized today.",
  },
  {
    q: "Do I have to connect HealthKit?",
    a: "No. HealthKit is optional. Without it, Quanti still writes a 15–20 word action card from your Active Destination and last night’s mark. Sleep and HRV only size how hard today can go.",
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
