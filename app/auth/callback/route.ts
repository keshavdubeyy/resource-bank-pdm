import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const providerError = searchParams.get("error_description") ?? searchParams.get("error")
  const rawNext = searchParams.get("next") ?? "/"
  const next = rawNext.startsWith("/") ? rawNext : "/"
  const forwardedHost = request.headers.get("x-forwarded-host")
  const redirectOrigin =
    process.env.NODE_ENV === "development" || !forwardedHost
      ? origin
      : `https://${forwardedHost}`

  const callbackUrl = new URL("/auth/client-callback", redirectOrigin)
  callbackUrl.searchParams.set("next", next)
  if (code) {
    callbackUrl.searchParams.set("code", code)
  }
  if (providerError) {
    callbackUrl.searchParams.set("error_description", providerError)
  }

  return NextResponse.redirect(callbackUrl)
}
