"use client";

import { motion } from "framer-motion";
import { toBlob } from "html-to-image";
import { Flame, Package, Share2, ShieldCheck, type LucideIcon } from "lucide-react";
import { useId, useRef, useState, type PointerEvent, type ReactNode } from "react";

type BadgeIcon = "shield" | "golf" | "package" | "flame" | "takeout";

type ShowcaseBadge = {
  id: string;
  name: string;
  icon: BadgeIcon;
  frontTitle: string;
  frontKicker: string;
  backHeadline: string;
  backDetail: string;
  backKicker: string;
};

const BORDER_TEXT = "QUANTI VERIFIED BADGE";
const SITE_URL = "https://quanti-app.com";

const badges: ShowcaseBadge[] = [
  {
    id: "og",
    name: "OG Founding Member",
    icon: "shield",
    frontTitle: "OG FOUNDING MEMBER",
    frontKicker: "EARLY ACCESS",
    backHeadline: "10K MILESTONE REWARD",
    backDetail: "0.5% Founder Revenue Dividend Pool Unlocked at 10k Subscribers",
    backKicker: "1 OF 500 OG FOUNDERS",
  },
  {
    id: "golf",
    name: "Golf Obsessed",
    icon: "golf",
    frontTitle: "2026 GOLF OBSESSED",
    frontKicker: "YEAR IN REVIEW",
    backHeadline: "73 ROUNDS PLAYED",
    backDetail: "$12,450 Spent • 1.2M Steps",
    backKicker: "PLAID + HEALTHKIT",
  },
  {
    id: "amazon",
    name: "Top 1% Amazonian",
    icon: "package",
    frontTitle: "TOP 1% AMAZONIAN",
    frontKicker: "AI VERIFIED",
    backHeadline: "148 PACKAGES",
    backDetail: "$4,820 Spent • 1 order / 2.4 days",
    backKicker: "PLAID VERIFIED",
  },
  {
    id: "marathon",
    name: "Desert Marathoner",
    icon: "flame",
    frontTitle: "DESERT MARATHONER",
    frontKicker: "AI VERIFIED",
    backHeadline: "2.84M STEPS",
    backDetail: "214 Workouts • Phoenix to Tucson 11x",
    backKicker: "HEALTHKIT VERIFIED",
  },
  {
    id: "doordash",
    name: "VIP Delivery Sponsor",
    icon: "takeout",
    frontTitle: "VIP DELIVERY SPONSOR",
    frontKicker: "AI VERIFIED",
    backHeadline: "186 DOORDASHES",
    backDetail: "$5,210 Spent • $940 in Fees",
    backKicker: "PLAID + HEALTHKIT",
  },
];

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

function GolfMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path d="M7 21h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 21V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 5.5 19 8.2 12 11V5.5Z" fill="currentColor" />
      <circle cx="8.2" cy="17.2" r="1.35" fill="currentColor" />
    </svg>
  );
}

function TakeoutMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path d="M5 9.5h14l-1.2 9.2a1.6 1.6 0 0 1-1.6 1.3H7.8a1.6 1.6 0 0 1-1.6-1.3L5 9.5Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 9.5 9.4 4.8h5.2L16 9.5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9 13.5h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function BadgeIconMark({ icon }: { icon: BadgeIcon }) {
  const className = "h-7 w-7 text-[#7C3AED]";
  if (icon === "golf") {
    return <GolfMark className={className} />;
  }
  if (icon === "takeout") {
    return <TakeoutMark className={className} />;
  }
  const Icon: LucideIcon = icon === "package" ? Package : icon === "flame" ? Flame : ShieldCheck;
  return <Icon className={className} strokeWidth={2.2} />;
}

function BadgeArcText({ pathId }: { pathId: string }) {
  return (
    <svg className="pointer-events-none absolute inset-1" viewBox="0 0 180 220" aria-hidden>
      <defs>
        <path id={pathId} d="M 22 148 A 68 68 0 0 0 158 148" fill="none" />
      </defs>
      <text
        fill="#C084FC"
        fontSize="7.5"
        fontWeight="600"
        letterSpacing="1.6"
        className="[filter:drop-shadow(0_0_5px_rgba(124,58,237,0.85))]"
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
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-violet-500/40 bg-gradient-to-b from-zinc-200/20 via-zinc-900 to-zinc-950 p-[2px] shadow-[0_0_16px_rgba(124,58,237,0.22),inset_0_1px_0_rgba(255,255,255,0.28)]">
      <div className="relative h-full w-full overflow-hidden rounded-[10px] border border-zinc-800 bg-zinc-900/80 backdrop-blur-md">
        {children}
      </div>
    </div>
  );
}

function FrontFace({ badge, pathId }: { badge: ShowcaseBadge; pathId: string }) {
  return (
    <BadgeShell>
      <div className="flex h-full flex-col items-center px-2.5 pb-3 pt-3">
        <p className="text-center text-[9px] font-semibold leading-tight tracking-[0.12em] text-violet-200">
          {badge.frontTitle}
        </p>
        <div className="relative my-auto flex h-14 w-14 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-[#7C3AED]/35 blur-xl" />
          <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-violet-400/50 bg-gradient-to-b from-zinc-200 to-zinc-500 shadow-[0_0_18px_rgba(124,58,237,0.5)]">
            <BadgeIconMark icon={badge.icon} />
          </span>
        </div>
        <BadgeArcText pathId={pathId} />
        <p className="text-[8px] font-semibold tracking-[0.16em] text-zinc-400">{badge.frontKicker}</p>
      </div>
    </BadgeShell>
  );
}

function BackFace({ badge, pathId }: { badge: ShowcaseBadge; pathId: string }) {
  return (
    <BadgeShell>
      <div className="relative flex h-full flex-col items-center px-2.5 pb-3 pt-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-mark.svg"
          alt=""
          width={88}
          height={80}
          className="pointer-events-none absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 opacity-[0.08]"
        />
        <p className="relative text-center text-[11px] font-bold leading-tight tracking-tight text-[#FAFAFA]">
          {badge.backHeadline}
        </p>
        <p className="relative mt-2 text-center text-[8px] leading-snug text-zinc-400">{badge.backDetail}</p>
        <BadgeArcText pathId={pathId} />
        <p className="relative mt-auto text-[8px] font-semibold tracking-[0.14em] text-violet-300">{badge.backKicker}</p>
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

function FlippableBadge({
  badge,
  flipped,
  active,
  uid,
  onToggle,
  onHover,
}: {
  badge: ShowcaseBadge;
  flipped: boolean;
  active: boolean;
  uid: string;
  onToggle: () => void;
  onHover: () => void;
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -8, y: px * 10 });
  }

  return (
    <div
      className="mx-auto w-full max-w-[180px]"
      style={{ perspective: "1000px" }}
      onPointerEnter={onHover}
    >
      <motion.div
        className={`h-[220px] w-full transition-[box-shadow] ${
          active ? "shadow-[0_0_20px_rgba(124,58,237,0.3)]" : "shadow-[0_0_12px_rgba(124,58,237,0.12)]"
        }`}
        animate={{ rotateX: tilt.x, rotateY: tilt.y }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        onPointerMove={onPointerMove}
        onPointerLeave={() => setTilt({ x: 0, y: 0 })}
        style={{ transformStyle: "preserve-3d" }}
      >
        <motion.button
          type="button"
          aria-label={`${badge.name}${flipped ? ", recap side" : ", title side"}`}
          aria-pressed={flipped}
          onClick={onToggle}
          className="relative h-full w-full cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div
            className="absolute inset-0"
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          >
            <FrontFace badge={badge} pathId={`${uid}-${badge.id}-front`} />
          </div>
          <div
            className="absolute inset-0"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <BackFace badge={badge} pathId={`${uid}-${badge.id}-back`} />
          </div>
        </motion.button>
      </motion.div>
    </div>
  );
}

export default function BadgeShowcase() {
  const uid = useId().replace(/:/g, "");
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  const activeBadge = badges.find((badge) => badge.id === activeId) ?? null;
  const activeFlipped = Boolean(activeId && flipped[activeId]);
  const showShare = Boolean(activeBadge && activeFlipped);

  function toggleBadge(id: string) {
    setFlipped((current) => {
      const next = !current[id];
      return { ...current, [id]: next };
    });
    setActiveId(id);
  }

  async function shareActive(channel: "story" | "x" | "instagram" | "imessage") {
    if (!activeBadge) {
      return;
    }
    setSharing(true);
    try {
      const node = captureRef.current;
      const blob = node
        ? await toBlob(node, { cacheBust: true, pixelRatio: 2, backgroundColor: "#09090B" })
        : null;
      if (!blob) {
        return;
      }
      const filename = `quanti-${activeBadge.id}-badge.png`;
      const shareCopy = `${activeBadge.name} — Quanti Verified Badge`;
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
          await navigator.share({ files: [file], title: activeBadge.name, text: shareCopy });
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

  return (
    <section
      aria-labelledby="badge-showcase-heading"
      className="relative mt-16 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-[0_0_20px_rgba(124,58,237,0.12)] backdrop-blur-md"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-violet-400">Collectibles</p>
          <h2 id="badge-showcase-heading" className="mt-1 text-lg font-semibold tracking-tight text-[#FAFAFA]">
            Flip a verified badge
          </h2>
        </div>
        <p className="max-w-sm text-left text-xs leading-5 text-[#A1A1AA] sm:text-right">
          Tap to reveal recap stats. Share the side you&apos;re on.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {badges.map((badge) => (
          <FlippableBadge
            key={badge.id}
            badge={badge}
            uid={uid}
            flipped={Boolean(flipped[badge.id])}
            active={activeId === badge.id}
            onToggle={() => toggleBadge(badge.id)}
            onHover={() => {
              if (flipped[badge.id]) {
                setActiveId(badge.id);
              }
            }}
          />
        ))}
      </div>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-200 ${
          showShare ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          {activeBadge ? (
            <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2">
              <button
                type="button"
                disabled={sharing}
                onClick={() => void shareActive("story")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#7C3AED] px-3 py-1.5 text-xs font-semibold text-white shadow-[0_0_16px_rgba(124,58,237,0.4)] transition hover:bg-violet-500 disabled:opacity-60"
              >
                <Share2 className="h-3.5 w-3.5" strokeWidth={2} />
                {sharing ? "Preparing…" : `Share ${activeBadge.name} to Story`}
              </button>
              <button
                type="button"
                disabled={sharing}
                onClick={() => void shareActive("x")}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 text-zinc-300 transition hover:border-violet-500/50 hover:text-[#FAFAFA]"
                aria-label="Share on X"
              >
                <XMark />
              </button>
              <button
                type="button"
                disabled={sharing}
                onClick={() => void shareActive("instagram")}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 text-zinc-300 transition hover:border-violet-500/50 hover:text-[#FAFAFA]"
                aria-label="Export for Instagram Story"
              >
                <InstagramMark />
              </button>
              <button
                type="button"
                disabled={sharing}
                onClick={() => void shareActive("imessage")}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 text-zinc-300 transition hover:border-violet-500/50 hover:text-[#FAFAFA]"
                aria-label="Share to iMessage"
              >
                <IMessageMark />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div
        ref={captureRef}
        aria-hidden
        className="pointer-events-none absolute left-[-9999px] top-0 h-[220px] w-[180px]"
      >
        {activeBadge ? (
          activeFlipped ? (
            <BackFace badge={activeBadge} pathId={`${uid}-capture-back`} />
          ) : (
            <FrontFace badge={activeBadge} pathId={`${uid}-capture-front`} />
          )
        ) : null}
      </div>
    </section>
  );
}
