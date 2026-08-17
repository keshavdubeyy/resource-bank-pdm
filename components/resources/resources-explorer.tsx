"use client"

import * as React from "react"

import { ActiveFilters } from "@/components/resources/active-filters"
import { CategoryChips } from "@/components/resources/category-chips"
import { FiltersPopover } from "@/components/resources/filters-popover"
import { ResourceDetail } from "@/components/resources/resource-detail"
import { ResourceGrid } from "@/components/resources/resource-grid"
import { ResourceSearch } from "@/components/resources/resource-search"
import {
  DEFAULT_FILTERS,
  filterResources,
  sortResources,
  type ResourceFilters,
} from "@/lib/resources/filters"
import type { Resource } from "@/lib/resources/types"

function ResourcesExplorer({ resources }: { resources: Resource[] }) {
  const [filters, setFilters] = React.useState<ResourceFilters>(DEFAULT_FILTERS)
  const [selectedResource, setSelectedResource] = React.useState<Resource | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)

  const visibleResources = React.useMemo(() => {
    const filtered = filterResources(resources, filters)
    return sortResources(filtered)
  }, [resources, filters])

  const updateFilters = (patch: Partial<ResourceFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }))
  }

  const resetFilters = () => setFilters(DEFAULT_FILTERS)

  const handleSelectResource = (resource: Resource) => {
    setSelectedResource(resource)
    setDetailOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <ResourceSearch
          value={filters.search}
          onChange={(value) => updateFilters({ search: value })}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CategoryChips
            value={filters.category}
            onChange={(category) => updateFilters({ category })}
          />
          <div className="flex items-center gap-2">
            <FiltersPopover
              filters={filters}
              onFilterChange={updateFilters}
              onReset={() => updateFilters({ type: "All" })}
            />
          </div>
        </div>

        <ActiveFilters
          filters={filters}
          onFilterChange={updateFilters}
          onClearAll={resetFilters}
        />
      </div>

      <p className="text-sm text-muted-foreground">
        {visibleResources.length} resource{visibleResources.length === 1 ? "" : "s"}
      </p>

      <ResourceGrid
        resources={visibleResources}
        onSelect={handleSelectResource}
        onClearFilters={resetFilters}
      />

      <ResourceDetail
        resource={selectedResource}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}

export { ResourcesExplorer }
