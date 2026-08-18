"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { AuthNav } from "@/components/shared/auth-nav"
import { MobileAccountMenu } from "@/components/shared/mobile-account-menu"
import type { AppUser } from "@/lib/auth/user"
import type { SupabaseUsage } from "@/lib/usage/usage-metrics"
import { cn } from "@/lib/utils"

/** The browse/folder flow renders its own iOS-style nav bar (title, back
 * button, folder actions) on mobile — this collapses the default title row
 * out of its way there without touching desktop, which keeps the brand link
 * and account menu regardless of route. */
function SiteHeaderBar({
  user,
  usage,
}: {
  user: AppUser | null
  usage: SupabaseUsage | null
}) {
  const pathname = usePathname()
  const isBrowseRoute = pathname === "/browse" || pathname?.startsWith("/browse/")

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60",
        isBrowseRoute ? "border-b-0 md:border-b md:border-border" : "border-b border-border"
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8",
          isBrowseRoute ? "h-0 overflow-hidden md:h-14 md:overflow-visible" : "h-14"
        )}
      >
        <Link
          href="/browse"
          className={cn("text-sm font-semibold tracking-tight", isBrowseRoute && "hidden md:block")}
        >
          PDM Resource Hub
        </Link>

        <div className="hidden md:block">
          <AuthNav user={user} usage={usage} />
        </div>

        {!isBrowseRoute && <MobileAccountMenu user={user} usage={usage} />}
      </div>
    </header>
  )
}

export { SiteHeaderBar }
