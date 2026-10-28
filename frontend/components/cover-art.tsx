import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Song cover: one of the Madhubani paintings in public/art/covers, picked from
 * the song's id so a song always keeps the same cover. Add a painting by
 * dropping the file in that folder and listing it here.
 */
const COVERS = ["fish-1", "peacock-1", "fish-2", "peacock-2", "fish-3", "peacock-3"];

const hash = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};

export const coverSrc = (seed: string) => `/art/covers/${COVERS[hash(seed) % COVERS.length]}.jpg`;

export function CoverArt({
  seed,
  className,
  children,
  rounded = "rounded-sm",
  sizes = "96px",
  priority,
}: {
  seed: string;
  className?: string;
  children?: ReactNode;
  rounded?: string;
  /** Rendered width hint for next/image */
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn("relative isolate shrink-0 overflow-hidden bg-muted", rounded, className)}>
      <Image src={coverSrc(seed)} alt="" fill sizes={sizes} priority={priority} className="-z-10 object-cover" />
      {children}
    </div>
  );
}

/** Animated bars shown on the song that is playing. */
export function Equalizer({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("flex h-4 items-end gap-0.5", className)}>
      {[0, 0.2, 0.4, 0.1].map((delay) => (
        <span
          key={delay}
          className="h-full w-1 origin-bottom animate-equalizer rounded-full bg-current"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </span>
  );
}
