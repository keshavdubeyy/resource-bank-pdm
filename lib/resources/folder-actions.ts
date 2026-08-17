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
  created_at: string
}

function mapDbFolder(row: DbFolder): FolderRow {
  return {
    id: row.id,
    name: row.name,
    parentFolderId: row.parent_folder_id,
    createdBy: row.created_by,
    createdAt: row.created_at,
  }
}

async function getServerClient() {
  const cookieStore = await cookies()
  return createClient(cookieStore)
}

/** One flat fetch — callable from Server Components (initial /browse load) and
 * from Client Components (the Add Resource Sheet's lazy folder-picker fetch). */
export async function getAllFolders(): Promise<FolderRow[]> {
  const supabase = await getServerClient()
  const { data, error } = await supabase
    .from("folders")
    .select("id, name, parent_folder_id, created_by, created_at")
    .order("name", { ascending: true })

  if (error) {
    throw new Error(`Failed to load folders: ${error.message}`)
  }

  return (data as DbFolder[]).map(mapDbFolder)
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
  const { data, error } = await supabase
    .from("folders")
    .insert({ name: trimmed, parent_folder_id: parentFolderId, created_by: user.id })
    .select("id, name, parent_folder_id, created_by, created_at")
    .single()

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Failed to create the folder." }
  }

  revalidatePath("/browse")
  return { ok: true, folder: mapDbFolder(data as DbFolder) }
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
    const { data, error: fetchError } = await supabase
      .from("folders")
      .select("id, name, parent_folder_id, created_by, created_at")

    if (fetchError) {
      return { ok: false, error: fetchError.message }
    }

    const descendants = getDescendantIds((data as DbFolder[]).map(mapDbFolder), folderId)
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
