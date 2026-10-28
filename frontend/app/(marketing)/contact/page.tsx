import { Mail, ShieldAlert } from "lucide-react";
import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { SUPPORT_EMAIL } from "@/lib/config";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <LegalPage title="Contact us">
      <div className="not-prose grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5">
          <Mail className="size-5 text-primary" />
          <h2 className="!mt-3 !text-base">Help with your account</h2>
          <p className="mt-1 text-sm text-muted-foreground">Payments, credits, songs or sign-in problems.</p>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="mt-3 inline-block text-sm">
            {SUPPORT_EMAIL}
          </a>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <ShieldAlert className="size-5 text-primary" />
          <h2 className="!mt-3 !text-base">Report a copyright issue</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Email a link to the song and proof that you own the music. We remove infringing content.
          </p>
          <a href={`mailto:${SUPPORT_EMAIL}?subject=Copyright%20complaint`} className="mt-3 inline-block text-sm">
            {SUPPORT_EMAIL}
          </a>
        </div>
      </div>
    </LegalPage>
  );
}
