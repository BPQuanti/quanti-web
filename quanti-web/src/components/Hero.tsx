"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BarChart2,
  CheckCircle2,
  Compass,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REF_STORAGE_KEY = "quanti_waitlist_ref";
const SIGNUP_STORAGE_KEY = "quanti_waitlist_signup";
const SIGNUP_EVENT = "quanti-waitlist-updated";

interface WaitlistApiResponse {
  success?: boolean;
  email?: string;
  referralCode?: string;
  error?: string;
}

interface ComparisonItem {
  title: string;
  description: string;
}

interface DailyFocusCardProps {
  action: string;
  reason: string;
  score: number;
}

const MIRROR_POINTS: ComparisonItem[] = [
  {
    title: "Data fatigue",
    description: "Dashboards pile up charts until you stop looking.",
  },
  {
    title: "No direction",
    description: "You know what happened. You still don't know what to do today.",
  },
  {
    title: "Siloed apps",
    description: "Bank, health, and habits never talk to each other.",
  },
];

const GPS_POINTS: ComparisonItem[] = [
  {
    title: "1 daily directive",
    description: "One priority action every morning. That's the move.",
  },
  {
    title: "Daily Momentum Score (0–100)",
    description: "A single number for whether your day is compounding.",
  },
  {
    title: "Cross-domain correlation",
    description: "Sleep vs. spending, workouts vs. focus—connected into one engine.",
  },
];

function persistReferralCode(code: string) {
  if (code) {
    localStorage.setItem(REF_STORAGE_KEY, code);
  }
}

function DailyFocusCard({ action, reason, score }: DailyFocusCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-indigo-500/25 bg-slate-900/80 p-5 shadow-[0_0_48px_rgba(99,102,241,0.18)] backdrop-blur-xl">
      <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            Daily Focus Card
          </p>
          <h3 className="mt-3 text-lg font-semibold tracking-tight text-slate-50">Today's priority</h3>
        </div>
        <div className="shrink-0 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">Momentum</p>
          <p className="mt-0.5 text-xl font-bold text-emerald-200">{score}/100</p>
        </div>
      </div>
      <p className="mt-4 text-base leading-6 text-slate-100">{action}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{reason}</p>
      <div className="mt-5 flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-slate-300">
        <Compass className="h-3.5 w-3.5 text-indigo-400" />
        Cross-domain: sleep · spending · focus
      </div>
    </div>
  );
}

function WaitlistCapture() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [referredBy, setReferredBy] = useState("");

  useEffect(() => {
    const fromUrl = searchParams.get("ref") || searchParams.get("ref_id") || "";
    persistReferralCode(fromUrl);
    setReferredBy(fromUrl || localStorage.getItem(REF_STORAGE_KEY) || "");
    try {
      const raw = localStorage.getItem(SIGNUP_STORAGE_KEY);
      if (raw && JSON.parse(raw)?.referralToken) {
        setSubmitted(true);
      }
    } catch {
      /* ignore */
    }
  }, [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const nextEmail = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(nextEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: nextEmail, referredBy }),
      });
      const payload = (await response.json()) as WaitlistApiResponse;
      if (!response.ok) {
        throw new Error(payload.error || "Unable to join the waitlist.");
      }
      localStorage.setItem(
        SIGNUP_STORAGE_KEY,
        JSON.stringify({
          email: payload.email || nextEmail,
          referralToken: payload.referralCode || "",
        }),
      );
      window.dispatchEvent(new Event(SIGNUP_EVENT));
      setSubmitted(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to join the waitlist.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-4 text-left shadow-[0_0_28px_rgba(16,185,129,0.12)]">
        <p className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
          <CheckCircle2 className="h-4 w-4" />
          You're on the list.
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Lock in <span className="font-semibold text-slate-50">$49/yr OG Founder Pricing</span> when we open
          TestFlight. We'll send your invite and claim window to your inbox.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="hero-waitlist-email">
          Email Address
        </label>
        <input
          id="hero-waitlist-email"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
          className="h-12 flex-1 rounded-xl border border-slate-800 bg-slate-950/80 px-4 text-sm text-slate-50 outline-none transition placeholder:text-slate-500 focus:border-indigo-400/70 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.18)]"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(99,102,241,0.4)] transition hover:bg-indigo-400 active:scale-95 disabled:cursor-wait disabled:opacity-70"
        >
          {loading ? "Joining…" : "Get TestFlight Access"}
          {!loading ? <ArrowRight className="h-4 w-4" /> : null}
        </button>
      </div>
      {error ? <p className="mt-2 text-sm text-rose-300">{error}</p> : null}
    </form>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-slate-800/80 bg-slate-950 px-4 py-12 text-slate-50 sm:px-8 sm:py-16">
      <div className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-indigo-600/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />

      <div className="relative grid items-start gap-10 lg:grid-cols-2">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <p className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">
            <Zap className="h-3.5 w-3.5" />
            The Action-First Engine
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl sm:leading-[1.08] lg:text-6xl">
            Stop staring at charts.{" "}
            <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
              Start making the right moves.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
            Quanti connects your bank, health, and habit data into 1 daily priority action every morning. No data
            fatigue—just clarity and real momentum.
          </p>
          <div id="waitlist" className="mt-8 w-full max-w-lg scroll-mt-24">
            <Suspense fallback={<div className="h-12 rounded-xl border border-slate-800 bg-slate-900/80" />}>
              <WaitlistCapture />
            </Suspense>
          </div>
        </div>

        <DailyFocusCard
          score={88}
          action="Hold spending under $40 until 8pm — last night's 5h 40m sleep is dragging impulse buys."
          reason="Quanti correlated a weak sleep window with afternoon spend spikes. One constraint. One win."
        />
      </div>

      <div className="relative mt-12 grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            <BarChart2 className="h-4 w-4" />
            Traditional Apps
          </p>
          <h2 className="mt-3 text-xl font-semibold text-slate-200">The Passive Mirror</h2>
          <ul className="mt-4 space-y-3">
            {MIRROR_POINTS.map((item) => (
              <li key={item.title} className="flex gap-3 text-left">
                <BarChart2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-slate-300">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-3xl border border-indigo-400/30 bg-indigo-500/5 p-5 shadow-[0_0_32px_rgba(99,102,241,0.12)] backdrop-blur-xl">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300">
            <Compass className="h-4 w-4" />
            Quanti Engine
          </p>
          <h2 className="mt-3 text-xl font-semibold text-slate-50">The Proactive GPS</h2>
          <ul className="mt-4 space-y-3">
            {GPS_POINTS.map((item) => (
              <li key={item.title} className="flex gap-3 text-left">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                <div>
                  <p className="text-sm font-medium text-slate-100">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
