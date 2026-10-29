import { ScrollProgress } from "@/components/landing/motion";
import { PlayerBar } from "@/components/player/player-bar";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/** Public pages are always dark, whatever the visitor chose inside the app. */
export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="dark flex min-h-svh flex-col bg-bg text-ink [color-scheme:dark]">
      <ScrollProgress />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <PlayerBar />
    </div>
  );
}
