import { redirect } from "next/navigation"

export default async function ResourcePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  await params
  redirect("/resources")
}
