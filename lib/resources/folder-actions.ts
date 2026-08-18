"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

import { getCurrentUser } from "@/lib/auth/user"
import { getDescendantIds } from "@/lib/resources/folder-tree"
import type { FolderRow } from "@/lib/resources/types"
import { createClient } from "@/utils/supabase/server"

type FolderResult = { ok: true; folder: FolderRow } | { ok: false; error: string }
type SimpleResult = { ok: true } | { ok: false; error: string }

interface DbFolder {
  id: string
  name: string
  parent_folder_id: string | null
  created_by: string | null
  created_by_name?: string | null
  created_at: string
}

const BASE_FOLDER_COLUMNS = "id, name, parent_folder_id, created_by, created_at"
const FOLDER_COLUMNS_WITH_CREATOR_NAME = `${BASE_FOLDER_COLUMNS}, created_by_name`
let hasCreatorNameColumn: boolean | null = null

function isMissingCreatorNameColumnError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  const message = error.message?.toLowerCase() ?? ""
  return error.code === "42703" || (message.includes("created_by_name") && message.includes("column"))
}

function mapDbFolder(row: DbFolder): FolderRow {
  return {
    id: row.id,
    name: row.name,
    parentFolderId: row.parent_folder_id,
    createdBy: row.created_by,
    createdByName: row.created_by_name ?? null,
    createdAt: row.created_at,
  }
}

async function getServerClient() {
  const cookieStore = await cookies()
  return createClient(cookieStore)
}

async function selectFolders(supabase: Awaited<ReturnType<typeof getServerClient>>): Promise<DbFolder[]> {
  if (hasCreatorNameColumn !== false) {
    const result = await supabase
      .from("folders")
      .select(FOLDER_COLUMNS_WITH_CREATOR_NAME)
      .order("name", { ascending: true })

    if (!result.error) {
      hasCreatorNameColumn = true
      return result.data as DbFolder[]
    }

    if (!isMissingCreatorNameColumnError(result.error)) {
      throw new Error(`Failed to load folders: ${result.error.message}`)
    }

    hasCreatorNameColumn = false
  }

  const fallback = await supabase
    .from("folders")
    .select(BASE_FOLDER_COLUMNS)
    .order("name", { ascending: true })

  if (fallback.error) {
    throw new Error(`Failed to load folders: ${fallback.error.message}`)
  }

  return fallback.data as DbFolder[]
}

/** One flat fetch — callable from Server Components (initial /browse load) and
 * from Client Components (the Add Resource Sheet's lazy folder-picker fetch). */
export async function getAllFolders(): Promise<FolderRow[]> {
  const supabase = await getServerClient()
  const folders = await selectFolders(supabase)
  return folders.map(mapDbFolder)
}

export async function createFolderAction(
  name: string,
  parentFolderId: string | null
): Promise<FolderResult> {
  const user = await getCurrentUser()
  if (!user) {
    return { ok: false, error: "You must be signed in to create a folder." }
  }

  const trimmed = name.trim()
  if (!trimmed) {
    return { ok: false, error: "Folder name is required." }
  }

  const supabase = await getServerClient()
  const insertPayload = {
    name: trimmed,
    parent_folder_id: parentFolderId,
    created_by: user.id,
  }

  if (hasCreatorNameColumn !== false) {
    const { data, error } = await supabase
      .from("folders")
      .insert({
        ...insertPayload,
        created_by_name: user.name,
      })
      .select(FOLDER_COLUMNS_WITH_CREATOR_NAME)
      .single()

    if (!error && data) {
      hasCreatorNameColumn = true
      revalidatePath("/browse")
      return { ok: true, folder: mapDbFolder(data as DbFolder) }
    }

    if (!isMissingCreatorNameColumnError(error)) {
      return { ok: false, error: error?.message ?? "Failed to create the folder." }
    }

    hasCreatorNameColumn = false
  }

  if (hasCreatorNameColumn === false) {
    const fallback = await supabase
      .from("folders")
      .insert(insertPayload)
      .select(BASE_FOLDER_COLUMNS)
      .single()

    if (fallback.error || !fallback.data) {
      return { ok: false, error: fallback.error?.message ?? "Failed to create the folder." }
    }

    revalidatePath("/browse")
    return { ok: true, folder: mapDbFolder(fallback.data as DbFolder) }
  }

  return { ok: false, error: "Failed to create the folder." }
}

export async function renameFolderAction(folderId: string, name: string): Promise<SimpleResult> {
  const user = await getCurrentUser()
  if (!user) {
    return { ok: false, error: "You must be signed in to rename a folder." }
  }

  const trimmed = name.trim()
  if (!trimmed) {
    return { ok: false, error: "Folder name is required." }
  }

  const supabase = await getServerClient()
  const { error, count } = await supabase
    .from("folders")
    .update({ name: trimmed }, { count: "exact" })
    .eq("id", folderId)
    .eq("created_by", user.id)

  if (error) {
    return { ok: false, error: error.message }
  }
  if (!count) {
    return { ok: false, error: "You can only rename folders you created." }
  }

  revalidatePath("/browse")
  return { ok: true }
}

export async function moveFolderAction(
  folderId: string,
  newParentId: string | null
): Promise<SimpleResult> {
  const user = await getCurrentUser()
  if (!user) {
    return { ok: false, error: "You must be signed in to move a folder." }
  }

  if (folderId === newParentId) {
    return { ok: false, error: "A folder can't be moved into itself." }
  }

  const supabase = await getServerClient()

  if (newParentId) {
    let folders: DbFolder[]
    try {
      folders = await selectFolders(supabase)
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Failed to load folders." }
    }

    const descendants = getDescendantIds(folders.map(mapDbFolder), folderId)
    if (descendants.has(newParentId)) {
      return { ok: false, error: "A folder can't be moved into one of its own subfolders." }
    }
  }

  const { error, count } = await supabase
    .from("folders")
    .update({ parent_folder_id: newParentId }, { count: "exact" })
    .eq("id", folderId)
    .eq("created_by", user.id)

  if (error) {
    return { ok: false, error: error.message }
  }
  if (!count) {
    return { ok: false, error: "You can only move folders you created." }
  }

  revalidatePath("/browse")
  return { ok: true }
}

export async function deleteFolderAction(folderId: string): Promise<SimpleResult> {
  const user = await getCurrentUser()
  if (!user) {
    return { ok: false, error: "You must be signed in to delete a folder." }
  }

  const supabase = await getServerClient()

  const [subfolders, resources] = await Promise.all([
    supabase.from("folders").select("id", { count: "exact", head: true }).eq("parent_folder_id", folderId),
    supabase.from("resources").select("id", { count: "exact", head: true }).eq("folder_id", folderId),
  ])

  if (subfolders.error || resources.error) {
    return {
      ok: false,
      error: (subfolders.error ?? resources.error)?.message ?? "Failed to check folder contents.",
    }
  }

  if ((subfolders.count ?? 0) > 0 || (resources.count ?? 0) > 0) {
    return { ok: false, error: "This folder isn't empty — move or delete its contents first." }
  }

  const { error, count } = await supabase
    .from("folders")
    .delete({ count: "exact" })
    .eq("id", folderId)
    .eq("created_by", user.id)

  if (error) {
    return { ok: false, error: error.message }
  }
  if (!count) {
    return { ok: false, error: "You can only delete folders you created." }
  }

  revalidatePath("/browse")
  return { ok: true }
}

export async function moveResourceToFolderAction(
  resourceId: string,
  folderId: string | null
): Promise<SimpleResult> {
  const user = await getCurrentUser()
  if (!user) {
    return { ok: false, error: "You must be signed in to move a resource." }
  }

  const supabase = await getServerClient()
  const { error, count } = await supabase
    .from("resources")
    .update({ folder_id: folderId }, { count: "exact" })
    .eq("id", resourceId)
    .eq("created_by", user.id)

  if (error) {
    return { ok: false, error: error.message }
  }
  if (!count) {
    return { ok: false, error: "You can only move resources you added." }
  }

  revalidatePath("/browse")
  revalidatePath("/resources")
  revalidatePath("/my-resources")
  return { ok: true }
}
