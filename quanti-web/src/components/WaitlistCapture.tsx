"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import WaitlistErrorBoundary from "@/components/WaitlistErrorBoundary";
import WaitlistShareActions from "@/components/WaitlistShareActions";
import {
  REF_STORAGE_KEY,
  SIGNUP_EVENT,
  SIGNUP_STORAGE_KEY,
  clearStorage,
  copyText,
  friendlyWaitlistError,
  parseJsonResponse,
  readStorage,
  writeStorage,
} from "@/lib/waitlist/clientStorage";
import { waitlistShareUrl } from "@/lib/waitlist/publicUrl";
import { waitlistViralRuleCopy } from "@/lib/waitlist/rank";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SignupState = {
  email: string;
  referralToken: string;
  currentRank: number;
  referralCount: number;
};

interface WaitlistApiResponse {
  success?: boolean;
  email?: string;
  referralCode?: string;
  currentRank?: number;
  initialPosition?: number;
  referralCount?: number;
  error?: string;
}

type WaitlistCaptureProps = {
  emailFieldId: string;
  submitLabel?: string;
  refreshOnMount?: boolean;
};

function persistReferralCode(code: string) {
  if (code) {
    writeStorage(REF_STORAGE_KEY, code);
  }
}

function readStoredSignup(): SignupState | null {
  const raw = readStorage(SIGNUP_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  const parsed = parseJsonResponse<Partial<SignupState> & { position?: number }>(raw);
  if (!parsed?.referralToken) {
    return null;
  }
  return {
    email: parsed.email || "",
    referralToken: parsed.referralToken,
    currentRank: parsed.currentRank ?? parsed.position ?? 0,
    referralCount: parsed.referralCount ?? 0,
  };
}

function persistSignup(signup: SignupState) {
  writeStorage(SIGNUP_STORAGE_KEY, JSON.stringify(signup));
  try {
    window.dispatchEvent(new Event(SIGNUP_EVENT));
  } catch {
    /* ignore */
  }
}

function signupFromPayload(payload: WaitlistApiResponse, fallbackEmail: string): SignupState | null {
  const referralToken = payload.referralCode || "";
  if (!referralToken) {
    return null;
  }
  return {
    email: payload.email || fallbackEmail,
    referralToken,
    currentRank: payload.currentRank ?? payload.initialPosition ?? 1,
    referralCount: payload.referralCount ?? 0,
  };
}

function WaitlistCaptureForm({
  emailFieldId,
  submitLabel = "Request Early Access",
  refreshOnMount = true,
}: WaitlistCaptureProps) {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [copied, setCopied] = useState(false);
  const [signup, setSignup] = useState<SignupState | null>(null);

  useEffect(() => {
    try {
      const fromUrl = searchParams.get("ref") || searchParams.get("ref_id") || "";
      persistReferralCode(fromUrl);
      setReferredBy(fromUrl || readStorage(REF_STORAGE_KEY) || "");
      const stored = readStoredSignup();
      if (stored) {
        setSignup(stored);
      }

      const sync = () => setSignup(readStoredSignup());
      window.addEventListener(SIGNUP_EVENT, sync);
      window.addEventListener("storage", sync);

      async function refreshRank(existing: SignupState) {
        if (!existing.email) {
          return;
        }
        try {
          const response = await fetch("/api/waitlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: existing.email, referredBy: fromUrl }),
          });
          const payload = parseJsonResponse<WaitlistApiResponse>(await response.text());
          const next = payload ? signupFromPayload(payload, existing.email) : null;
          if (next) {
            persistSignup(next);
            setSignup(next);
          }
        } catch {
          /* keep cached rank if refresh fails */
        }
      }

      if (refreshOnMount && stored?.email) {
        void refreshRank(stored);
      }

      return () => {
        window.removeEventListener(SIGNUP_EVENT, sync);
        window.removeEventListener("storage", sync);
      };
    } catch (bootError) {
      console.error("Waitlist boot failed", bootError);
    }
  }, [searchParams, refreshOnMount]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const nextEmail = email
      .normalize("NFKC")
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .trim()
      .toLowerCase();
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
      const payload = parseJsonResponse<WaitlistApiResponse>(await response.text()) || {};
      const next = signupFromPayload(payload, nextEmail);
      if (next) {
        persistSignup(next);
        setSignup(next);
        return;
      }
      setError(friendlyWaitlistError(payload.error) || "Something went wrong. Please try again.");
    } catch (submitError) {
      setError(
        friendlyWaitlistError(submitError instanceof Error ? submitError.message : "") ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!signup?.referralToken) {
      return;
    }
    const ok = await copyText(waitlistShareUrl(signup.referralToken));
    if (!ok) {
      setError("Could not copy the link. Long-press it to copy.");
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function startOver() {
    clearStorage(SIGNUP_STORAGE_KEY);
    setSignup(null);
    setEmail("");
    setError("");
    setCopied(false);
  }

  if (signup) {
    const shareUrl = waitlistShareUrl(signup.referralToken);
    return (
      <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-4 text-left shadow-[0_0_28px_rgba(16,185,129,0.12)]">
        <p className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
          <CheckCircle2 className="h-4 w-4" />
          You are #{signup.currentRank} on the waitlist.
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-300">{waitlistViralRuleCopy()}</p>
        <div className="mt-4">
          <WaitlistShareActions shareUrl={shareUrl} copied={copied} onCopy={copyLink} />
        </div>
        {error ? <p className="mt-2 text-sm text-rose-300">{error}</p> : null}
        <p className="mt-3 text-xs leading-5 text-slate-500">
          We sent a confirmation to your inbox. If you don&apos;t see it, check Promotions or Spam.
        </p>
        <button
          type="button"
          onClick={startOver}
          className="mt-3 text-xs text-slate-500 underline-offset-2 transition hover:text-slate-300 hover:underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor={emailFieldId}>
          Email Address
        </label>
        <input
          id={emailFieldId}
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
          className="h-12 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.28)]"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(99,102,241,0.4)] transition hover:bg-indigo-400 active:scale-95 disabled:cursor-wait disabled:opacity-70"
        >
          {loading ? "Requesting…" : submitLabel}
          {!loading ? <ArrowRight className="h-4 w-4" /> : null}
        </button>
      </div>
      {error ? <p className="mt-2 text-sm text-rose-300">{error}</p> : null}
    </form>
  );
}

export default function WaitlistCapture(props: WaitlistCaptureProps) {
  return (
    <WaitlistErrorBoundary>
      <Suspense fallback={<div className="h-12 rounded-xl border border-slate-800 bg-slate-900/80" />}>
        <WaitlistCaptureForm {...props} />
      </Suspense>
    </WaitlistErrorBoundary>
  );
}
