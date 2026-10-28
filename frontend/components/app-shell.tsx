"use client";

import {
  ChevronsUpDown,
  CreditCard,
  Home,
  Library,
  LogOut,
  Menu,
  Repeat2,
  Sparkles,
  UserRound,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/brand";
import { PageLoader } from "@/components/common";
import { PlayerBar } from "@/components/player/player-bar";
import { usePlayer } from "@/components/player/player-provider";
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
  { href: "/create", label: "Create", icon: Sparkles },
  { href: "/remix", label: "Similar song", icon: Repeat2 },
  { href: "/songs", label: "Library", icon: Library },
  { href: "/billing", label: "Credits & plans", icon: CreditCard },
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
    <div className="flex h-full flex-col gap-6 p-4">
      <Logo href="/dashboard" className="px-2 pt-1" />

      <Button variant="brand" size="xl" className="w-full" asChild>
        <Link href="/create" onClick={onNavigate}>
          <Sparkles /> Create a song
        </Link>
      </Button>

      <nav className="space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent font-medium text-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
              )}
            >
              <Icon className={cn("size-4", active && "text-primary")} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3">
        <Link
          href="/billing"
          onClick={onNavigate}
          className="block rounded-xl border bg-gradient-to-br from-brand-1/15 via-brand-2/10 to-brand-3/15 p-4 transition-colors hover:border-primary/40"
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            Credits
            <Zap className="size-3.5 text-primary" />
          </div>
          <p className="mt-1 font-display text-2xl font-bold">{user.credits}</p>
          <p className="mt-1 text-xs text-primary">Get more credits →</p>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-sidebar-accent/60"
            >
              <Avatar className="size-8">
                <AvatarFallback className="bg-brand-gradient text-xs font-semibold text-white">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{user.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
              </span>
              <ChevronsUpDown className="size-4 text-muted-foreground" />
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
                <CreditCard /> Credits & plans
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
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sidebar-border bg-sidebar lg:block">
        <SidebarContent user={user} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-xl lg:hidden">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-0">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SidebarContent user={user} onNavigate={() => setSheetOpen(false)} />
            </SheetContent>
          </Sheet>
          <Logo href="/dashboard" />
          <Link href="/billing" className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
            {user.credits} credits
          </Link>
        </header>

        <main className={cn("mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8", track && "pb-28")}>
          {!user.emailVerified && <VerifyBanner />}
          {children}
        </main>
      </div>

      <PlayerBar className="lg:left-64" />
    </div>
  );
}

function VerifyBanner() {
  const [busy, setBusy] = useState(false);
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm">
      <span>
        <span className="font-medium text-warning">Verify your email</span> to start creating songs. Check your inbox for
        the link.
      </span>
      <Button
        size="sm"
        variant="outline"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await api.post("/auth/resend-verification");
            toast.success("A new verification link is on its way.");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not send the email.");
          } finally {
            setBusy(false);
          }
        }}
      >
        Resend link
      </Button>
    </div>
  );
}
