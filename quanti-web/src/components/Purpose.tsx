export default function Purpose() {
  return (
    <section
      className="relative mt-16 overflow-hidden rounded-[28px] border border-slate-800/80 bg-[#0D0D0D] px-4 py-12 text-slate-50 sm:px-8 sm:py-14"
      aria-labelledby="purpose-heading"
    >
      <div className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-indigo-600/20 blur-3xl" />
      <article className="relative mx-auto max-w-3xl rounded-2xl border border-indigo-400/30 bg-slate-950/80 px-6 py-12 text-center shadow-[0_0_36px_rgba(99,102,241,0.16)] sm:px-10 sm:py-14">
        <h2
          id="purpose-heading"
          className="text-sm font-semibold uppercase tracking-wide text-indigo-300"
        >
          What is Quanti?
        </h2>
        <p className="mt-3 text-2xl font-bold leading-snug tracking-tight text-slate-50 sm:text-3xl">
          Your daily execution compass.
        </p>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
          You name an Active Target — one checkable object, no calendar deadline. Each morning a 10-second voice check-in plus optional HealthKit becomes
          one 15-word action card. Evening outcome mark: Executed / Partial / Shifted. Zero-dashboard. Under 30 seconds
          of daily screen time.
        </p>
      </article>
    </section>
  );
}
