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
          Quanti turns your raw daily data into an intelligent strategy for whatever life season you&apos;re in.
        </p>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
          By pairing passive telemetry across your health (Apple Watch, Oura, WHOOP), schedule, and bank activity with a
          15-second morning voice check, Quanti connects cold metrics with how you actually feel—delivering one clear
          directive each day so you stay present, intentional, and in total alignment.
        </p>
      </article>
    </section>
  );
}
