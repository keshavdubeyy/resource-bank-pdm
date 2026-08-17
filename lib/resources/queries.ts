import { cookies } from "next/headers"

import { createClient } from "@/utils/supabase/server"
import type {
  Resource,
  ResourceCategory,
  ResourceCost,
  ResourceLevel,
  ResourcePurpose,
  ResourceType,
} from "@/lib/resources/types"

const RESOURCE_SELECT = "*, resource_links(id, label, url, position)"

interface DbResourceLink {
  id: string
  label: string
  url: string
  position: number
}

export interface DbResource {
  id: string
  slug: string
  title: string
  description: string
  category: ResourceCategory | null
  purpose: ResourcePurpose | null
  type: ResourceType
  level: ResourceLevel | null
  cost: ResourceCost | null
  why_useful: string
  recommended_by: string
  created_by: string | null
  date_added: string
  folder_id: string | null
  preview_image_url: string | null
  resource_links: DbResourceLink[]
}

export function mapDbResource(row: DbResource): Resource {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category,
    purpose: row.purpose,
    type: row.type,
    level: row.level,
    cost: row.cost,
    whyUseful: row.why_useful,
    contributor: row.recommended_by,
    links: [...row.resource_links]
      .sort((a, b) => a.position - b.position)
      .map((link) => ({ label: link.label, url: link.url })),
    dateAdded: row.date_added,
    createdBy: row.created_by,
    folderId: row.folder_id,
    previewImageUrl: row.preview_image_url,
  }
}

async function getServerClient() {
  const cookieStore = await cookies()
  return createClient(cookieStore)
}

export async function getPublicResources(): Promise<Resource[]> {
  const supabase = await getServerClient()
  const { data, error } = await supabase
    .from("resources")
    .select(RESOURCE_SELECT)
    .order("date_added", { ascending: false })

  if (error) {
    throw new Error(`Failed to load resources: ${error.message}`)
  }

  return (data as unknown as DbResource[]).map(mapDbResource)
}

export async function getMyResources(userId: string): Promise<Resource[]> {
  const supabase = await getServerClient()
  const { data, error } = await supabase
    .from("resources")
    .select(RESOURCE_SELECT)
    .eq("created_by", userId)
    .order("date_added", { ascending: false })

  if (error) {
    throw new Error(`Failed to load your resources: ${error.message}`)
  }

  return (data as unknown as DbResource[]).map(mapDbResource)
}

export async function getResourceById(id: string): Promise<Resource | null> {
  const supabase = await getServerClient()
  const { data, error } = await supabase
    .from("resources")
    .select(RESOURCE_SELECT)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to load resource: ${error.message}`)
  }

  return data ? mapDbResource(data as unknown as DbResource) : null
}
