import type { HugeiconsIcon } from "@hugeicons/react"
import {
  Csv01Icon,
  Doc02Icon,
  Image01Icon,
  Pdf01Icon,
  Txt01Icon,
  Xls02Icon,
} from "@hugeicons/core-free-icons"

import { createClient } from "@/utils/supabase/client"
import { notifySupabaseUsageChanged } from "@/lib/usage/client-events"

export const RESOURCE_FILES_BUCKET = "resource-files"
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

export type UploadKind = "pdf" | "image" | "xls" | "csv" | "doc" | "txt"

/** Tracks an in-flight (or resolved) upload for a single attachment, independent of form submission. */
export type UploadStatus = "idle" | "uploading" | "error" | "done"

/** Every extension/MIME combination accepted for upload, grouped by kind —
 * also doubles as the file picker's `accept` filter and the single source
 * of truth for what the storage bucket's allowed_mime_types must include. */
const IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"]
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif"]
const XLS_MIME_TYPES = [
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]
const XLS_EXTENSIONS = [".xls", ".xlsx"]
const CSV_MIME_TYPES = ["text/csv"]
const CSV_EXTENSIONS = [".csv"]
const DOC_MIME_TYPES = [
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]
const DOC_EXTENSIONS = [".doc", ".docx"]
const TXT_MIME_TYPES = ["text/plain"]
const TXT_EXTENSIONS = [".txt"]

/** Suitable as an `<input accept>` value covering every supported upload kind. */
export const UPLOAD_ACCEPT = [
  "application/pdf",
  ...IMAGE_MIME_TYPES,
  ...XLS_MIME_TYPES,
  ...XLS_EXTENSIONS,
  ...CSV_MIME_TYPES,
  ...CSV_EXTENSIONS,
  ...DOC_MIME_TYPES,
  ...DOC_EXTENSIONS,
  ...TXT_MIME_TYPES,
].join(",")

export function getUploadKind(file: File): UploadKind | null {
  const name = file.name.toLowerCase()
  // Checked before the xls MIME types below — Excel on Windows sometimes
  // exports .csv with the application/vnd.ms-excel MIME type.
  if (name.endsWith(".csv") || CSV_MIME_TYPES.includes(file.type)) {
    return "csv"
  }
  if (file.type === "application/pdf" || name.endsWith(".pdf")) {
    return "pdf"
  }
  if (IMAGE_MIME_TYPES.includes(file.type) || IMAGE_EXTENSIONS.some((ext) => name.endsWith(ext))) {
    return "image"
  }
  if (XLS_MIME_TYPES.includes(file.type) || XLS_EXTENSIONS.some((ext) => name.endsWith(ext))) {
    return "xls"
  }
  if (DOC_MIME_TYPES.includes(file.type) || DOC_EXTENSIONS.some((ext) => name.endsWith(ext))) {
    return "doc"
  }
  if (TXT_MIME_TYPES.includes(file.type) || TXT_EXTENSIONS.some((ext) => name.endsWith(ext))) {
    return "txt"
  }
  return null
}

const UPLOAD_KIND_ICONS = {
  pdf: Pdf01Icon,
  image: Image01Icon,
  xls: Xls02Icon,
  csv: Csv01Icon,
  doc: Doc02Icon,
  txt: Txt01Icon,
} satisfies Record<UploadKind, Parameters<typeof HugeiconsIcon>[0]["icon"]>

/** Icon for a given upload kind, or null (callers supply their own fallback,
 * e.g. a generic link icon, for the "no file/not an upload" case). */
export function getUploadKindIcon(kind: UploadKind | null) {
  return kind ? UPLOAD_KIND_ICONS[kind] : null
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

/** For an already-saved storage URL, guesses the upload kind from its extension (for display only). */
export function guessUploadKindFromUrl(url: string): UploadKind {
  const lower = url.toLowerCase()
  if (CSV_EXTENSIONS.some((ext) => lower.includes(ext))) return "csv"
  if (IMAGE_EXTENSIONS.some((ext) => lower.includes(ext))) return "image"
  if (XLS_EXTENSIONS.some((ext) => lower.includes(ext))) return "xls"
  if (DOC_EXTENSIONS.some((ext) => lower.includes(ext))) return "doc"
  if (TXT_EXTENSIONS.some((ext) => lower.includes(ext))) return "txt"
  return "pdf"
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
