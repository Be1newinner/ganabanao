import type { Metadata } from "next";
import { LegalPage, PendingText } from "@/components/legal-page";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <PendingText />
      <p>
        This policy will follow India&apos;s Digital Personal Data Protection Act, 2023. It will cover:
      </p>
      <ul>
        <li>what we collect: name, email address, songs you create and audio you upload, payment records</li>
        <li>why we collect it and how long we keep it (stems are deleted after 30 days; uploaded reference audio after the job finishes)</li>
        <li>who processes it on our behalf: AI music generation, hosting, storage, email and payment providers</li>
        <li>your rights, including deleting your account and all your songs from your profile page</li>
        <li>how to contact us about your data</li>
      </ul>
    </LegalPage>
  );
}
