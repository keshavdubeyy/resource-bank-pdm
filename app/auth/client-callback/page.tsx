import { AuthClientCallback } from "@/components/shared/auth-client-callback"

export default async function AuthClientCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{
    code?: string
    error?: string
    error_description?: string
    next?: string
  }>
}) {
  const params = await searchParams

  return (
    <AuthClientCallback
      code={params.code}
      next={params.next}
      providerError={params.error_description ?? params.error}
    />
  )
}
