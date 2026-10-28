"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Alert, LinkButton, Spinner } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { useSession } from "@/lib/session";
import type { User } from "@/lib/types";

export function VerifyEmail() {
  const token = useSearchParams().get("token");
  const { user, setUser } = useSession();
  const [state, setState] = useState<{ status: "working" | "done" | "error"; message?: string }>({ status: "working" });
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return; // tokens are single-use; never send twice (e.g. React strict mode)
    sent.current = true;
    if (!token) {
      setState({ status: "error", message: "This link is missing its token. Open the link from your email again." });
      return;
    }
    api
      .post<User>("/auth/verify-email", { token })
      .then((res) => {
        setState({ status: "done", message: res.message });
        if (user) setUser(res.data);
      })
      .catch((err: unknown) =>
        setState({ status: "error", message: err instanceof ApiError ? err.message : "Verification failed." })
      );
  }, [token, user, setUser]);

  return (
    <div className="text-center">
      <h1 className="mb-4 text-xl font-semibold">Verify your email</h1>
      {state.status === "working" && <Spinner />}
      {state.status === "done" && (
        <>
          <Alert tone="success">{state.message}</Alert>
          <LinkButton href={user ? "/dashboard" : "/login"} className="mt-6 w-full">
            {user ? "Go to dashboard" : "Log in"}
          </LinkButton>
        </>
      )}
      {state.status === "error" && (
        <>
          <Alert tone="error">{state.message}</Alert>
          <p className="mt-4 text-sm text-muted">You can ask for a new link from your dashboard.</p>
          <LinkButton href="/dashboard" variant="secondary" className="mt-4 w-full">
            Go to dashboard
          </LinkButton>
        </>
      )}
    </div>
  );
}
