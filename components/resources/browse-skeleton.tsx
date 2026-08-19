import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function FolderCardSkeleton() {
  return (
    <Card className="flex min-h-32 flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="size-6 rounded-md" />
        <Skeleton className="size-6 rounded-md" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-3/4 rounded-full" />
        <Skeleton className="h-3 w-1/3 rounded-full" />
      </div>
    </Card>
  )
}

function ResourceCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-col gap-2">
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="h-4 w-4/5 rounded-full" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-5 w-16 rounded-full" />
      </CardContent>
      <CardFooter className="justify-between">
        <Skeleton className="h-3 w-2/5 rounded-full" />
        <Skeleton className="size-4 rounded-full" />
      </CardFooter>
    </Card>
  )
}

/** Matches BrowsePage/BrowseFolderPage's real layout dimensions closely (same
 * grid columns, same card heights) so the swap to real content never jumps. */
function BrowseSkeleton({ showBreadcrumb = false }: { showBreadcrumb?: boolean }) {
  return (
    <div className="flex flex-col gap-6">
      {showBreadcrumb && (
        <div className="hidden items-center gap-2 md:flex">
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="h-4 w-48 rounded-full" />
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-10 w-full max-w-xl rounded-3xl" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-2xl" />
          <Skeleton className="h-9 w-36 rounded-2xl" />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-16 rounded-full" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <FolderCardSkeleton key={index} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-20 rounded-full" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <ResourceCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  )
}

export { BrowseSkeleton }
