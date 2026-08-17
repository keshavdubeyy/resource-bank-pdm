"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon } from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ResourceFilters } from "@/lib/resources/filters"

interface ActiveFilterChip {
  key: keyof ResourceFilters
  label: string
}

function RemovableChip({
  label,
  onRemove,
}: {
  label: string
  onRemove: () => void
}) {
  return (
    <Badge variant="secondary" className="h-6 gap-1 pr-1 text-xs">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove filter: ${label}`}
        className="flex size-4 items-center justify-center rounded-full transition-colors hover:bg-foreground/10"
      >
        <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-3!" />
      </button>
    </Badge>
  )
}

function ActiveFilters({
  filters,
  onFilterChange,
  onClearAll,
}: {
  filters: ResourceFilters
  onFilterChange: (patch: Partial<ResourceFilters>) => void
  onClearAll: () => void
}) {
  const chips: ActiveFilterChip[] = []

  if (filters.search.trim()) {
    chips.push({ key: "search", label: `"${filters.search.trim()}"` })
  }
  if (filters.type !== "All") {
    chips.push({ key: "type", label: filters.type })
  }

  if (chips.length === 0) {
    return null
  }

  const clearValue = (key: keyof ResourceFilters) => {
    if (key === "search") {
      onFilterChange({ search: "" })
    } else {
      onFilterChange({ [key]: "All" } as Partial<ResourceFilters>)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <RemovableChip
          key={chip.key}
          label={chip.label}
          onRemove={() => clearValue(chip.key)}
        />
      ))}
      <Button
        type="button"
        variant="ghost"
        size="xs"
        onClick={onClearAll}
        className="text-muted-foreground"
      >
        Clear all
      </Button>
    </div>
  )
}

export { ActiveFilters }
