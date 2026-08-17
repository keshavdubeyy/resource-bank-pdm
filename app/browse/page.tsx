import { FolderExplorer } from "@/components/resources/folder-explorer"
import { PageHeader } from "@/components/shared/page-header"
import { getCurrentUser } from "@/lib/auth/user"
import { getAllFolders } from "@/lib/resources/folder-actions"
import { getPublicResources } from "@/lib/resources/queries"

export default async function BrowsePage() {
  const [user, resources, folders] = await Promise.all([
    getCurrentUser(),
    getPublicResources(),
    getAllFolders(),
  ])

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader
        title="Browse Folders"
        description="Organize resources into your own folders — create, rename, move, and drag things around like a shared Drive."
      />
      <FolderExplorer user={user} resources={resources} folders={folders} currentFolderId={null} />
    </div>
  )
}
