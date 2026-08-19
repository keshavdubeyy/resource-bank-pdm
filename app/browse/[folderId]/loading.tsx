import { BrowseSkeleton } from "@/components/resources/browse-skeleton"

export default function BrowseFolderLoading() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-4 sm:gap-8 sm:px-6 sm:py-6 lg:px-8">
      <BrowseSkeleton showBreadcrumb />
    </div>
  )
}
