"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

/** Interactive chips that build a song prompt, then hand it to Create. */

const GENRES = ["Kajri", "Chaita", "Holi", "Chhath geet", "Purvi", "Sohar"];
const TAALS = ["Keherwa", "Dadra", "Rupak", "Deepchandi"];
const INSTRUMENTS = ["Dholak", "Harmonium", "Bansuri", "Shehnai", "Nal", "Jhaal"];
const MOODS = ["romantic", "festive", "devotional", "longing", "energetic"];
const VOICES = ["female voice", "male voice", "duet"];

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm transition-all duration-200 active:scale-95",
        on
          ? "border-transparent bg-cta font-medium text-on-cta shadow-[0_6px_20px_-8px_#ee6a8a]"
          : "border-hairline bg-surface-1 text-ink-2 hover:-translate-y-0.5 hover:border-[#ee6a8a]/50 hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}

export function PromptBuilder() {
  const [genre, setGenre] = useState("Kajri");
  const [taal, setTaal] = useState("Keherwa");
  const [instruments, setInstruments] = useState<string[]>(["Dholak", "Bansuri"]);
  const [mood, setMood] = useState("romantic");
  const [voice, setVoice] = useState("female voice");

  const list = (xs: string[]) =>
    xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;
  const prompt = `A ${mood} ${genre} in ${taal} taal, ${voice}${instruments.length ? `, with ${list(instruments.map((i) => i.toLowerCase()))}` : ""}`;

  const groups: [string, string[], (v: string) => boolean, (v: string) => void][] = [
    ["Genre", GENRES, (v) => v === genre, setGenre],
    ["Taal", TAALS, (v) => v === taal, setTaal],
    [
      "Instruments",
      INSTRUMENTS,
      (v) => instruments.includes(v),
      (v) => setInstruments((xs) => (xs.includes(v) ? xs.filter((x) => x !== v) : [...xs, v].slice(-4))),
    ],
    ["Mood", MOODS, (v) => v === mood, setMood],
    ["Voice", VOICES, (v) => v === voice, setVoice],
  ];

  return (
    <div className="space-y-5">
      {groups.map(([label, items, isOn, pick]) => (
        <div key={label}>
          <p className="mb-2 text-sm font-semibold">{label}</p>
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <Chip key={item} on={isOn(item)} onClick={() => pick(item)}>
                {item}
              </Chip>
            ))}
          </div>
        </div>
      ))}

      <div className="rounded-2xl border border-hairline bg-surface-2/80 p-4 backdrop-blur">
        <p className="text-xs text-ink-3">Your song</p>
        <p key={prompt} className="mt-1 animate-settle text-lg leading-snug text-ink" aria-live="polite">
          {prompt}
        </p>
        <Link
          href={`/signup?prompt=${encodeURIComponent(prompt)}`}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-cta px-5 py-2.5 text-sm font-semibold text-on-cta shadow-[0_8px_24px_-10px_#ee6a8a] transition-transform hover:scale-[1.03] active:scale-95"
        >
          <Sparkles className="size-4" /> Make this song
        </Link>
      </div>
    </div>
  );
}
