import { FileText } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Layout for the legal pages (FR-1.7). The client supplies the final text;
 * until then each page shows what it must cover, so Razorpay review can see the pages exist.
 */
export function LegalPage({ title, updated, children }: { title: string; updated?: string; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-10 flex items-center gap-4">
        <span className="grid size-12 place-items-center rounded-xl bg-brand-gradient text-white">
          <FileText className="size-5" />
        </span>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          {updated && <p className="mt-1 text-sm text-muted-foreground">Last updated: {updated}</p>}
        </div>
      </div>
      <div className="space-y-4 leading-relaxed text-foreground/90 [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-6">
        {children}
      </div>
    </article>
  );
}

export function PendingText() {
  return (
    <p className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm">
      Draft placeholder — the final text for this page will be supplied by the site owner.
    </p>
  );
}
