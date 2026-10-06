"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, MessageCircle, Share2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REF_STORAGE_KEY = "quanti_waitlist_ref";
const SIGNUP_STORAGE_KEY = "quanti_waitlist_signup";
const SIGNUP_EVENT = "quanti-waitlist-updated";
const SITE_ORIGIN = "https://quanti-app.com";
const WAITLIST_ID = process.env.NEXT_PUBLIC_GETWAITLIST_ID || "33110";

type SignupState = {
  email: string;
  position: number;
  referralToken: string;
};

function readStoredSignup(): SignupState | null {
  try {
    const raw = localStorage.getItem(SIGNUP_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as SignupState;
    if (!parsed?.referralToken) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function persistSignup(signup: SignupState) {
  localStorage.setItem(SIGNUP_STORAGE_KEY, JSON.stringify(signup));
  window.dispatchEvent(new Event(SIGNUP_EVENT));
}

function captureReferralCode() {
  const params = new URLSearchParams(window.location.search);
  const incoming = params.get("ref") || params.get("ref_id");
  if (incoming) {
    localStorage.setItem(REF_STORAGE_KEY, incoming);
    return incoming;
  }
  return localStorage.getItem(REF_STORAGE_KEY) || "";
}

export default function WaitlistForm({ id }: { id?: string }) {
  const fieldId = `${id || "waitlist"}-email`;
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [referredBy, setReferredBy] = useState("");
  const [signup, setSignup] = useState<SignupState | null>(null);

  useEffect(() => {
    setReferredBy(captureReferralCode());
    setSignup(readStoredSignup());

    const sync = () => setSignup(readStoredSignup());
    window.addEventListener(SIGNUP_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SIGNUP_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const emailValid = EMAIL_PATTERN.test(email.trim());
  const shareUrl = useMemo(
    () => (signup?.referralToken ? `${SITE_ORIGIN}/?ref=${encodeURIComponent(signup.referralToken)}` : ""),
    [signup],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    setError("");
    if (!emailValid) {
      setError("Enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          referred_by: referredBy,
          waitlist_id: WAITLIST_ID,
        }),
      });
      const payload = (await response.json()) as SignupState & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Unable to join the waitlist.");
      }
      persistSignup({
        email: payload.email,
        position: payload.position,
        referralToken: payload.referralToken,
      });
      setSignup({
        email: payload.email,
        position: payload.position,
        referralToken: payload.referralToken,
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to join the waitlist.");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyLink() {
    if (!shareUrl) {
      return;
    }
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const tweet = `Just joined the waitlist for @quanti_app — syncing bank & health metrics into wild yearly stats. Join here: ${shareUrl}`;
  const message = `Check out Quanti, it connects your bank and Apple Health into crazy recap stats: ${shareUrl}`;

  return (
    <div
      id={id}
      className="w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 text-left shadow-[0_0_24px_rgba(124,58,237,0.12)] backdrop-blur-xl sm:p-5"
    >
      <AnimatePresence mode="wait" initial={false}>
        {signup ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            className="space-y-4"
          >
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-[#FAFAFA]">
                You&apos;re #{signup.position} in Line
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#A1A1AA]">
                First 500 signups unlock the exclusive &apos;OG Verified&apos; badge.
              </p>
              <p className="mt-2 text-sm leading-6 text-violet-400">
                Share your link to jump the TestFlight line and lock in your OG status.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <p className="h-11 flex-1 truncate rounded-xl border border-violet-500/40 bg-zinc-950/70 px-3 py-3 text-xs text-[#E4E4E7]">
                {shareUrl}
              </p>
              <button
                type="button"
                onClick={copyLink}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-violet-500/40 bg-[#7C3AED] px-4 text-sm font-semibold text-white shadow-[0_0_18px_rgba(124,58,237,0.35)] transition hover:bg-violet-500"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>

            <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-2.5 shadow-[0_0_16px_rgba(124,58,237,0.12)]">
              <p className="text-xs leading-5 text-violet-200">
                ⚡ First 500 OG members unlock Lifetime Free Access + a share of our 10k Founder Revenue Pool when we
                cross 10,000 subscribers.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950/70 px-3 text-xs font-medium text-[#FAFAFA] transition hover:border-violet-500/40"
              >
                <Share2 className="h-3.5 w-3.5 text-violet-400" />
                Share on X
              </a>
              <a
                href={`sms:&body=${encodeURIComponent(message)}`}
                className="inline-flex h-10 items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950/70 px-3 text-xs font-medium text-[#FAFAFA] transition hover:border-violet-500/40"
              >
                <MessageCircle className="h-3.5 w-3.5 text-violet-400" />
                iMessage
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(message)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950/70 px-3 text-xs font-medium text-[#FAFAFA] transition hover:border-violet-500/40"
              >
                WhatsApp
              </a>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="capture"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
            className="w-full"
          >
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor={fieldId}>
                Email Address
              </label>
              <input
                id={fieldId}
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onBlur={() => setTouched(true)}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email Address"
                className="h-12 flex-1 rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 text-sm text-[#FAFAFA] outline-none transition placeholder:text-[#A1A1AA] focus:border-violet-500/60 focus:shadow-[0_0_0_4px_rgba(124,58,237,0.18)]"
              />
              <button
                type="submit"
                disabled={submitting}
                className="h-12 shrink-0 rounded-xl bg-gradient-to-r from-[#7C3AED] to-violet-500 px-5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(124,58,237,0.45)] transition hover:from-violet-500 hover:to-[#7C3AED] disabled:cursor-wait disabled:opacity-70"
              >
                {submitting ? "Joining…" : "Join the Waitlist"}
              </button>
            </div>
            <p className="mt-3 text-xs leading-5 text-[#A1A1AA]">
              Get early access to Quanti TestFlight &amp; claim your 2026 status badge.
            </p>
            {(touched && !emailValid) || error ? (
              <p className="mt-2 text-sm text-rose-300">{error || "Enter a valid email address."}</p>
            ) : null}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
