import { HugeiconsIcon } from "@hugeicons/react"
import { FavouriteIcon } from "@hugeicons/core-free-icons"
import Link from "next/link"

function SiteFooter() {
  return (
    <footer className="sm:border-t sm:border-border">
      <div className="mx-auto grid max-w-6xl items-center gap-3 px-4 py-6 text-center text-sm text-muted-foreground sm:grid-cols-[1fr_auto_1fr] sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:justify-start">
          <p>&copy; {new Date().getFullYear()} PDM Resource Hub</p>
          <Link href="/version" className="text-foreground underline-offset-4 hover:underline">
            Version history
          </Link>
        </div>
        <p className="inline-flex items-center justify-center gap-1.5">
          Made with
          <HugeiconsIcon
            icon={FavouriteIcon}
            strokeWidth={2}
            className="size-4"
            aria-label="love"
          />
          for PDM
        </p>
        <p className="sm:text-right">
          Managed &amp; developed by{" "}
          <a
            href="https://www.linkedin.com/in/itskeshavdubey/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Keshav Dubey
          </a>
        </p>
      </div>
    </footer>
  )
}

export { SiteFooter }
