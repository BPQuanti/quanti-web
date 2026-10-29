import { Compass, Radio, Shield } from "lucide-react";

const PILLARS = [
  {
    title: "You name now and next",
    body: "Where you are, where you want to go. The morning 1% is a move on that vector—not a season badge.",
    icon: Compass,
  },
  {
    title: "Sleep, Screens, Calendar, Spend, Place, Voice",
    body: "Meeting density and Home/Work/Gym context sit next to screen habits, spend, and 15-second voice checks—connected on your phone into one morning rule.",
    icon: Radio,
  },
  {
    title: "100% On-Device Sandbox",
    body: "Zero external server logs of raw health or bank data. Processing stays in the iOS sandbox. Nothing sold. Nothing transmitted raw.",
    icon: Shield,
    accent: true,
  },
];

export default function ArchitectureBanner() {
  return (
    <section className="mt-16 text-slate-50" aria-labelledby="architecture-heading">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">Value Pillars</p>
        <h2 id="architecture-heading" className="mt-3 text-3xl font-semibold tracking-tight">
          Stay in control. Signals stay on your phone.
        </h2>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {PILLARS.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <article
              key={pillar.title}
              className={`rounded-2xl border p-6 shadow-[0_0_20px_rgba(99,102,241,0.08)] ${
                pillar.accent
                  ? "border-emerald-400/30 bg-emerald-500/10"
                  : "border-slate-800 bg-slate-900/70"
              }`}
            >
              <div
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${
                  pillar.accent
                    ? "border-emerald-400/30 bg-emerald-400/10"
                    : "border-indigo-400/25 bg-indigo-400/10"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${pillar.accent ? "text-emerald-300" : "text-indigo-300"}`}
                  strokeWidth={1.75}
                />
              </div>
              <h3 className="mt-4 text-lg font-semibold tracking-tight">{pillar.title}</h3>
              <p className={`mt-3 text-sm leading-6 ${pillar.accent ? "text-emerald-100/80" : "text-slate-400"}`}>
                {pillar.body}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
