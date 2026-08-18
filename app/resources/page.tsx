import { PageHeader } from "@/components/shared/page-header"
import { ResourcesExplorer } from "@/components/resources/resources-explorer"
import { getPublicResources } from "@/lib/resources/queries"

export default async function ResourcesPage() {
  const resources = await getPublicResources()

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-4 sm:gap-8 sm:px-6 sm:py-6 lg:px-8">
      <PageHeader
        title="Resources"
        description="Browse guides, templates, and case studies for every stage of the PDM placement process."
      />
      <ResourcesExplorer resources={resources} />
    </div>
  )
}
