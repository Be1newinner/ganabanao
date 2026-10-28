"use client";

import Link from "next/link";
import { useState } from "react";
import { Alert, Button, Field, Input } from "@/components/ui";
import { useFormSubmit } from "@/components/use-form";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const { busy, error, fieldErrors, run } = useFormSubmit();
  const [sent, setSent] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email");
    const res = await run(() => api.post("/auth/forgot-password", { email }));
    if (res) setSent(res.message);
  }

  return (
    <>
      <h1 className="text-xl font-semibold">Reset your password</h1>
      <p className="mt-1 mb-6 text-sm text-muted">We will email you a link. It works for 30 minutes.</p>
      {sent ? (
        <Alert tone="success">{sent}</Alert>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {error && <Alert tone="error">{error}</Alert>}
          <Field label="Email" htmlFor="email" error={fieldErrors.email}>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </Field>
          <Button type="submit" className="w-full" loading={busy}>
            Send reset link
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="text-brand hover:underline">
          Back to log in
        </Link>
      </p>
    </>
  );
}
