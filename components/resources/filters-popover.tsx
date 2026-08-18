"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { FilterHorizontalIcon } from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  countActiveFilters,
  type ResourceFilters,
} from "@/lib/resources/filters"
import { RESOURCE_TYPES } from "@/lib/resources/types"

function FilterField({
  id,
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  id: string
  label: string
  value: string
  placeholder: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={value === "All" ? "" : value}
        onValueChange={(next) => onChange(next === "" ? "All" : (next as string))}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">{placeholder}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function FiltersPopover({
  filters,
  onFilterChange,
  onReset,
}: {
  filters: ResourceFilters
  onFilterChange: (patch: Partial<ResourceFilters>) => void
  onReset: () => void
}) {
  const activeCount = countActiveFilters(filters)

  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" size="lg" />}>
        <HugeiconsIcon
          icon={FilterHorizontalIcon}
          strokeWidth={2}
          data-icon="inline-start"
        />
        More Filters
        {activeCount > 0 && (
          <Badge variant="secondary" data-icon="inline-end">
            {activeCount}
          </Badge>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <PopoverHeader>
          <PopoverTitle>More Filters</PopoverTitle>
        </PopoverHeader>
        <div className="flex flex-col gap-4">
          <FilterField
            id="filter-type"
            label="Resource Type"
            value={filters.type}
            placeholder="Any Type"
            options={[...RESOURCE_TYPES]}
            onChange={(value) =>
              onFilterChange({ type: value as ResourceFilters["type"] })
            }
          />
          {activeCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={onReset}
              className="self-start"
            >
              Reset filters
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { FiltersPopover }
