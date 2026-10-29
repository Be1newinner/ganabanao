"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/** A visual preview of the stems view: each channel's meter moves; tap to mute it. */
const CHANNELS = [
  { name: "Vocals", color: "#f6b444", speed: 0.9 },
  { name: "Drums & dholak", color: "#f2785a", speed: 0.55 },
  { name: "Bass", color: "#ee6a8a", speed: 1.3 },
  { name: "Keyboard & harmonium", color: "#c77dff", speed: 1.05 },
  { name: "Flute", color: "#9b7bff", speed: 1.5 },
  { name: "Strings", color: "#6fd3c1", speed: 1.2 },
];

export function StemsMixer() {
  const [muted, setMuted] = useState<Set<string>>(new Set());

  return (
    <div className="rounded-3xl border border-hairline bg-surface-1/80 p-4 shadow-[0_30px_90px_-40px_rgb(124_82_240/0.6)] backdrop-blur sm:p-6">
      <div className="mb-4 flex items-center justify-between text-sm text-ink-3">
        <span>Saawan ke jhoola, 6 stems</span>
        <span>Tap a stem to mute it</span>
      </div>
      <ul className="space-y-2">
        {CHANNELS.map((ch, row) => {
          const off = muted.has(ch.name);
          return (
            <li key={ch.name}>
              <button
                type="button"
                aria-pressed={!off}
                onClick={() =>
                  setMuted((m) => {
                    const next = new Set(m);
                    if (next.has(ch.name)) next.delete(ch.name);
                    else next.add(ch.name);
                    return next;
                  })
                }
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface-2"
              >
                {off ? <VolumeX className="size-4 text-ink-3" /> : <Volume2 className="size-4" style={{ color: ch.color }} />}
                <span className={cn("w-40 shrink-0 truncate text-sm sm:w-48", off && "text-ink-3 line-through")}>{ch.name}</span>
                <span aria-hidden className="flex h-8 flex-1 items-center gap-[3px] overflow-hidden">
                  {Array.from({ length: 36 }, (_, i) => (
                    <span
                      key={i}
                      className="h-full flex-1 origin-center animate-meter rounded-full motion-reduce:animate-none"
                      style={{
                        background: ch.color,
                        opacity: off ? 0.12 : 0.85,
                        animationDuration: `${ch.speed + ((i * 7 + row * 3) % 10) / 14}s`,
                        animationDelay: `${-((i * 13 + row * 5) % 17) / 10}s`,
                        transform: `scaleY(${0.25 + (((i * 31 + row * 11) % 20) / 20) * 0.7})`,
                      }}
                    />
                  ))}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
