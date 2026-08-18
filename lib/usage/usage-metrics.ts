const MB = 1024 * 1024
const GB = 1024 * MB

export const FREE_SUPABASE_LIMITS = {
  databaseBytes: 500 * MB,
  storageBytes: 1 * GB,
  egressBytes: 5 * GB,
} as const

export type UsageTone = "normal" | "warning" | "danger"

export interface UsageMetric {
  label: string
  usedBytes: number
  limitBytes: number
  remainingBytes: number
  percent: number
  tone: UsageTone
  summary: string
  remainingSummary: string
}

export interface SupabaseUsageSummary {
  available: true
  limitProfile: "free"
  actualPlan: string | null
  planVerified: boolean
  fetchedAt: string
  storage: UsageMetric
  database: UsageMetric
}

export interface SupabaseUsageUnavailable {
  available: false
  limitProfile: "free"
  actualPlan: string | null
  planVerified: boolean
  reason: string
}

export type SupabaseUsage = SupabaseUsageSummary | SupabaseUsageUnavailable

function getTone(percent: number): UsageTone {
  if (percent >= 90) {
    return "danger"
  }

  if (percent >= 70) {
    return "warning"
  }

  return "normal"
}

export function formatBytes(bytes: number): string {
  if (bytes >= GB) {
    return `${new Intl.NumberFormat("en", { maximumFractionDigits: 1 }).format(bytes / GB)} GB`
  }

  if (bytes >= MB) {
    return `${new Intl.NumberFormat("en", { maximumFractionDigits: 0 }).format(bytes / MB)} MB`
  }

  if (bytes >= 1024) {
    return `${new Intl.NumberFormat("en", { maximumFractionDigits: 0 }).format(bytes / 1024)} KB`
  }

  return `${new Intl.NumberFormat("en").format(bytes)} B`
}

export function createUsageMetric(label: string, usedBytes: number, limitBytes: number): UsageMetric {
  const percent = limitBytes > 0 ? Math.min((usedBytes / limitBytes) * 100, 100) : 0
  const remainingBytes = Math.max(limitBytes - usedBytes, 0)

  return {
    label,
    usedBytes,
    limitBytes,
    remainingBytes,
    percent,
    tone: getTone(percent),
    summary: `${formatBytes(usedBytes)} / ${formatBytes(limitBytes)}`,
    remainingSummary: `${formatBytes(remainingBytes)} left`,
  }
}
