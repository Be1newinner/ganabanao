import { CircleAlert, CircleCheck, Info, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Small shared pieces used across pages, built on shadcn/ui. */

export function Spinner({ className }: { className?: string }) {
  return <Loader2 aria-hidden className={cn("size-4 animate-spin", className)} />;
}

export function PageLoader() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="mb-2 text-xs font-semibold tracking-widest text-primary uppercase">{eyebrow}</p>}
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

const STATUS: Record<string, { label: string; className: string }> = {
  queued: { label: "In queue", className: "border-warning/30 bg-warning/10 text-warning" },
  generating: { label: "Creating", className: "border-chart-5/30 bg-chart-5/10 text-chart-5" },
  done: { label: "Ready", className: "border-success/30 bg-success/10 text-success" },
  failed: { label: "Failed", className: "border-destructive/30 bg-destructive/10 text-destructive" },
  paid: { label: "Paid", className: "border-success/30 bg-success/10 text-success" },
  created: { label: "Started", className: "border-border bg-muted text-muted-foreground" },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const s = STATUS[status] ?? { label: status, className: "" };
  return (
    <Badge variant="outline" className={cn("gap-1", s.className, className)}>
      {(status === "generating" || status === "queued") && <Spinner className="size-3" />}
      {s.label}
    </Badge>
  );
}

export function EmptyState({
  icon,
  title,
  children,
  className,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center rounded-2xl border border-dashed px-6 py-14 text-center", className)}>
      {icon && <div className="mb-4 grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">{icon}</div>}
      <p className="font-medium">{title}</p>
      {children && <div className="mt-2 max-w-sm text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}

/** Label + control + error/hint, for forms. */
export function FormField({
  label,
  htmlFor,
  error,
  hint,
  aside,
  children,
  className,
}: {
  label: ReactNode;
  htmlFor?: string;
  error?: string;
  hint?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={htmlFor}>{label}</Label>
        {aside && <span className="text-xs text-muted-foreground tabular-nums">{aside}</span>}
      </div>
      {children}
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

/** Selectable pill, for style tags in the create forms. */
export function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm transition-all",
        selected
          ? "border-transparent bg-brand-gradient font-medium text-white shadow-md shadow-brand-2/20"
          : "bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

/** Inline message for forms and pages, on top of shadcn's Alert. */
export function Notice({ tone = "info", children }: { tone?: "info" | "error" | "success"; children: ReactNode }) {
  const Icon = tone === "error" ? CircleAlert : tone === "success" ? CircleCheck : Info;
  return (
    <Alert
      variant={tone === "error" ? "destructive" : "default"}
      className={cn(tone === "success" && "text-success", tone === "info" && "bg-muted/50")}
    >
      <Icon />
      <AlertDescription className={cn(tone === "success" && "text-success")}>{children}</AlertDescription>
    </Alert>
  );
}

/** Rounded section with a heading, used for form panels. */
export function Panel({ title, description, children, className }: { title?: ReactNode; description?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border bg-card/60 p-5 sm:p-6", className)}>
      {title && <h2 className="font-display text-lg font-semibold">{title}</h2>}
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <div className={cn(title || description ? "mt-5" : "")}>{children}</div>
    </section>
  );
}
