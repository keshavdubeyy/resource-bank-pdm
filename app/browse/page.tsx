import { FolderExplorer } from "@/components/resources/folder-explorer"
import { PageHeader } from "@/components/shared/page-header"
import { DatabaseErrorFallback } from "@/components/shared/database-error-fallback"
import { getCurrentUser } from "@/lib/auth/user"
import { getAllFolders } from "@/lib/resources/folder-actions"
import { getPublicResources } from "@/lib/resources/queries"
import { getSupabaseUsage } from "@/lib/usage/supabase-usage"

export default async function BrowsePage() {
  let result:
    | {
        user: Awaited<ReturnType<typeof getCurrentUser>>
        usage: Awaited<ReturnType<typeof getSupabaseUsage>>
        resources: Awaited<ReturnType<typeof getPublicResources>>
        folders: Awaited<ReturnType<typeof getAllFolders>>
      }
    | { error: Error }

  try {
    const [user, resources, folders] = await Promise.all([
      getCurrentUser().catch(() => null),
      getPublicResources(),
      getAllFolders(),
    ])
    const usage = user ? await getSupabaseUsage() : null
    result = { user, usage, resources, folders }
  } catch (error) {
    result = { error: error as Error }
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-4 sm:gap-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="hidden md:block">
        <PageHeader
          title="Browse Folders"
          description="Organize resources into your own folders — create, rename, move, and drag things around like a shared Drive."
        />
      </div>
      {"error" in result ? (
        <DatabaseErrorFallback error={result.error} />
      ) : (
        <FolderExplorer
          user={result.user}
          usage={result.usage}
          resources={result.resources}
          folders={result.folders}
          currentFolderId={null}
        />
      )}
    </div>
  )
}
