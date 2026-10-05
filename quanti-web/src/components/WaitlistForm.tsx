"use client";

import { useForm, ValidationError } from "@formspree/react";

const FORMSPREE_FORM_ID = "mvkzopwd";

export default function WaitlistForm({ id }: { id?: string }) {
  const [state, handleSubmit] = useForm(FORMSPREE_FORM_ID);
  const fieldId = `${id || "waitlist"}-email`;

  if (state.succeeded) {
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
    <form id={id} onSubmit={handleSubmit} className="w-full">
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
          placeholder="Email Address"
          className="h-12 flex-1 rounded-xl border border-[#2d2442] bg-[#221c33] px-4 text-sm text-[#f8fafc] outline-none transition placeholder:text-[#94a3b8] focus:border-[#8b5cf6] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.18)]"
        />
        <button
          type="submit"
          disabled={state.submitting}
          className="h-12 shrink-0 rounded-xl bg-[#8b5cf6] px-5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(139,92,246,0.45)] transition hover:bg-[#7c3aed] hover:shadow-[0_0_36px_rgba(139,92,246,0.7)] disabled:cursor-wait disabled:opacity-70"
        >
          {state.submitting ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Joining…
            </span>
          ) : (
            "Get Early Access"
          )}
        </button>
      </div>
      <ValidationError
        prefix="Email"
        field="email"
        errors={state.errors}
        className="mt-3 block text-sm text-rose-300"
      />
    </form>
  );
}
