"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Sparkles, Zap } from "lucide-react";

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

function persistReferralCode(code: string) {
  if (code) {
    localStorage.setItem(REF_STORAGE_KEY, code);
  }
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
      if (!response.ok || payload.success === false) {
        throw new Error(payload.error || "Unable to join the waitlist.");
      }
      localStorage.setItem(
        SIGNUP_STORAGE_KEY,
        JSON.stringify({
          email: payload.email || nextEmail,
          referralToken: payload.referralCode || "",
          position: 1,
          referralCount: 0,
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

      <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
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
          <p className="mt-4 inline-flex max-w-lg items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1.5 text-left text-xs leading-5 text-emerald-200">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            First 500 waitlist members lock in $49/yr OG Founder pricing.
          </p>
      </div>
    </section>
  );
}
