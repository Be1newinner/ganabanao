"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand";
import { Magnetic } from "@/components/landing/motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SITE_NAME } from "@/lib/config";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

const LINKS = [
  { id: "tools", label: "Tools" },
  { id: "how", label: "How it works" },
  { id: "stems", label: "Stems" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQ" },
];

/**
 * Floating glass navigation for the public pages: a sliding highlight follows
 * the section you are reading, and the bar tucks away while scrolling down.
 */
export function SiteHeader() {
  const { user } = useSession();
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const nav = useRef<HTMLElement>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);

  // Glass after scrolling; hide on the way down, show on the way up
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (y < 300) setActive(null); // back at the hero: no section highlighted
      setHidden(y > 320 && y > last + 4 ? true : y < last - 4 ? false : (h) => h);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Which section is on screen
  useEffect(() => {
    if (!onHome) return;
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter((s): s is HTMLElement => !!s);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [onHome]);

  // Slide the highlight under the active link
  useLayoutEffect(() => {
    const el = active && nav.current?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    setPill(el ? { left: el.offsetLeft, width: el.offsetWidth } : null);
  }, [active]);

  const cta = (
    <Button variant="brand" size="lg" className="rounded-full px-5" asChild>
      <Link href={user ? "/dashboard" : "/signup"}>{user ? "Open the studio" : "Start creating"}</Link>
    </Button>
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-40 px-3 pt-3 transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.1,1)] sm:px-6",
        hidden && !open && "-translate-y-[120%]"
      )}
    >
      <div
        className={cn(
          "relative mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 rounded-full pr-2 pl-5 transition-all duration-500",
          scrolled
            ? "bg-surface-1/75 shadow-[0_18px_50px_-20px_rgb(0_0_0/0.7)] backdrop-blur-xl"
            : "bg-surface-1/35 backdrop-blur-md"
        )}
      >
        {/* Gradient hairline edge */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full p-px"
          style={{
            background:
              "linear-gradient(110deg, rgb(246 180 68 / 0.6), rgb(255 255 255 / 0.1) 30%, rgb(255 255 255 / 0.1) 70%, rgb(124 82 240 / 0.65))",
            // Keep only the 1px ring: the padding box minus the content box
            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />

        <Logo size={30} className="text-[1.45rem]" />

        <nav ref={nav} aria-label="Main" className="relative hidden items-center md:flex">
          {pill && (
            <span
              aria-hidden
              className="absolute top-1/2 h-9 -translate-y-1/2 rounded-full bg-surface-3/80 shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_0_24px_-6px_rgb(238_106_138/0.6)] transition-all duration-500 ease-[cubic-bezier(0.2,0.7,0.1,1)]"
              style={{ left: pill.left, width: pill.width }}
            />
          )}
          {LINKS.map((l) => (
            <Link
              key={l.id}
              data-id={l.id}
              href={`/#${l.id}`}
              className={cn(
                "relative rounded-full px-4 py-2 text-sm transition-colors",
                active === l.id ? "text-ink" : "text-ink-2 hover:text-ink"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          {!user && (
            <Link href="/login" className="hidden rounded-full px-4 py-2 text-sm text-ink-2 hover:text-ink sm:block">
              Log in
            </Link>
          )}
          <Magnetic strength={0.25} className="hidden sm:inline-block">
            {cta}
          </Magnetic>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-lg" className="rounded-full md:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="dark w-72 border-hairline bg-sunken text-ink">
              <SheetTitle className="px-6 pt-6 font-display text-2xl text-gold">{SITE_NAME}</SheetTitle>
              <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Mobile">
                {LINKS.map((l) => (
                  <Link
                    key={l.id}
                    href={`/#${l.id}`}
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
