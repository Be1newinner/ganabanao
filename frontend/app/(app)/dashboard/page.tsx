"use client";

import { ArrowRight, CalendarClock, Library, Repeat2, Sparkles, Wand2, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EmptyState } from "@/components/common";
import { CoverArt } from "@/components/cover-art";
import { SongList, useSongs } from "@/components/songs/song-list";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { useSession } from "@/lib/session";
import type { Catalog } from "@/lib/types";
import { useApi } from "@/lib/use-api";

/** Dashboard (FR-2.1, FR-2.2): balance, plan, the two create options and the five newest songs. */
export default function DashboardPage() {
  const { user } = useSession();
  const router = useRouter();
  const catalog = useApi<Catalog>("/billing/catalog");
  const recent = useSongs("/songs?limit=5");
  const [idea, setIdea] = useState("");
  if (!user) return null;

  const sub = user.subscription;
  const plan = catalog.data?.plans.find((p) => p.id === sub?.planId);
  const subLive = sub && ["active", "authenticated", "pending"].includes(sub.status ?? "");

  return (
    <div className="space-y-10">
      {/* Welcome + quick prompt */}
      <section className="relative overflow-hidden rounded-3xl border bg-card p-6 sm:p-10">
        <div aria-hidden className="absolute inset-0 bg-aurora opacity-80" />
        <div className="relative">
          <p className="text-sm text-muted-foreground">Namaste, {user.name.split(" ")[0]} 👋</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-5xl">
            What will you <span className="text-brand-gradient">sing today?</span>
          </h1>
          <form
            className="mt-8 flex max-w-2xl flex-col gap-2 rounded-2xl border bg-background/80 p-2 shadow-xl shadow-brand-3/5 backdrop-blur sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              router.push(idea.trim() ? `/create?prompt=${encodeURIComponent(idea.trim())}` : "/create");
            }}
          >
            <input
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              maxLength={500}
              placeholder="A romantic Kajri in the rain, female vocal, bansuri…"
              aria-label="Describe your song"
              className="h-11 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            <Button type="submit" variant="brand" size="xl">
              <Sparkles /> Create
            </Button>
          </form>
        </div>
      </section>

      {/* Balance and plan (FR-2.1) */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Link href="/billing" className="group rounded-2xl border bg-card p-5 transition-colors hover:border-primary/40">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            Credit balance <Zap className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-display text-4xl font-bold">{user.credits}</p>
          <p className="mt-1 text-xs text-primary group-hover:underline">Buy more credits →</p>
        </Link>
        <Link
          href="/billing"
          className="group rounded-2xl border bg-card p-5 transition-colors hover:border-primary/40 sm:col-span-2"
        >
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            Current plan <CalendarClock className="size-4 text-primary" />
          </div>
          {subLive ? (
            <>
              <p className="mt-2 font-display text-2xl font-bold">{plan?.name ?? "Monthly plan"}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {sub.cancelAtPeriodEnd ? "Ends" : "Renews"} on {formatDate(sub.currentPeriodEnd)}
                {plan && !sub.cancelAtPeriodEnd ? ` · adds ${plan.credits} credits` : ""}
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 font-display text-2xl font-bold">Pay as you go</p>
              <p className="mt-1 text-sm text-muted-foreground">Pick a monthly plan for fresh credits every month.</p>
            </>
          )}
        </Link>
      </section>

      {/* The two create options (FR-2.2) */}
      <section className="grid gap-4 md:grid-cols-2">
        {[
          {
            href: "/create",
            icon: Wand2,
            seed: "text-to-song",
            title: "Text to song",
            body: "Write lyrics, choose genre, mood, taal and instruments, and get a full song.",
            cta: "Start writing",
          },
          {
            href: "/remix",
            icon: Repeat2,
            seed: "similar-song-tool",
            title: "Similar song, new lyrics",
            body: "Upload a song you have rights to and get a new version with your words.",
            cta: "Upload a song",
          },
        ].map(({ href, icon: Icon, seed, title, body, cta }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-5 overflow-hidden rounded-2xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-xl hover:shadow-brand-2/5"
          >
            <CoverArt seed={seed} className="size-24 sm:size-28" rounded="rounded-xl">
              <Icon className="absolute inset-0 m-auto size-9 text-white drop-shadow" />
            </CoverArt>
            <div className="min-w-0">
              <h2 className="font-display text-xl font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              <p className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                {cta} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </p>
            </div>
          </Link>
        ))}
      </section>

      {/* Five newest songs, each with Download: Single or Stems (FR-2.2) */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Recent songs</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/songs">
              View library <ArrowRight />
            </Link>
          </Button>
        </div>
        <SongList
          songs={recent.data}
          loading={recent.loading}
          error={recent.error}
          setSongs={(fn) => recent.setData((s) => fn(s))}
          empty={
            <EmptyState icon={<Library className="size-5" />} title="No songs yet">
              Your songs will show up here. Describe one above to get started.
            </EmptyState>
          }
        />
      </section>
    </div>
  );
}
