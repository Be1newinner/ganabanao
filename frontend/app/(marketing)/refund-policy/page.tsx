import type { Metadata } from "next";
import { LegalPage, PendingText } from "@/components/legal-page";

export const metadata: Metadata = { title: "Refund Policy" };

export default function RefundPolicyPage() {
  return (
    <LegalPage title="Refund Policy">
      <PendingText />
      <h2>Failed songs</h2>
      <p>If a song, remix or stem download fails, the credits it used are returned to your account automatically.</p>
      <h2>Paid credits and plans</h2>
      <p>The rules for refunds of credit packs and monthly plans will be stated here.</p>
    </LegalPage>
  );
}
