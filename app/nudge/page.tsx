import { NudgeSandbox } from "@/components/resources/nudge-sandbox"
import { PageHeader } from "@/components/shared/page-header"
import { getCurrentUser } from "@/lib/auth/user"
import { getPublicResources } from "@/lib/resources/queries"

export default async function NudgePage() {
  const user = await getCurrentUser().catch(() => null)
  const resources = user ? await getPublicResources().catch(() => []) : []
  const hasContributed = !!user && resources.some((resource) => resource.createdBy === user.id)

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-4 sm:gap-8 sm:px-6 sm:py-6 lg:px-8">
      <PageHeader
        title="Contribution nudge sandbox"
        description="Preview every state of the contribution nudge — anonymous, engaged, dismissed, first-time contributor, existing contributor — without needing to sign in/out or dig through devtools."
      />
      <NudgeSandbox realUser={user} realHasContributed={hasContributed} />
    </div>
  )
}
