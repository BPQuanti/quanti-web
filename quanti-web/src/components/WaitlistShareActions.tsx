"use client";

import { Check, Copy, MessageCircle, Share2 } from "lucide-react";
import { waitlistShareMessage } from "@/lib/waitlist/rank";

function WhatsAppMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
      <path d="M12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.44 1.33 4.94L2 22l5.4-1.4a10.1 10.1 0 0 0 4.64 1.13h.01c5.46 0 9.89-4.4 9.89-9.83C21.94 6.4 17.5 2 12.04 2Zm5.74 14.16c-.24.68-1.4 1.26-1.94 1.3-.5.04-1.12.06-1.81-.11-.42-.11-.95-.31-1.64-.6-2.88-1.24-4.76-4.14-4.91-4.33-.14-.2-1.18-1.56-1.18-2.98 0-1.41.74-2.11 1-2.4.24-.27.64-.39 1.02-.39.12 0 .23 0 .33.01.3.01.44.03.64.5.24.58.82 2 .89 2.14.07.14.12.3.02.49-.09.2-.14.31-.28.48-.14.16-.29.36-.42.49-.14.14-.28.29-.12.56.16.27.7 1.15 1.5 1.86 1.04.92 1.91 1.2 2.18 1.34.27.14.43.12.59-.07.16-.2.68-.79.86-1.06.18-.27.36-.22.6-.13.24.09 1.54.73 1.8.86.27.14.44.2.51.31.07.12.07.68-.17 1.36Z" />
    </svg>
  );
}

export default function WaitlistShareActions({
  shareUrl,
  copied,
  onCopy,
}: {
  shareUrl: string;
  copied: boolean;
  onCopy: () => void;
}) {
  const message = waitlistShareMessage(shareUrl);
  const chip =
    "inline-flex h-10 items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950/70 px-3 text-xs font-medium text-slate-100 transition hover:border-indigo-400/40";

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <p className="h-11 flex-1 truncate rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-3 text-left text-xs text-slate-200">
          {shareUrl}
        </p>
        <button
          type="button"
          onClick={() => void onCopy()}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-indigo-400/30 bg-indigo-500 px-4 text-sm font-semibold text-white shadow-[0_0_18px_rgba(99,102,241,0.35)] transition hover:bg-indigo-400 active:scale-95"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={chip}
        >
          <Share2 className="h-3.5 w-3.5 text-indigo-300" />
          Share on X
        </a>
        <a href={`sms:?body=${encodeURIComponent(message)}`} className={chip}>
          <MessageCircle className="h-3.5 w-3.5 text-indigo-300" />
          iMessage
        </a>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={chip}
        >
          <WhatsAppMark />
          WhatsApp
        </a>
      </div>
    </div>
  );
}
