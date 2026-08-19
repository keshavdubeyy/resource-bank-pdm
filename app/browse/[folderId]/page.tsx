import { redirect } from "next/navigation"

import { FolderExplorer } from "@/components/resources/folder-explorer"
import { DatabaseErrorFallback } from "@/components/shared/database-error-fallback"
import { getCurrentUser } from "@/lib/auth/user"
import { getAllFolders } from "@/lib/resources/folder-actions"
import { buildChildrenMap } from "@/lib/resources/folder-tree"
import {
  getFolderResourceCounts,
  getFolderResources,
  hasUserContributed,
} from "@/lib/resources/resource-actions"

export default async function BrowseFolderPage({
  params,
}: {
  params: Promise<{ folderId: string }>
}) {
  const { folderId } = await params
  let result:
    | {
        user: Awaited<ReturnType<typeof getCurrentUser>>
        hasContributed: boolean
        resourcePage: Awaited<ReturnType<typeof getFolderResources>>
        folderResourceCounts: Awaited<ReturnType<typeof getFolderResourceCounts>>
        folders: Awaited<ReturnType<typeof getAllFolders>>
      }
    | { error: Error }

  try {
    const [user, folders] = await Promise.all([
      getCurrentUser().catch(() => null),
      getAllFolders(),
    ])
    const subfolderIds = (buildChildrenMap(folders).get(folderId) ?? []).map((folder) => folder.id)
    const [resourcePage, folderResourceCounts, hasContributed] = await Promise.all([
      getFolderResources(folderId),
      getFolderResourceCounts(subfolderIds),
      user ? hasUserContributed(user.id) : Promise.resolve(false),
    ])
    result = { user, hasContributed, resourcePage, folderResourceCounts, folders }
  } catch (error) {
    result = { error: error as Error }
  }

  if (!("error" in result)) {
    if (!result.folders.some((folder) => folder.id === folderId)) {
      redirect("/browse")
    }
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-4 sm:gap-8 sm:px-6 sm:py-6 lg:px-8">
      {"error" in result ? (
        <DatabaseErrorFallback error={result.error} />
      ) : (
        <FolderExplorer
          user={result.user}
          resources={result.resourcePage.resources}
          hasMoreResources={result.resourcePage.hasMore}
          folderResourceCounts={result.folderResourceCounts}
          hasContributed={result.hasContributed}
          folders={result.folders}
          currentFolderId={folderId}
        />
      )}
    </div>
  )
}
