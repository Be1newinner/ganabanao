"use client";

import {
  ChevronsUpDown,
  CreditCard,
  Home,
  Library,
  LogOut,
  Menu,
  PenLine,
  Repeat2,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { BorderStrip, Logo } from "@/components/brand";
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
  { href: "/create", label: "Write a song", icon: PenLine },
  { href: "/remix", label: "Similar song", icon: Repeat2 },
  { href: "/songs", label: "Library", icon: Library },
  { href: "/billing", label: "Credits and plans", icon: CreditCard },
];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

function SidebarContent({ user, onNavigate }: { user: User; onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useSession();

  return (
    <div className="flex h-full flex-col gap-7 px-4 py-6 text-sidebar-foreground">
      <Logo href="/dashboard" className="px-2 text-sidebar-foreground" />

      <Button variant="shell" size="xl" className="w-full" asChild>
        <Link href="/create" onClick={onNavigate}>
          <PenLine /> New song
        </Link>
      </Button>

      <nav className="space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-[15px] transition-colors",
                active
                  ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                  : "text-shell-muted hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className={cn("size-[18px]", active && "text-haldi")} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="px-3">
          <p className="font-display text-4xl leading-none text-haldi">{user.credits}</p>
          <p className="mt-1 text-sm text-shell-muted">credits left</p>
          <Link
            href="/billing"
            onClick={onNavigate}
            className="mt-2 inline-block text-sm font-semibold underline decoration-haldi decoration-2 underline-offset-4 hover:text-haldi"
          >
            Add credits
          </Link>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-md border-t border-sidebar-border p-2 pt-4 text-left hover:bg-sidebar-accent/70"
            >
              <Avatar className="size-8">
                <AvatarFallback className="bg-haldi text-xs font-semibold text-kajal">{initials(user.name)}</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{user.name}</span>
                <span className="block truncate text-xs text-shell-muted">{user.email}</span>
              </span>
              <ChevronsUpDown className="size-4 text-shell-muted" />
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
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-sidebar lg:block">
        <SidebarContent user={user} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 bg-sidebar text-sidebar-foreground">
          <div className="flex h-14 items-center justify-between gap-2 px-4 sm:px-8">
            <div className="flex items-center gap-2 lg:hidden">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Open menu"
                    className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <Menu />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground">
                  <SheetTitle className="sr-only">Menu</SheetTitle>
                  <SidebarContent user={user} onNavigate={() => setSheetOpen(false)} />
                </SheetContent>
              </Sheet>
              <Logo href="/dashboard" className="text-2xl text-sidebar-foreground" />
            </div>
            <div className="ml-auto flex items-center gap-3">
              <Link href="/billing" className="text-sm text-shell-muted hover:text-sidebar-foreground lg:hidden">
                <span className="font-semibold text-haldi">{user.credits}</span> credits
              </Link>
              <ThemeToggle className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
            </div>
          </div>
          <BorderStrip />
        </header>

        <main className={cn("mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8 lg:py-10", track && "pb-28")}>
          {!user.emailVerified && <VerifyBanner />}
          {children}
        </main>

        <AppFooter className={cn(track && "pb-20")} />
      </div>

      <PlayerBar className="lg:left-64" />
    </div>
  );
}

/** Red footer band, matching the shell (NFR-21: states the music is AI-generated). */
function AppFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("bg-sidebar text-sidebar-foreground", className)}>
      <BorderStrip />
      <div className="flex flex-col gap-3 px-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="text-shell-muted">All music made here is AI-generated.</p>
        <nav className="flex flex-wrap gap-x-5 gap-y-1">
          {[
            ["/terms", "Terms"],
            ["/privacy", "Privacy"],
            ["/refund-policy", "Refunds"],
            ["/contact", "Contact"],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="text-shell-muted hover:text-sidebar-foreground hover:underline">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

function VerifyBanner() {
  const [busy, setBusy] = useState(false);
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-md border-l-4 border-haldi bg-haldi/10 px-4 py-3 text-sm">
      <span>
        <span className="font-semibold">Verify your email</span> to start making songs. The link is in your inbox.
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
