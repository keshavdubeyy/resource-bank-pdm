"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"

interface DatabaseErrorFallbackProps {
  error: Error | string
  reset?: () => void
}

export function DatabaseErrorFallback({ error, reset }: DatabaseErrorFallbackProps) {
  const errorMessage = error instanceof Error ? error.message : error
  const isFetchFailed = errorMessage.toLowerCase().includes("fetch failed")

  const handleRetry = () => {
    if (reset) {
      reset()
    } else {
      window.location.reload()
    }
  }

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-border p-8 text-center md:p-12">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>

      <h2 className="mt-6 text-xl font-semibold tracking-tight text-foreground">
        {isFetchFailed ? "Database Connection Failed" : "Database Schema Error"}
      </h2>

      <p className="mt-2 max-w-md text-sm/relaxed text-muted-foreground">
        {isFetchFailed
          ? "We couldn't connect to the database. Please verify that your internet connection is active and that your database is running."
          : "An error occurred while loading folders or resources. The database schema might not be up-to-date."}
      </p>

      <div className="mt-4 rounded-xl bg-muted p-3 text-left font-mono text-xs text-muted-foreground max-w-lg overflow-x-auto border border-border w-full">
        <span className="font-semibold text-foreground">Details:</span> {errorMessage}
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Button onClick={handleRetry} variant="default" size="default" className="rounded-xl">
          Try Again
        </Button>
      </div>
    </div>
  )
}
