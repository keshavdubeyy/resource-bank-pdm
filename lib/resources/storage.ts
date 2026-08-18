import { createClient } from "@/utils/supabase/client"
import { notifySupabaseUsageChanged } from "@/lib/usage/client-events"

export const RESOURCE_FILES_BUCKET = "resource-files"
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

export type UploadKind = "pdf" | "image"

/** Tracks an in-flight (or resolved) upload for a single attachment, independent of form submission. */
export type UploadStatus = "idle" | "uploading" | "error" | "done"

const IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"]
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif"]

export function getUploadKind(file: File): UploadKind | null {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    return "pdf"
  }
  if (
    IMAGE_MIME_TYPES.includes(file.type) ||
    IMAGE_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext))
  ) {
    return "image"
  }
  return null
}

export function isUploadedResourceFileUrl(url: string): boolean {
  return url.includes(`/storage/v1/object/public/${RESOURCE_FILES_BUCKET}/`)
}

function getResourceFilePath(url: string): string | null {
  const marker = `/storage/v1/object/public/${RESOURCE_FILES_BUCKET}/`
  const index = url.indexOf(marker)

  if (index === -1) {
    return null
  }

  const path = url.slice(index + marker.length)
  if (!path) {
    return null
  }

  try {
    return decodeURIComponent(path)
  } catch {
    return path
  }
}

/** For an already-saved storage URL, guesses pdf vs image from its extension (for display only). */
export function guessUploadKindFromUrl(url: string): UploadKind {
  const lower = url.toLowerCase()
  return IMAGE_EXTENSIONS.some((ext) => lower.includes(ext)) ? "image" : "pdf"
}

/** Picks a display icon for a resource link — pdf/image for uploaded files, null for
 * an external link (callers fall back to a favicon or generic link icon for those). */
export function guessLinkIconKind(url: string | null | undefined): UploadKind | null {
  if (!url || !isUploadedResourceFileUrl(url)) {
    return null
  }
  return guessUploadKindFromUrl(url)
}

export async function uploadResourceFile(
  userId: string,
  file: File
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const supabase = createClient()
  const path = `${userId}/${crypto.randomUUID()}-${file.name}`

  const { error: uploadError } = await supabase.storage
    .from(RESOURCE_FILES_BUCKET)
    .upload(path, file, { contentType: file.type || undefined })

  if (uploadError) {
    return { ok: false, error: uploadError.message }
  }

  const { data } = supabase.storage.from(RESOURCE_FILES_BUCKET).getPublicUrl(path)
  notifySupabaseUsageChanged()
  return { ok: true, url: data.publicUrl }
}

export async function deleteUploadedResourceFiles(urls: string[]) {
  const paths = Array.from(
    new Set(urls.map(getResourceFilePath).filter((path): path is string => Boolean(path)))
  )

  if (paths.length === 0) {
    return
  }

  const supabase = createClient()
  const { error } = await supabase.storage.from(RESOURCE_FILES_BUCKET).remove(paths)
  if (!error) {
    notifySupabaseUsageChanged()
  }
}
