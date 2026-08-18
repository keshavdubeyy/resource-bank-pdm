export function buildFolderShareUrl(folderId: string): string {
  return `${window.location.origin}/browse/${folderId}`
}

export function buildResourceShareUrl(slug: string): string {
  return `${window.location.origin}/browse?resource=${encodeURIComponent(slug)}`
}

export type ShareResult = { ok: true; method: "share" | "copy" } | { ok: false }

/** Uses the native OS share sheet when available (mobile Safari/Chrome), falling
 * back to copying the link to the clipboard everywhere else (most desktop browsers). */
export async function shareOrCopyLink(data: { title: string; url: string }): Promise<ShareResult> {
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share(data)
      return { ok: true, method: "share" }
    } catch (error) {
      // The user dismissing the native share sheet isn't a failure worth reporting.
      if (error instanceof Error && error.name === "AbortError") {
        return { ok: true, method: "share" }
      }
      // Any other failure (e.g. share blocked by permissions policy) falls through to clipboard.
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(data.url)
      return { ok: true, method: "copy" }
    } catch {
      return { ok: false }
    }
  }

  return { ok: false }
}
