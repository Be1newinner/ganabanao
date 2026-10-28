import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "./reset-form";

export const metadata: Metadata = { title: "Choose a new password" };

export default function ResetPasswordPage() {
  return (
    <>
      <h1 className="font-display text-3xl font-bold tracking-tight">Choose a new password</h1>
      <p className="mt-2 mb-8 text-sm text-muted-foreground">You will be signed out of other devices.</p>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </>
  );
}
