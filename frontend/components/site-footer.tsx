import { Mail } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand";
import { CurrentYear } from "@/components/current-year";
import { Button } from "@/components/ui/button";
import { SITE_NAME, SUPPORT_EMAIL } from "@/lib/config";

const COLUMNS = [
  {
    title: "Make music",
    links: [
      { href: "/signup", label: "Write a song" },
      { href: "/signup", label: "Make a similar song" },
      { href: "/#stems", label: "Download stems" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Learn",
    links: [
      { href: "/#how", label: "How it works" },
      { href: "/#faq", label: "Questions and answers" },
      { href: "/#tools", label: "The three tools" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/contact", label: "Contact us" },
      { href: "/contact", label: "Report a copyright issue" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms of Service" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/refund-policy", label: "Refund Policy" },
    ],
  },
];

/** The big footer for the public pages (NFR-21: states that the music is AI-generated). */
export function SiteFooter() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-hairline bg-sunken">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-40 h-80 bg-aurora-glow opacity-60" />

      <div className="relative mx-auto max-w-7xl px-4 pt-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div className="max-w-sm">
            <Logo className="text-3xl text-gold" />
            <p className="mt-4 leading-relaxed text-ink-2">
              An AI music studio for Bhojpuri songs. Write the words, choose the feel, and hear your song in minutes.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="brand" size="xl" className="rounded-full px-6" asChild>
                <Link href="/signup">Start creating</Link>
              </Button>
              <Button variant="outline" size="xl" className="rounded-full" asChild>
                <a href={`mailto:${SUPPORT_EMAIL}`}>
                  <Mail /> Email us
                </a>
              </Button>
            </div>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-sm font-semibold text-ink">{col.title}</p>
                <ul className="mt-4 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-sm text-ink-3 transition-colors hover:text-ink">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-hairline py-6 text-sm text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CurrentYear /> {SITE_NAME}. All music made here is AI-generated.
          </p>
          <p>Made for the voices of Bhojpur, Purvanchal and beyond.</p>
        </div>
      </div>

      {/* The wordmark, very large, fading into the floor */}
      <p
        aria-hidden
        className="pointer-events-none relative -mb-[0.2em] text-center font-display text-[15.5vw] leading-none whitespace-nowrap text-festival opacity-90 select-none [mask-image:linear-gradient(to_bottom,black_35%,transparent_95%)]"
      >
        {SITE_NAME}
      </p>
    </footer>
  );
}
