"use client";

import { useCallback, useState, type PointerEvent } from "react";

export type FocusArcId = "recovery" | "deep-work" | "capital";

type ArcScene = {
  id: FocusArcId;
  label: string;
  mode: string;
  glyph: string;
  directive: string;
  metrics: { name: string; value: number; tone: string }[];
};

const SCENES: Record<FocusArcId, ArcScene> = {
  recovery: {
    id: "recovery",
    label: "Recovery Arc",
    mode: "Recovery Mode",
    glyph: "🧘",
    directive:
      "Recovery Arc: Restrict Slack & high-stimulus inputs after 8:30 PM. Target HRV recovery peak.",
    metrics: [
      { name: "Recovery", value: 86, tone: "bg-emerald-400" },
      { name: "Deep Work", value: 42, tone: "bg-indigo-400" },
      { name: "Capital", value: 51, tone: "bg-amber-400" },
    ],
  },
  "deep-work": {
    id: "deep-work",
    label: "Deep Work Arc",
    mode: "Deep Work Mode",
    glyph: "🧠",
    directive:
      "Deep Work Arc: Shift last caloric intake 45 mins earlier → Reclaim 15ms HRV. Cap caffeine at 11:30 AM.",
    metrics: [
      { name: "Recovery", value: 58, tone: "bg-emerald-400" },
      { name: "Deep Work", value: 91, tone: "bg-indigo-400" },
      { name: "Capital", value: 44, tone: "bg-amber-400" },
    ],
  },
  capital: {
    id: "capital",
    label: "Capital Arc",
    mode: "Capital Sync",
    glyph: "💰",
    directive:
      "Capital Arc: Block impulse delivery spend after 9:00 PM. Route surplus to the 9:00 AM decision window.",
    metrics: [
      { name: "Recovery", value: 61, tone: "bg-emerald-400" },
      { name: "Deep Work", value: 55, tone: "bg-indigo-400" },
      { name: "Capital", value: 84, tone: "bg-amber-400" },
    ],
  },
};

export const ARC_OPTIONS: { id: FocusArcId; label: string; glyph: string }[] = [
  { id: "recovery", label: "Recovery Arc", glyph: "🧘" },
  { id: "deep-work", label: "Deep Work Arc", glyph: "🧠" },
  { id: "capital", label: "Capital Arc", glyph: "💰" },
];

type IPhoneFocusFrameProps = {
  arc: FocusArcId;
  onArcChange?: (arc: FocusArcId) => void;
};

export default function IPhoneFocusFrame({ arc, onArcChange }: IPhoneFocusFrameProps) {
  const scene = SCENES[arc];
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handlePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (window.matchMedia("(pointer: coarse)").matches) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -10, y: px * 12 });
  }, []);

  const resetTilt = useCallback(() => setTilt({ x: 0, y: 0 }), []);

  return (
    <div className="flex w-full flex-col items-center lg:items-end">
      <div
        className="relative w-[232px] sm:w-[260px] [perspective:1200px]"
        onPointerMove={handlePointerMove}
        onPointerLeave={resetTilt}
      >
        <div className="pointer-events-none absolute -inset-8 rounded-[3rem] bg-indigo-500/20 blur-3xl" />
        <div
          className="relative origin-center transition-transform duration-150 ease-out will-change-transform [transform-style:preserve-3d]"
          style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
        >
          <div className="rounded-[2.55rem] border border-white/10 bg-[#0D0D0D] p-[7px] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_60px_rgba(0,0,0,0.55),0_0_40px_rgba(99,102,241,0.18)]">
            <div className="relative overflow-hidden rounded-[2.15rem] bg-[#0D0D0D]">
              <div className="relative aspect-[9/19.4] min-h-[490px] px-3 pb-4 pt-3">
                <div className="absolute left-1/2 top-2 z-10 h-[22px] w-[86px] -translate-x-1/2 rounded-full bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]" />

                <div className="mt-8 flex items-start justify-between gap-3 px-1">
                  <div>
                    <p className="text-[10px] font-medium tracking-wide text-zinc-400">Tue, Oct 13</p>
                    <p className="text-[12px] font-semibold text-zinc-200">7:12 AM</p>
                  </div>
                  <div className="flex min-w-0 flex-col items-end">
                    <p className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-emerald-300">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70" />
                        <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
                      </span>
                      Live
                    </p>
                    <p className="mt-0.5 max-w-[108px] text-right text-[7px] font-medium uppercase leading-3 tracking-[0.1em] text-zinc-500">
                      Quanti Telemetry Engine
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-zinc-900/80 p-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl transition duration-300 hover:border-indigo-400/35 hover:shadow-[0_0_28px_rgba(99,102,241,0.22)]">
                  <div className="flex items-center justify-between gap-2">
                    <p className="whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.14em] text-indigo-300">
                      Daily Focus
                    </p>
                    <span className="rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[8px] font-medium text-zinc-400">
                      {scene.glyph} {scene.mode}
                    </span>
                  </div>
                  <p
                    key={scene.id}
                    className="mt-3 text-[13px] font-semibold leading-5 text-zinc-50 transition-opacity duration-300"
                  >
                    {scene.directive}
                  </p>

                  <div className="mt-4 space-y-2.5">
                    {scene.metrics.map((metric) => (
                      <div key={metric.name}>
                        <div className="flex items-center justify-between text-[9px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                          <span>{metric.name}</span>
                          <span className="tabular-nums text-zinc-300">{metric.value}</span>
                        </div>
                        <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full ${metric.tone} transition-[width] duration-500 ease-out`}
                            style={{ width: `${metric.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="mt-3 whitespace-nowrap rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-1 text-[7px] font-semibold uppercase tracking-[0.1em] text-emerald-200">
                    Processed On-Device • Encrypted
                  </p>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-1.5">
                  {ARC_OPTIONS.map((option) => {
                    const active = option.id === arc;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => onArcChange?.(option.id)}
                        className={`rounded-full px-1 py-1.5 text-[8px] font-semibold uppercase tracking-wide transition ${
                          active
                            ? "border border-indigo-300/40 bg-indigo-500/25 text-indigo-100 shadow-[0_0_16px_rgba(99,102,241,0.35)]"
                            : "border border-white/10 bg-black/30 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                        }`}
                      >
                        {option.glyph} {option.id === "deep-work" ? "Deep Work" : option.id === "capital" ? "Capital" : "Recovery"}
                      </button>
                    );
                  })}
                </div>

                <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-white/20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
