"use client";

import { Repeat2, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useSongs } from "@/components/songs/song-list";
import { isActive } from "@/components/songs/song-row";
import { SongTile } from "@/components/songs/song-tile";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { useSession } from "@/lib/session";
import type { Catalog, PublicSettings } from "@/lib/types";
import { useApi } from "@/lib/use-api";
import { cn } from "@/lib/utils";

/*
 * Home (FR-2.1, FR-2.2), per music-app-ux: composer first, idea cards, then
 * the user's songs as small glowing covers. Festival gradients (user request)
 * carry the atmosphere; there are no large images.
 */

/** Idea cards: deep festival gradients, white text (all ≥ 4.5:1). */
const IDEAS = [
  { genre: "Kajri", text: "A song for the first rain, female voice, bansuri", bg: "from-[#8c2a55] via-[#a8431a] to-[#c2366c]" },
  { genre: "Chhath geet", text: "Dawn at the ghat, slow, harmonium and jhaal", bg: "from-[#a8431a] via-[#8c2a55] to-[#3b2a8f]" },
  { genre: "Holi", text: "A dance number at 124 BPM, dholak and synth", bg: "from-[#c2366c] via-[#6d3fd9] to-[#3b2a8f]" },
  { genre: "Purvi folk", text: "A song about missing home, male voice", bg: "from-[#0b6b66] via-[#3b2a8f] to-[#6d3fd9]" },
];

const greeting = () => {
  const h = new Date().getHours();
  // Late nights are still evening for a musician
  return h >= 5 && h < 12 ? "Good morning" : h >= 12 && h < 17 ? "Good afternoon" : "Good evening";
};

export function DashboardView() {
  const { user } = useSession();
  const catalog = useApi<Catalog>("/billing/catalog");
  const settings = useApi<PublicSettings>("/settings");
  const songs = useSongs("/songs?limit=12");
  const [idea, setIdea] = useState("");
  if (!user) return null;

  const sub = user.subscription;
  const plan = catalog.data?.plans.find((p) => p.id === sub?.planId);
  const subLive = sub && ["active", "authenticated", "pending"].includes(sub.status ?? "");
  const songCost = settings.data?.creditCosts.generate;

  // Songs still being made come first (music-app-ux: in progress at the top)
  const ordered = [...(songs.data ?? [])].sort((a, b) => Number(isActive(b)) - Number(isActive(a)));

  return (
    <>
      {/* Festival light behind the top of the page */}
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[620px] bg-aurora-glow lg:left-60" />

      <div className="space-y-14">
        <section className="space-y-7 pt-4">
          <div>
            <p className="text-ink-2">
              {greeting()}, {user.name.split(" ")[0]}
            </p>
            <h1 className="mt-1 font-display text-4xl leading-tight sm:text-6xl">What will you sing today?</h1>
            <p className="mt-3 text-ink-2">
              {creditLine(user.credits, songCost)}{" "}
              {subLive && plan ? `${plan.name} renews on ${formatDate(sub.currentPeriodEnd)}. ` : ""}
              <Link href="/billing" className="ink-link text-ink">
                {user.credits ? "Add credits" : "Get credits"}
              </Link>
            </p>
          </div>

          <Composer
            idea={idea}
            setIdea={setIdea}
            songCost={songCost}
            remixCost={settings.data?.creditCosts.remix}
          />
        </section>

        <section aria-labelledby="ideas-heading">
          <h2 id="ideas-heading" className="mb-4 font-display text-2xl">
            Start from an idea
          </h2>
          <div className="-mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
            {IDEAS.map((card) => (
              <Link
                key={card.text}
                href={`/create?prompt=${encodeURIComponent(`${card.genre}: ${card.text}`)}`}
                className={cn(
                  "group relative w-64 shrink-0 snap-start overflow-hidden rounded-2xl bg-linear-to-br p-5 text-white sm:w-auto",
                  "transition-transform duration-300 hover:-translate-y-1",
                  card.bg
                )}
              >
                <span
                  aria-hidden
                  className="absolute -top-10 -right-10 size-36 rounded-full bg-white/10 blur-2xl transition-opacity group-hover:opacity-70"
                />
                <p className="text-sm font-semibold text-white/80">{card.genre}</p>
                <p className="mt-2 min-h-14 text-[17px] leading-snug font-medium">{card.text}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold">
                  <Sparkles className="size-4" /> Use this idea
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="songs-heading">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 id="songs-heading" className="font-display text-2xl">
              Your songs
            </h2>
            {!!songs.data?.length && (
              <Link href="/songs" className="ink-link text-sm">
                Open the library
              </Link>
            )}
          </div>

          {songs.loading && !songs.data ? (
            <CoverGridSkeleton />
          ) : ordered.length ? (
            <div className="grid animate-settle grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
              {ordered.map((song) => (
                <SongTile
                  key={song.id}
                  song={song}
                  stemsCost={settings.data?.creditCosts.stems}
                  onChange={(updated) => songs.setData((list) => list?.map((s) => (s.id === updated.id ? updated : s)))}
                  onDelete={(id) => songs.setData((list) => list?.filter((s) => s.id !== id))}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-hairline px-6 py-10 text-center text-ink-2">
              Your songs will appear here. Describe one above, or start from an idea.
            </p>
          )}
        </section>
      </div>
    </>
  );
}

/** "You have 94 credits, enough for about 31 songs." or a plain statement when there are none. */
function creditLine(credits: number, songCost?: number): string {
  if (credits === 0) return "You have no credits yet.";
  if (!songCost) return `You have ${credits} credits.`;
  const n = Math.floor(credits / Math.max(1, songCost));
  if (n === 0) return `You have ${credits} credits, not quite enough for a song.`;
  return `You have ${credits} credits, enough for about ${n} ${n === 1 ? "song" : "songs"}.`;
}

type Mode = "write" | "similar";

/** The composer: describe a song, then continue to the full form with it prefilled. */
function Composer({
  idea,
  setIdea,
  songCost,
  remixCost,
}: {
  idea: string;
  setIdea: (v: string) => void;
  songCost?: number;
  remixCost?: number;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("write");
  const box = useRef<HTMLTextAreaElement>(null);

  const go = () => {
    const q = idea.trim() ? `?prompt=${encodeURIComponent(idea.trim())}` : "";
    router.push(mode === "write" ? `/create${q}` : `/remix${q}`);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        go();
      }}
      className="gradient-edge rounded-3xl p-2 shadow-[0_24px_80px_-32px_rgb(236_72_126/0.55)] backdrop-blur-xl"
    >
      <div className="flex gap-1 p-1" role="tablist" aria-label="What would you like to make?">
        {(
          [
            ["write", "Write a song", "/art/tool-lyrics.jpg"],
            ["similar", "Similar song", "/art/tool-remix.jpg"],
          ] as const
        ).map(([value, label, art]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={mode === value}
            onClick={() => setMode(value)}
            className={cn(
              "flex items-center gap-2.5 rounded-xl py-1.5 pr-4 pl-1.5 text-sm transition-colors",
              mode === value ? "bg-surface-3 font-medium text-ink" : "text-ink-2 hover:text-ink"
            )}
          >
            <span className="relative size-7 overflow-hidden rounded-md">
              <Image src={art} alt="" fill sizes="28px" className="object-cover" />
            </span>
            {label}
          </button>
        ))}
      </div>

      <label htmlFor="idea" className="sr-only">
        Describe your song
      </label>
      <textarea
        id="idea"
        ref={box}
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) go();
        }}
        maxLength={500}
        rows={3}
        placeholder={
          mode === "write"
            ? "Describe the song you hear in your head…"
            : "Describe the new version, e.g. same tune, new lyrics about the monsoon, female voice"
        }
        className="block w-full resize-none bg-transparent px-4 pt-3 pb-2 text-lg leading-relaxed text-ink outline-none placeholder:text-ink-3"
      />

      <div className="flex flex-wrap items-center justify-end gap-3 px-3 pb-2">
        <span className="text-xs text-ink-3">
          {mode === "write"
            ? songCost !== undefined && `${songCost} credits per song`
            : remixCost !== undefined && `${remixCost} credits per song`}
        </span>
        <Button type="submit" variant="brand" size="xl" className="rounded-full px-6">
          {mode === "write" ? <Sparkles /> : <Repeat2 />}
          {mode === "write" ? "Continue to lyrics" : "Choose a song"}
        </Button>
      </div>
    </form>
  );
}

function CoverGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i}>
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="mt-3 h-4 w-2/3" />
          <Skeleton className="mt-2 h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
