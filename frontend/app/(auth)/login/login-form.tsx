"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FormField, Notice, Spinner } from "@/components/common";
import { GoogleButton, OrDivider } from "@/components/google-button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormSubmit } from "@/components/use-form";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";
import type { User } from "@/lib/types";

/** Only same-site paths are allowed as a post-login destination. */
const safeNext = (next: string | null): string => (next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");

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
        {(error || oauthError) && <Notice tone="error">{error ?? oauthError}</Notice>}
        <FormField label="Email" htmlFor="email" error={fieldErrors.email}>
          <Input id="email" name="email" type="email" autoComplete="email" required className="h-11" />
        </FormField>
        <FormField
          label="Password"
          htmlFor="password"
          error={fieldErrors.password}
          aside={
            <Link href="/forgot-password" className="text-primary hover:underline">
              Forgot password?
            </Link>
          }
        >
          <Input id="password" name="password" type="password" autoComplete="current-password" required className="h-11" />
        </FormField>
        <div className="flex items-center gap-2">
          <Checkbox id="remember" checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
          <Label htmlFor="remember" className="font-normal">
            Remember me for 30 days
          </Label>
        </div>
        <Button type="submit" variant="brand" size="xl" className="w-full" disabled={busy}>
          {busy && <Spinner />} Log in
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
