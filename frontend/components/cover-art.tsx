import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Generated cover art: every song gets its own gradient and pattern, derived
 * from its id, so the library looks like an album wall without stored images.
 */

const hash = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};

export function coverStyle(seed: string) {
  const h = hash(seed);
  const hueA = h % 360;
  const hueB = (hueA + 40 + ((h >> 9) % 120)) % 360;
  const angle = (h >> 3) % 360;
  return {
    backgroundImage: [
      `radial-gradient(circle at ${20 + ((h >> 5) % 60)}% ${15 + ((h >> 11) % 50)}%, oklch(0.85 0.15 ${hueB} / 0.55), transparent 55%)`,
      `linear-gradient(${angle}deg, oklch(0.62 0.2 ${hueA}), oklch(0.38 0.16 ${hueB}))`,
    ].join(","),
    pattern: (h >> 13) % 3,
  };
}

export function CoverArt({
  seed,
  className,
  children,
  rounded = "rounded-lg",
}: {
  seed: string;
  className?: string;
  children?: ReactNode;
  rounded?: string;
}) {
  const { backgroundImage, pattern } = coverStyle(seed);
  return (
    <div className={cn("relative isolate shrink-0 overflow-hidden", rounded, className)} style={{ backgroundImage }}>
      <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0 -z-10 size-full opacity-25 mix-blend-overlay">
        {pattern === 0 &&
          [14, 26, 38, 50].map((r) => <circle key={r} cx="78" cy="78" r={r} fill="none" stroke="white" strokeWidth="1.2" />)}
        {pattern === 1 &&
          [0, 1, 2, 3, 4, 5].map((i) => (
            <path key={i} d={`M0 ${20 + i * 14} Q 25 ${8 + i * 14} 50 ${20 + i * 14} T 100 ${20 + i * 14}`} fill="none" stroke="white" strokeWidth="1.4" />
          ))}
        {pattern === 2 &&
          [0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <rect key={i} x={8 + i * 11} y={60 - ((i * 37) % 40)} width="5" height={20 + ((i * 37) % 40)} rx="2.5" fill="white" />
          ))}
      </svg>
      {children}
    </div>
  );
}

/** Animated bars shown on the song that is playing. */
export function Equalizer({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("flex h-4 items-end gap-0.5", className)}>
      {[0, 0.2, 0.4, 0.1].map((delay) => (
        <span key={delay} className="h-full w-1 origin-bottom animate-equalizer rounded-full bg-current" style={{ animationDelay: `${delay}s` }} />
      ))}
    </span>
  );
}
