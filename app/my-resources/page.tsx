import { PageHeader } from "@/components/shared/page-header"
import { SubmitGate } from "@/components/resources/submit-gate"
import { MyResourceGrid } from "@/components/resources/my-resource-grid"
import { getCurrentUser } from "@/lib/auth/user"
import { getMyResources } from "@/lib/resources/queries"

export default async function MyResourcesPage() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-4 sm:gap-8 sm:px-6 sm:py-12 lg:px-8">
        <PageHeader
          title="My Resources"
          description="Sign in to see the resources you've contributed."
        />
        <SubmitGate
          next="/my-resources"
          title="Sign in to see your resources"
          description="We use Google sign-in to attribute resources to their contributor. You'll be brought right back here afterward."
        />
      </div>
    )
  }

  const resources = await getMyResources(user.id)

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-4 sm:gap-8 sm:px-6 sm:py-12 lg:px-8">
      <PageHeader
        title="My Resources"
        description="Resources you've contributed to the hub. Edit or remove anything that's out of date."
      />
      <MyResourceGrid resources={resources} user={user} />
    </div>
  )
}
