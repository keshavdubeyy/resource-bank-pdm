"use client"

export const SUPABASE_USAGE_CHANGED_EVENT = "pdm:supabase-usage-changed"

export function notifySupabaseUsageChanged() {
  window.dispatchEvent(new CustomEvent(SUPABASE_USAGE_CHANGED_EVENT))
}
