"use client";

import Link from "next/link";
import { Logo } from "@/components/brand";
import { ThemeToggle } from "@/components/theme";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/session";

/** Header for the public pages. */
export function SiteHeader() {
  const { user } = useSession();
  return (
    <header className="sticky top-0 z-30 border-b border-transparent bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />
        <nav className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="lg" asChild>
            <Link href="/pricing">Pricing</Link>
          </Button>
          {user ? (
            <Button variant="brand" size="lg" asChild>
              <Link href="/dashboard">Open app</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="lg" asChild className="hidden sm:inline-flex">
                <Link href="/login">Log in</Link>
              </Button>
              <Button variant="brand" size="lg" asChild>
                <Link href="/signup">Start creating</Link>
              </Button>
            </>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
