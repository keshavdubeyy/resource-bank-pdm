export function slugify(title: string, existingSlugs: Set<string>): string {
  const base =
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-+|-+$)/g, "") || "resource"

  let slug = base
  let suffix = 2
  while (existingSlugs.has(slug)) {
    slug = `${base}-${suffix}`
    suffix += 1
  }
  return slug
}

/** Prefixes a protocol-less value (e.g. "example.com") with https:// so it can be parsed as a URL. */
export function normalizeUrl(value: string): string {
  const trimmed = value.trim()
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }
  return `https://${trimmed}`
}

export function isValidUrl(value: string): boolean {
  const trimmed = value.trim()
  // Browsers' URL parser is lenient about whitespace and dotless hosts
  // (e.g. `new URL("https://not a url")` doesn't throw), so reject those explicitly.
  if (!trimmed || /\s/.test(trimmed)) {
    return false
  }
  try {
    const url = new URL(normalizeUrl(trimmed))
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return false
    }
    return url.hostname === "localhost" || url.hostname.includes(".")
  } catch {
    return false
  }
}

/** Older resources were saved with description === title (a since-removed
 * fallback), so an empty-check alone isn't enough to catch "no real note". */
export function hasMeaningfulDescription(resource: { title: string; description: string }): boolean {
  const description = resource.description.trim()
  return description.length > 0 && description !== resource.title.trim()
}

export function truncate(value: string, maxLength: number): string {
  const trimmed = value.trim()
  if (trimmed.length <= maxLength) {
    return trimmed
  }
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`
}

/** Google's public favicon service — returns null for non-http(s) URLs (e.g. uploaded files). */
export function getFaviconUrl(url: string | null | undefined, size = 64): string | null {
  if (!url) {
    return null
  }
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null
    }
    return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=${size}`
  } catch {
    return null
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  const kb = bytes / 1024
  if (kb < 1024) {
    return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`
  }
  return `${(kb / 1024).toFixed(1)} MB`
}
