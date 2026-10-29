import Image from "next/image";
import Link from "next/link";
import { SITE_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";

/**
 * GaoAI logo lockup: the mark (a G of vinyl grooves with a singing bird and an
 * AI spark, public/brand/gaoai-mark.svg) and the wordmark "Gao" + "AI".
 * "Gao" means "sing" in Bhojpuri and Hindi.
 */
export function Logo({
  className,
  href = "/",
  size = 32,
  showMark = true,
}: {
  className?: string;
  href?: string;
  /** Mark size in px; the wordmark scales with the text size set in className */
  size?: number;
  showMark?: boolean;
}) {
  // SITE_NAME can be overridden by env; the two-tone wordmark applies to "…AI" names
  const [lead, tail] = SITE_NAME.endsWith("AI") ? [SITE_NAME.slice(0, -2), "AI"] : [SITE_NAME, ""];
  return (
    <Link href={href} className={cn("group flex items-center gap-2.5 font-display text-[1.6rem] leading-none text-ink", className)}>
      {showMark && (
        <Image
          src="/brand/gaoai-mark.svg"
          alt=""
          width={size}
          height={size}
          unoptimized
          priority
          className="shrink-0 transition-transform duration-500 group-hover:rotate-[-12deg]"
        />
      )}
      <span>
        {lead}
        {tail && <span className="text-festival">{tail}</span>}
      </span>
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
