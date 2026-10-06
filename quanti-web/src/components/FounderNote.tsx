export default function FounderNote() {
  return (
    <section aria-label="Founder note">
      <div className="mx-auto my-12 max-w-3xl rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-8 text-center shadow-[0_0_30px_rgba(124,58,237,0.1)] backdrop-blur-md">
        <blockquote className="text-xl font-medium leading-relaxed tracking-tight text-zinc-100 md:text-2xl">
          AI built to{" "}
          <span className="font-semibold text-violet-400">connect the dots</span> you don&apos;t have time to track.
          From your health to your money, Quanti reveals the{" "}
          <span className="font-semibold text-violet-400">full story of your year</span>
          —unlocked first by our <span className="font-semibold text-violet-400">OG members</span>.
        </blockquote>
        <p className="mt-4 font-mono text-sm uppercase tracking-wider text-zinc-400">— Brian, Founder @ Quanti</p>
      </div>
    </section>
  );
}
