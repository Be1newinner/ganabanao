import Link from "next/link";
import { SITE_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";

/** Wordmark in the display face. A placeholder until the client supplies the logo (FR-1.1). */
export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("font-display text-[1.65rem] leading-none text-sindoor", className)}>
      {SITE_NAME}
    </Link>
  );
}

/** The Madhubani border band (public/art/border-strip.jpg), repeated across its width. */
export function BorderStrip({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("h-4 bg-[url(/art/border-strip.jpg)] bg-[length:auto_100%] bg-repeat-x dark:opacity-80", className)}
    />
  );
}
