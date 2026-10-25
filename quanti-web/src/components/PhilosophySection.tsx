import { Hourglass, Mic, ScanEye, Timer } from "lucide-react";

const PILLARS = [
  {
    title: "Desirable Friction",
    body: "We intentionally gate inputs with micro-pauses so your actions are routed through deliberate choice rather than automated reflex loops.",
    icon: Hourglass,
  },
  {
    title: "Local Constraints",
    body: "You cannot execute a 6-month strategy with a fatigued morning brain. We shrink macro goals down to a single execution rule for the next 24 hours.",
    icon: Timer,
  },
  {
    title: "Subjective Context",
    body: "Biometrics are incomplete without your lived reality. We pair passive background telemetry with your morning voice to prevent dashboard fatigue.",
    icon: Mic,
  },
  {
    title: "The Mirror Effect",
    body: "Data isn't neutral—it depends on what you care about. Your baseline is filtered through your selected Focus Arc to deliver guidance tailored to your active priority.",
    icon: ScanEye,
  },
] as const;

export default function PhilosophySection() {
  return (
    <section
      className="relative mt-16 overflow-hidden rounded-[28px] border border-slate-800/80 bg-[#0D0D0D] px-4 py-12 text-slate-50 sm:px-8 sm:py-14"
      aria-labelledby="philosophy-heading"
    >
      <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="relative mx-auto max-w-5xl">
        <div className="max-w-3xl">
          <p className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-300">
            Our Philosophy
          </p>
          <h2
            id="philosophy-heading"
            className="mt-5 text-3xl font-semibold tracking-tight text-neutral-100 sm:text-4xl"
          >
            Built for Agency, Not Attention.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-400 sm:text-lg">
            Modern software optimizes for continuous engagement and cognitive noise. Quanti is designed as a quiet,
            privacy-first decision mirror—giving you clarity and getting out of the way.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article
                key={pillar.title}
                className="rounded-2xl border border-white/10 bg-neutral-900/50 p-5 shadow-2xl backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-white/20"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-indigo-200">
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-tight text-neutral-100">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">{pillar.body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
