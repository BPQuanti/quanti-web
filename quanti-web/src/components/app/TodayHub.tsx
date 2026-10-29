"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const SIGNALS = [
  "Destination: own place",
  " Health: Low HRV (optional)",
  "Yesterday: shifted",
] as const;

type TabId = "today" | "arcs" | "privacy";

export default function TodayHub() {
  const [tab, setTab] = useState<TabId>("today");
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [reflectionOpen, setReflectionOpen] = useState(false);
  const [reflection, setReflection] = useState<"executed" | "partial" | "shifted" | null>(null);

  useEffect(() => {
    if (!isRecording) {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      setIsRecording(false);
      setHasRecorded(true);
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [isRecording]);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-[#09090B] font-sans text-neutral-100 shadow-2xl sm:min-h-[844px] sm:border-x sm:border-white/10">
      <header className="flex items-center justify-between border-b border-white/5 px-6 pb-4 pt-6">
        <div>
          <Image
            src="/logo-full.svg"
            alt="Quanti"
            width={148}
            height={36}
            unoptimized
            className="h-7 w-auto object-contain object-left"
          />
          <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-neutral-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
            Destination GPS
          </p>
        </div>
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
          At home → own place
        </span>
      </header>

      <main className="flex flex-1 flex-col px-6 py-6">
        {tab === "today" ? (
          !hasRecorded ? (
            <div className="flex flex-1 flex-col justify-center space-y-8 text-center">
              <div>
                <span className="mb-2 block font-mono text-xs uppercase tracking-widest text-neutral-400">
                  Morning Context
                </span>
                <h2 className="text-2xl font-semibold tracking-tight text-neutral-100">
                  What blocked yesterday’s 1% toward your own place?
                </h2>
              </div>

              <div className="flex flex-wrap justify-center gap-2 font-mono text-[11px] text-neutral-400">
                {SIGNALS.map((signal) => (
                  <span key={signal} className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1">
                    {signal}
                  </span>
                ))}
              </div>

              <div className="py-4">
                <button
                  type="button"
                  onClick={() => setIsRecording(true)}
                  disabled={isRecording}
                  aria-label="Tap to record 15s voice check"
                  className={`relative mx-auto flex h-32 w-32 flex-col items-center justify-center rounded-full border shadow-lg transition-all duration-300 ${
                    isRecording
                      ? "scale-105 animate-pulse border-2 border-amber-500 bg-amber-500/20"
                      : "border-white/20 bg-neutral-900 hover:border-amber-400/50 hover:bg-neutral-800"
                  }`}
                >
                  {!isRecording ? (
                    <span
                      className="pointer-events-none absolute inset-0 rounded-full border border-amber-400/25 animate-ping"
                      aria-hidden
                    />
                  ) : null}
                  <span className="relative mb-1 text-3xl" aria-hidden>
                    🎙️
                  </span>
                  <span className="relative px-3 text-[11px] font-medium leading-4 text-neutral-300">
                    {isRecording ? "Listening..." : "Tap to record 15s voice check"}
                  </span>
                </button>
                <p className="mt-3 font-mono text-xs text-neutral-500">15s — fills what sensors cannot see</p>
              </div>

              <div className="flex justify-center gap-3 border-t border-white/5 pt-4 text-xs text-neutral-400">
                <button
                  type="button"
                  onClick={() => setHasRecorded(true)}
                  className="rounded-full border border-white/10 px-3 py-1.5 transition hover:border-white/30 hover:text-white"
                >
                  💬 Quick Text
                </button>
                <button
                  type="button"
                  onClick={() => setHasRecorded(true)}
                  className="rounded-full border border-white/10 px-3 py-1.5 transition hover:border-white/30 hover:text-white"
                >
                  Skip — blunter card
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span className="font-mono uppercase tracking-wider">Today&apos;s Directive</span>
                <span>7:15 AM</span>
              </div>

              <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs italic text-amber-300/90">
                🎙️ &ldquo;The listing is still open. I froze.&rdquo;
              </p>

              <article className="space-y-4 rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-xl">
                <p className="text-base font-medium leading-relaxed text-neutral-100">
                  &ldquo;Send one listing follow-up in 20 minutes, then stop. Yesterday slipped, so today’s 1% is
                  smaller and named.&rdquo;
                </p>
                <div className="flex items-center justify-between border-t border-white/5 pt-3 font-mono text-[11px] text-neutral-400">
                  <span>SIGNAL SYNTHESIS</span>
                  <span>Watch HRV + Voice Context</span>
                </div>
              </article>

              <div className="rounded-xl border border-white/5 bg-white/[0.02]">
                <button
                  type="button"
                  onClick={() => setReflectionOpen((open) => !open)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-neutral-400"
                  aria-expanded={reflectionOpen}
                >
                  Executed, partial, or shifted?
                  <span className="text-neutral-600" aria-hidden>
                    {reflectionOpen ? "–" : "+"}
                  </span>
                </button>
                {reflectionOpen ? (
                  <div className="flex gap-2 border-t border-white/5 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setReflection("executed")}
                      className={`rounded-full border px-3 py-1.5 text-xs transition ${
                        reflection === "executed"
                          ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                          : "border-white/10 text-neutral-400 hover:text-white"
                      }`}
                    >
                      Executed
                    </button>
                    <button
                      type="button"
                      onClick={() => setReflection("partial")}
                      className={`rounded-full border px-3 py-1.5 text-xs transition ${
                        reflection === "partial"
                          ? "border-sky-400/40 bg-sky-500/15 text-sky-200"
                          : "border-white/10 text-neutral-400 hover:text-white"
                      }`}
                    >
                      Partial
                    </button>
                    <button
                      type="button"
                      onClick={() => setReflection("shifted")}
                      className={`rounded-full border px-3 py-1.5 text-xs transition ${
                        reflection === "shifted"
                          ? "border-amber-400/40 bg-amber-500/15 text-amber-200"
                          : "border-white/10 text-neutral-400 hover:text-white"
                      }`}
                    >
                      Shifted
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          )
        ) : null}

        {tab === "arcs" ? (
          <div className="flex flex-1 flex-col justify-center space-y-4 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-neutral-400">Destination</p>
            <h2 className="text-2xl font-semibold tracking-tight">Where are you going?</h2>
            <p className="text-sm leading-6 text-neutral-400">
              Name a finish line someone else could check. Vague goals make vague cards. Named targets make named moves.
            </p>
          </div>
        ) : null}

        {tab === "privacy" ? (
          <div className="flex flex-1 flex-col justify-center space-y-4 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-neutral-400">Privacy</p>
            <h2 className="text-2xl font-semibold tracking-tight">HealthKit optional. Voice not retained.</h2>
            <p className="text-sm leading-6 text-neutral-400">
              Voice processed securely in-memory via encrypted edge transcription with zero data retention. Sleep and HRV
              only size today&apos;s push. Nothing is sold.
            </p>
          </div>
        ) : null}
      </main>

      <nav className="grid grid-cols-3 border-t border-white/5 px-2 pb-6 pt-2" aria-label="Primary">
        {(
          [
            { id: "today", label: "Today" },
            { id: "arcs", label: "Destination" },
            { id: "privacy", label: "Privacy" },
          ] as const
        ).map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-xl px-2 py-2 text-[11px] font-medium leading-4 transition ${
                active ? "bg-white/5 text-white" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
