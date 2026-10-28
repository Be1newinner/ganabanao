"use client";

import { ArrowLeft, MailCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FormField, Notice, Spinner } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      {sent ? (
        <div className="text-center">
          <MailCheck className="mx-auto size-14 text-primary" />
          <h1 className="mt-4 font-display text-2xl font-bold">Check your inbox</h1>
          <p className="mt-2 text-sm text-muted-foreground">{sent} The link works for 30 minutes.</p>
        </div>
      ) : (
        <>
          <h1 className="font-display text-3xl font-bold tracking-tight">Reset your password</h1>
          <p className="mt-2 mb-8 text-sm text-muted-foreground">We will email you a link. It works for 30 minutes.</p>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            {error && <Notice tone="error">{error}</Notice>}
            <FormField label="Email" htmlFor="email" error={fieldErrors.email}>
              <Input id="email" name="email" type="email" autoComplete="email" required className="h-11" />
            </FormField>
            <Button type="submit" variant="brand" size="xl" className="w-full" disabled={busy}>
              {busy && <Spinner />} Send reset link
            </Button>
          </form>
        </>
      )}
      <Button variant="ghost" className="mt-8 w-full" asChild>
        <Link href="/login">
          <ArrowLeft /> Back to log in
        </Link>
      </Button>
    </>
  );
}
