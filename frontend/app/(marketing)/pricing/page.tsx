import type { Metadata } from "next";
import { PricingTable } from "@/components/pricing-table";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="text-3xl font-semibold tracking-tight">Pricing</h1>
      <p className="mt-2 text-muted">Every song, remix and stem download uses credits. Pick a monthly plan or buy a pack.</p>
      <div className="mt-10">
        <PricingTable />
      </div>
    </div>
  );
}
