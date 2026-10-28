"use client";

import Link from "next/link";
import { SITE_NAME } from "@/lib/config";
import { useSession } from "@/lib/session";
import { LinkButton } from "./ui";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
      <span aria-hidden className="grid size-8 place-items-center rounded-lg bg-brand text-white">♪</span>
      {SITE_NAME}
    </Link>
  );
}

export function SiteHeader() {
  const { user } = useSession();
  return (
    <header className="border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link href="/pricing" className="rounded-lg px-3 py-2 text-sm hover:bg-surface-muted">
            Pricing
          </Link>
          {user ? (
            <LinkButton href="/dashboard" size="sm">
              Dashboard
            </LinkButton>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-3 py-2 text-sm hover:bg-surface-muted">
                Log in
              </Link>
              <LinkButton href="/signup" size="sm">
                Sign up
              </LinkButton>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
