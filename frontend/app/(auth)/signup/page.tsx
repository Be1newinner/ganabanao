"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleButton, OrDivider } from "@/components/google-button";
import { Alert, Button, Field, Input } from "@/components/ui";
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
      <h1 className="text-xl font-semibold">Create your account</h1>
      <p className="mt-1 mb-6 text-sm text-muted">Start making Bhojpuri songs with AI.</p>
      <GoogleButton label="Sign up with Google" />
      <OrDivider />
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error && <Alert tone="error">{error}</Alert>}
        <Field label="Name" htmlFor="name" error={fieldErrors.name}>
          <Input id="name" name="name" autoComplete="name" required />
        </Field>
        <Field label="Email" htmlFor="email" error={fieldErrors.email}>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Password" htmlFor="password" error={fieldErrors.password} hint="At least 8 characters">
          <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        </Field>
        <Button type="submit" className="w-full" loading={busy}>
          Create account
        </Button>
        <p className="text-xs text-muted">
          By signing up you agree to the{" "}
          <Link href="/terms" className="underline">Terms</Link> and{" "}
          <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Log in
        </Link>
      </p>
    </>
  );
}
