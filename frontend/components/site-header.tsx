"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/#tools", label: "Tools" },
  { href: "/#how", label: "How it works" },
  { href: "/#stems", label: "Stems" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

/** Header for the public pages: transparent at the top, frosted glass after scrolling. */
export function SiteHeader() {
  const { user } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const cta = user ? (
    <Button variant="brand" size="lg" className="rounded-full px-5" asChild>
      <Link href="/dashboard">Open the studio</Link>
    </Button>
  ) : (
    <Button variant="brand" size="lg" className="rounded-full px-5" asChild>
      <Link href="/signup">Start creating</Link>
    </Button>
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled ? "border-b border-hairline bg-bg/70 backdrop-blur-xl" : "border-b border-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo className="text-gold" />
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-full px-3 py-2 text-sm text-ink-2 transition-colors hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {!user && (
            <Link href="/login" className="hidden px-3 py-2 text-sm text-ink-2 hover:text-ink sm:block">
              Log in
            </Link>
          )}
          <span className="hidden sm:block">{cta}</span>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="dark w-72 border-hairline bg-sunken text-ink">
              <SheetTitle className="px-6 pt-6 font-display text-2xl text-gold">GanaBanao</SheetTitle>
              <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Mobile">
                {LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-3 text-base text-ink-2 hover:bg-surface-1 hover:text-ink"
                  >
                    {l.label}
                  </Link>
                ))}
                {!user && (
                  <Link href="/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-base text-ink-2 hover:bg-surface-1">
                    Log in
                  </Link>
                )}
              </nav>
              <div className="px-6">{cta}</div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
