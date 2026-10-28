"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormField, Notice, Spinner } from "@/components/common";
import { GoogleButton, OrDivider } from "@/components/google-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFormSubmit } from "@/components/use-form";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";
import type { User } from "@/lib/types";

export default function SignupPage() {
  const router = useRouter();
  const { setUser } = useSession();
  const { busy, error, fieldErrors, run } = useFormSubmit();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await run(() =>
      api.post<User>("/auth/register", {
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
      })
    );
    if (res) {
      setUser(res.data);
      router.replace("/dashboard");
    }
  }

  return (
    <>
      <h1 className="font-display text-3xl font-bold tracking-tight">Create your account</h1>
      <p className="mt-2 mb-8 text-sm text-muted-foreground">Start making Bhojpuri songs with AI.</p>
      <GoogleButton label="Sign up with Google" />
      <OrDivider />
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error && <Notice tone="error">{error}</Notice>}
        <FormField label="Name" htmlFor="name" error={fieldErrors.name}>
          <Input id="name" name="name" autoComplete="name" required className="h-11" />
        </FormField>
        <FormField label="Email" htmlFor="email" error={fieldErrors.email}>
          <Input id="email" name="email" type="email" autoComplete="email" required className="h-11" />
        </FormField>
        <FormField label="Password" htmlFor="password" error={fieldErrors.password} hint="At least 8 characters">
          <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className="h-11" />
        </FormField>
        <Button type="submit" variant="brand" size="xl" className="w-full" disabled={busy}>
          {busy && <Spinner />} Create account
        </Button>
        <p className="text-xs text-muted-foreground">
          By signing up you agree to the{" "}
          <Link href="/terms" className="underline hover:text-foreground">Terms</Link> and{" "}
          <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
        </p>
      </form>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </>
  );
}
