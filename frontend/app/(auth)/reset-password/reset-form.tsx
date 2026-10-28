"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Alert, Button, Field, Input, LinkButton } from "@/components/ui";
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

  if (!token) return <Alert tone="error">This link is missing its token. Open the link from your email again.</Alert>;
  if (done) {
    return (
      <>
        <Alert tone="success">{done}</Alert>
        <LinkButton href="/login" className="mt-6 w-full">
          Log in
        </LinkButton>
      </>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {error && <Alert tone="error">{error}</Alert>}
      <Field label="New password" htmlFor="password" error={fieldErrors.password} hint="At least 8 characters">
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
      </Field>
      <Field label="Confirm new password" htmlFor="confirm">
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
      </Field>
      <Button type="submit" className="w-full" loading={busy}>
        Save password
      </Button>
    </form>
  );
}
