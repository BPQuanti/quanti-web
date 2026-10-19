import WaitlistCapture from "@/components/WaitlistCapture";

const QUESTIONS = [
  {
    q: "Is my data safe?",
    a: "Yes. Sleep, screens, calendar, spend, location, and voice stay in the iOS sandbox. We never sell data. Integrations are read-only.",
  },
  {
    q: "How does on-device processing work?",
    a: "Correlation runs on your phone. Location and voice never leave the device. Raw health and bank samples are not dumped into a cloud you don't control.",
  },
  {
    q: "Does Quanti lock my apps or force my calendar?",
    a: "No. You get skippable 5-second pauses and one morning rule. Never forced lockouts.",
  },
  {
    q: "Am I stuck with three presets?",
    a: "No. You name the season—Founder Sprint, Creative Flow, Parenting Presence, or your own.",
  },
  {
    q: "When does TestFlight open?",
    a: "Closed TestFlight rolls out from this waitlist. Spot order is signup plus referrals.",
  },
];

export default function FAQAndCTA() {
  return (
    <section className="mt-16 mb-8 text-slate-50" aria-labelledby="faq-cta-heading">
      <div className="overflow-hidden rounded-[28px] border border-indigo-400/25 bg-slate-950/80 px-5 py-10 shadow-[0_0_40px_rgba(99,102,241,0.16)] sm:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full border border-slate-600/80 bg-slate-900/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-300">
            Early Access
          </p>
          <h2 id="faq-cta-heading" className="mt-4 text-2xl font-semibold tracking-tight sm:text-4xl sm:leading-[1.12]">
            Claim a spot. Be seen in the morning.
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

        <div id="waitlist-footer" className="mx-auto mt-10 max-w-xl scroll-mt-24 text-left">
          <WaitlistCapture
            emailFieldId="footer-waitlist-email"
            submitLabel="Claim Early Access"
            refreshOnMount={false}
          />
        </div>
      </div>
    </section>
  );
}
