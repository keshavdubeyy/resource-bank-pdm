"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { DirectionProvider } from "@/components/ui/direction"
import { Separator } from "@/components/ui/separator"
import { DsExample } from "@/components/ds/ds-section"

function LayoutSection() {
  const [direction, setDirection] = React.useState<"ltr" | "rtl">("ltr")

  return (
    <>
      <DsExample
        title="Separator"
        description="Visually or semantically separates content."
        contentClassName="flex-col items-stretch"
      >
        <div className="flex w-full max-w-sm flex-col gap-4">
          <p className="text-sm">Track overview</p>
          <Separator />
          <p className="text-sm text-muted-foreground">
            Guides, templates, and case studies for this track.
          </p>
        </div>
        <div className="flex h-8 items-center gap-4">
          <span className="text-sm">Docs</span>
          <Separator orientation="vertical" />
          <span className="text-sm">Community</span>
          <Separator orientation="vertical" />
          <span className="text-sm">Support</span>
        </div>
      </DsExample>

      <DsExample
        title="Direction Provider"
        description="Provides left-to-right or right-to-left context to nested components."
        contentClassName="flex-col items-stretch"
      >
        <div className="flex w-full max-w-sm flex-col gap-3">
          <Button
            size="lg"
            variant="outline"
            className="self-start"
            onClick={() =>
              setDirection((current) => (current === "ltr" ? "rtl" : "ltr"))
            }
          >
            Toggle direction ({direction})
          </Button>
          <DirectionProvider direction={direction}>
            <div
              dir={direction}
              className="flex items-center justify-between rounded-2xl border p-3 text-sm"
            >
              <span>Start</span>
              <span className="text-muted-foreground">End</span>
            </div>
          </DirectionProvider>
        </div>
      </DsExample>
    </>
  )
}

export { LayoutSection }
