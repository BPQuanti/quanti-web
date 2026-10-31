"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import WaitlistErrorBoundary from "@/components/WaitlistErrorBoundary";
import {
  REF_STORAGE_KEY,
  SIGNUP_EVENT,
  SIGNUP_STORAGE_KEY,
  clearStorage,
  friendlyWaitlistError,
  parseJsonResponse,
  readStorage,
  writeStorage,
} from "@/lib/waitlist/clientStorage";

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
  submitLabel = "Request TestFlight Access",
  refreshOnMount = true,
}: WaitlistCaptureProps) {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [touched, setTouched] = useState(false);
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

  function startOver() {
    clearStorage(SIGNUP_STORAGE_KEY);
    setSignup(null);
    setEmail("");
    setError("");
  }

  const emailValid = EMAIL_PATTERN.test(
    email
      .normalize("NFKC")
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .trim()
      .toLowerCase(),
  );
  const showEmailError = Boolean(error) || (touched && email.length > 0 && !emailValid);

  if (signup) {
    return (
      <div className="min-h-[168px] rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-left">
        <p className="flex items-center gap-2 text-sm font-semibold text-white">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-white" />
          You&apos;re on the list for TestFlight access.
        </p>
        <p className="mt-2 text-sm leading-6 text-white/60">
          We&apos;re sending invites in batches to keep cohort feedback high-signal. Watch your inbox for a direct
          invitation link from Apple TestFlight as spots open up.
        </p>
        {error ? <p className="mt-2 text-sm text-rose-300">{error}</p> : null}
        <button
          type="button"
          onClick={startOver}
          className="mt-3 text-xs text-white/40 underline-offset-2 transition hover:text-white/70 hover:underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="min-h-[168px] w-full">
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
          inputMode="email"
          spellCheck={false}
          value={email}
          onBlur={() => setTouched(true)}
          onChange={(event) => {
            setEmail(event.target.value);
            if (error) {
              setError("");
            }
          }}
          placeholder="Enter your email for TestFlight invite..."
          className="h-12 flex-1 rounded-xl border border-white/15 bg-[#0A0A0C] px-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-white/40 focus:shadow-[0_0_0_4px_rgba(255,255,255,0.08)]"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-[#0A0A0C] transition hover:bg-white/90 active:scale-95 disabled:cursor-wait disabled:opacity-70"
        >
          {loading ? "Requesting…" : submitLabel}
          {!loading ? <ArrowRight className="h-4 w-4" /> : null}
        </button>
      </div>
      <p className="mt-3 text-xs leading-5 text-white/45">
        We are enrolling beta testers in small cohorts. Zero spam—just your direct TestFlight invitation link.
      </p>
      {showEmailError ? (
        <p className="mt-2 text-sm text-rose-300" role="alert">
          {error || "Enter a valid email address."}
        </p>
      ) : (
        <p className="mt-2 h-5 text-sm" aria-hidden>
          {" "}
        </p>
      )}
    </form>
  );
}

export default function WaitlistCapture(props: WaitlistCaptureProps) {
  return (
    <WaitlistErrorBoundary>
      <Suspense fallback={<div className="min-h-[168px] rounded-xl border border-white/10 bg-[#0A0A0C]" />}>
        <WaitlistCaptureForm {...props} />
      </Suspense>
    </WaitlistErrorBoundary>
  );
}
