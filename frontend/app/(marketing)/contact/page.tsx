import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { SUPPORT_EMAIL } from "@/lib/config";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <LegalPage title="Contact us">
      <p>
        For help with your account, payments or a song, email{" "}
        <a className="font-medium text-brand underline" href={`mailto:${SUPPORT_EMAIL}`}>
          {SUPPORT_EMAIL}
        </a>
        .
      </p>
      <p>To report content that infringes your copyright, email the same address with a link to the song and proof of ownership.</p>
    </LegalPage>
  );
}
