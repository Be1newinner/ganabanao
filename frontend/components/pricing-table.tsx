"use client";

import { Check, Coins, Repeat, Zap } from "lucide-react";
import Link from "next/link";
import { Spinner } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatInr } from "@/lib/format";
import { useSession } from "@/lib/session";
import type { Catalog } from "@/lib/types";
import { useApi } from "@/lib/use-api";
import { cn } from "@/lib/utils";

/**
 * Plans and credit packs from the API (FR-1.2). On the billing page,
 * `onBuyPlan` / `onBuyPack` open Razorpay; on the public page they link to signup or billing.
 */
export function PricingTable({
  onBuyPlan,
  onBuyPack,
  busyId,
  currentPlanId,
}: {
  onBuyPlan?: (id: string) => void;
  onBuyPack?: (id: string) => void;
  busyId?: string | null;
  currentPlanId?: string;
}) {
  const { data, error, loading } = useApi<Catalog>("/billing/catalog");
  const { user } = useSession();

  if (loading) {
    return (
      <div className="grid gap-5 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-72 rounded-2xl" />
        ))}
      </div>
    );
  }
  if (error || !data) return <p className="text-sm text-destructive">Could not load prices. {error?.message}</p>;

  const action = (kind: "plan" | "pack", id: string, featured = false) => {
    const handler = kind === "plan" ? onBuyPlan : onBuyPack;
    if (handler) {
      const isCurrent = kind === "plan" && id === currentPlanId;
      return (
        <Button
          variant={featured ? "brand" : "outline"}
          size="xl"
          className="w-full"
          onClick={() => handler(id)}
          disabled={isCurrent || busyId === id}
        >
          {busyId === id && <Spinner />}
          {isCurrent ? "Your plan" : kind === "plan" ? "Subscribe" : "Buy credits"}
        </Button>
      );
    }
    return (
      <Button variant={featured ? "brand" : "outline"} size="xl" className="w-full" asChild>
        <Link href={user ? "/billing" : "/signup"}>{user ? "Choose in billing" : "Get started"}</Link>
      </Button>
    );
  };

  const costs = data.creditCosts;
  const featuredIndex = data.plans.length >= 3 ? 1 : data.plans.length - 1;

  return (
    <div className="space-y-16">
      <section>
        <div className="mb-6 flex items-center gap-2">
          <Repeat className="size-5 text-primary" />
          <h2 className="font-display text-2xl font-bold">Monthly plans</h2>
        </div>
        <p className="-mt-4 mb-6 text-sm text-muted-foreground">
          Credits are added every month when your plan renews.{" "}
          {data.carryOverSubscriptionCredits ? "Unused credits carry over." : "Unused plan credits expire at renewal."}{" "}
          Cancel any time.
        </p>
        {data.plans.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Plans will be announced soon.
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {data.plans.map((p, i) => {
              const featured = i === featuredIndex;
              return (
                <div
                  key={p.id}
                  className={cn(
                    "relative flex flex-col rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#ee6a8a]/40 hover:shadow-[0_24px_60px_-28px_rgb(238_106_138/0.55)]",
                    featured && "border-transparent shadow-2xl shadow-brand-2/15 ring-2 ring-primary/60"
                  )}
                >
                  {featured && (
                    <span className="absolute -top-3 left-6 rounded-full bg-brand-gradient px-3 py-0.5 text-xs font-semibold text-white">
                      Most popular
                    </span>
                  )}
                  <h3 className="font-display text-lg font-semibold">{p.name}</h3>
                  <p className="mt-4 font-display text-4xl font-bold">
                    {formatInr(p.pricePaise)}
                    <span className="text-base font-normal text-muted-foreground"> /month</span>
                  </p>
                  <ul className="mt-6 space-y-2 text-sm">
                    <li className="flex gap-2">
                      <Zap className="size-4 text-primary" /> <strong>{p.credits} credits</strong> every month
                    </li>
                    <li className="flex gap-2 text-muted-foreground">
                      <Check className="size-4 text-success" /> About {Math.floor(p.credits / Math.max(1, costs.generate))} songs
                    </li>
                    {p.description && (
                      <li className="flex gap-2 text-muted-foreground">
                        <Check className="size-4 text-success" /> {p.description}
                      </li>
                    )}
                  </ul>
                  <div className="mt-auto pt-8">{action("plan", p.id, featured)}</div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="mb-6 flex items-center gap-2">
          <Coins className="size-5 text-primary" />
          <h2 className="font-display text-2xl font-bold">Credit packs</h2>
        </div>
        <p className="-mt-4 mb-6 text-sm text-muted-foreground">One-time purchase. Credits stay in your account.</p>
        {data.packs.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Credit packs will be announced soon.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.packs.map((p) => (
              <div key={p.id} className="flex flex-col rounded-2xl border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#ee6a8a]/40 hover:shadow-[0_24px_60px_-28px_rgb(238_106_138/0.55)]">
                <h3 className="font-medium">{p.name}</h3>
                <p className="mt-3 font-display text-3xl font-bold">{formatInr(p.pricePaise)}</p>
                <p className="mt-1 text-sm font-medium text-primary">{p.credits} credits</p>
                <div className="mt-auto pt-6">{action("pack", p.id)}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-6 font-display text-2xl font-bold">What things cost</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Song from lyrics", costs.generate, "One full song, up to 5:30"],
            ["Instrumental", costs.instrumental, "No vocals"],
            ["Similar song", costs.remix, "From your own audio"],
            ["Stems", costs.stems, "Once per song, kept 30 days"],
          ].map(([label, cost, note]) => (
            <div key={label} className="rounded-2xl border bg-card p-5">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-1 font-display text-2xl font-bold">
                {cost} <span className="text-sm font-normal text-muted-foreground">credits</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{note}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">If a job fails, its credits are returned automatically.</p>
      </section>
    </div>
  );
}
