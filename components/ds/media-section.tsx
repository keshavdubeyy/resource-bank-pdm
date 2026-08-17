"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DsExample } from "@/components/ds/ds-section"

const chartData = [
  { track: "APM", submissions: 42 },
  { track: "Core PM", submissions: 28 },
  { track: "Growth PM", submissions: 35 },
  { track: "Technical PM", submissions: 19 },
]

const chartConfig = {
  submissions: {
    label: "Submissions",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const scrollTags = [
  "Case Interviews",
  "Estimation",
  "Product Design",
  "Metrics & Analytics",
  "System Design",
  "Behavioral",
  "Negotiation",
  "Prioritization",
  "Roadmapping",
  "Stakeholder Management",
]

function MediaSection() {
  return (
    <>
      <DsExample
        title="Chart"
        description="Composable charts built on recharts."
        contentClassName="flex-col items-stretch"
      >
        <ChartContainer config={chartConfig} className="h-64 w-full max-w-lg">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="track"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="submissions" fill="var(--color-submissions)" radius={4} />
          </BarChart>
        </ChartContainer>
      </DsExample>

      <DsExample
        title="Carousel"
        description="A slideshow of one or more items."
        contentClassName="justify-center overflow-visible"
      >
        <Carousel className="mx-12 w-full max-w-xs">
          <CarouselContent>
            {Array.from({ length: 5 }, (_, index) => (
              <CarouselItem key={index}>
                <div className="flex aspect-square items-center justify-center rounded-2xl border bg-card text-2xl font-semibold">
                  {index + 1}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </DsExample>

      <DsExample title="Scroll Area" description="A viewport with a styled scrollbar.">
        <ScrollArea className="h-48 w-64 rounded-2xl border p-4">
          <div className="flex flex-col gap-3 text-sm">
            {scrollTags.map((tag) => (
              <p key={tag}>{tag}</p>
            ))}
          </div>
        </ScrollArea>
      </DsExample>

      <DsExample title="Resizable" description="Panels that can be resized by dragging.">
        <ResizablePanelGroup
          orientation="horizontal"
          className="h-48 w-full max-w-lg rounded-2xl border"
        >
          <ResizablePanel defaultSize="50">
            <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">
              Panel A
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="50">
            <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">
              Panel B
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </DsExample>
    </>
  )
}

export { MediaSection }
