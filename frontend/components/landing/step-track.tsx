"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "./motion";

/**
 * "How it works" steps on a line that fills as you scroll through the
 * section; each step lights up as the line reaches it. Vertical on phones.
 */
export function StepTrack({ steps }: { steps: { title: string; body: string }[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the list's top reaches 80% of the viewport, 1 when its bottom reaches 55%
      const p = (vh * 0.8 - r.top) / (r.height + vh * 0.25);
      setProgress(Math.max(0, Math.min(1, p)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [reduced]);

  const p = reduced ? 1 : progress;

  return (
    <ol ref={ref} className="relative mt-14 grid gap-12 pl-16 md:grid-cols-3 md:gap-10 md:pl-0">
      {/* Track: vertical on phones, horizontal from md */}
      <span aria-hidden className="absolute top-0 bottom-0 left-7 w-px bg-hairline md:top-7 md:right-[16%] md:bottom-auto md:left-[16%] md:h-px md:w-auto" />
      <span
        aria-hidden
        className="absolute top-0 left-7 w-px origin-top bg-linear-to-b from-[#f6b444] via-[#ee6a8a] to-[#7c52f0] md:hidden"
        style={{ height: `${p * 100}%` }}
      />
      <span
        aria-hidden
        className="absolute top-7 left-[16%] hidden h-px bg-linear-to-r from-[#f6b444] via-[#ee6a8a] to-[#7c52f0] md:block"
        style={{ width: `${p * 68}%` }}
      />
      {steps.map((s, i) => {
        const lit = p >= (i + 0.35) / steps.length || (i === 0 && p > 0.02);
        return (
          <li key={s.title} className="relative">
            <span
              className={cn(
                "absolute -left-16 top-0 z-10 grid size-14 place-items-center rounded-full border font-display text-2xl transition-all duration-500 md:static",
                lit
                  ? "scale-105 border-transparent bg-cta text-on-cta shadow-[0_0_44px_-6px_#ee6a8a]"
                  : "border-hairline bg-surface-2 text-ink-3"
              )}
            >
              {i + 1}
            </span>
            <h3 className={cn("font-display text-2xl transition-colors duration-500 md:mt-6", lit ? "text-ink" : "text-ink-3")}>{s.title}</h3>
            <p className={cn("mt-2 max-w-sm leading-relaxed transition-colors duration-500", lit ? "text-ink-2" : "text-ink-3")}>{s.body}</p>
          </li>
        );
      })}
    </ol>
  );
}
