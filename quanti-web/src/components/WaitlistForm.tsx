"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, MessageCircle, Share2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import OGFoundingBadge from "@/components/OGFoundingBadge";
import { BATCH_SIZE, JUMP_PER_BATCH, rankWaitlistPosition } from "@/lib/waitlist/rank";
import { waitlistShareUrl } from "@/lib/waitlist/publicUrl";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REF_STORAGE_KEY = "quanti_waitlist_ref";
const SIGNUP_STORAGE_KEY = "quanti_waitlist_signup";
const SIGNUP_EVENT = "quanti-waitlist-updated";

type SignupState = {
  email: string;
  position: number;
  referralToken: string;
  referralCount: number;
  currentRank?: number;
  isTop500?: boolean;
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
    return {
      email: parsed.email,
      position: parsed.position,
      referralToken: parsed.referralToken,
      referralCount: parsed.referralCount ?? 0,
      currentRank: parsed.currentRank,
      isTop500: parsed.isTop500,
    };
  } catch {
    return null;
  }
}

function persistSignup(signup: SignupState) {
  localStorage.setItem(SIGNUP_STORAGE_KEY, JSON.stringify(signup));
  window.dispatchEvent(new Event(SIGNUP_EVENT));
}

function persistReferralCode(code: string) {
  if (code) {
    localStorage.setItem(REF_STORAGE_KEY, code);
  }
}

function WhatsAppMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
      <path d="M12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.44 1.33 4.94L2 22l5.4-1.4a10.1 10.1 0 0 0 4.64 1.13h.01c5.46 0 9.89-4.4 9.89-9.83C21.94 6.4 17.5 2 12.04 2Zm5.74 14.16c-.24.68-1.4 1.26-1.94 1.3-.5.04-1.12.06-1.81-.11-.42-.11-.95-.31-1.64-.6-2.88-1.24-4.76-4.14-4.91-4.33-.14-.2-1.18-1.56-1.18-2.98 0-1.41.74-2.11 1-2.4.24-.27.64-.39 1.02-.39.12 0 .23 0 .33.01.3.01.44.03.64.5.24.58.82 2 .89 2.14.07.14.12.3.02.49-.09.2-.14.31-.28.48-.14.16-.29.36-.42.49-.14.14-.28.29-.12.56.16.27.7 1.15 1.5 1.86 1.04.92 1.91 1.2 2.18 1.34.27.14.43.12.59-.07.16-.2.68-.79.86-1.06.18-.27.36-.22.6-.13.24.09 1.54.73 1.8.86.27.14.44.2.51.31.07.12.07.68-.17 1.36Z" />
    </svg>
  );
}

export default function WaitlistForm({ id }: { id?: string }) {
  const fieldId = `${id || "waitlist"}-email`;
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [referredBy, setReferredBy] = useState("");
  const [signup, setSignup] = useState<SignupState | null>(null);

  useEffect(() => {
    const fromUrl = searchParams.get("ref") || searchParams.get("ref_id") || "";
    persistReferralCode(fromUrl);
    setReferredBy(fromUrl || localStorage.getItem(REF_STORAGE_KEY) || "");
    setSignup(readStoredSignup());

    const sync = () => setSignup(readStoredSignup());
    window.addEventListener(SIGNUP_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SIGNUP_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [searchParams]);

  const emailValid = EMAIL_PATTERN.test(email.trim());
  const shareUrl = useMemo(
    () => (signup?.referralToken ? waitlistShareUrl(signup.referralToken) : ""),
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
          referredBy,
        }),
      });
      const payload = (await response.json()) as {
        email?: string;
        referralCode?: string;
        referralCount?: number;
        initialPosition?: number;
        currentRank?: number;
        isTop500?: boolean;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error || "Unable to join the waitlist.");
      }
      const nextSignup = {
        email: payload.email || email.trim().toLowerCase(),
        position: payload.initialPosition ?? payload.currentRank ?? 1,
        referralToken: payload.referralCode || "",
        referralCount: payload.referralCount ?? 0,
        currentRank: payload.currentRank,
        isTop500: payload.isTop500,
      };
      persistSignup(nextSignup);
      setSignup(nextSignup);
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

  const tweet = `Just joined the waitlist for @quanti_app — jump 50 spots for every 3 friends. Join here: ${shareUrl}`;
  const message = `Check out Quanti and jump the waitlist with me: ${shareUrl}`;
  const rank = signup
    ? rankWaitlistPosition(signup.position, signup.referralCount)
    : null;
  const currentRank = signup?.currentRank ?? rank?.currentRank ?? signup?.position;
  const isTop500 = signup?.isTop500 ?? rank?.isTop500 ?? false;
  const invitedThisBatch = signup ? signup.referralCount % BATCH_SIZE : 0;
  const progressRatio = invitedThisBatch / BATCH_SIZE;

  return (
    <div
      id={id}
      className="w-full overflow-visible rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 text-left shadow-[0_0_24px_rgba(124,58,237,0.12)] backdrop-blur-xl sm:p-5"
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
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-violet-500/40 bg-violet-500/15 px-3 py-1 text-sm font-semibold text-violet-200">
                  #{currentRank}
                </span>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                    isTop500
                      ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-300"
                      : "border-amber-400/40 bg-amber-500/10 text-amber-200"
                  }`}
                >
                  {isTop500 ? "🟢 TOP 500 LOCK" : "🟡 PROVISIONAL"}
                </span>
              </div>
              <h3 className="mt-3 text-xl font-semibold tracking-tight text-[#FAFAFA]">
                You&apos;re #{currentRank} in Line
              </h3>
              <p className="mt-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-sm leading-6 text-violet-200">
                BOOST YOUR RANK: Jump {JUMP_PER_BATCH} spots for every {BATCH_SIZE} friends who sign up with your link.
              </p>
              <p className="mt-3 text-sm leading-6 text-[#A1A1AA]">
                The top 500 waitlist members receive a 48-hour VIP early access window &amp; OG Claim Code to lock in
                the 500-capped OG Founder Pass.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
              <p className="text-sm font-medium text-[#FAFAFA]">
                {invitedThisBatch} / {BATCH_SIZE} Friends Invited — {rank?.remainingForNextJump ?? BATCH_SIZE} More to
                Jump {JUMP_PER_BATCH} Spots
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-[#7C3AED] shadow-[0_0_10px_rgba(124,58,237,0.55)] transition-all"
                  style={{ width: `${Math.max(progressRatio * 100, invitedThisBatch > 0 ? 8 : 0)}%` }}
                />
              </div>
              <div className="mt-3 flex gap-2">
                {Array.from({ length: BATCH_SIZE }, (_, index) => (
                  <span
                    key={index}
                    className={`h-2 flex-1 rounded-full ${
                      index < invitedThisBatch ? "bg-[#7C3AED] shadow-[0_0_10px_rgba(124,58,237,0.55)]" : "bg-zinc-800"
                    }`}
                  />
                ))}
              </div>
              {rank && rank.totalJumps > 0 ? (
                <p className="mt-2 text-xs text-zinc-500">You&apos;ve jumped {rank.totalJumps} spots so far.</p>
              ) : null}
            </div>

            <div className="my-6 flex flex-col items-center gap-6 rounded-2xl border border-violet-500/30 bg-zinc-900/80 p-5 shadow-[0_0_25px_rgba(124,58,237,0.15)] md:flex-row">
              <div className="min-w-0 flex-1 text-center md:text-left">
                <p className="text-lg font-bold text-violet-400">⚡ The 10k Founder Royalty Promise</p>
                <p className="mt-2 text-sm leading-6 text-[#A1A1AA]">
                  The first 500 OG Badge holders unlock Lifetime VIP Access PLUS a direct share of our 0.5% Founder
                  Revenue Pool once we cross 10,000 paid subscribers.
                </p>
                <p className="mt-2 text-xs text-zinc-400">Invite friends using your link to lock in your spot!</p>
                <p className="mt-2 text-[11px] leading-4 text-zinc-500">
                  Verified badges start as proof of your year. As Quanti scales, they become a passport for brand perks
                  and VIP rewards.
                </p>
              </div>
              <div className="shrink-0">
                <OGFoundingBadge variant="compact" />
              </div>
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
                href={`https://wa.me/?text=${encodeURIComponent(message)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950/70 px-3 text-xs font-medium text-[#FAFAFA] transition hover:border-violet-500/40"
              >
                <WhatsAppMark />
                WhatsApp
              </a>
              <a
                href={`sms:&body=${encodeURIComponent(message)}`}
                className="inline-flex h-10 items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950/70 px-3 text-xs font-medium text-[#FAFAFA] transition hover:border-violet-500/40"
              >
                <MessageCircle className="h-3.5 w-3.5 text-violet-400" />
                iMessage
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
