import type { UsageMetric, UsageTone } from "@/lib/usage/usage-metrics"
import { cn } from "@/lib/utils"

function toneStyles(tone: UsageTone) {
  if (tone === "danger") {
    return {
      bar: "bg-destructive",
      text: "text-destructive",
      surface: "border-destructive/30 bg-destructive/10",
    }
  }

  if (tone === "warning") {
    return {
      bar: "bg-amber-500",
      text: "text-amber-600 dark:text-amber-400",
      surface: "border-amber-500/30 bg-amber-500/10",
    }
  }

  return {
    bar: "bg-primary",
    text: "text-foreground",
    surface: "border-border bg-muted/30",
  }
}

function StoragePoolSummary({
  metric,
  compact = false,
  className,
}: {
  metric: UsageMetric
  compact?: boolean
  className?: string
}) {
  const styles = toneStyles(metric.tone)
  const label =
    metric.tone === "danger"
      ? "Storage almost full"
      : metric.tone === "warning"
        ? "Storage getting full"
        : "Shared storage pool"

  return (
    <section
      className={cn(
        "rounded-2xl border p-4",
        compact ? "space-y-2.5 border-transparent bg-transparent p-0" : styles.surface,
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className={cn("text-sm font-medium leading-none", styles.text)}>{label}</p>
          {!compact && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Uploads share the same 1 GB Supabase file storage pool.
            </p>
          )}
        </div>
        <p className="shrink-0 text-right text-sm leading-none tabular-nums text-muted-foreground">
          {metric.remainingSummary}
        </p>
      </div>

      <div className={cn("space-y-2.5", compact ? "pt-0" : "pt-2")}>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-[width]", styles.bar)}
            style={{ width: `${metric.percent}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>{metric.summary}</span>
          <span>{Math.round(metric.percent)}% used</span>
        </div>
      </div>
    </section>
  )
}

export { StoragePoolSummary }
