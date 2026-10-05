"use client";

import { FormEvent, useState } from "react";

type FormState = "idle" | "loading" | "success" | "error";

export default function WaitlistForm({ id }: { id?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setState("error");
      setMessage("Enter your email to join the waitlist.");
      return;
    }

    setState("loading");
    setMessage("");
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Unable to join the waitlist.");
      }
      setState("success");
      setEmail("");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Unable to join the waitlist.");
    }
  };

  if (state === "success") {
    return (
      <p
        id={id}
        className="rounded-2xl border border-[#8b5cf6]/40 bg-[#161124] px-5 py-4 text-sm leading-6 text-[#f8fafc] shadow-[0_0_40px_rgba(139,92,246,0.18)]"
      >
        You&apos;re on the list! We&apos;ll notify you when early access opens.
      </p>
    );
  }

  return (
    <form id={id} onSubmit={onSubmit} className="w-full">
      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor={`${id || "waitlist"}-email`}>
          Email Address
        </label>
        <input
          id={`${id || "waitlist"}-email`}
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email Address"
          className="h-12 flex-1 rounded-xl border border-[#2d2442] bg-[#221c33] px-4 text-sm text-[#f8fafc] outline-none transition placeholder:text-[#94a3b8] focus:border-[#8b5cf6] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.18)]"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="h-12 shrink-0 rounded-xl bg-[#8b5cf6] px-5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(139,92,246,0.45)] transition hover:bg-[#7c3aed] hover:shadow-[0_0_36px_rgba(139,92,246,0.7)] disabled:cursor-wait disabled:opacity-70"
        >
          {state === "loading" ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Joining…
            </span>
          ) : (
            "Get Early Access"
          )}
        </button>
      </div>
      {state === "error" && message ? (
        <p className="mt-3 text-sm text-rose-300">{message}</p>
      ) : null}
    </form>
  );
}
