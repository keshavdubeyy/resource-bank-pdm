"use client"

import { AccountMenuContent } from "@/components/shared/account-menu-content"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { AppUser } from "@/lib/auth/user"

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

/** Mobile counterpart to AuthNav — just the account menu. Adding a resource
 * happens via the floating action button instead of a top-nav button. */
function MobileAccountMenu({ user }: { user: AppUser | null }) {
  if (!user) {
    return null
  }

  return (
    <div className="md:hidden">
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
        <DropdownMenuContent align="end" className="w-72 max-w-[calc(100vw-2rem)]">
          <AccountMenuContent user={user} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export { MobileAccountMenu }
