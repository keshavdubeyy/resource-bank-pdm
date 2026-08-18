"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"

import { AddResourceTrigger } from "@/components/resources/add-resource-trigger"
import { Button } from "@/components/ui/button"
import type { AppUser } from "@/lib/auth/user"

/** Bottom-of-screen floating action button for adding a resource on mobile —
 * keeps the top nav uncluttered and matches where a native app would put it. */
function MobileAddResourceFab({ user }: { user: AppUser | null }) {
  return (
    <div className="fixed right-4 bottom-6 z-40 md:hidden">
      <AddResourceTrigger user={user}>
        {(onClick, isPending) => (
          <Button
            size="icon-lg"
            className="size-14 rounded-full shadow-lg"
            onClick={onClick}
            disabled={isPending}
            aria-label="Add resource"
          >
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-6" />
          </Button>
        )}
      </AddResourceTrigger>
    </div>
  )
}

export { MobileAddResourceFab }
