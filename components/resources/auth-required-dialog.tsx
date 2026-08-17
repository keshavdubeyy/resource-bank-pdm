"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { GoogleIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import {
  signInWithGoogleForAction,
  type AuthActionIntent,
} from "@/lib/auth/client"

const intentCopy: Record<
  AuthActionIntent,
  { title: string; browseCopy: string; actionCopy: string }
> = {
  "add-resource": {
    title: "Sign in to contribute",
    browseCopy: "Anyone can browse and use PDM Resources without signing in.",
    actionCopy:
      "To add resources, sign in with your Google account. Contribution access is available only to verified PDM students.",
  },
  "create-folder": {
    title: "Sign in to create folders",
    browseCopy: "Anyone can browse the resource library without signing in.",
    actionCopy:
      "To create or organize folders, sign in with your Google account. Folder management is available only to verified PDM students.",
  },
  "edit-resource": {
    title: "Sign in to edit resources",
    browseCopy: "Anyone can browse and use PDM Resources without signing in.",
    actionCopy:
      "To edit resources, sign in with your Google account. Editing access is available only to verified PDM students.",
  },
  "move-resource": {
    title: "Sign in to move resources",
    browseCopy: "Anyone can browse and use PDM Resources without signing in.",
    actionCopy:
      "To organize resources, sign in with your Google account. Resource management is available only to verified PDM students.",
  },
  "rename-folder": {
    title: "Sign in to rename folders",
    browseCopy: "Anyone can browse the resource library without signing in.",
    actionCopy:
      "To rename folders, sign in with your Google account. Folder management is available only to verified PDM students.",
  },
  "delete-folder": {
    title: "Sign in to delete folders",
    browseCopy: "Anyone can browse the resource library without signing in.",
    actionCopy:
      "To delete folders, sign in with your Google account. Folder management is available only to verified PDM students.",
  },
}

function AuthRequiredDialog({
  open,
  onOpenChange,
  intent,
  folderId,
  parentFolderId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  intent: AuthActionIntent
  folderId?: string | null
  parentFolderId?: string | null
}) {
  const [isPending, setIsPending] = React.useState(false)
  const copy = intentCopy[intent]

  async function handleContinue() {
    setIsPending(true)
    await signInWithGoogleForAction(intent, { folderId, parentFolderId })
    setIsPending(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-4 sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription className="sr-only">{copy.actionCopy}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 text-sm text-muted-foreground">
          <p>{copy.browseCopy}</p>
          <p>{copy.actionCopy}</p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleContinue} disabled={isPending}>
            {isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <HugeiconsIcon icon={GoogleIcon} strokeWidth={2} data-icon="inline-start" />
            )}
            Continue with Google
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { AuthRequiredDialog }
