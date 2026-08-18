"use client"

import * as React from "react"
import { createBrowserClient } from "@supabase/ssr"

import { Spinner } from "@/components/ui/spinner"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

function safeNextPath(next: string | undefined): string {
  return next?.startsWith("/") ? next : "/browse"
}

function redirectWithError(message: string) {
  const url = new URL("/browse", window.location.origin)
  url.searchParams.set("auth_error", message)
  window.location.replace(url.toString())
}

function AuthClientCallback({
  code,
  next,
  providerError,
}: {
  code?: string
  next?: string
  providerError?: string
}) {
  const [status, setStatus] = React.useState("Signing you in...")

  React.useEffect(() => {
    let cancelled = false

    async function finishSignIn() {
      if (providerError) {
        redirectWithError(providerError)
        return
      }
      if (!code) {
        redirectWithError("Missing authentication code.")
        return
      }

      const supabase = createBrowserClient(supabaseUrl!, supabaseKey!, {
        auth: {
          detectSessionInUrl: false,
        },
      })
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (cancelled) {
        return
      }

      if (error) {
        redirectWithError(error.message)
        return
      }

      setStatus("Taking you back...")
      window.location.replace(safeNextPath(next))
    }

    finishSignIn()

    return () => {
      cancelled = true
    }
  }, [code, next, providerError])

  return (
    <div className="mx-auto flex min-h-[calc(100svh-7rem)] max-w-sm flex-col items-center justify-center gap-3 px-4 text-center">
      <Spinner />
      <div className="flex flex-col gap-1">
        <h1 className="text-base font-medium">{status}</h1>
        <p className="text-sm text-muted-foreground">This only takes a moment.</p>
      </div>
    </div>
  )
}

export { AuthClientCallback }
