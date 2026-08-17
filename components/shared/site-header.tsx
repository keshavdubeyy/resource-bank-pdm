import Link from "next/link"

import { AuthNav } from "@/components/shared/auth-nav"
import { MobileAuthNav } from "@/components/shared/mobile-auth-nav"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { getCurrentUser } from "@/lib/auth/user"
import { HugeiconsIcon } from "@hugeicons/react"
import { Menu01Icon } from "@hugeicons/core-free-icons"

async function SiteHeader() {
  const user = await getCurrentUser()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/browse" className="text-sm font-semibold tracking-tight">
          PDM Resource Hub
        </Link>

        <div className="hidden md:block">
          <AuthNav user={user} />
        </div>

        <Sheet>
          <SheetTrigger
            render={<Button variant="ghost" size="icon" className="md:hidden" />}
          >
            <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} />
            <span className="sr-only">Toggle menu</span>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle>PDM Resource Hub</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-4 px-6">
              <MobileAuthNav user={user} />
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

export { SiteHeader }
