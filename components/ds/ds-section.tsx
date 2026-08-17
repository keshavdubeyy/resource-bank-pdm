import * as React from "react"

import { cn } from "@/lib/utils"

function DsSection({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="flex scroll-mt-24 flex-col gap-6">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-10">{children}</div>
    </section>
  )
}

function DsExample({
  title,
  description,
  className,
  contentClassName,
  children,
}: {
  title: string
  description?: string
  className?: string
  contentClassName?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-col gap-0.5">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div
        className={cn(
          "flex flex-wrap items-start gap-4 overflow-x-auto rounded-2xl border bg-card/50 p-6",
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  )
}

export { DsSection, DsExample }
