"use client";

import { useCallback, useEffect, useState, type PointerEvent } from "react";
import TraceSignalCard from "@/components/TraceSignalCard";

export type FocusArcId = "recovery" | "deep-work" | "capital";

export const ARC_OPTIONS: { id: FocusArcId; label: string; glyph: string }[] = [
  { id: "recovery", label: "Recovery Arc", glyph: "🧘" },
  { id: "deep-work", label: "Deep Work Arc", glyph: "🧠" },
  { id: "capital", label: "Capital Arc", glyph: "💰" },
];

type IPhoneFocusFrameProps = {
  arc: FocusArcId;
  onArcChange?: (arc: FocusArcId) => void;
};

function formatLockscreenDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatLockscreenTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function IPhoneFocusFrame({ arc, onArcChange }: IPhoneFocusFrameProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

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
        className="relative w-[268px] sm:w-[300px] [perspective:1200px]"
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
              <div className="relative flex min-h-[560px] flex-col px-3 pb-4 pt-3">
                <div className="absolute left-1/2 top-2 z-10 h-[22px] w-[86px] -translate-x-1/2 rounded-full bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]" />

                <div className="mt-8 flex items-start justify-between gap-3 px-1">
                  <div>
                    <p className="text-[10px] font-medium tracking-wide text-zinc-400" suppressHydrationWarning>
                      {now ? formatLockscreenDate(now) : "\u00a0"}
                    </p>
                    <p className="text-[12px] font-semibold text-zinc-200" suppressHydrationWarning>
                      {now ? formatLockscreenTime(now) : "\u00a0"}
                    </p>
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

                <div className="mt-4 min-h-0 flex-1 overflow-y-auto pb-2">
                  <TraceSignalCard arc={arc} compact dateLabel={now ? formatLockscreenDate(now) : undefined} />
                </div>

                <div className="mt-2 grid grid-cols-3 gap-1.5">
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
                        {option.id === "deep-work" ? "Deep Work" : option.id === "capital" ? "Capital" : "Recovery"}
                      </button>
                    );
                  })}
                </div>

                <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-white/20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
