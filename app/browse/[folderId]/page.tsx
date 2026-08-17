import { redirect } from "next/navigation"

import { FolderExplorer } from "@/components/resources/folder-explorer"
import { PageHeader } from "@/components/shared/page-header"
import { getCurrentUser } from "@/lib/auth/user"
import { getAllFolders } from "@/lib/resources/folder-actions"
import { getPublicResources } from "@/lib/resources/queries"

export default async function BrowseFolderPage({
  params,
}: {
  params: Promise<{ folderId: string }>
}) {
  const { folderId } = await params

  const [user, resources, folders] = await Promise.all([
    getCurrentUser(),
    getPublicResources(),
    getAllFolders(),
  ])

  // Stale or invalid folder link — send back to root rather than erroring.
  if (!folders.some((folder) => folder.id === folderId)) {
    redirect("/browse")
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader
        title="Browse Folders"
        description="Organize resources into your own folders — create, rename, move, and drag things around like a shared Drive."
      />
      <FolderExplorer
        user={user}
        resources={resources}
        folders={folders}
        currentFolderId={folderId}
      />
    </div>
  )
}
