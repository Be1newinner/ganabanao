import type { Metadata } from "next";
import { PricingTable } from "@/components/pricing-table";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <div className="relative">
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-96 bg-aurora" />
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-14 text-center">
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            Simple, <span className="text-brand-gradient">credit-based</span> pricing
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Every song, remix and stem download uses credits. Pick a monthly plan or top up with a pack.
          </p>
        </div>
        <PricingTable />
      </div>
    </div>
  );
}
