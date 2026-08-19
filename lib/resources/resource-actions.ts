"use server"

import { cookies } from "next/headers"

import { mapDbResource, RESOURCE_SELECT, type DbResource } from "@/lib/resources/queries"
import type { Resource } from "@/lib/resources/types"
import { createClient } from "@/utils/supabase/server"

const RESOURCE_PAGE_SIZE = 20

async function getServerClient() {
  const cookieStore = await cookies()
  return createClient(cookieStore)
}

export interface ResourcePage {
  resources: Resource[]
  hasMore: boolean
}

/** Fetches one page of resources scoped to a single folder (null = root/unfiled)
 * instead of the entire resources table — the fix for /browse shipping every
 * resource in the bank on every page load. Fetches one extra row to detect
 * `hasMore` without a separate count query. */
export async function getFolderResources(
  folderId: string | null,
  { offset = 0, limit = RESOURCE_PAGE_SIZE }: { offset?: number; limit?: number } = {}
): Promise<ResourcePage> {
  const supabase = await getServerClient()
  let query = supabase
    .from("resources")
    .select(RESOURCE_SELECT)
    .order("date_added", { ascending: false })
    .range(offset, offset + limit)

  query = folderId === null ? query.is("folder_id", null) : query.eq("folder_id", folderId)

  const { data, error } = await query
  if (error) {
    throw new Error(`Failed to load resources: ${error.message}`)
  }

  const rows = data as unknown as DbResource[]
  const hasMore = rows.length > limit
  const page = hasMore ? rows.slice(0, limit) : rows
  return { resources: page.map(mapDbResource), hasMore }
}

/** Resource counts for a bounded set of folders (e.g. the subfolders visible in
 * the current view) — HEAD requests against the existing folder_id index, no
 * resource rows transferred, instead of deriving counts from a full fetch. */
export async function getFolderResourceCounts(
  folderIds: string[]
): Promise<Record<string, number>> {
  if (folderIds.length === 0) {
    return {}
  }

  const supabase = await getServerClient()
  const results = await Promise.all(
    folderIds.map((id) =>
      supabase.from("resources").select("id", { count: "exact", head: true }).eq("folder_id", id)
    )
  )

  const counts: Record<string, number> = {}
  folderIds.forEach((id, index) => {
    counts[id] = results[index].count ?? 0
  })
  return counts
}

/** Cheap existence check (HEAD count against the created_by index) — replaces
 * deriving "has this user contributed" from a fully-loaded resources array. */
export async function hasUserContributed(userId: string): Promise<boolean> {
  const supabase = await getServerClient()
  const { count, error } = await supabase
    .from("resources")
    .select("id", { count: "exact", head: true })
    .eq("created_by", userId)

  if (error) {
    return false
  }
  return (count ?? 0) > 0
}

export async function getResourceBySlug(slug: string): Promise<Resource | null> {
  const supabase = await getServerClient()
  const { data, error } = await supabase
    .from("resources")
    .select(RESOURCE_SELECT)
    .eq("slug", slug)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to load resource: ${error.message}`)
  }

  return data ? mapDbResource(data as unknown as DbResource) : null
}

/** Strips characters that would otherwise break ilike's wildcard syntax or
 * PostgREST's `.or()` filter-string parsing, rather than trying to escape them. */
function sanitizeSearchTerm(value: string): string {
  return value.replace(/[%_,()]/g, " ").trim().replace(/\s+/g, " ")
}

/** Server-side search across title/description/contributor — the resources
 * table is no longer fully loaded client-side, so search can't filter in
 * memory anymore. Bounded to 50 matches, most recent first. */
export async function searchResourcesServer(query: string): Promise<Resource[]> {
  const term = sanitizeSearchTerm(query)
  if (!term) {
    return []
  }

  const supabase = await getServerClient()
  const pattern = `%${term}%`
  const { data, error } = await supabase
    .from("resources")
    .select(RESOURCE_SELECT)
    .or(`title.ilike.${pattern},description.ilike.${pattern},recommended_by.ilike.${pattern}`)
    .order("date_added", { ascending: false })
    .limit(50)

  if (error) {
    throw new Error(`Search failed: ${error.message}`)
  }

  return (data as unknown as DbResource[]).map(mapDbResource)
}
