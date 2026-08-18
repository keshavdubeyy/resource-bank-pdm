"use client"

import { AccountMenuContent } from "@/components/shared/account-menu-content"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
