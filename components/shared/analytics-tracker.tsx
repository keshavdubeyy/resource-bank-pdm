"use client"

import * as React from "react"
import { usePathname, useSearchParams } from "next/navigation"

const VISITOR_ID_KEY = "pdm:visitor-id"

function getVisitorId(): string {
  try {
    const existing = window.localStorage.getItem(VISITOR_ID_KEY)
    if (existing) {
      return existing
    }

    const next =
      typeof window.crypto?.randomUUID === "function"
        ? window.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`

    window.localStorage.setItem(VISITOR_ID_KEY, next)
    return next
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`
  }
}

async function trackAnalyticsEvent(
  eventType: "page_view" | "login",
  path: string
) {
  try {
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType,
        anonymousId: getVisitorId(),
        path,
      }),
      keepalive: true,
    })
  } catch {
    // Analytics should never block navigation or auth flows.
  }
}

function AnalyticsTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  React.useEffect(() => {
    const query = searchParams.toString()
    const path = query ? `${pathname}?${query}` : pathname
    void trackAnalyticsEvent("page_view", path)
  }, [pathname, searchParams])

  return null
}

export { AnalyticsTracker, trackAnalyticsEvent }
