"use client"

import Link from "next/link"

import { AccountUsageSummary } from "@/components/shared/account-usage-summary"
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { signOutAction } from "@/lib/auth/actions"
import type { AppUser } from "@/lib/auth/user"

function AccountMenuContent({ user }: { user: AppUser }) {
  return (
    <>
      <div className="px-2 py-1.5">
        <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
        {user.email && (
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        )}
      </div>
      <DropdownMenuSeparator />
      <AccountUsageSummary />
      <DropdownMenuSeparator />
      <DropdownMenuItem render={<Link href="/my-resources" />}>
        My Resources
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem variant="destructive" onClick={() => signOutAction()}>
        Sign out
      </DropdownMenuItem>
    </>
  )
}

export { AccountMenuContent }
