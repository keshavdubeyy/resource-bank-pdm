import { cookies } from "next/headers"

import { createClient } from "@/utils/supabase/server"
import {
  createUsageMetric,
  FREE_SUPABASE_LIMITS,
  type SupabaseUsage,
} from "@/lib/usage/usage-metrics"

interface UsageSummaryRpcRow {
  database_bytes: number | string | null
  storage_bytes: number | string | null
}

function getUnavailableReason(errorMessage: string): string {
  const lower = errorMessage.toLowerCase()

  if (
    lower.includes("could not find the function") ||
    lower.includes("schema cache") ||
    lower.includes("get_usage_summary")
  ) {
    return "Run the usage summary SQL migration in Supabase."
  }

  if (lower.includes("permission denied")) {
    return "Usage function needs permission to read aggregate storage metadata."
  }

  return "Usage unavailable."
}

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0
  }

  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

export async function getSupabaseUsage(): Promise<SupabaseUsage | null> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase.rpc("get_usage_summary")

  if (error) {
    console.error("Supabase usage RPC failed:", error)
    return {
      available: false,
      limitProfile: "free",
      actualPlan: null,
      planVerified: false,
      reason: getUnavailableReason(error.message),
    }
  }

  const row = Array.isArray(data)
    ? (data[0] as UsageSummaryRpcRow | undefined)
    : (data as UsageSummaryRpcRow | null)

  if (!row) {
    return {
      available: false,
      limitProfile: "free",
      actualPlan: null,
      planVerified: false,
      reason: "Usage unavailable",
    }
  }

  return {
    available: true,
    limitProfile: "free",
    actualPlan: null,
    planVerified: false,
    fetchedAt: new Date().toISOString(),
    storage: createUsageMetric("Storage", toNumber(row.storage_bytes), FREE_SUPABASE_LIMITS.storageBytes),
    database: createUsageMetric("Database", toNumber(row.database_bytes), FREE_SUPABASE_LIMITS.databaseBytes),
  }
}
