import { Quote } from "lucide-react";

export default function FounderNote() {
  return (
    <section aria-label="Founder note" className="mt-24 px-1">
      <div className="mx-auto max-w-2xl rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-6 shadow-[0_0_20px_rgba(124,58,237,0.1)] backdrop-blur-md md:p-8">
        <Quote className="h-6 w-6 text-violet-400" strokeWidth={1.5} aria-hidden />
        <blockquote className="mt-4 text-lg leading-relaxed text-[#E4E4E7] md:text-xl">
          We built Quanti out of a genuine curiosity to see what our daily habits actually look like when you
          connect the dots. It’s an unfiltered, fun lens into your real life—turning your health and spending
          stats into insights you’ll actually want to share on your story or send to the group chat.
        </blockquote>
        <p className="mt-6 flex items-center gap-3">
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-violet-500/30 bg-[#7C3AED]/20 text-sm font-semibold text-[#FAFAFA] shadow-[0_0_12px_rgba(124,58,237,0.25)]"
          >
            B
          </span>
          <span className="text-sm leading-5">
            <span className="font-bold text-[#FAFAFA]">— Brian</span>
            <span className="text-violet-400">, Founder @ Quanti</span>
          </span>
        </p>
      </div>
    </section>
  );
}
