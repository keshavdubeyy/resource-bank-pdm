"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, MoreVerticalIcon } from "@hugeicons/core-free-icons"
import Image from "next/image"
import Link from "next/link"

import { MobileAccountMenu } from "@/components/shared/mobile-account-menu"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { AppUser } from "@/lib/auth/user"
import type { FolderRow as FolderRowType } from "@/lib/resources/types"

/** iOS-style nav bar for the mobile browse flow: centered title, a back
 * chevron once nested in a folder, and a trailing slot that's the account
 * menu at the root or a rename/delete menu for the folder being viewed. Sits
 * in the space `SiteHeaderBar` collapses out of on mobile for /browse routes. */
function MobileFolderNavBar({
  currentFolder,
  canManage,
  onBack,
  onShare,
  onRename,
  onDelete,
  user,
}: {
  currentFolder: FolderRowType | null
  canManage: boolean
  onBack: () => void
  onShare: () => void
  onRename: () => void
  onDelete: () => void
  user: AppUser | null
}) {
  return (
    <div className="sticky top-0 z-40 -mx-4 -mt-4 flex h-14 items-center gap-1 border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 sm:-mx-6 sm:-mt-12 sm:px-6 md:hidden">
      {currentFolder ? (
        <Button variant="ghost" size="icon-lg" aria-label="Back to parent folder" onClick={onBack}>
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
        </Button>
      ) : (
        <Link
          href="/browse"
          className="flex h-9 w-10 shrink-0 items-center focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
        >
          <Image
            src="/pdm-logo-color.svg"
            alt=""
            width={379}
            height={337}
            className="h-8 w-auto dark:hidden"
            aria-hidden="true"
            priority
          />
          <Image
            src="/pdm-logo-white.svg"
            alt=""
            width={379}
            height={337}
            className="hidden h-8 w-auto dark:block"
            aria-hidden="true"
            priority
          />
          <span className="sr-only">PDM Resource Hub</span>
        </Link>
      )}

      <h1 className="flex-1 truncate text-center text-base font-semibold">
        {currentFolder ? currentFolder.name : "All Resources"}
      </h1>

      {currentFolder ? (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-lg" />}>
            <HugeiconsIcon icon={MoreVerticalIcon} strokeWidth={2} />
            <span className="sr-only">Folder actions</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {currentFolder.createdByName && (
              <>
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  Created by {currentFolder.createdByName}
                </div>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={onShare}>Share</DropdownMenuItem>
            {canManage && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onRename}>Rename</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={onDelete}>
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : user ? (
        <MobileAccountMenu user={user} />
      ) : (
        <div className="size-9 shrink-0" />
      )}
    </div>
  )
}

export { MobileFolderNavBar }
