import { HugeiconsIcon } from "@hugeicons/react"
import { FavouriteIcon } from "@hugeicons/core-free-icons"
import Link from "next/link"

function SiteFooter() {
  return (
    <footer className="sm:border-t sm:border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-6 text-center text-sm text-muted-foreground sm:flex-row sm:justify-between sm:px-6 sm:text-left lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:justify-start">
          <p>&copy; {new Date().getFullYear()} PDM Resource Hub</p>
          <Link href="/version" className="text-foreground underline-offset-4 hover:underline">
            Version history
          </Link>
        </div>
        <p className="inline-flex items-center gap-1.5">
          Made with
          <HugeiconsIcon
            icon={FavouriteIcon}
            strokeWidth={2}
            className="size-4"
            aria-label="love"
          />
          for PDM
        </p>
      </div>
    </footer>
  )
}

export { SiteFooter }
