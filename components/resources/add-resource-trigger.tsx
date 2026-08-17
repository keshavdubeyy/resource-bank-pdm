"use client"

import * as React from "react"

import { AddResourceSheet } from "@/components/resources/add-resource-sheet"
import { signInWithGoogle } from "@/lib/auth/client"
import type { AppUser } from "@/lib/auth/user"

/** Pairs a caller-supplied trigger element with the Add Resource Sheet — signs
 * anonymous users in first, then opens the Sheet once there's a real user. */
function AddResourceTrigger({
  user,
  initialFolderId,
  children,
}: {
  user: AppUser | null
  /** undefined = ask "where should this go"; a value (incl. null for root) pre-fills the folder. */
  initialFolderId?: string | null
  children: (onClick: () => void, isPending: boolean) => React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  const [isPending, setIsPending] = React.useState(false)

  async function handleClick() {
    if (!user) {
      setIsPending(true)
      await signInWithGoogle(window.location.pathname)
      setIsPending(false)
      return
    }
    setOpen(true)
  }

  return (
    <>
      {children(handleClick, isPending)}
      {user && (
        <AddResourceSheet
          open={open}
          onOpenChange={setOpen}
          user={user}
          initialFolderId={initialFolderId}
        />
      )}
    </>
  )
}

export { AddResourceTrigger }
