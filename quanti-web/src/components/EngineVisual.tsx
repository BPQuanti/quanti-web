"use client";

import { useState } from "react";
import {
  ArrowDown,
  Calendar,
  CreditCard,
  MapPin,
  Mic,
  Activity,
  Sparkles,
} from "lucide-react";

const DESTINATIONS = [
  { id: "own-place", glyph: "🏠", label: "At home → own place" },
  { id: "first-revenue", glyph: "⚡", label: "Building → first revenue" },
  { id: "present-evenings", glyph: "🤍", label: "Stretched → present evenings" },
] as const;

type DestinationId = (typeof DESTINATIONS)[number]["id"] | "custom";

const PASSIVE = [
  { icon: Activity, label: "Apple Watch, Oura, WHOOP, or iPhone Health" },
  { icon: Calendar, label: "Calendar Density & Phone Usage" },
  { icon: CreditCard, label: "Bank & Credit Card Activity" },
  { icon: MapPin, label: "On-Device Location (Home, Work, Gym)" },
];

export default function EngineVisual() {
  const [destination, setDestination] = useState<DestinationId>("own-place");
  const [customFocus, setCustomFocus] = useState("");
  const selectedPreset = DESTINATIONS.find((item) => item.id === destination);
  const customLabel = customFocus.trim() || "where you want to go";
  const selectedLabel =
    destination === "custom" ? customLabel : (selectedPreset?.label ?? DESTINATIONS[0].label);

  return (
    <section
      className="relative mt-16 overflow-hidden rounded-[28px] border border-slate-800/80 bg-[#0D0D0D] px-4 py-12 text-slate-50 sm:px-8 sm:py-14"
      aria-labelledby="engine-visual-heading"
    >
      <div className="pointer-events-none absolute -right-10 top-8 h-64 w-64 rounded-full bg-violet-600/15 blur-3xl" />
      <div className="relative mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">The Signal Engine</p>
          <h2 id="engine-visual-heading" className="mt-3 text-3xl font-semibold tracking-tight">
            Destination + overnight signals + one blank = today&apos;s 1%.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            You name now and next. Telemetry only sizes how hard today can go. The 15-second check fills the one fact sensors cannot see.
          </p>
          <p className="mx-auto mt-4 max-w-2xl rounded-2xl border border-indigo-400/20 bg-indigo-500/10 px-4 py-3 text-sm leading-6 text-slate-300">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-300">
              Start with 1 signal. Expand whenever you&apos;re ready.
            </span>
            Launch release connects seamlessly with Apple Health and Calendar. You choose exactly which data sources to
            enable—start with just your morning voice check and add background signals as you go.
          </p>
        </div>

        <div className="mt-10 grid gap-3 lg:grid-cols-3">
          <article className="rounded-2xl border border-sky-400/25 bg-slate-950/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-300">Input A · Passive data</p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight">What happened</h3>
            <ul className="mt-4 space-y-3">
              {PASSIVE.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label} className="flex items-center gap-3 text-sm leading-6 text-slate-300">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-400/25 bg-sky-400/10 text-sky-300">
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    {item.label}
                  </li>
                );
              })}
            </ul>
          </article>

          <article className="rounded-2xl border border-rose-400/25 bg-slate-950/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-200">Input B · One blank</p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight">
              <span aria-hidden>🎙️</span> 15-Second Morning Check
            </h3>
            <div className="mt-4 flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-rose-400/30 bg-rose-400/10 text-rose-200">
                <Mic className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <p className="text-sm leading-6 text-slate-300">
                Answers the one fact sensors cannot see: why yesterday slipped, whether recovery is real, or the named
                next object.
              </p>
            </div>
            <p className="mt-4 rounded-full border border-rose-300/25 bg-rose-400/10 px-3 py-2 text-xs font-medium leading-5 text-rose-100">
              Quiet morning? A short note works. This is weather, not a new destination.
            </p>
          </article>

          <article className="rounded-2xl border border-indigo-400/25 bg-slate-950/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-300">Input C · Destination</p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight">Where you&apos;re going</h3>
            <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Example destinations">
              {DESTINATIONS.map((option) => {
                const selected = option.id === destination;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setDestination(option.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      selected
                        ? "border-indigo-300/50 bg-indigo-500/20 text-indigo-100"
                        : "border-slate-700 bg-slate-900/80 text-slate-300 hover:border-slate-500"
                    }`}
                  >
                    <span aria-hidden>{option.glyph}</span>
                    {option.label}
                  </button>
                );
              })}
            </div>
            <label className="mt-4 flex items-center gap-2 rounded-2xl border border-dashed border-indigo-400/40 bg-indigo-500/10 px-3 py-2.5">
              <span aria-hidden className="shrink-0 text-sm">
                ✨
              </span>
              <input
                type="text"
                value={customFocus}
                onChange={(event) => {
                  setCustomFocus(event.target.value);
                  setDestination("custom");
                }}
                onFocus={() => setDestination("custom")}
                placeholder='Where you are → where you want to go (e.g. "at home → own place")'
                className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                aria-label="Type where you are and where you want to go"
              />
            </label>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              You name where you are and where you want to go. Quanti writes a 1% daily rule on that vector.
            </p>
          </article>
        </div>

        <div className="mt-4 flex justify-center" aria-hidden>
          <ArrowDown className="h-6 w-6 text-indigo-400/80" strokeWidth={1.75} />
        </div>

        <article className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-6 text-center sm:p-8">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
            <Sparkles className="h-4 w-4" strokeWidth={1.75} />
            Output · Daily directive
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-50">A + B + C = one 1% rule</h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-emerald-50/90 sm:text-base">
            One concrete 1% action for today, sized by last night, aimed at {selectedLabel}.
          </p>
        </article>
      </div>
    </section>
  );
}
