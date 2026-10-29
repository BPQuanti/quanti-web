"use client";

import { useId, useState } from "react";
import { Search } from "lucide-react";
import type { DestinationId } from "@/components/IPhoneFocusFrame";

const SCENES: Record<
  DestinationId,
  {
    now: string;
    next: string;
    directive: string;
    why: string;
    signals: string[];
  }
> = {
  "own-place": {
    now: "Living at home",
    next: "Own place",
    directive: "Send the one listing follow-up, then stop. Twenty minutes toward your own place.",
    why: "Yesterday was partial. Sleep is short, so the 1% is smaller and named.",
    signals: [
      "Destination: at home → own place",
      "Sleep: 5.8h, HRV down vs your week",
      "Yesterday: partial on the listing email",
      "Voice: 'The listing is still open; I froze.'",
    ],
  },
  "first-revenue": {
    now: "Building the app",
    next: "First revenue",
    directive: "Ship one paid-path screen before noon. That is today’s 1% toward first revenue.",
    why: "Recovery is fine. The blank was the named object—not another planning hour.",
    signals: [
      "Destination: building → first revenue",
      "Sleep: 7.6h, recovery usable",
      "Yesterday: executed a smaller ship",
      "Voice: 'I keep polishing instead of charging.'",
    ],
  },
  "present-evenings": {
    now: "Days run long",
    next: "Present evenings",
    directive: "Hard stop at 6:30. One protected hour at home—today’s 1% toward present evenings.",
    why: "Yesterday you shifted. The move is friction-free: a clock, not a new plot.",
    signals: [
      "Destination: stretched days → present evenings",
      "Calendar density: stacked past 7 PM",
      "Yesterday: shifted the shutdown",
      "Voice: 'Pickup chaos ate the evening.'",
    ],
  },
};

type TraceSignalCardProps = {
  destination?: DestinationId;
  arc?: DestinationId;
  compact?: boolean;
  dateLabel?: string;
};

export default function TraceSignalCard({
  destination,
  arc,
  compact = false,
  dateLabel = "Oct 12",
}: TraceSignalCardProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const scene = SCENES[destination ?? arc ?? "own-place"];

  return (
    <article
      className={`w-full rounded-2xl border border-indigo-400/25 bg-slate-900/80 shadow-[0_0_40px_rgba(99,102,241,0.16)] backdrop-blur-md ${
        compact ? "p-3" : "p-5"
      }`}
    >
      {compact ? (
        <div className="font-mono font-semibold uppercase tracking-[0.12em] text-indigo-300">
          <p className="text-[9px] leading-4">1% Daily Directive // {dateLabel}</p>
          <p className="mt-0.5 text-[9px] leading-4">
            {scene.now} → {scene.next}
          </p>
        </div>
      ) : (
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-300">
          1% Daily Directive // {dateLabel} • {scene.now} → {scene.next}
        </p>
      )}
      <p
        key={scene.next}
        className={`mt-3 font-semibold text-slate-50 ${
          compact ? "text-[13px] leading-5" : "mt-4 text-base leading-7 sm:text-lg"
        }`}
      >
        {scene.directive}
      </p>
      <p className={`mt-2 text-indigo-200/90 ${compact ? "text-[11px] leading-4" : "text-sm leading-6"}`}>{scene.why}</p>

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
        {compact ? "Why this 1% — tap" : "Why this 1% — see what the synthesizer used"}
      </button>

      <div
        id={panelId}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className={`overflow-hidden ${open ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}>
          <div className={`rounded-xl border border-slate-700 bg-slate-950/80 text-left ${compact ? "mt-3 p-3" : "mt-4 p-4"}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-300">What the synthesizer used</p>
            <ul className={`mt-3 space-y-2 text-slate-300 ${compact ? "text-[11px] leading-5" : "text-sm leading-6"}`}>
              {scene.signals.map((signal) => (
                <li key={signal}>{signal}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </article>
  );
}
