import { getSupabaseUsage } from "@/lib/usage/supabase-usage"

export const dynamic = "force-dynamic"

export async function GET() {
  const usage = await getSupabaseUsage()

  if (!usage) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  return Response.json(usage, {
    headers: {
      "Cache-Control": "private, no-store",
    },
  })
}
