"use client";

import { CircleCheck, CircleX } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/common";
import { Button } from "@/components/ui/button";
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
      {state.status === "working" && (
        <>
          <Spinner className="mx-auto size-8 text-primary" />
          <p className="mt-4 text-muted-foreground">Verifying your email…</p>
        </>
      )}
      {state.status === "done" && (
        <>
          <CircleCheck className="mx-auto size-14 text-success" />
          <h1 className="mt-4 font-display text-2xl font-bold">Email verified</h1>
          <p className="mt-2 text-sm text-muted-foreground">{state.message}</p>
          <Button variant="brand" size="xl" className="mt-8 w-full" asChild>
            <Link href={user ? "/create" : "/login"}>{user ? "Create your first song" : "Log in"}</Link>
          </Button>
        </>
      )}
      {state.status === "error" && (
        <>
          <CircleX className="mx-auto size-14 text-destructive" />
          <h1 className="mt-4 font-display text-2xl font-bold">Link not valid</h1>
          <p className="mt-2 text-sm text-muted-foreground">{state.message}</p>
          <p className="mt-1 text-sm text-muted-foreground">You can ask for a new link from your dashboard.</p>
          <Button variant="outline" size="xl" className="mt-8 w-full" asChild>
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </>
      )}
    </div>
  );
}
