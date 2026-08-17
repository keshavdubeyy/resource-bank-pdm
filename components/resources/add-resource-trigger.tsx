"use client"

import * as React from "react"

import { AddResourceSheet } from "@/components/resources/add-resource-sheet"
import { AuthRequiredDialog } from "@/components/resources/auth-required-dialog"
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
  const [authDialogOpen, setAuthDialogOpen] = React.useState(false)

  function handleClick() {
    if (!user) {
      setAuthDialogOpen(true)
      return
    }
    setOpen(true)
  }

  return (
    <>
      {children(handleClick, false)}
      <AuthRequiredDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        intent="add-resource"
        folderId={initialFolderId}
      />
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
