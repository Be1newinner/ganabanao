import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <>
      <h1 className="font-display text-3xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-2 mb-8 text-sm text-muted-foreground">Log in to keep making music.</p>
      {/* useSearchParams needs a Suspense boundary so the page can still prerender */}
      <Suspense>
        <LoginForm />
      </Suspense>
    </>
  );
}
