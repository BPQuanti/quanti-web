export default function Purpose() {
  return (
    <section
      className="relative mt-16 overflow-hidden rounded-[28px] border border-slate-800/80 bg-[#0D0D0D] px-4 py-12 text-slate-50 sm:px-8 sm:py-14"
      aria-labelledby="purpose-heading"
    >
      <div className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-indigo-600/20 blur-3xl" />
      <article className="relative mx-auto max-w-3xl rounded-2xl border border-indigo-400/30 bg-slate-950/80 p-6 text-center shadow-[0_0_36px_rgba(99,102,241,0.16)] sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">Definition</p>
        <h2 id="purpose-heading" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          What is Quanti for?
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
          Quanti is a privacy-first behavioral operating system built for people who want to stay present and
          intentional without managing 20 different tracking apps. It bridges the gap between cold health metrics and
          how you actually feel, giving you personalized guidance for whatever season of life you are in.
        </p>
      </article>
    </section>
  );
}
