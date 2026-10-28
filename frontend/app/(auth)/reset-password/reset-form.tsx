"use client";

import { CircleCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { FormField, Notice, Spinner } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFormSubmit } from "@/components/use-form";
import { api } from "@/lib/api";

export function ResetPasswordForm() {
  const token = useSearchParams().get("token");
  const { busy, error, fieldErrors, run, setError } = useFormSubmit();
  const [done, setDone] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (form.get("password") !== form.get("confirm")) {
      setError("The two passwords do not match.");
      return;
    }
    const res = await run(() => api.post("/auth/reset-password", { token, password: form.get("password") }));
    if (res) setDone(res.message);
  }

  if (!token) return <Notice tone="error">This link is missing its token. Open the link from your email again.</Notice>;
  if (done) {
    return (
      <div className="text-center">
        <CircleCheck className="mx-auto size-14 text-success" />
        <p className="mt-4 text-sm text-muted-foreground">{done}</p>
        <Button variant="brand" size="xl" className="mt-8 w-full" asChild>
          <Link href="/login">Log in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {error && <Notice tone="error">{error}</Notice>}
      <FormField label="New password" htmlFor="password" error={fieldErrors.password} hint="At least 8 characters">
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className="h-11" />
      </FormField>
      <FormField label="Confirm new password" htmlFor="confirm">
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required className="h-11" />
      </FormField>
      <Button type="submit" variant="brand" size="xl" className="w-full" disabled={busy}>
        {busy && <Spinner />} Save password
      </Button>
    </form>
  );
}
