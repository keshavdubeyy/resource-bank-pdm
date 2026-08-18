import { PageHeader } from "@/components/shared/page-header"

export default function AdminPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-4 sm:gap-8 sm:px-6 sm:py-6 lg:px-8">
      <PageHeader
        title="Admin"
        description="Resource review and moderation tools will live here."
      />
    </div>
  )
}
