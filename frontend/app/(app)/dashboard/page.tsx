"use client";

import { PenLine, Repeat2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SongList, useSongs } from "@/components/songs/song-list";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { useSession } from "@/lib/session";
import type { Catalog } from "@/lib/types";
import { useApi } from "@/lib/use-api";
import { cn } from "@/lib/utils";

/** Dashboard (FR-2.1, FR-2.2): the mural and song prompt, balance and plan, the two tools, recent songs. */
export default function DashboardPage() {
  const { user } = useSession();
  const catalog = useApi<Catalog>("/billing/catalog");
  const recent = useSongs("/songs?limit=5");
  if (!user) return null;

  const sub = user.subscription;
  const plan = catalog.data?.plans.find((p) => p.id === sub?.planId);
  const subLive = sub && ["active", "authenticated", "pending"].includes(sub.status ?? "");
  const songCost = catalog.data?.creditCosts.generate;

  return (
    <div className="space-y-14">
      <Hero firstName={user.name.split(" ")[0]} />

      {/* Balance and plan (FR-2.1), as one line of the ledger rather than stat cards */}
      <section aria-label="Credits and plan" className="flex flex-wrap items-baseline gap-x-10 gap-y-3">
        <p>
          <span className="font-display text-4xl">{user.credits}</span>{" "}
          <span className="text-muted-foreground">
            credits{songCost ? `, enough for about ${Math.floor(user.credits / Math.max(1, songCost))} songs` : ""}
          </span>
        </p>
        <p className="text-muted-foreground">
          {subLive ? (
            <>
              <span className="font-semibold text-foreground">{plan?.name ?? "Monthly plan"}</span>{" "}
              {sub.cancelAtPeriodEnd ? "ends" : "renews"} on {formatDate(sub.currentPeriodEnd)}
            </>
          ) : (
            "No monthly plan"
          )}
        </p>
        <Link href="/billing" className="ink-link">
          {subLive ? "Manage credits" : "Add credits"}
        </Link>
      </section>

      {/* The two ways to make a song (FR-2.2) */}
      <section className="grid gap-6 xl:grid-cols-2">
        <ToolPanel
          href="/create"
          image="/art/tool-lyrics.jpg"
          title="Write a song"
          body="Bring your lyrics. Choose the genre, mood, taal and instruments, and get a full song with vocals."
          action="Start writing"
          icon={<PenLine />}
        />
        <ToolPanel
          href="/remix"
          image="/art/tool-remix.jpg"
          title="Make a similar song"
          body="Upload a song you have the rights to, write new words, and keep its music and feel."
          action="Upload a song"
          icon={<Repeat2 />}
        />
      </section>

      {/* Five newest songs, each with Download: Single or Stems (FR-2.2) */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl">Recent songs</h2>
          <Link href="/songs" className="ink-link text-sm">
            Open the library
          </Link>
        </div>
        <SongList
          songs={recent.data}
          loading={recent.loading}
          error={recent.error}
          setSongs={(fn) => recent.setData((s) => fn(s))}
          numbered
          empty={<EmptySongs />}
        />
      </section>
    </div>
  );
}

function Hero({ firstName }: { firstName: string }) {
  const router = useRouter();
  const [idea, setIdea] = useState("");

  return (
    <section className="painted-frame relative overflow-hidden bg-[#f7f4eb] text-[#1f1a17]">
      {/* The mural keeps its own paper colour in both themes: a painting hung on the wall */}
      <div className="relative h-56 sm:h-72 lg:aspect-[1376/768] lg:h-auto">
        <Image
          src="/art/hero-mural.jpg"
          alt="Madhubani painting of a village music gathering: a singer, a dholak player, a harmonium player and a flute player among peacocks, fish and lotus flowers"
          fill
          priority
          sizes="(min-width: 1024px) 70vw, 100vw"
          className="animate-unveil object-cover object-right"
        />
      </div>
      <div className="relative px-6 pt-2 pb-8 sm:px-10 lg:absolute lg:inset-y-0 lg:left-0 lg:flex lg:w-[40%] lg:flex-col lg:justify-center lg:py-10 lg:pr-4 lg:pl-[4.5%]">
        <h1 className="font-display text-4xl leading-[1.05] sm:text-5xl xl:text-6xl">{firstName}, what shall we sing today?</h1>
        <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-[#4a463e]">
          Describe the song in a line. You can add lyrics, taal and instruments on the next page.
        </p>
        <form
          className="mt-6 max-w-md"
          onSubmit={(e) => {
            e.preventDefault();
            router.push(idea.trim() ? `/create?prompt=${encodeURIComponent(idea.trim())}` : "/create");
          }}
        >
          <label htmlFor="idea" className="sr-only">
            Describe your song
          </label>
          <input
            id="idea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            maxLength={500}
            placeholder="A Kajri for the first rain, female voice, bansuri"
            className="h-11 w-full border-b-2 border-kajal bg-transparent text-base outline-none placeholder:text-[#8a857a] focus:border-sindoor"
          />
          <Button type="submit" variant="brand" size="xl" className="mt-4">
            <PenLine /> Start this song
          </Button>
        </form>
      </div>
    </section>
  );
}

function ToolPanel({
  href,
  image,
  title,
  body,
  action,
  icon,
}: {
  href: string;
  image: string;
  title: string;
  body: string;
  action: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-6 rounded-md border bg-card p-5 transition-colors hover:border-ink-line/40 sm:flex-row sm:items-center sm:p-6"
    >
      {/* The artwork is the only colour in the panel */}
      <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-sm bg-[#f7f4eb] sm:w-40">
        <Image src={image} alt="" fill sizes="(min-width: 640px) 160px, 100vw" className="object-cover" />
      </div>
      <div className="min-w-0">
        <h2 className="font-display text-[1.75rem] leading-tight">{title}</h2>
        <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted-foreground">{body}</p>
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sindoor">
          {icon}
          <span className="underline decoration-transparent decoration-2 underline-offset-4 transition-colors group-hover:decoration-sindoor">
            {action}
          </span>
        </span>
      </div>
    </Link>
  );
}

function EmptySongs() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-dashed py-10 text-center">
      <div className="relative size-28 overflow-hidden rounded-full bg-[#f7f4eb]">
        <Image src="/art/empty-koel.jpg" alt="" fill sizes="112px" className="object-cover" />
      </div>
      <p className="mt-2 font-display text-2xl">Your first song will sing here</p>
      <p className="max-w-sm text-sm text-muted-foreground">Describe one above, or write your lyrics to begin.</p>
    </div>
  );
}
