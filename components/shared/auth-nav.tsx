"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"

import { AddResourceTrigger } from "@/components/resources/add-resource-trigger"
import { AccountMenuContent } from "@/components/shared/account-menu-content"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { AppUser } from "@/lib/auth/user"
import type { SupabaseUsage } from "@/lib/usage/usage-metrics"

function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  )
}

function AuthNav({
  user,
  usage,
}: {
  user: AppUser | null
  usage: SupabaseUsage | null
}) {
  return (
    <div className="flex items-center gap-2">
      <AddResourceTrigger user={user}>
        {(onClick, isPending) => (
          <Button size="lg" onClick={onClick} disabled={isPending}>
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
            Add Resource
          </Button>
        )}
      </AddResourceTrigger>

      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
              />
            }
          >
            <Avatar size="sm">
              <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
              <AvatarFallback>{initials(user.name)}</AvatarFallback>
            </Avatar>
            <span className="sr-only">Open account menu</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <AccountMenuContent user={user} usage={usage} />
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

export { AuthNav }
