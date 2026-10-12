import { Lock } from "lucide-react";
import TraceSignalCard from "@/components/TraceSignalCard";
import WaitlistCapture from "@/components/WaitlistCapture";

const ARCS = [
  { id: "recovery", label: "Recovery Arc", glyph: "🧘" },
  { id: "deep-work", label: "Deep Work Arc", glyph: "🧠", active: true },
  { id: "capital", label: "Capital Arc", glyph: "💰" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-slate-800/80 bg-slate-950 px-4 py-10 text-slate-50 sm:px-8 sm:py-14">
      <div className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-indigo-600/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="text-left">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-5xl sm:leading-[1.08] lg:text-[3.15rem]">
            An automated behavioral GPS for whatever arc you&apos;re in.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
            Find out exactly which late-night habit is destroying your morning focus. Quanti passively correlates your
            HealthKit, Screen Time, and Plaid signals into a single daily action. Zero manual logging.
          </p>
          <div id="waitlist" className="mt-8 w-full max-w-xl scroll-mt-24">
            <div className="mb-3 flex flex-wrap gap-2" aria-label="Arc selector preview">
              {ARCS.map((arc) => (
                <span
                  key={arc.id}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    arc.active
                      ? "border-indigo-300/50 bg-indigo-500/20 text-indigo-100 shadow-[0_0_18px_rgba(99,102,241,0.28)]"
                      : "border-slate-700 bg-slate-900/80 text-slate-300"
                  }`}
                >
                  <span aria-hidden>{arc.glyph}</span>
                  {arc.label}
                </span>
              ))}
            </div>
            <WaitlistCapture emailFieldId="hero-waitlist-email" submitLabel="Request Early Access" />
            <p className="mt-3 flex items-start gap-2 text-sm font-semibold leading-6 text-emerald-100">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" strokeWidth={2} />
              <span>
                <span aria-hidden>🔒 </span>
                100% On-Device Processing. We never store, transmit, or sell your raw health or bank data.
              </span>
            </p>
          </div>
        </div>

        <TraceSignalCard />
      </div>
    </section>
  );
}
