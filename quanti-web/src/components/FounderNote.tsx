export default function FounderNote() {
  return (
    <section aria-label="Founder note" className="pb-4">
      <div className="mx-auto my-16 max-w-3xl rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-8 text-center shadow-[0_0_30px_rgba(124,58,237,0.1)] backdrop-blur-md md:p-10">
        <blockquote className="text-xl font-medium leading-relaxed tracking-tight text-zinc-100 md:text-2xl">
          You generate{" "}
          <span className="font-semibold text-violet-400">millions of data points</span> every year across your health,
          spend, and habits. Quanti uses AI to{" "}
          <span className="font-semibold text-violet-400">connect those dots automatically</span>
          —unlocking the <span className="font-semibold text-violet-400">future of personal insight</span> before anyone
          else.
        </blockquote>
        <p className="mt-4 font-mono text-sm uppercase tracking-wider text-zinc-400">— Brian, Founder @ Quanti</p>
      </div>
    </section>
  );
}
