import Link from "next/link";
import { Logo } from "@/components/brand";
import { CurrentYear } from "@/components/current-year";
import { SITE_NAME } from "@/lib/config";

const LINKS = [
  { href: "/pricing", label: "Pricing" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/refund-policy", label: "Refund policy" },
  { href: "/contact", label: "Contact" },
];

/** NFR-21: every page states that the music is AI-generated. */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Logo />
          <p className="text-sm text-muted-foreground">
            © <CurrentYear /> {SITE_NAME}. All music on this site is AI-generated.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
