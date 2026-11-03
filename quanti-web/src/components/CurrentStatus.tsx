const STATUS = [
  {
    label: "Now",
    title: "Private iOS TestFlight is live",
    body: "Invite-only, capped cohort. We send Apple TestFlight links in small batches from this waitlist.",
  },
  {
    label: "The app",
    title: "One Active Destination. One 1% a day.",
    body: "A 15–20 word verb-first physical action. Optional HealthKit sleep/HRV sizes the window. A skippable 10–15s voice check fills one blank.",
  },
  {
    label: "The loop",
    title: "Mark tonight. Tomorrow is already written.",
    body: "Evening mark: Executed, Partial, or Shifted. That mark writes the next card. Achieved archives the destination.",
  },
] as const;

export default function CurrentStatus() {
  return (
    <section
      className="relative mt-16 overflow-hidden rounded-[28px] border border-white/10 bg-[#0D0D0D] px-4 py-12 text-white sm:px-8 sm:py-14"
      aria-labelledby="current-status-heading"
    >
      <div className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="relative mx-auto max-w-5xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
            Current status
          </p>
          <h2
            id="current-status-heading"
            className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl"
          >
            Quanti is a daily execution compass.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/55 sm:text-lg">
            You name one thing you want true. Each day you get one checkable 1%. Mark it at night. That is the whole product.
          </p>
        </div>

        <div className="mt-10 grid gap-3 md:grid-cols-3">
          {STATUS.map((item) => (
            <article key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-300">{item.label}</p>
              <h3 className="mt-2 text-lg font-semibold tracking-tight text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
