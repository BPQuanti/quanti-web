"use client";

import { useId, useState } from "react";
import { Search } from "lucide-react";
import type { FocusArcId } from "@/components/IPhoneFocusFrame";

const ARC_TRACES: Record<
  FocusArcId,
  {
    label: string;
    directive: string;
    signals: string[];
    impact: string;
  }
> = {
  "founder-sprint": {
    label: "Founder Sprint",
    directive: "5-second pause before late Slack. Keep the 9:00 AM decision window.",
    signals: [
      "Sleep: recovery down vs your usual week",
      "Screens: Slack + social after 10:12 PM",
      "Calendar: back-to-back meetings until 6:40 PM",
      "Location: left the gym at 8:51 PM, home after 9:20",
      "Spend: late checkout when you were already tired",
      "Voice check: 'I was avoiding the hard email.'",
    ],
    impact: "A gentle speed bump, not a lock—you still choose. Pre-commit the morning block.",
  },
  "creative-flow": {
    label: "Creative Flow",
    directive: "Cap caffeine by 11:30 AM. Suggested 90-minute deep-work block—accept or skip.",
    signals: [
      "Sleep: you cooled down 2 hours later than usual",
      "Screens: high-stimulus apps after 10:00 PM",
      "Calendar: only one deep-work block, stacked after 3 PM",
      "Location: studio until 9:10 PM, then home",
      "Spend: late delivery $45.80 at 10:15 PM",
      "Voice check: 'I needed noise so I wouldn't sit with the draft.'",
    ],
    impact: "The voice check gives the why. The morning rule is a nudge, not a calendar takeover.",
  },
  "parenting-presence": {
    label: "Parenting Presence",
    directive: "Pause-screen on checkout after 8:30 PM. Keep surplus for tomorrow's 7:00 AM window.",
    signals: [
      "Spend: impulse delivery after bedtime",
      "Screens: checkout flows after 9:40 PM",
      "Calendar: school pickup + evening activities stacked",
      "Location: home after 7:05 PM, stayed home",
      "Sleep: wired late, slow to fall asleep",
      "Voice check: 'I was buying calm after bedtime chaos.'",
    ],
    impact: "A skippable pause. No app lock. You keep the last move.",
  },
};

type TraceSignalCardProps = {
  arc?: FocusArcId;
  compact?: boolean;
  dateLabel?: string;
};

export default function TraceSignalCard({
  arc = "founder-sprint",
  compact = false,
  dateLabel = "Oct 12",
}: TraceSignalCardProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const scene = ARC_TRACES[arc];

  return (
    <article
      className={`w-full rounded-2xl border border-indigo-400/25 bg-slate-900/80 shadow-[0_0_40px_rgba(99,102,241,0.16)] backdrop-blur-md ${
        compact ? "p-3" : "p-5"
      }`}
    >
      {compact ? (
        <div className="font-mono font-semibold uppercase tracking-[0.12em] text-indigo-300">
          <p className="text-[9px] leading-4">1% Daily Directive // {dateLabel}</p>
          <p className="mt-0.5 text-[9px] leading-4">Season: {scene.label}</p>
        </div>
      ) : (
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-300">
          1% Daily Directive // {dateLabel} • Season: {scene.label}
        </p>
      )}
      <p
        key={scene.label}
        className={`mt-3 font-semibold text-slate-50 ${
          compact ? "text-[13px] leading-5" : "mt-4 text-base leading-7 sm:text-lg"
        }`}
      >
        {scene.directive}
      </p>

      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-300/50 bg-indigo-500/20 font-semibold text-indigo-100 shadow-[0_0_28px_rgba(99,102,241,0.35)] transition hover:bg-indigo-500/30 hover:shadow-[0_0_36px_rgba(99,102,241,0.5)] active:scale-[0.99] ${
          compact ? "px-2.5 py-2.5 text-[11px] leading-4" : "mt-5 px-4 py-3 text-sm"
        }`}
      >
        <Search className={compact ? "h-3.5 w-3.5 shrink-0" : "h-4 w-4"} strokeWidth={2} />
        {compact ? "Trace Signal — tap to reveal" : "Trace Signal — Click to reveal pattern"}
      </button>

      <div
        id={panelId}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className={`overflow-hidden ${open ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}>
          <div className={`rounded-xl border border-slate-700 bg-slate-950/80 text-left ${compact ? "mt-3 p-3" : "mt-4 p-4"}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-300">Connected signals</p>
            <ul className={`mt-3 space-y-2 text-slate-300 ${compact ? "text-[11px] leading-5" : "text-sm leading-6"}`}>
              {scene.signals.map((signal) => (
                <li key={signal}>{signal}</li>
              ))}
            </ul>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-200">Gentle speed bump</p>
            <p className={`mt-1.5 text-slate-300 ${compact ? "text-[11px] leading-5" : "text-sm leading-6"}`}>{scene.impact}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
