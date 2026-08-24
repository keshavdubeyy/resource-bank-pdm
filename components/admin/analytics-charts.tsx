"use client"

import { useState } from "react"

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { AdminAnalyticsPoint } from "@/lib/admin/metrics"

const chartConfig = {
  visitors: {
    label: "Visitors",
    color: "var(--chart-1)",
  },
  logins: {
    label: "Logins",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en").format(value)
}

const RANGES = [
  {
    value: "daily",
    label: "Daily",
    description: "Unique visitors and successful login events over the last 14 days.",
    variant: "area" as const,
  },
  {
    value: "weekly",
    label: "Weekly",
    description: "Unique visitors and successful login events over the last 12 weeks.",
    variant: "area" as const,
  },
  {
    value: "monthly",
    label: "Monthly",
    description: "Unique visitors and successful login events over the last 12 months.",
    variant: "line" as const,
  },
  {
    value: "yearly",
    label: "Yearly",
    description: "Unique visitors and successful login events over the last 5 years.",
    variant: "line" as const,
  },
]

function AnalyticsTrendPanel({
  data,
  variant,
}: {
  data: AdminAnalyticsPoint[]
  variant: "area" | "line"
}) {
  const Chart = variant === "area" ? AreaChart : LineChart

  return (
    <div>
      <ChartContainer
        config={chartConfig}
        className="h-64 w-full"
        initialDimension={{ width: 520, height: 256 }}
      >
        <Chart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={18}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={32}
            allowDecimals={false}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          {variant === "area" ? (
            <>
              <Area
                dataKey="visitors"
                type="monotone"
                fill="var(--color-visitors)"
                fillOpacity={0.18}
                stroke="var(--color-visitors)"
                strokeWidth={2}
              />
              <Area
                dataKey="logins"
                type="monotone"
                fill="var(--color-logins)"
                fillOpacity={0.12}
                stroke="var(--color-logins)"
                strokeWidth={2}
              />
            </>
          ) : (
            <>
              <Line
                dataKey="visitors"
                type="monotone"
                stroke="var(--color-visitors)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="logins"
                type="monotone"
                stroke="var(--color-logins)"
                strokeWidth={2}
                dot={false}
              />
            </>
          )}
        </Chart>
      </ChartContainer>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="py-2 pr-3 font-medium">Period</th>
              <th className="py-2 pr-3 text-right font-medium">Visitors</th>
              <th className="py-2 text-right font-medium">Logins</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(-6).map((point) => (
              <tr key={point.key} className="border-b last:border-0">
                <td className="py-2 pr-3 font-medium">{point.label}</td>
                <td className="py-2 pr-3 text-right tabular-nums">
                  {formatNumber(point.visitors)}
                </td>
                <td className="py-2 text-right tabular-nums">
                  {formatNumber(point.logins)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AnalyticsCharts({
  daily,
  weekly,
  monthly,
  yearly,
}: {
  daily: AdminAnalyticsPoint[]
  weekly: AdminAnalyticsPoint[]
  monthly: AdminAnalyticsPoint[]
  yearly: AdminAnalyticsPoint[]
}) {
  const dataByRange: Record<string, AdminAnalyticsPoint[]> = {
    daily,
    weekly,
    monthly,
    yearly,
  }
  const [activeRange, setActiveRange] = useState<string>("daily")
  const activeDescription = RANGES.find(
    (range) => range.value === activeRange
  )?.description

  return (
    <section className="rounded-lg border bg-card p-4">
      <Tabs value={activeRange} onValueChange={setActiveRange}>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">Visitors And Logins</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeDescription}
            </p>
          </div>
          <TabsList>
            {RANGES.map((range) => (
              <TabsTrigger key={range.value} value={range.value}>
                {range.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {RANGES.map((range) => (
          <TabsContent key={range.value} value={range.value}>
            <AnalyticsTrendPanel
              data={dataByRange[range.value]}
              variant={range.variant}
            />
          </TabsContent>
        ))}
      </Tabs>
    </section>
  )
}

export { AnalyticsCharts }
