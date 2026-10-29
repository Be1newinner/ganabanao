"use client";

import { ChevronsUpDown, CreditCard, Home, Library, LogOut, Menu, PenLine, Repeat2, Sparkles, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/brand";
import { PageLoader } from "@/components/common";
import { PlayerBar } from "@/components/player/player-bar";
import { usePlayer } from "@/components/player/player-provider";
import { ThemeToggle } from "@/components/theme";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/create", label: "Create a Song", icon: PenLine },
  { href: "/remix", label: "Similar song", icon: Repeat2 },
  { href: "/songs", label: "Library", icon: Library },
];

const LEGAL = [
  ["/terms", "Terms"],
  ["/privacy", "Privacy"],
  ["/refund-policy", "Refunds"],
  ["/contact", "Contact"],
];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/** Sidebar per music-app-ux: wordmark, Create, navigation, credits, account, small print. */
function SidebarContent({ user, onNavigate }: { user: User; onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useSession();

  return (
    <div className="flex h-full flex-col px-3 py-5">
      <Logo href="/dashboard" className="px-3 text-gold" />

      {/* Raised, not gold: the page's own primary action is the only gold one (visual-qa) */}
      <Button
        variant="secondary"
        size="xl"
        className="mt-6 w-full border border-hairline bg-surface-2 hover:bg-surface-3"
        asChild
      >
        <Link href="/create" onClick={onNavigate}>
          <Sparkles className="text-gold" /> Create
        </Link>
      </Button>

      <nav className="mt-6 space-y-0.5" aria-label="Main">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-[15px] transition-colors",
                active ? "bg-surface-2 font-medium text-ink" : "text-ink-2 hover:bg-surface-1 hover:text-ink"
              )}
            >
              <Icon className={cn("size-[18px]", active ? "text-gold" : "text-ink-3")} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4">
        <Link
          href="/billing"
          onClick={onNavigate}
          className={cn(
            "block rounded-lg px-3 py-3 transition-colors hover:bg-surface-1",
            pathname === "/billing" && "bg-surface-2"
          )}
        >
          <span className="flex items-baseline justify-between">
            <span className="text-sm text-ink-2">Credits</span>
            <span className="font-display text-2xl leading-none text-gold">{user.credits}</span>
          </span>
          <span className="mt-1 flex items-center gap-1.5 text-xs text-ink-3">
            <CreditCard className="size-3.5" /> Plans and credit packs
          </span>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-surface-1">
              <Avatar className="size-8">
                <AvatarFallback className="bg-surface-3 text-xs font-semibold text-ink">{initials(user.name)}</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{user.name}</span>
                <span className="block truncate text-xs text-ink-3">{user.email}</span>
              </span>
              <ChevronsUpDown className="size-4 text-ink-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" onClick={onNavigate}>
                <UserRound /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/billing" onClick={onNavigate}>
                <CreditCard /> Credits and plans
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={async () => {
                await logout();
                router.replace("/login");
              }}
            >
              <LogOut /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* NFR-21, and the legal pages, as small print instead of an in-app footer */}
        <div className="px-3 text-xs leading-relaxed text-ink-3">
          <p>All music here is AI-generated.</p>
          <p className="mt-1 flex flex-wrap gap-x-3">
            {LEGAL.map(([href, label]) => (
              <Link key={href} href={href} className="hover:text-ink">
                {label}
              </Link>
            ))}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Signed-in layout: sidebar, content and the bottom player. Redirects to login without a session. */
export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const { track } = usePlayer();
  const router = useRouter();
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (user === null) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [user, router, pathname]);

  if (!user) return <PageLoader />;

  return (
    <div className="flex min-h-svh">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-hairline bg-sidebar lg:block">
        <SidebarContent user={user} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-60">
        <header className="sticky top-0 z-20 border-b border-hairline bg-background/80 backdrop-blur-md lg:border-b-0 lg:bg-transparent lg:backdrop-blur-none">
          <div className="flex h-14 items-center gap-2 px-4 sm:px-8">
            <div className="flex items-center gap-1 lg:hidden">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open menu">
                    <Menu />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 border-hairline bg-sidebar p-0">
                  <SheetTitle className="sr-only">Menu</SheetTitle>
                  <SidebarContent user={user} onNavigate={() => setSheetOpen(false)} />
                </SheetContent>
              </Sheet>
              <Logo href="/dashboard" className="text-2xl text-gold" />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Link href="/billing" className="text-sm text-ink-2 hover:text-ink lg:hidden">
                <span className="font-semibold text-gold">{user.credits}</span> credits
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className={cn("mx-auto w-full max-w-6xl flex-1 px-4 pt-2 pb-12 sm:px-8", track && "pb-28")}>
          {!user.emailVerified && <VerifyBanner />}
          {children}
        </main>
      </div>

      <PlayerBar className="lg:left-60" />
    </div>
  );
}

function VerifyBanner() {
  const [busy, setBusy] = useState(false);
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gold/30 bg-gold-soft px-4 py-3 text-sm">
      <span>
        <span className="font-semibold text-gold">Verify your email</span> to start making songs. The link is in your inbox.
      </span>
      <Button
        size="sm"
        variant="outline"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await api.post("/auth/resend-verification");
            toast.success("Verification email sent.");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not send the email.");
          } finally {
            setBusy(false);
          }
        }}
      >
        Send a new link
      </Button>
    </div>
  );
}
