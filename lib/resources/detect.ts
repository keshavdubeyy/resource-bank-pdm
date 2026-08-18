"use server"

import { lookup } from "node:dns/promises"

import type { ResourceType } from "@/lib/resources/types"

export interface DetectedMetadata {
  title: string | null
  type: ResourceType
  sourceLabel: string | null
}

const COURSE_DOMAINS = [
  "coursera.org",
  "udemy.com",
  "edx.org",
  "pluralsight.com",
  "skillshare.com",
  "masterclass.com",
]

function hostnameMatches(hostname: string, domain: string): boolean {
  return hostname === domain || hostname.endsWith(`.${domain}`)
}

function isPrivateOrReservedIp(address: string): boolean {
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(address)) {
    const [a, b] = address.split(".").map(Number)
    if (a === 10 || a === 127 || a === 0) return true
    if (a === 169 && b === 254) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 192 && b === 168) return true
    return false
  }
  const lower = address.toLowerCase()
  return (
    lower === "::1" ||
    lower.startsWith("fc") ||
    lower.startsWith("fd") ||
    lower.startsWith("fe80")
  )
}

/** Rejects non-http(s) URLs and anything resolving to a private/loopback/link-local address. */
async function resolveSafeUrl(rawUrl: string): Promise<URL | null> {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return null
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return null
  }

  const hostname = url.hostname.toLowerCase()
  if (["localhost", "0.0.0.0", "127.0.0.1", "::1"].includes(hostname)) {
    return null
  }

  try {
    const results = await lookup(hostname, { all: true })
    if (results.some((result) => isPrivateOrReservedIp(result.address))) {
      return null
    }
  } catch {
    return null
  }

  return url
}

async function detectYouTube(url: URL): Promise<DetectedMetadata | null> {
  if (!hostnameMatches(url.hostname, "youtube.com") && !hostnameMatches(url.hostname, "youtu.be")) {
    return null
  }
  const fallback: DetectedMetadata = {
    title: null,
    type: "Video",
    sourceLabel: "YouTube",
  }
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url.toString())}&format=json`
    const response = await fetch(oembedUrl, { signal: AbortSignal.timeout(5000) })
    if (!response.ok) {
      return fallback
    }
    const data = (await response.json()) as { title?: unknown }
    return {
      title: typeof data.title === "string" ? data.title : null,
      type: "Video",
      sourceLabel: "YouTube",
    }
  } catch {
    return fallback
  }
}

function detectGitHub(url: URL): DetectedMetadata | null {
  if (!hostnameMatches(url.hostname, "github.com")) {
    return null
  }
  const [owner, repo] = url.pathname.split("/").filter(Boolean)
  return {
    title: owner && repo ? `${owner}/${repo}` : null,
    type: "Repository",
    sourceLabel: "GitHub",
  }
}

/** LinkedIn blocks scraping (login wall + bot protection), so the generic
 * og:title fetch below never returns anything useful — build a name straight
 * from the profile slug instead, e.g. "/in/john-doe-1a2b3c4d" -> "John Doe". */
function humanizeProfileSlug(slug: string): string {
  const words = decodeURIComponent(slug).split(/[-_]+/).filter(Boolean)
  const looksGenerated = (word: string) => /\d/.test(word) && word.length >= 6
  while (words.length > 1 && looksGenerated(words[words.length - 1])) {
    words.pop()
  }
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
}

function detectLinkedIn(url: URL): DetectedMetadata | null {
  if (!hostnameMatches(url.hostname, "linkedin.com")) {
    return null
  }
  const [section, slug] = url.pathname.split("/").filter(Boolean)
  const name = slug ? humanizeProfileSlug(slug) : ""
  const isProfileLike = section === "in" || section === "company" || section === "school"
  return {
    title: isProfileLike && name ? `${name} · LinkedIn` : null,
    type: "Article",
    sourceLabel: "LinkedIn",
  }
}

function detectCourseDomain(url: URL): ResourceType | null {
  return COURSE_DOMAINS.some((domain) => hostnameMatches(url.hostname, domain))
    ? "Course"
    : null
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
}

function extractMetaContent(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${property}["']`, "i"),
  ]
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match) {
      return decodeHtmlEntities(match[1])
    }
  }
  return null
}

/** Best-effort — bot-protected sites (Amazon, LinkedIn, etc.) will often return nulls here. */
async function fetchGenericMetadata(url: URL): Promise<{
  title: string | null
  sourceLabel: string | null
}> {
  const fallback = { title: null, sourceLabel: url.hostname }
  try {
    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(5000),
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PDMResourceHubBot/1.0; +link preview)",
      },
    })
    const contentType = response.headers.get("content-type") ?? ""
    if (!response.ok || !contentType.includes("text/html")) {
      return fallback
    }

    const buffer = await response.arrayBuffer()
    const html = new TextDecoder().decode(buffer.slice(0, 200_000))

    const ogTitle = extractMetaContent(html, "og:title")
    const ogSiteName = extractMetaContent(html, "og:site_name")
    const titleTagMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
    const title = ogTitle ?? (titleTagMatch ? decodeHtmlEntities(titleTagMatch[1].trim()) : null)

    return {
      title: title || null,
      sourceLabel: ogSiteName ?? url.hostname,
    }
  } catch {
    return fallback
  }
}

export async function detectFromUrl(rawUrl: string): Promise<DetectedMetadata> {
  const url = await resolveSafeUrl(rawUrl)
  if (!url) {
    return { title: null, type: "Article", sourceLabel: null }
  }

  const youtube = await detectYouTube(url)
  if (youtube) {
    return youtube
  }

  const github = detectGitHub(url)
  if (github) {
    return github
  }

  const linkedin = detectLinkedIn(url)
  if (linkedin) {
    return linkedin
  }

  const courseType = detectCourseDomain(url)
  const generic = await fetchGenericMetadata(url)

  return {
    title: generic.title,
    type: courseType ?? "Article",
    sourceLabel: generic.sourceLabel,
  }
}
