"use client";

import { motion } from "framer-motion";
import { toBlob } from "html-to-image";
import { Share2 } from "lucide-react";
import { useId, useRef, useState, type PointerEvent, type ReactNode } from "react";

const SITE_URL = "https://quanti-app.com";
const FRONT_RIM = "QUANTI VERIFIED FOUNDER STATUS";
const BACK_RIM = "SYNC VERIFIED: PLAID + APPLE HEALTHKIT";

function InstagramMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" />
    </svg>
  );
}

function XMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
      <path d="M14.7 10.4 21 3h-1.9l-5.5 6.4L9.2 3H3.5l6.7 9.7L3.5 21h1.9l6-7 4.8 7h5.7l-7.2-10.6ZM8.4 4.4h1.7l9.4 15.2h-1.7L8.4 4.4Z" />
    </svg>
  );
}

function IMessageMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
      <path d="M12 3.5c-4.9 0-8.8 3.3-8.8 7.4 0 2.5 1.5 4.8 3.8 6.2-.1.7-.5 1.8-1.6 3.1 1.8-.3 3.3-1.1 4.3-1.8.7.1 1.5.2 2.3.2 4.9 0 8.8-3.3 8.8-7.4S16.9 3.5 12 3.5Z" />
    </svg>
  );
}

function RimText({
  pathId,
  text,
  tone,
  compact,
}: {
  pathId: string;
  text: string;
  tone: "front" | "back";
  compact?: boolean;
}) {
  const isFront = tone === "front";
  return (
    <svg className="pointer-events-none absolute inset-0" viewBox="0 0 300 300" aria-hidden>
      <defs>
        <path id={pathId} d="M 54 232 A 118 118 0 0 0 246 232" fill="none" />
      </defs>
      <text
        fill={isFront ? "#A78BFA" : "#71717A"}
        fontSize={compact ? (isFront ? 7 : 6) : isFront ? 8.5 : 7.2}
        fontWeight="600"
        letterSpacing={compact ? 0.8 : isFront ? 1.8 : 1.1}
        className={isFront ? "[filter:drop-shadow(0_0_4px_rgba(124,58,237,0.7))]" : "opacity-80"}
      >
        <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
          {text}
        </textPath>
      </text>
    </svg>
  );
}

function CoinShell({
  children,
  pathId,
  rimText,
  tone,
  compact,
}: {
  children: ReactNode;
  pathId: string;
  rimText: string;
  tone: "front" | "back";
  compact?: boolean;
}) {
  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-full border border-violet-500/40 bg-[linear-gradient(160deg,#d4d4d8_0%,#3f3f46_22%,#18181b_48%,#09090b_76%,#52525b_100%)] shadow-[0_0_40px_rgba(124,58,237,0.28),inset_0_1px_0_rgba(255,255,255,0.4)] ${
        compact ? "p-[10px]" : "p-[18px]"
      }`}
    >
      <RimText pathId={pathId} text={rimText} tone={tone} compact={compact} />
      <div className="relative h-full w-full overflow-hidden rounded-full border border-zinc-800/90 bg-[radial-gradient(ellipse_at_30%_18%,rgba(124,58,237,0.2),transparent_52%),linear-gradient(180deg,#18181B_0%,#09090B_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        {children}
      </div>
    </div>
  );
}

function FrontFace({ pathId, compact }: { pathId: string; compact?: boolean }) {
  return (
    <CoinShell pathId={pathId} rimText={FRONT_RIM} tone="front" compact={compact}>
      <div className={`flex h-full flex-col items-center ${compact ? "px-3 pb-6 pt-3" : "px-7 pb-10 pt-7"}`}>
        <span
          className={`rounded-full border border-violet-500/40 bg-[#7C3AED]/15 font-semibold tracking-[0.16em] text-violet-300 ${
            compact ? "px-1.5 py-px text-[6px]" : "px-2.5 py-0.5 text-[8px] tracking-[0.2em]"
          }`}
        >
          EARLY ACCESS
        </span>
        <p
          className={`mt-1 text-center font-semibold tracking-[0.12em] text-[#FAFAFA] ${
            compact ? "text-[7px] leading-3" : "mt-2 text-[11px] tracking-[0.16em]"
          }`}
        >
          OG FOUNDING MEMBER
        </p>
        <div className={`relative my-auto flex items-center justify-center ${compact ? "h-12 w-12" : "h-24 w-24"}`}>
          <span className="absolute inset-0 rounded-full bg-[#7C3AED]/35 blur-xl" />
          <span
            className={`relative flex items-center justify-center rounded-full border border-violet-400/60 bg-gradient-to-b from-zinc-200 to-zinc-600 shadow-[0_0_20px_rgba(124,58,237,0.5)] ${
              compact ? "h-10 w-10" : "h-20 w-20 shadow-[0_0_32px_rgba(124,58,237,0.55)]"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-mark.svg"
              alt=""
              width={compact ? 22 : 44}
              height={compact ? 20 : 40}
              className={compact ? "h-5 w-5" : "h-10 w-10"}
            />
          </span>
        </div>
      </div>
    </CoinShell>
  );
}

function BackFace({ pathId, compact }: { pathId: string; compact?: boolean }) {
  return (
    <CoinShell pathId={pathId} rimText={BACK_RIM} tone="back" compact={compact}>
      <div className={`relative flex h-full flex-col items-center ${compact ? "px-3 pb-6 pt-3" : "px-8 pb-10 pt-7"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-mark.svg"
          alt=""
          width={compact ? 72 : 160}
          height={compact ? 64 : 140}
          className={`pointer-events-none absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 opacity-[0.07] ${
            compact ? "h-12 w-12" : "h-28 w-28"
          }`}
        />
        <p
          className={`relative text-center font-semibold tracking-[0.12em] text-violet-300 ${
            compact ? "text-[6px] leading-3" : "text-[10px] tracking-[0.16em]"
          }`}
        >
          10K MILESTONE REWARD
        </p>
        <p
          className={`relative text-center font-bold tracking-tight text-[#FAFAFA] ${
            compact ? "mt-1.5 text-[11px] leading-tight" : "mt-3 text-xl"
          }`}
        >
          1 OF FIRST 500
        </p>
        <p
          className={`relative text-center text-zinc-400 ${
            compact ? "mt-1 text-[6.5px] leading-3" : "mt-3 text-[10px] leading-4"
          }`}
        >
          {compact
            ? "0.5% royalty pool + Lifetime VIP at 10k paid subs."
            : "Unlocks 0.5% Founder Royalty Pool + Lifetime VIP Access once Quanti reaches 10,000 paid subscribers."}
        </p>
      </div>
    </CoinShell>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const faceStyle = {
  backfaceVisibility: "hidden" as const,
  WebkitBackfaceVisibility: "hidden" as const,
  transform: "translateZ(1px)",
};

export default function OGFoundingBadge({
  variant = "full",
  className = "",
}: {
  variant?: "full" | "compact";
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const compact = variant === "compact";
  const [flipped, setFlipped] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [sharing, setSharing] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  const shareCopy = flipped
    ? "10K Milestone Reward — 1 of first 500. 0.5% Founder Royalty Pool + Lifetime VIP Access at 10,000 paid subscribers."
    : "OG Founding Member — Quanti Verified Founder Status.";
  const filename = flipped ? "quanti-og-founder-back.png" : "quanti-og-founder-front.png";

  async function shareActiveSide(channel: "story" | "x" | "instagram" | "imessage") {
    setSharing(true);
    try {
      const node = captureRef.current;
      const blob = node
        ? await toBlob(node, { cacheBust: true, pixelRatio: 2, backgroundColor: "#09090B" })
        : null;
      if (!blob) {
        return;
      }
      const file = new File([blob], filename, { type: "image/png" });
      const canShareFiles = typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });

      if (channel === "x") {
        downloadBlob(blob, filename);
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareCopy)}&url=${encodeURIComponent(SITE_URL)}`,
          "_blank",
          "noopener,noreferrer",
        );
        return;
      }

      if (channel === "instagram") {
        downloadBlob(blob, `story-${filename}`);
        return;
      }

      if (canShareFiles && typeof navigator.share === "function") {
        try {
          await navigator.share({ files: [file], title: "OG Founding Member", text: shareCopy });
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }
        }
      }

      downloadBlob(blob, filename);
    } finally {
      setSharing(false);
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -10, y: px * 12 });
  }

  return (
    <div className={`relative flex flex-col items-center ${compact ? "" : "mt-6 w-full"} ${className}`.trim()}>
      <div
        className={
          compact
            ? "relative h-[140px] w-[140px] max-w-[160px] sm:h-[160px] sm:w-[160px]"
            : "relative h-[260px] w-[260px] sm:h-[280px] sm:w-[280px]"
        }
        style={{ perspective: "1000px" }}
      >
        <motion.div
          className={`h-full w-full ${compact ? "transition-[filter] hover:drop-shadow-[0_0_16px_rgba(124,58,237,0.45)]" : ""}`}
          animate={{ rotateX: tilt.x, rotateY: tilt.y }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          onPointerMove={onPointerMove}
          onPointerLeave={() => setTilt({ x: 0, y: 0 })}
          style={{ transformStyle: "preserve-3d" }}
        >
          <motion.button
            type="button"
            aria-label={flipped ? "Show badge front" : "Show 10k milestone back"}
            aria-pressed={flipped}
            onClick={() => setFlipped((value) => !value)}
            className="relative h-full w-full cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70"
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="absolute inset-0" style={faceStyle}>
              <FrontFace pathId={`${uid}-front-arc`} compact={compact} />
            </div>
            <div
              className="absolute inset-0"
              style={{
                ...faceStyle,
                transform: "rotateY(180deg) translateZ(1px)",
              }}
            >
              <BackFace pathId={`${uid}-back-arc`} compact={compact} />
            </div>
          </motion.button>
        </motion.div>
      </div>

      <div
        ref={captureRef}
        aria-hidden
        className={`pointer-events-none absolute left-[-9999px] top-0 ${compact ? "h-[160px] w-[160px]" : "h-[280px] w-[280px]"}`}
      >
        {flipped ? (
          <BackFace pathId={`${uid}-capture-back`} compact={compact} />
        ) : (
          <FrontFace pathId={`${uid}-capture-front`} compact={compact} />
        )}
      </div>

      {compact ? null : (
        <div className="mt-5 w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950/50 p-3 shadow-[0_0_24px_rgba(124,58,237,0.18)]">
          <button
            type="button"
            disabled={sharing}
            onClick={() => void shareActiveSide("story")}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7C3AED] px-4 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(124,58,237,0.45)] transition hover:bg-violet-500 disabled:opacity-60"
          >
            <Share2 className="h-4 w-4" strokeWidth={2} />
            {sharing ? "Preparing…" : "Share OG Badge to Story"}
          </button>
          <div className="mt-3 flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={sharing}
              onClick={() => void shareActiveSide("imessage")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-800 text-zinc-300 transition hover:border-violet-500/50 hover:text-[#FAFAFA]"
              aria-label="Share to iMessage"
            >
              <IMessageMark />
            </button>
            <button
              type="button"
              disabled={sharing}
              onClick={() => void shareActiveSide("instagram")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-800 text-zinc-300 transition hover:border-violet-500/50 hover:text-[#FAFAFA]"
              aria-label="Export for Instagram Story"
            >
              <InstagramMark />
            </button>
            <button
              type="button"
              disabled={sharing}
              onClick={() => void shareActiveSide("x")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-800 text-zinc-300 transition hover:border-violet-500/50 hover:text-[#FAFAFA]"
              aria-label="Share on X"
            >
              <XMark />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
