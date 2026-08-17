import { PageHeader } from "@/components/shared/page-header"

export default async function TrackPage({
  params,
}: {
  params: Promise<{ track: string }>
}) {
  const { track } = await params

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader
        title={`${track} Track`}
        description="Resources curated for this placement track."
      />
    </div>
  )
}
