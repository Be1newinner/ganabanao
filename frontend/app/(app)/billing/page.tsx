"use client";

import { CalendarClock, Receipt, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState, PageHeader, Spinner, StatusBadge } from "@/components/common";
import { PricingTable } from "@/components/pricing-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, ApiError } from "@/lib/api";
import { SITE_NAME } from "@/lib/config";
import { formatDate, formatDateTime, formatInr } from "@/lib/format";
import { openCheckout } from "@/lib/razorpay";
import { useSession } from "@/lib/session";
import type { Catalog, LedgerEntry, Payment, User } from "@/lib/types";
import { useApi } from "@/lib/use-api";
import { cn } from "@/lib/utils";

const LEDGER_LABELS: Record<string, string> = {
  signup: "Welcome credits",
  purchase: "Credit pack",
  subscription: "Plan credits",
  expire: "Expired",
  reserve: "Used",
  refund: "Refund",
  admin: "Adjustment",
};

/** Credits, plan and payments (FR-2.1, FR-7.3 to FR-7.7). */
export default function BillingPage() {
  const { user, setUser, refresh } = useSession();
  const catalog = useApi<Catalog>("/billing/catalog");
  const payments = useApi<Payment[]>("/billing/payments");
  const ledger = useApi<LedgerEntry[]>("/billing/ledger?limit=50");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  if (!user) return null;
  const sub = user.subscription;
  const subLive = sub && ["active", "authenticated", "pending", "created"].includes(sub.status ?? "");
  const plan = catalog.data?.plans.find((p) => p.id === sub?.planId);

  /** Credits arrive by webhook a moment after payment; poll the balance briefly. */
  async function waitForCredits(before: number) {
    const toastId = toast.loading("Payment received. Adding your credits…");
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const fresh = await refresh().catch(() => null);
      if (fresh && (fresh.credits > before || fresh.subscription?.status === "active")) {
        toast.success("Credits added. Happy creating!", { id: toastId });
        void payments.reload();
        void ledger.reload();
        return;
      }
    }
    toast.info("Your payment is being confirmed. Credits will appear shortly — refresh in a minute.", { id: toastId });
  }

  async function checkout(kind: "pack" | "plan", id: string) {
    setBusyId(id);
    try {
      const before = user!.credits;
      let paid: boolean;
      if (kind === "pack") {
        const { data } = await api.post<{ keyId: string; orderId: string; description: string }>("/billing/orders", { packId: id });
        paid = await openCheckout({
          key: data.keyId,
          order_id: data.orderId,
          name: SITE_NAME,
          description: data.description,
          prefill: { name: user!.name, email: user!.email },
        });
      } else {
        const { data } = await api.post<{ keyId: string; subscriptionId: string; description: string }>("/billing/subscription", {
          planId: id,
        });
        paid = await openCheckout({
          key: data.keyId,
          subscription_id: data.subscriptionId,
          name: SITE_NAME,
          description: data.description,
          prefill: { name: user!.name, email: user!.email },
        });
        void refresh();
      }
      if (paid) await waitForCredits(before);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment could not start.");
    } finally {
      setBusyId(null);
    }
  }

  async function cancelPlan() {
    setCancelling(true);
    try {
      const res = await api.delete("/billing/subscription");
      const fresh = await refresh();
      if (fresh) setUser(fresh as User);
      setCancelOpen(false);
      toast.success(res.message);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not cancel the plan.");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <>
      <PageHeader title="Credits & plans" description="Every song, similar song and stem download uses credits." />

      <div className="mb-12 grid gap-4 md:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl bg-brand-gradient p-6 text-white shadow-xl shadow-brand-2/20">
          <Zap aria-hidden className="absolute -right-4 -bottom-4 size-28 opacity-20" />
          <p className="text-sm text-white/80">Credit balance</p>
          <p className="mt-2 font-display text-5xl font-bold">{user.credits}</p>
          {catalog.data && (
            <p className="mt-2 text-sm text-white/80">
              About {Math.floor(user.credits / Math.max(1, catalog.data.creditCosts.generate))} songs
            </p>
          )}
        </div>
        <div className="rounded-2xl border bg-card p-6 md:col-span-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            Your plan <CalendarClock className="size-4 text-primary" />
          </div>
          {subLive ? (
            <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-display text-2xl font-bold">
                  {plan?.name ?? "Monthly plan"}{" "}
                  {sub.cancelAtPeriodEnd && <Badge variant="outline" className="align-middle">Cancelled</Badge>}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {sub.status !== "active"
                    ? "Waiting for the first payment to be confirmed."
                    : sub.cancelAtPeriodEnd
                      ? `Ends on ${formatDate(sub.currentPeriodEnd)}. Your credits stay in your account.`
                      : `Renews on ${formatDate(sub.currentPeriodEnd)}${plan ? ` and adds ${plan.credits} credits` : ""}.`}
                </p>
              </div>
              {!sub.cancelAtPeriodEnd && (
                <Button variant="outline" onClick={() => setCancelOpen(true)}>
                  Cancel plan
                </Button>
              )}
            </div>
          ) : (
            <>
              <p className="mt-2 font-display text-2xl font-bold">Pay as you go</p>
              <p className="mt-1 text-sm text-muted-foreground">Choose a plan below for fresh credits every month.</p>
            </>
          )}
        </div>
      </div>

      <PricingTable
        onBuyPlan={(id) => void checkout("plan", id)}
        onBuyPack={(id) => void checkout("pack", id)}
        busyId={busyId}
        currentPlanId={subLive && !sub.cancelAtPeriodEnd ? sub.planId : undefined}
      />

      <section className="mt-16">
        <h2 className="mb-4 font-display text-2xl font-bold">History</h2>
        <Tabs defaultValue="credits">
          <TabsList>
            <TabsTrigger value="credits">Credits</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="credits" className="mt-4">
            {ledger.loading ? (
              <Spinner />
            ) : !ledger.data?.length ? (
              <EmptyState title="No credit activity yet" />
            ) : (
              <div className="overflow-hidden rounded-2xl border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>What</TableHead>
                      <TableHead className="text-right">Credits</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledger.data.map((l) => (
                      <TableRow key={l._id}>
                        <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateTime(l.createdAt)}</TableCell>
                        <TableCell>
                          <span className="font-medium">{LEDGER_LABELS[l.type] ?? l.type}</span>
                          <span className="block max-w-xs truncate text-xs text-muted-foreground">{l.reason}</span>
                        </TableCell>
                        <TableCell className={cn("text-right font-medium tabular-nums", l.amount > 0 ? "text-success" : "")}>
                          {l.amount > 0 ? `+${l.amount}` : l.amount}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">{l.balanceAfter}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="payments" className="mt-4">
            {payments.loading ? (
              <Spinner />
            ) : !payments.data?.length ? (
              <EmptyState icon={<Receipt className="size-5" />} title="No payments yet" />
            ) : (
              <div className="overflow-hidden rounded-2xl border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.data.map((p) => (
                      <TableRow key={p._id}>
                        <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(p.paidAt ?? p.createdAt)}</TableCell>
                        <TableCell className="font-medium">{p.description}</TableCell>
                        <TableCell>
                          <StatusBadge status={p.status} />
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{formatInr(p.amountPaise)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel your plan?</DialogTitle>
            <DialogDescription>
              {sub?.status === "active"
                ? `Your plan stops renewing. It stays active until ${formatDate(sub?.currentPeriodEnd)}, and the credits you have stay in your account.`
                : "The plan has not been paid yet, so it is cancelled straight away."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCancelOpen(false)}>
              Keep plan
            </Button>
            <Button variant="destructive" onClick={() => void cancelPlan()} disabled={cancelling}>
              {cancelling && <Spinner />} Cancel plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
