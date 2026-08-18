"use client"

import * as React from "react"

import type { SupabaseUsage, UsageMetric, UsageTone } from "@/lib/usage/usage-metrics"
import { StoragePoolSummary } from "@/components/shared/storage-pool-summary"
import { SUPABASE_USAGE_CHANGED_EVENT } from "@/lib/usage/client-events"
import { cn } from "@/lib/utils"

function toneClasses(tone: UsageTone) {
  if (tone === "danger") {
    return "bg-destructive text-destructive"
  }

  if (tone === "warning") {
    return "bg-amber-500 text-amber-600 dark:text-amber-400"
  }

  return "bg-primary text-muted-foreground"
}

function UsageBar({ metric }: { metric: UsageMetric }) {
  const classes = toneClasses(metric.tone)
  const isElevated = metric.tone !== "normal"

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className={cn("font-medium", isElevated ? classes.split(" ")[1] : "text-foreground")}>
          {metric.tone === "danger" ? `${metric.label} almost full` : metric.label}
        </span>
        <span className="shrink-0 tabular-nums text-muted-foreground">{metric.summary}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-[width]", classes.split(" ")[0])}
          style={{ width: `${metric.percent}%` }}
        />
      </div>
    </div>
  )
}

function AccountUsageSummary({ usage: initialUsage }: { usage: SupabaseUsage | null }) {
  const [usage, setUsage] = React.useState(initialUsage)

  React.useEffect(() => {
    let cancelled = false

    async function refreshUsage() {
      try {
        const response = await fetch("/api/usage/supabase", { cache: "no-store" })
        if (!response.ok) {
          return
        }
        const nextUsage = (await response.json()) as SupabaseUsage
        if (!cancelled) {
          setUsage(nextUsage)
        }
      } catch {
        // Keep the last known value visible.
      }
    }

    window.addEventListener(SUPABASE_USAGE_CHANGED_EVENT, refreshUsage)
    window.addEventListener("focus", refreshUsage)

    return () => {
      cancelled = true
      window.removeEventListener(SUPABASE_USAGE_CHANGED_EVENT, refreshUsage)
      window.removeEventListener("focus", refreshUsage)
    }
  }, [])

  if (!usage) {
    return null
  }

  return (
    <section className="px-2 py-1.5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-foreground">Usage</p>
        <p className="text-[11px] text-muted-foreground">Free limits</p>
      </div>
      {usage.available ? (
        <div className="space-y-3">
          <StoragePoolSummary metric={usage.storage} compact />
          <UsageBar metric={usage.database} />
        </div>
      ) : (
        <p className="text-xs leading-relaxed text-muted-foreground">{usage.reason}</p>
      )}
    </section>
  )
}

export { AccountUsageSummary }
