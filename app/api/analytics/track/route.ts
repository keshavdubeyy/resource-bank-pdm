import { cookies } from "next/headers"

import { toAppUser } from "@/lib/auth/user"
import { createClient } from "@/utils/supabase/server"

export const dynamic = "force-dynamic"

const EVENT_TYPES = new Set(["page_view", "login"])

interface AnalyticsPayload {
  eventType?: unknown
  anonymousId?: unknown
  path?: unknown
}

function cleanPath(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return "/"
  }

  return value.slice(0, 300)
}

function cleanAnonymousId(value: unknown): string | null {
  if (typeof value !== "string") {
    return null
  }

  const trimmed = value.trim()
  if (trimmed.length < 8 || trimmed.length > 128) {
    return null
  }

  return trimmed
}

export async function POST(request: Request) {
  let payload: AnalyticsPayload

  try {
    payload = (await request.json()) as AnalyticsPayload
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (
    typeof payload.eventType !== "string" ||
    !EVENT_TYPES.has(payload.eventType)
  ) {
    return Response.json({ error: "Invalid event type" }, { status: 400 })
  }

  const anonymousId = cleanAnonymousId(payload.anonymousId)
  if (!anonymousId) {
    return Response.json({ error: "Invalid visitor id" }, { status: 400 })
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const appUser = user ? toAppUser(user) : null

  const { error } = await supabase.from("analytics_events").insert({
    event_type: payload.eventType,
    anonymous_id: anonymousId,
    user_id: appUser?.id ?? null,
    user_name: appUser?.name ?? null,
    user_email: appUser?.email ?? null,
    path: cleanPath(payload.path),
  })

  if (error) {
    const message = error.message.toLowerCase()
    const isMissingTable =
      error.code === "42P01" ||
      message.includes("analytics_events") ||
      message.includes("schema cache")

    return Response.json(
      {
        ok: false,
        reason: isMissingTable
          ? "Run the analytics events migration."
          : "Analytics unavailable.",
      },
      { status: 202 }
    )
  }

  return Response.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } }
  )
}
