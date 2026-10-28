import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "./reset-form";

export const metadata: Metadata = { title: "Choose a new password" };

export default function ResetPasswordPage() {
  return (
    <>
      <h1 className="text-xl font-semibold">Choose a new password</h1>
      <p className="mt-1 mb-6 text-sm text-muted">You will be signed out of other devices.</p>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </>
  );
}
