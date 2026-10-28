import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <>
      <h1 className="text-xl font-semibold">Log in</h1>
      <p className="mt-1 mb-6 text-sm text-muted">Welcome back. Your songs are waiting.</p>
      <Suspense>
        <LoginForm />
      </Suspense>
    </>
  );
}
