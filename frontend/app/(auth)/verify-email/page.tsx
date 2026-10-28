import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/common";
import { VerifyEmail } from "./verify-email";

export const metadata: Metadata = { title: "Verify email" };

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Spinner className="mx-auto size-8" />}>
      <VerifyEmail />
    </Suspense>
  );
}
