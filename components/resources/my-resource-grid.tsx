import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"

import { MyResourceCard } from "@/components/resources/my-resource-card"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import type { Resource } from "@/lib/resources/types"

function MyResourceGrid({
  resources,
  user,
}: {
  resources: Resource[]
  user: { id: string; name: string }
}) {
  if (resources.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
          </EmptyMedia>
          <EmptyTitle>You haven&apos;t added any resources yet</EmptyTitle>
          <EmptyDescription>
            Resources you submit will show up here so you can edit or remove them.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button nativeButton={false} render={<Link href="/submit" />}>
            Add a resource
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {resources.map((resource) => (
        <MyResourceCard key={resource.id} resource={resource} user={user} />
      ))}
    </div>
  )
}

export { MyResourceGrid }
