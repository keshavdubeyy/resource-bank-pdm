"use client"

import { Button } from "@/components/ui/button"
import { RESOURCE_CATEGORIES, type ResourceCategory } from "@/lib/resources/types"

const CATEGORY_CHIP_OPTIONS: (ResourceCategory | "All")[] = [
  "All",
  ...RESOURCE_CATEGORIES,
]

function CategoryChips({
  value,
  onChange,
}: {
  value: ResourceCategory | "All"
  onChange: (category: ResourceCategory | "All") => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORY_CHIP_OPTIONS.map((option) => (
        <Button
          key={option}
          type="button"
          size="sm"
          variant={value === option ? "default" : "outline"}
          aria-pressed={value === option}
          onClick={() => onChange(option)}
        >
          {option}
        </Button>
      ))}
    </div>
  )
}

export { CategoryChips }
