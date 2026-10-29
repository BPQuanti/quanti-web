export default function HeroProductPreview() {
  return (
    <div className="flex w-full flex-col items-stretch gap-4 lg:items-end">
      <article className="w-full rounded-2xl border border-indigo-400/25 bg-slate-900/80 p-5 shadow-[0_0_40px_rgba(99,102,241,0.16)] backdrop-blur-md">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-300">
          1% Daily Directive // Oct 11
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-200 sm:text-[15px]">
          Building toward first revenue. Sleep was short. Yesterday you shifted.
        </p>
        <div className="mt-4 rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-3.5 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-300">Today’s 1%</p>
          <p className="mt-1.5 text-sm leading-6 text-slate-50">
            Ship one paid-path screen before noon, then stop.
          </p>
        </div>
      </article>

      <div className="relative mx-auto w-[228px] sm:w-[248px] lg:mx-0" aria-hidden>
        <div className="pointer-events-none absolute -inset-6 rounded-[3rem] bg-indigo-500/20 blur-3xl" />
        <div className="relative rounded-[2.35rem] border border-slate-700 bg-slate-950 p-2 shadow-[0_0_40px_rgba(99,102,241,0.2)]">
          <div className="relative overflow-hidden rounded-[1.95rem] bg-gradient-to-b from-indigo-950 via-slate-950 to-slate-950 px-3 pb-3 pt-6">
            <div className="absolute left-1/2 top-2 h-[16px] w-[64px] -translate-x-1/2 rounded-full bg-black" />
            <p className="mt-4 text-center text-[10px] font-medium tracking-wide text-slate-300">Saturday, October 11</p>
            <p className="text-center text-[40px] font-semibold leading-none tracking-tight text-slate-50">7:12</p>

            <div className="mt-5 rounded-[20px] border border-white/10 bg-slate-900/80 p-3.5 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-indigo-300">Quanti</p>
                <p className="text-[9px] font-semibold text-emerald-300">1%</p>
              </div>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                Building → first revenue
              </p>
              <p className="mt-2 text-[13px] font-semibold leading-snug text-slate-50">One paid-path screen · before noon</p>
              <p className="mt-1 text-[10px] leading-4 text-slate-400">Sleep was short. Yesterday shifted. Then stop.</p>
            </div>
            <div className="mx-auto mt-6 h-1 w-20 rounded-full bg-white/25" />
          </div>
        </div>
      </div>
    </div>
  );
}
