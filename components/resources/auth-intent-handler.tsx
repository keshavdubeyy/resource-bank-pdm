"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { AddResourceSheet } from "@/components/resources/add-resource-sheet"
import type { AppUser } from "@/lib/auth/user"
import { clearAuthReturnIntent, readAuthReturnIntent } from "@/lib/auth/client"

function AuthIntentHandler({ user }: { user: AppUser | null }) {
  const router = useRouter()
  const handledRef = React.useRef(false)
  const [addResourceIntent, setAddResourceIntent] = React.useState<{
    folderId?: string | null
  } | null>(null)

  React.useEffect(() => {
    if (!user || handledRef.current) {
      return
    }

    const intent = readAuthReturnIntent()
    if (intent?.action !== "add-resource") {
      return
    }

    handledRef.current = true
    window.setTimeout(() => setAddResourceIntent({ folderId: intent.folderId }), 0)
    router.replace(clearAuthReturnIntent(), { scroll: false })
  }, [router, user])

  if (!user || !addResourceIntent) {
    return null
  }

  return (
    <AddResourceSheet
      open={!!addResourceIntent}
      onOpenChange={(open) => !open && setAddResourceIntent(null)}
      user={user}
      initialFolderId={addResourceIntent.folderId}
    />
  )
}

export { AuthIntentHandler }
