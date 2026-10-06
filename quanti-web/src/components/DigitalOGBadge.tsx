"use client";

import { motion } from "framer-motion";
import { toBlob } from "html-to-image";
import { Share2, ShieldCheck } from "lucide-react";
import { useId, useRef, useState, type PointerEvent, type ReactNode } from "react";

type DigitalOGBadgeProps = {
  title?: string;
  established?: string;
  recapLabel?: string;
  recapStat?: string;
  recapSubLabel?: string;
};

const BORDER_TEXT = "QUANTI VERIFIED BADGE";
const SITE_URL = "https://quanti-app.com";

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

function BadgeArcText({ pathId }: { pathId: string }) {
  return (
    <svg className="pointer-events-none absolute inset-2" viewBox="0 0 280 280" aria-hidden>
      <defs>
        <path id={pathId} d="M 36 168 A 104 104 0 0 0 244 168" fill="none" />
      </defs>
      <text
        fill="#C084FC"
        fontSize="11"
        fontWeight="600"
        letterSpacing="3.2"
        className="[filter:drop-shadow(0_0_6px_rgba(124,58,237,0.85))]"
      >
        <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
          {BORDER_TEXT}
        </textPath>
      </text>
    </svg>
  );
}

function BadgeShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[2.4rem] border border-violet-500/40 bg-gradient-to-b from-zinc-200/25 via-zinc-900 to-zinc-950 p-[3px] shadow-[0_0_40px_rgba(124,58,237,0.28),inset_0_1px_0_rgba(255,255,255,0.35)]">
      <div className="relative h-full w-full overflow-hidden rounded-[2.2rem] border border-zinc-700/80 bg-[radial-gradient(ellipse_at_30%_20%,rgba(124,58,237,0.22),transparent_55%),linear-gradient(180deg,#18181B_0%,#09090B_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        {children}
      </div>
    </div>
  );
}

function FrontFace({
  title,
  established,
  pathId,
}: {
  title: string;
  established: string;
  pathId: string;
}) {
  return (
    <BadgeShell>
      <div className="flex h-full flex-col items-center px-6 pb-8 pt-8">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-300">
          {title}
        </p>
        <div className="relative mt-8 flex h-28 w-28 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-[#7C3AED]/30 blur-2xl" />
          <span className="relative flex h-24 w-24 items-center justify-center rounded-full border border-violet-400/50 bg-gradient-to-b from-zinc-200 to-zinc-500 text-[#09090B] shadow-[0_0_36px_rgba(124,58,237,0.55)]">
            <ShieldCheck className="h-12 w-12 text-[#7C3AED]" strokeWidth={2.4} />
          </span>
        </div>
        <BadgeArcText pathId={pathId} />
        <p className="mt-auto self-end text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
          {established}
        </p>
      </div>
    </BadgeShell>
  );
}

function BackFace({
  recapLabel,
  recapStat,
  recapSubLabel,
  pathId,
}: {
  recapLabel: string;
  recapStat: string;
  recapSubLabel: string;
  pathId: string;
}) {
  return (
    <BadgeShell>
      <div className="relative flex h-full flex-col items-center px-6 pb-8 pt-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-mark.svg"
          alt=""
          width={180}
          height={160}
          className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 opacity-[0.08]"
        />
        <p className="relative text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-300">
          {recapLabel}
        </p>
        <p className="relative mt-10 text-center text-3xl font-bold leading-tight tracking-tight text-[#FAFAFA] sm:text-4xl">
          {recapStat}
        </p>
        <p className="relative mt-3 text-center text-xs font-medium tracking-wide text-zinc-400">
          {recapSubLabel}
        </p>
        <BadgeArcText pathId={pathId} />
      </div>
    </BadgeShell>
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

export default function DigitalOGBadge({
  title = "2026 Golf Obsessed",
  established = "EST. 2026",
  recapLabel = "Recap Verification",
  recapStat = "73 Rounds Played",
  recapSubLabel = "Sync: Plaid + HealthKit",
}: DigitalOGBadgeProps) {
  const uid = useId().replace(/:/g, "");
  const [flipped, setFlipped] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [sharing, setSharing] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  const shareCopy = flipped
    ? `${recapStat} — ${title}. Quanti Verified.`
    : `${title} — Quanti Verified Badge.`;
  const filename = flipped ? "quanti-og-recap.png" : "quanti-og-badge.png";

  async function captureBadge() {
    const node = captureRef.current;
    if (!node) {
      return null;
    }
    return toBlob(node, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#09090B",
    });
  }

  async function shareActiveSide(channel: "story" | "x" | "instagram" | "imessage") {
    setSharing(true);
    try {
      const blob = await captureBadge();
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
          await navigator.share({ files: [file], title, text: shareCopy });
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
    setTilt({ x: py * -12, y: px * 14 });
  }

  return (
    <section
      aria-labelledby="og-badge-heading"
      className="mt-24 rounded-3xl border border-zinc-800/80 bg-zinc-900/60 px-6 py-12 text-center shadow-[0_0_40px_rgba(124,58,237,0.12)] backdrop-blur-md sm:px-10"
    >
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-violet-400">Unlock</p>
      <h2 id="og-badge-heading" className="mt-3 text-3xl font-semibold tracking-tight text-[#FAFAFA]">
        Your OG Verified Badge
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#A1A1AA] sm:text-base">
        Connect Plaid and HealthKit to mint a 3D collectible. Tap the badge to flip between status and recap —
        then share the side you&apos;re on.
      </p>

      <div className="relative mt-10 flex flex-col items-center">
        <div className="relative h-[320px] w-[280px] sm:h-[340px] sm:w-[300px]" style={{ perspective: "1000px" }}>
          <motion.div
            className="h-full w-full"
            animate={{ rotateX: tilt.x, rotateY: tilt.y }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onPointerMove={onPointerMove}
            onPointerLeave={() => setTilt({ x: 0, y: 0 })}
            style={{ transformStyle: "preserve-3d" }}
          >
            <motion.button
              type="button"
              aria-label={flipped ? "Show badge front" : "Show recap back"}
              aria-pressed={flipped}
              onClick={() => setFlipped((value) => !value)}
              className="relative h-full w-full cursor-pointer rounded-[2.4rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70"
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div
                className="absolute inset-0"
                style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
              >
                <FrontFace title={title} established={established} pathId={`${uid}-front-arc`} />
              </div>
              <div
                className="absolute inset-0"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <BackFace
                  recapLabel={recapLabel}
                  recapStat={recapStat}
                  recapSubLabel={recapSubLabel}
                  pathId={`${uid}-back-arc`}
                />
              </div>
            </motion.button>
          </motion.div>
        </div>

        <div
          ref={captureRef}
          aria-hidden
          className="pointer-events-none absolute left-[-9999px] top-0 h-[340px] w-[300px]"
        >
          {flipped ? (
            <BackFace
              recapLabel={recapLabel}
              recapStat={recapStat}
              recapSubLabel={recapSubLabel}
              pathId={`${uid}-capture-back`}
            />
          ) : (
            <FrontFace title={title} established={established} pathId={`${uid}-capture-front`} />
          )}
        </div>

        <div className="mt-8 w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3 shadow-[0_0_30px_rgba(124,58,237,0.2)]">
          <button
            type="button"
            disabled={sharing}
            onClick={() => void shareActiveSide("story")}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7C3AED] px-4 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(124,58,237,0.45)] transition hover:bg-violet-500 disabled:opacity-60"
          >
            <Share2 className="h-4 w-4" strokeWidth={2} />
            {sharing ? "Preparing…" : "Share This State to Story"}
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
      </div>
    </section>
  );
}
