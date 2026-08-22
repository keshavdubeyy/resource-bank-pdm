import { AnalyticsCharts } from "@/components/admin/analytics-charts"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { DatabaseErrorFallback } from "@/components/shared/database-error-fallback"
import { getAdminMetrics, type AdminMetricItem } from "@/lib/admin/metrics"

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en").format(value)
}

function MetricCard({
  label,
  value,
  detail,
  tone = "default",
}: {
  label: string
  value: number | string
  detail: string
  tone?: "default" | "attention" | "success"
}) {
  const toneClass =
    tone === "attention"
      ? "border-amber-500/30 bg-amber-500/10"
      : tone === "success"
        ? "border-emerald-500/30 bg-emerald-500/10"
        : "border-border bg-card"

  return (
    <section className={`rounded-lg border p-4 ${toneClass}`}>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {detail}
      </p>
    </section>
  )
}

function DistributionList({
  title,
  description,
  items,
  emptyLabel,
}: {
  title: string
  description: string
  items: AdminMetricItem[]
  emptyLabel: string
}) {
  const maxValue = Math.max(...items.map((item) => item.value), 1)

  return (
    <section className="rounded-lg border bg-card p-4">
      <div className="mb-4">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate font-medium">
                  {item.label}
                </span>
                <span className="shrink-0 text-muted-foreground tabular-nums">
                  {formatNumber(item.value)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${Math.max((item.value / maxValue) * 100, 4)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      )}
    </section>
  )
}

function RankedList({
  title,
  description,
  items,
  emptyLabel,
}: {
  title: string
  description: string
  items: { label: string; value: number; detail?: string }[]
  emptyLabel: string
}) {
  return (
    <section className="rounded-lg border bg-card p-4">
      <div className="mb-4">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {items.length > 0 ? (
        <div className="divide-y">
          {items.map((item, index) => (
            <div
              key={item.label}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium text-muted-foreground tabular-nums">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.label}</p>
                {item.detail && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.detail}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-sm font-medium tabular-nums">
                {formatNumber(item.value)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      )}
    </section>
  )
}

export default async function AdminPage() {
  let result: Awaited<ReturnType<typeof getAdminMetrics>> | { error: Error }

  try {
    result = await getAdminMetrics()
  } catch (error) {
    result = { error: error as Error }
  }

  if ("error" in result) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-4 sm:gap-8 sm:px-6 sm:py-6 lg:px-8">
        <PageHeader
          title="Admin"
          description="Community contribution metrics for the PDM resource bank."
        />
        <DatabaseErrorFallback error={result.error} />
      </div>
    )
  }

  const metrics = result
  const contributorItems = metrics.topContributors.map((contributor) => ({
    label: contributor.name,
    value: contributor.resourceCount,
    detail:
      contributor.resourceCount === 1
        ? "1 resource uploaded"
        : "resources uploaded",
  }))
  const folderItems = metrics.folderDistribution.map((folder) => ({
    label: folder.name,
    value: folder.resourceCount,
  }))
  const latestDailyPoint = metrics.analytics.available
    ? metrics.analytics.daily.at(-1)
    : null

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-4 sm:gap-8 sm:px-6 sm:py-6 lg:px-8">
      <PageHeader
        title="Admin"
        description="Track whether the PDM resource bank is growing through student contribution instead of private gatekeeping."
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Student uploads"
          value={formatNumber(metrics.studentUploadedResources)}
          detail={`${metrics.studentContributionPercent}% of all resources are community-added.`}
          tone="success"
        />
        <MetricCard
          label="Unique contributors"
          value={formatNumber(metrics.uniqueContributors)}
          detail="People who have uploaded at least one resource."
          tone="success"
        />
        <MetricCard
          label="Uploads this month"
          value={formatNumber(metrics.newUploadsThisMonth)}
          detail={`${formatNumber(metrics.newUploadsThisWeek)} added in the last 7 days.`}
        />
        <MetricCard
          label="Repeat contributors"
          value={formatNumber(metrics.repeatContributors)}
          detail="People who have uploaded more than once."
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total resources"
          value={formatNumber(metrics.totalResources)}
          detail={`${formatNumber(metrics.seedResources)} seed resources, ${formatNumber(
            metrics.studentUploadedResources
          )} student uploads.`}
        />
        <MetricCard
          label="Need context"
          value={formatNumber(metrics.resourcesMissingContext)}
          detail='Blank or very short "why useful" notes.'
          tone={metrics.resourcesMissingContext > 0 ? "attention" : "default"}
        />
        <MetricCard
          label="Without links"
          value={formatNumber(metrics.resourcesWithoutLinks)}
          detail="Resources with no link or attachment row."
          tone={metrics.resourcesWithoutLinks > 0 ? "attention" : "default"}
        />
        <MetricCard
          label="Unfiled"
          value={formatNumber(metrics.unfiledResources)}
          detail="Resources not assigned to a folder."
          tone={metrics.unfiledResources > 0 ? "attention" : "default"}
        />
      </section>

      <section className="rounded-lg border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">Community Health</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              These are the closest current-codebase signals for onboarding and
              anti-gatekeeping.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {formatNumber(metrics.foldersCreated)} folders
            </Badge>
            <Badge variant="secondary">
              {formatNumber(metrics.folderCreators)} folder creators
            </Badge>
            <Badge variant="secondary">
              {formatNumber(metrics.seedResources)} seed resources
            </Badge>
          </div>
        </div>
      </section>

      {metrics.analytics.available ? (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            <MetricCard
              label="Visitors today"
              value={formatNumber(latestDailyPoint?.visitors ?? 0)}
              detail="Unique visitors from page-view events."
            />
            <MetricCard
              label="Logins today"
              value={formatNumber(latestDailyPoint?.logins ?? 0)}
              detail="Successful Google sign-ins recorded today."
            />
            <MetricCard
              label="Logged in, no upload"
              value={formatNumber(
                metrics.analytics.loggedInNonContributors.length
              )}
              detail="Known users who have visited or logged in but have not contributed."
              tone={
                metrics.analytics.loggedInNonContributors.length > 0
                  ? "attention"
                  : "default"
              }
            />
          </section>

          <AnalyticsCharts
            daily={metrics.analytics.daily}
            weekly={metrics.analytics.weekly}
            monthly={metrics.analytics.monthly}
            yearly={metrics.analytics.yearly}
          />

          <section className="rounded-lg border bg-card p-4">
            <div className="mb-4">
              <h2 className="text-base font-semibold">
                Logged In Users Without Uploads
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Use this list for contribution nudges: these users have shown
                up, but have not added a resource yet.
              </p>
            </div>
            {metrics.analytics.loggedInNonContributors.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-2 pr-4 font-medium">User</th>
                      <th className="py-2 pr-4 text-right font-medium">
                        Page Views
                      </th>
                      <th className="py-2 pr-4 text-right font-medium">
                        Logins
                      </th>
                      <th className="py-2 text-right font-medium">Last Seen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.analytics.loggedInNonContributors.map((user) => (
                      <tr key={user.userId} className="border-b last:border-0">
                        <td className="py-3 pr-4">
                          <div className="min-w-48">
                            <p className="font-medium">{user.name}</p>
                            {user.email && (
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {user.email}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums">
                          {formatNumber(user.pageViews)}
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums">
                          {formatNumber(user.logins)}
                        </td>
                        <td className="py-3 text-right whitespace-nowrap text-muted-foreground">
                          {user.lastSeen}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No logged-in non-contributors yet.
              </p>
            )}
          </section>
        </>
      ) : (
        <section className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <h2 className="text-base font-semibold">
            Traffic Metrics Need Setup
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {metrics.analytics.reason}
          </p>
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <RankedList
            title="Top Contributors"
            description="Recognize students who are sharing material with the cohort."
            items={contributorItems}
            emptyLabel="No student uploads yet."
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
          <DistributionList
            title="Resources By Type"
            description="Shows whether the bank has a healthy mix of PDFs, videos, articles, courses, and repositories."
            items={metrics.typeDistribution}
            emptyLabel="No resources yet."
          />
          <DistributionList
            title="Resources By Folder"
            description="Highlights strong prep areas and folders that need more contributions."
            items={folderItems}
            emptyLabel="No folders have resources yet."
          />
        </div>
      </section>
    </div>
  )
}
