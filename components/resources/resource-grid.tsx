"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { SearchRemoveIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ResourceCard } from "@/components/resources/resource-card"
import type { Resource } from "@/lib/resources/types"

function ResourceGrid({
  resources,
  onSelect,
  onClearFilters,
}: {
  resources: Resource[]
  onSelect: (resource: Resource) => void
  onClearFilters: () => void
}) {
  if (resources.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={SearchRemoveIcon} strokeWidth={2} />
          </EmptyMedia>
          <EmptyTitle>No resources match your filters</EmptyTitle>
          <EmptyDescription>
            Try a different search term or clear a few filters to see more results.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" size="lg" onClick={onClearFilters}>
            Clear all filters
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {resources.map((resource) => (
        <ResourceCard key={resource.id} resource={resource} onSelect={onSelect} />
      ))}
    </div>
  )
}

export { ResourceGrid }
