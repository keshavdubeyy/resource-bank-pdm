"use client"

import * as React from "react"

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
    browseCopy:
      "Anyone can browse the resource library without signing in. To add resources, sign in with your Google account.",
    actionCopy: "",
  },
  "create-folder": {
    title: "Sign in to create folders",
    browseCopy:
      "Anyone can browse the resource library without signing in. To create or organize folders, sign in with your Google account.",
    actionCopy: "",
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

function GoogleLogo() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-4 shrink-0"
      data-icon="inline-start"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z"
      />
    </svg>
  )
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
          <DialogDescription className="sr-only">
            {copy.actionCopy || copy.browseCopy}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 text-sm text-muted-foreground">
          <p>{copy.browseCopy}</p>
          {copy.actionCopy && <p>{copy.actionCopy}</p>}
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
              <GoogleLogo />
            )}
            Continue with Google
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { AuthRequiredDialog }
