"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import type { SupabaseClient } from "@supabase/supabase-js"

import { getCurrentUser } from "@/lib/auth/user"
import { mapDbResource, type DbResource } from "@/lib/resources/queries"
import type { NewResourceInput, Resource } from "@/lib/resources/types"
import { slugify, truncate } from "@/lib/resources/utils"
import { createClient } from "@/utils/supabase/server"

type ActionResult = { ok: true; resource: Resource } | { ok: false; error: string }

async function getServerClient() {
  const cookieStore = await cookies()
  return createClient(cookieStore)
}

async function generateUniqueSlug(
  supabase: SupabaseClient,
  title: string
): Promise<string> {
  const { data, error } = await supabase.from("resources").select("slug")
  if (error) {
    throw new Error(`Failed to check existing slugs: ${error.message}`)
  }
  const existingSlugs = new Set((data ?? []).map((row: { slug: string }) => row.slug))
  return slugify(title, existingSlugs)
}

function buildDescription(title: string, whyUseful: string): string {
  return whyUseful.trim() ? truncate(whyUseful, 140) : title
}

export async function createResourceAction(input: NewResourceInput): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) {
    return { ok: false, error: "You must be signed in with Google to add a resource." }
  }

  const supabase = await getServerClient()
  const slug = await generateUniqueSlug(supabase, input.title)

  const { data: resourceRow, error: resourceError } = await supabase
    .from("resources")
    .insert({
      slug,
      title: input.title,
      description: buildDescription(input.title, input.whyUseful),
      category: null,
      topic_id: null,
      folder_id: input.folderId,
      type: input.type,
      level: null,
      cost: null,
      purpose: null,
      why_useful: input.whyUseful,
      recommended_by: user.name,
      created_by: user.id,
      preview_image_url: input.previewImageUrl,
    })
    .select("*")
    .single()

  if (resourceError || !resourceRow) {
    return { ok: false, error: resourceError?.message ?? "Failed to save the resource." }
  }

  const linkRows = input.links.map((link, index) => ({
    resource_id: resourceRow.id,
    label: link.label,
    url: link.url,
    position: index,
    created_by: user.id,
  }))

  const { data: linkData, error: linkError } = await supabase
    .from("resource_links")
    .insert(linkRows)
    .select("id, label, url, position")

  if (linkError || !linkData) {
    await supabase.from("resources").delete().eq("id", resourceRow.id)
    return { ok: false, error: linkError?.message ?? "Failed to save the resource links." }
  }

  revalidatePath("/resources")
  revalidatePath("/my-resources")
  revalidatePath("/browse")

  return {
    ok: true,
    resource: mapDbResource({
      ...(resourceRow as unknown as DbResource),
      resource_links: linkData,
    }),
  }
}

export async function updateResourceAction(
  resourceId: string,
  input: NewResourceInput
): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) {
    return { ok: false, error: "You must be signed in to edit a resource." }
  }

  const supabase = await getServerClient()

  const { data: resourceRow, error: resourceError } = await supabase
    .from("resources")
    .update({
      title: input.title,
      description: buildDescription(input.title, input.whyUseful),
      folder_id: input.folderId,
      type: input.type,
      why_useful: input.whyUseful,
      preview_image_url: input.previewImageUrl,
    })
    .eq("id", resourceId)
    .eq("created_by", user.id)
    .select("*")
    .maybeSingle()

  if (resourceError) {
    return { ok: false, error: resourceError.message }
  }
  if (!resourceRow) {
    return { ok: false, error: "Resource not found, or you don't have permission to edit it." }
  }

  const { error: deleteLinksError } = await supabase
    .from("resource_links")
    .delete()
    .eq("resource_id", resourceId)

  if (deleteLinksError) {
    return { ok: false, error: deleteLinksError.message }
  }

  const linkRows = input.links.map((link, index) => ({
    resource_id: resourceId,
    label: link.label,
    url: link.url,
    position: index,
    created_by: user.id,
  }))

  const { data: linkData, error: linkError } = await supabase
    .from("resource_links")
    .insert(linkRows)
    .select("id, label, url, position")

  if (linkError || !linkData) {
    return { ok: false, error: linkError?.message ?? "Failed to save the resource links." }
  }

  revalidatePath("/resources")
  revalidatePath("/my-resources")
  revalidatePath("/browse")

  return {
    ok: true,
    resource: mapDbResource({
      ...(resourceRow as unknown as DbResource),
      resource_links: linkData,
    }),
  }
}

export async function deleteResourceAction(
  resourceId: string
): Promise<{ error?: string }> {
  const user = await getCurrentUser()
  if (!user) {
    return { error: "You must be signed in to delete a resource." }
  }

  const supabase = await getServerClient()
  const { error, count } = await supabase
    .from("resources")
    .delete({ count: "exact" })
    .eq("id", resourceId)
    .eq("created_by", user.id)

  if (error) {
    return { error: error.message }
  }
  if (!count) {
    return { error: "Resource not found, or you don't have permission to delete it." }
  }

  revalidatePath("/resources")
  revalidatePath("/my-resources")
  revalidatePath("/browse")
  return {}
}
