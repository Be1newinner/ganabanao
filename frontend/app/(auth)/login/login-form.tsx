"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { GoogleButton, OrDivider } from "@/components/google-button";
import { Alert, Button, Field, Input } from "@/components/ui";
import { useFormSubmit } from "@/components/use-form";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";
import type { User } from "@/lib/types";

/** Only same-site paths are allowed as a post-login destination. */
export const safeNext = (next: string | null): string => (next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { setUser } = useSession();
  const { busy, error, fieldErrors, run } = useFormSubmit();
  const [remember, setRemember] = useState(true);
  const oauthError = params.get("error");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await run(() =>
      api.post<User>("/auth/login", { email: form.get("email"), password: form.get("password"), remember })
    );
    if (res) {
      setUser(res.data);
      router.replace(safeNext(params.get("next")));
    }
  }

  return (
    <>
      <GoogleButton />
      <OrDivider />
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {(error || oauthError) && <Alert tone="error">{error ?? oauthError}</Alert>}
        <Field label="Email" htmlFor="email" error={fieldErrors.email}>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Password" htmlFor="password" error={fieldErrors.password}>
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </Field>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-brand" />
            Remember me
          </label>
          <Link href="/forgot-password" className="text-brand hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" loading={busy}>
          Log in
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        New here?{" "}
        <Link href="/signup" className="font-medium text-brand hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
