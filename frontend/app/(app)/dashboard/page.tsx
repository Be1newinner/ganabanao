"use client";

import Link from "next/link";
import { SongList, useSongs } from "@/components/song-list";
import { Card, EmptyState, LinkButton, PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { useApi } from "@/lib/use-api";
import { useSession } from "@/lib/session";
import type { Catalog } from "@/lib/types";

/** Dashboard (FR-2.1, FR-2.2): balance, plan, the two create options and the five newest songs. */
export default function DashboardPage() {
  const { user } = useSession();
  const catalog = useApi<Catalog>("/billing/catalog");
  const recent = useSongs("/songs?limit=5");
  if (!user) return null;

  const sub = user.subscription;
  const plan = catalog.data?.plans.find((p) => p.id === sub?.planId);
  const subLive = sub && ["active", "authenticated", "pending"].includes(sub.status ?? "");

  return (
    <>
      <PageHeader title={`Namaste, ${user.name.split(" ")[0]}`} description="What would you like to make today?" />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-muted">Credit balance</p>
          <p className="mt-1 text-3xl font-semibold">{user.credits}</p>
          <Link href="/billing" className="mt-2 inline-block text-sm text-brand hover:underline">
            Buy credits
          </Link>
        </Card>
        <Card className="sm:col-span-2">
          <p className="text-sm text-muted">Current plan</p>
          {subLive ? (
            <>
              <p className="mt-1 text-xl font-semibold">{plan?.name ?? "Monthly plan"}</p>
              <p className="mt-1 text-sm text-muted">
                {sub.cancelAtPeriodEnd ? "Ends" : "Renews"} on {formatDate(sub.currentPeriodEnd)}
                {plan && !sub.cancelAtPeriodEnd ? ` · adds ${plan.credits} credits` : ""}
              </p>
            </>
          ) : (
            <>
              <p className="mt-1 text-xl font-semibold">No plan</p>
              <p className="mt-1 text-sm text-muted">Pay as you go with credit packs, or pick a monthly plan.</p>
            </>
          )}
          <Link href="/billing" className="mt-2 inline-block text-sm text-brand hover:underline">
            Manage billing
          </Link>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card className="flex flex-col">
          <h2 className="text-lg font-semibold">✍️ Text to song</h2>
          <p className="mt-1 flex-1 text-sm text-muted">
            Write lyrics, choose the genre, mood, taal and instruments, and get a full song.
          </p>
          <LinkButton href="/create" className="mt-4 self-start">
            Create a song
          </LinkButton>
        </Card>
        <Card className="flex flex-col">
          <h2 className="text-lg font-semibold">🔁 Similar song, new lyrics</h2>
          <p className="mt-1 flex-1 text-sm text-muted">
            Upload a song you have rights to and get a new version with your lyrics.
          </p>
          <LinkButton href="/remix" className="mt-4 self-start">
            Make a similar song
          </LinkButton>
        </Card>
      </div>

      <div className="mt-10 mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent songs</h2>
        <Link href="/songs" className="text-sm text-brand hover:underline">
          All songs
        </Link>
      </div>
      <SongList
        songs={recent.data}
        loading={recent.loading}
        error={recent.error}
        setSongs={(fn) => recent.setData((s) => fn(s))}
        empty={<EmptyState title="No songs yet">Your songs will appear here. Start with “Create a song”.</EmptyState>}
      />
    </>
  );
}
