import { PageHeader } from "@/components/shared/page-header"

export default function AdminPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader
        title="Admin"
        description="Resource review and moderation tools will live here."
      />
    </div>
  )
}
