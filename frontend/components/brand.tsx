import { AudioWaveform } from "lucide-react";
import Link from "next/link";
import { SITE_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";

/** Placeholder logo until the client supplies theirs (FR-1.1). */
export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5 font-display text-lg font-bold tracking-tight", className)}>
      <span aria-hidden className="grid size-8 place-items-center rounded-lg bg-brand-gradient shadow-lg shadow-brand-2/30">
        <AudioWaveform className="size-4.5 text-white" />
      </span>
      {SITE_NAME}
    </Link>
  );
}
