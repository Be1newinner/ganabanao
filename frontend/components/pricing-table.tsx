"use client";

import { useApi } from "@/lib/use-api";
import { formatInr } from "@/lib/format";
import type { Catalog } from "@/lib/types";
import { useSession } from "@/lib/session";
import { Alert, Button, Card, LinkButton, Spinner } from "./ui";

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

  if (loading) return <div className="flex justify-center py-12"><Spinner /></div>;
  if (error || !data) return <Alert tone="error">Could not load prices. {error?.message}</Alert>;

  const action = (kind: "plan" | "pack", id: string) => {
    const handler = kind === "plan" ? onBuyPlan : onBuyPack;
    if (handler) {
      const isCurrent = kind === "plan" && id === currentPlanId;
      return (
        <Button className="w-full" onClick={() => handler(id)} loading={busyId === id} disabled={isCurrent}>
          {isCurrent ? "Your plan" : kind === "plan" ? "Subscribe" : "Buy credits"}
        </Button>
      );
    }
    return (
      <LinkButton className="w-full" href={user ? "/billing" : "/signup"}>
        {user ? "Buy in billing" : "Sign up to buy"}
      </LinkButton>
    );
  };

  const costs = data.creditCosts;
  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-xl font-semibold">Monthly plans</h2>
        <p className="mt-1 text-sm text-muted">
          Credits are added every month when your plan renews.{" "}
          {data.carryOverSubscriptionCredits ? "Unused credits carry over." : "Unused plan credits expire at renewal."} Cancel any time.
        </p>
        {data.plans.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Plans will be announced soon.</p>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.plans.map((p) => (
              <Card key={p.id} className="flex flex-col">
                <h3 className="font-semibold">{p.name}</h3>
                <p className="mt-2 text-3xl font-semibold">
                  {formatInr(p.pricePaise)}
                  <span className="text-base font-normal text-muted"> / month</span>
                </p>
                <p className="mt-1 text-sm font-medium text-brand-strong">{p.credits} credits every month</p>
                {p.description && <p className="mt-3 text-sm text-muted">{p.description}</p>}
                <div className="mt-auto pt-5">{action("plan", p.id)}</div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold">Credit packs</h2>
        <p className="mt-1 text-sm text-muted">One-time purchase. Credits stay in your account.</p>
        {data.packs.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Credit packs will be announced soon.</p>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.packs.map((p) => (
              <Card key={p.id} className="flex flex-col">
                <h3 className="font-semibold">{p.name}</h3>
                <p className="mt-2 text-2xl font-semibold">{formatInr(p.pricePaise)}</p>
                <p className="mt-1 text-sm font-medium text-brand-strong">{p.credits} credits</p>
                <div className="mt-auto pt-5">{action("pack", p.id)}</div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold">What things cost</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border">
              {[
                ["Song from text and lyrics", costs.generate],
                ["Instrumental track", costs.instrumental],
                ["Similar song from your audio", costs.remix],
                ["Stems for a song (once per song, kept 30 days)", costs.stems],
              ].map(([label, cost]) => (
                <tr key={label}>
                  <td className="px-4 py-3">{label}</td>
                  <td className="px-4 py-3 text-right font-medium">{cost} credits</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted">If a job fails, its credits are returned automatically.</p>
      </section>
    </div>
  );
}
