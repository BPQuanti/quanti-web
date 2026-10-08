export default function FounderNote() {
  return (
    <section aria-label="Founder note" className="mt-16">
      <div className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center shadow-[0_0_40px_rgba(99,102,241,0.1)] backdrop-blur-md md:p-10">
        <div className="pointer-events-none absolute -left-10 top-0 h-28 w-28 rounded-full bg-indigo-500/15 blur-3xl" />
        <p className="text-5xl font-serif leading-none text-indigo-400/50" aria-hidden>
          “
        </p>
        <blockquote className="mt-2 text-xl font-medium leading-relaxed tracking-tight text-slate-50 md:text-2xl">
          You generate millions of data points every year across your health, spend, and habits—and drowning in raw
          charts won&apos;t help you build a better life. Quanti turns that noise into one clear, high-leverage move
          every single morning.
        </blockquote>
        <p className="mt-5 font-mono text-sm uppercase tracking-wider text-slate-400">— Brian, Founder @ Quanti</p>
      </div>
    </section>
  );
}
