"use client";

import { useRef } from "react";

const CAPABILITIES = [
  { icon: "🏠", label: "Now → next", detail: "The plot is the destination you named" },
  { icon: "⌚", label: "Overnight size", detail: "Sleep and HRV only bound how hard today can go" },
  { icon: "🎙️", label: "One blank", detail: "15s fills what sensors cannot see" },
  { icon: "📅", label: "Protect the window", detail: "Meetings cannot steal the 1% toward next" },
  { icon: "💳", label: "Keep the 1%", detail: "A slip does not rewrite where you are going" },
  { icon: "✓", label: "Executed / partial / shifted", detail: "Yesterday’s mark writes tomorrow’s 1%" },
  { icon: "🎯", label: "One card", detail: "A named action, then stop" },
] as const;

export default function SignalCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; startX: number; scrollLeft: number } | null>(null);

  return (
    <section
      className="relative mt-16 overflow-hidden rounded-[28px] border border-slate-800/80 bg-[#0D0D0D] py-10 text-slate-50"
      aria-labelledby="signal-carousel-heading"
    >
      <p
        id="signal-carousel-heading"
        className="mb-6 text-center font-mono text-xs uppercase tracking-widest text-neutral-400"
      >
        Signals size the window. Destination stays the plot.
      </p>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#0D0D0D] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#0D0D0D] to-transparent" />

        <div
          ref={trackRef}
          className="flex cursor-grab gap-4 overflow-x-auto scroll-smooth px-8 py-2 active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onPointerDown={(event) => {
            const track = trackRef.current;
            if (!track) {
              return;
            }
            dragRef.current = {
              pointerId: event.pointerId,
              startX: event.clientX,
              scrollLeft: track.scrollLeft,
            };
            track.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const track = trackRef.current;
            const drag = dragRef.current;
            if (!track || !drag || drag.pointerId !== event.pointerId) {
              return;
            }
            track.scrollLeft = drag.scrollLeft - (event.clientX - drag.startX);
          }}
          onPointerUp={(event) => {
            if (dragRef.current?.pointerId === event.pointerId) {
              dragRef.current = null;
            }
          }}
          onPointerCancel={() => {
            dragRef.current = null;
          }}
        >
          {CAPABILITIES.map((cap) => (
            <article
              key={cap.label}
              className="w-64 flex-none rounded-xl border border-white/10 bg-neutral-900/60 p-4 shadow-md transition-all duration-200 hover:border-white/20"
            >
              <div className="mb-2 flex items-center gap-2.5">
                <span className="text-lg" aria-hidden>
                  {cap.icon}
                </span>
                <h3 className="text-sm font-semibold text-neutral-200">{cap.label}</h3>
              </div>
              <p className="text-xs leading-normal text-neutral-400">{cap.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
