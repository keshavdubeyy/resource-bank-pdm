"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"

import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"

function ResourceSearch({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <InputGroup className="h-10 w-full max-w-xl rounded-3xl">
      <InputGroupAddon>
        <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
      </InputGroupAddon>
      <InputGroupInput
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search resources, folders, or contributors..."
        aria-label="Search resources and folders"
      />
    </InputGroup>
  )
}

export { ResourceSearch }
