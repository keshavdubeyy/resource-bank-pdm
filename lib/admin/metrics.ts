import { cookies } from "next/headers"

import { createClient } from "@/utils/supabase/server"

const WEAK_CONTEXT_MIN_LENGTH = 24

interface ResourceMetricRow {
  id: string
  type: string
  why_useful: string | null
  recommended_by: string | null
  created_by: string | null
  date_added: string
  folder_id: string | null
}

interface LinkMetricRow {
  resource_id: string
}

interface FolderMetricRow {
  id: string
  name: string
  created_by: string | null
}

interface AnalyticsEventRow {
  event_type: "page_view" | "login"
  anonymous_id: string
  user_id: string | null
  user_name: string | null
  user_email: string | null
  path: string | null
  occurred_at: string
}

export interface AdminMetricItem {
  label: string
  value: number
  detail?: string
}

export interface AdminContributorMetric {
  name: string
  resourceCount: number
}

export interface AdminFolderMetric {
  id: string | null
  name: string
  resourceCount: number
}

export interface AdminAnalyticsPoint {
  key: string
  label: string
  visitors: number
  logins: number
}

export interface AdminLoggedInNonContributor {
  userId: string
  name: string
  email: string | null
  pageViews: number
  logins: number
  lastSeen: string
}

export interface AdminAnalyticsSummary {
  available: true
  daily: AdminAnalyticsPoint[]
  weekly: AdminAnalyticsPoint[]
  monthly: AdminAnalyticsPoint[]
  yearly: AdminAnalyticsPoint[]
  loggedInNonContributors: AdminLoggedInNonContributor[]
}

export interface AdminAnalyticsUnavailable {
  available: false
  reason: string
}

export interface AdminMetrics {
  totalResources: number
  studentUploadedResources: number
  seedResources: number
  newUploadsThisWeek: number
  newUploadsThisMonth: number
  uniqueContributors: number
  repeatContributors: number
  resourcesMissingContext: number
  resourcesWithoutLinks: number
  unfiledResources: number
  foldersCreated: number
  folderCreators: number
  studentContributionPercent: number
  typeDistribution: AdminMetricItem[]
  folderDistribution: AdminFolderMetric[]
  topContributors: AdminContributorMetric[]
  analytics: AdminAnalyticsSummary | AdminAnalyticsUnavailable
}

function getIsoDateDaysAgo(days: number): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - days)
  return date.toISOString().slice(0, 10)
}

function getIsoMonthStart(): string {
  const date = new Date()
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
    .toISOString()
    .slice(0, 10)
}

function increment(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1)
}

function sortCountEntries(entries: [string, number][]): AdminMetricItem[] {
  return entries
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, value]) => ({ label, value }))
}

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  )
}

function startOfUtcWeek(date: Date): Date {
  const day = date.getUTCDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const weekStart = startOfUtcDay(date)
  weekStart.setUTCDate(weekStart.getUTCDate() + mondayOffset)
  return weekStart
}

function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

function addUtcMonths(date: Date, months: number): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1)
  )
}

function addUtcYears(date: Date, years: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear() + years, 0, 1))
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function monthKey(date: Date): string {
  return date.toISOString().slice(0, 7)
}

function yearKey(date: Date): string {
  return String(date.getUTCFullYear())
}

function dayLabel(key: string): string {
  const date = new Date(`${key}T00:00:00.000Z`)
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date)
}

function monthLabel(key: string): string {
  const date = new Date(`${key}-01T00:00:00.000Z`)
  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(value))
}

function getAnalyticsUnavailableReason(errorMessage: string): string {
  const lower = errorMessage.toLowerCase()

  if (
    lower.includes("analytics_events") ||
    lower.includes("schema cache") ||
    lower.includes("does not exist")
  ) {
    return "Run supabase/analytics-events-migration.sql to enable visit and login metrics."
  }

  if (lower.includes("permission denied")) {
    return "Sign in with an account allowed to read analytics events."
  }

  return "Analytics metrics unavailable."
}

function createEmptySeries(
  count: number,
  start: Date,
  nextDate: (date: Date, offset: number) => Date,
  getKey: (date: Date) => string,
  getLabel: (key: string) => string
): { points: AdminAnalyticsPoint[]; visitorsByKey: Map<string, Set<string>> } {
  const points: AdminAnalyticsPoint[] = []
  const visitorsByKey = new Map<string, Set<string>>()

  for (let index = 0; index < count; index += 1) {
    const key = getKey(nextDate(start, index))
    points.push({ key, label: getLabel(key), visitors: 0, logins: 0 })
    visitorsByKey.set(key, new Set())
  }

  return { points, visitorsByKey }
}

function buildAnalyticsSummary(
  events: AnalyticsEventRow[],
  contributorIds: Set<string>
): AdminAnalyticsSummary {
  const now = new Date()
  const today = startOfUtcDay(now)
  const daily = createEmptySeries(
    14,
    addUtcDays(today, -13),
    addUtcDays,
    dayKey,
    dayLabel
  )
  const weekly = createEmptySeries(
    12,
    addUtcDays(startOfUtcWeek(now), -77),
    (date, offset) => addUtcDays(date, offset * 7),
    dayKey,
    (key) => `Week of ${dayLabel(key)}`
  )
  const monthly = createEmptySeries(
    12,
    addUtcMonths(
      new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)),
      -11
    ),
    addUtcMonths,
    monthKey,
    monthLabel
  )
  const yearly = createEmptySeries(
    5,
    addUtcYears(new Date(Date.UTC(now.getUTCFullYear(), 0, 1)), -4),
    addUtcYears,
    yearKey,
    (key) => key
  )
  const loggedInUsers = new Map<
    string,
    {
      name: string
      email: string | null
      pageViews: number
      logins: number
      lastSeen: string
    }
  >()

  const pointCollections = [
    {
      points: daily.points,
      visitorsByKey: daily.visitorsByKey,
      getKey: (date: Date) => dayKey(startOfUtcDay(date)),
    },
    {
      points: weekly.points,
      visitorsByKey: weekly.visitorsByKey,
      getKey: (date: Date) => dayKey(startOfUtcWeek(date)),
    },
    {
      points: monthly.points,
      visitorsByKey: monthly.visitorsByKey,
      getKey: (date: Date) => monthKey(date),
    },
    {
      points: yearly.points,
      visitorsByKey: yearly.visitorsByKey,
      getKey: (date: Date) => yearKey(date),
    },
  ]

  for (const event of events) {
    const occurredAt = new Date(event.occurred_at)
    const visitorKey = event.user_id
      ? `user:${event.user_id}`
      : `anon:${event.anonymous_id}`

    for (const collection of pointCollections) {
      const key = collection.getKey(occurredAt)
      const point = collection.points.find((item) => item.key === key)
      if (!point) {
        continue
      }

      if (event.event_type === "page_view") {
        collection.visitorsByKey.get(key)?.add(visitorKey)
      }

      if (event.event_type === "login") {
        point.logins += 1
      }
    }

    if (event.user_id) {
      const existing = loggedInUsers.get(event.user_id)
      loggedInUsers.set(event.user_id, {
        name: event.user_name?.trim() || existing?.name || "Unnamed user",
        email: event.user_email ?? existing?.email ?? null,
        pageViews:
          (existing?.pageViews ?? 0) +
          (event.event_type === "page_view" ? 1 : 0),
        logins:
          (existing?.logins ?? 0) + (event.event_type === "login" ? 1 : 0),
        lastSeen:
          !existing || event.occurred_at > existing.lastSeen
            ? event.occurred_at
            : existing.lastSeen,
      })
    }
  }

  for (const collection of pointCollections) {
    for (const point of collection.points) {
      point.visitors = collection.visitorsByKey.get(point.key)?.size ?? 0
    }
  }

  const loggedInNonContributors = Array.from(loggedInUsers.entries())
    .filter(([userId]) => !contributorIds.has(userId))
    .map(([userId, user]) => ({
      userId,
      name: user.name,
      email: user.email,
      pageViews: user.pageViews,
      logins: user.logins,
      lastSeen: formatDateTime(user.lastSeen),
    }))
    .sort(
      (a, b) =>
        b.logins - a.logins ||
        b.pageViews - a.pageViews ||
        a.name.localeCompare(b.name)
    )
    .slice(0, 50)

  return {
    available: true,
    daily: daily.points,
    weekly: weekly.points,
    monthly: monthly.points,
    yearly: yearly.points,
    loggedInNonContributors,
  }
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const [resourcesResult, linksResult, foldersResult] = await Promise.all([
    supabase
      .from("resources")
      .select(
        "id, type, why_useful, recommended_by, created_by, date_added, folder_id"
      ),
    supabase.from("resource_links").select("resource_id"),
    supabase.from("folders").select("id, name, created_by"),
  ])

  if (resourcesResult.error) {
    throw new Error(
      `Failed to load resource metrics: ${resourcesResult.error.message}`
    )
  }

  if (linksResult.error) {
    throw new Error(`Failed to load link metrics: ${linksResult.error.message}`)
  }

  if (foldersResult.error) {
    throw new Error(
      `Failed to load folder metrics: ${foldersResult.error.message}`
    )
  }

  const resources = (resourcesResult.data ?? []) as ResourceMetricRow[]
  const links = (linksResult.data ?? []) as LinkMetricRow[]
  const folders = (foldersResult.data ?? []) as FolderMetricRow[]

  const weekStart = getIsoDateDaysAgo(7)
  const monthStart = getIsoMonthStart()
  const linkedResourceIds = new Set(links.map((link) => link.resource_id))
  const folderNames = new Map(folders.map((folder) => [folder.id, folder.name]))

  const typeCounts = new Map<string, number>()
  const folderCounts = new Map<string, number>()
  const contributorCounts = new Map<string, { name: string; count: number }>()
  const contributorIds = new Set<string>()
  const folderCreatorIds = new Set<string>()

  let studentUploadedResources = 0
  let seedResources = 0
  let newUploadsThisWeek = 0
  let newUploadsThisMonth = 0
  let resourcesMissingContext = 0
  let resourcesWithoutLinks = 0
  let unfiledResources = 0

  for (const resource of resources) {
    increment(typeCounts, resource.type || "Unknown")
    increment(folderCounts, resource.folder_id ?? "unfiled")

    if (resource.created_by) {
      studentUploadedResources += 1
      contributorIds.add(resource.created_by)
      const existing = contributorCounts.get(resource.created_by)
      contributorCounts.set(resource.created_by, {
        name: resource.recommended_by?.trim() || "Unnamed contributor",
        count: (existing?.count ?? 0) + 1,
      })

      if (resource.date_added >= weekStart) {
        newUploadsThisWeek += 1
      }

      if (resource.date_added >= monthStart) {
        newUploadsThisMonth += 1
      }
    } else {
      seedResources += 1
    }

    if ((resource.why_useful ?? "").trim().length < WEAK_CONTEXT_MIN_LENGTH) {
      resourcesMissingContext += 1
    }

    if (!linkedResourceIds.has(resource.id)) {
      resourcesWithoutLinks += 1
    }

    if (!resource.folder_id) {
      unfiledResources += 1
    }
  }

  for (const folder of folders) {
    if (folder.created_by) {
      folderCreatorIds.add(folder.created_by)
    }
  }

  const topContributors = Array.from(contributorCounts.values())
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 8)
    .map((contributor) => ({
      name: contributor.name,
      resourceCount: contributor.count,
    }))

  const folderDistribution = Array.from(folderCounts.entries())
    .map(([id, resourceCount]) => ({
      id: id === "unfiled" ? null : id,
      name:
        id === "unfiled"
          ? "Unfiled"
          : (folderNames.get(id) ?? "Unknown folder"),
      resourceCount,
    }))
    .sort(
      (a, b) =>
        b.resourceCount - a.resourceCount || a.name.localeCompare(b.name)
    )
    .slice(0, 10)

  const totalResources = resources.length
  const analyticsResult = await supabase
    .from("analytics_events")
    .select(
      "event_type, anonymous_id, user_id, user_name, user_email, path, occurred_at"
    )
    .order("occurred_at", { ascending: true })
    .limit(10000)

  const analytics: AdminMetrics["analytics"] = analyticsResult.error
    ? {
        available: false,
        reason: getAnalyticsUnavailableReason(analyticsResult.error.message),
      }
    : buildAnalyticsSummary(
        (analyticsResult.data ?? []) as AnalyticsEventRow[],
        contributorIds
      )

  return {
    totalResources,
    studentUploadedResources,
    seedResources,
    newUploadsThisWeek,
    newUploadsThisMonth,
    uniqueContributors: contributorCounts.size,
    repeatContributors: Array.from(contributorCounts.values()).filter(
      (contributor) => contributor.count > 1
    ).length,
    resourcesMissingContext,
    resourcesWithoutLinks,
    unfiledResources,
    foldersCreated: folders.length,
    folderCreators: folderCreatorIds.size,
    studentContributionPercent:
      totalResources > 0
        ? Math.round((studentUploadedResources / totalResources) * 100)
        : 0,
    typeDistribution: sortCountEntries(Array.from(typeCounts.entries())),
    folderDistribution,
    topContributors,
    analytics,
  }
}
