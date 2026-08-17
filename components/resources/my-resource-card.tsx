"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import { Image01Icon, Link04Icon, Pdf01Icon } from "@hugeicons/core-free-icons"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { EditResourceSheet } from "@/components/resources/edit-resource-sheet"
import { deleteResourceAction } from "@/lib/resources/actions"
import { guessLinkIconKind } from "@/lib/resources/storage"
import type { Resource } from "@/lib/resources/types"
import { getFaviconUrl } from "@/lib/resources/utils"

function MyResourceCard({
  resource,
  user,
}: {
  resource: Resource
  user: { id: string; name: string }
}) {
  const router = useRouter()
  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const primaryUrl = resource.links[0]?.url
  const iconKind = guessLinkIconKind(primaryUrl)
  const avatarImageUrl = iconKind ? null : (resource.previewImageUrl ?? getFaviconUrl(primaryUrl))

  async function handleDelete() {
    setIsDeleting(true)
    setError(null)
    const result = await deleteResourceAction(resource.id)
    setIsDeleting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    setDeleteOpen(false)
    router.refresh()
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-col gap-2">
          <Avatar size="sm" className="rounded-md">
            {avatarImageUrl && <AvatarImage src={avatarImageUrl} alt="" />}
            <AvatarFallback className="rounded-md">
              <HugeiconsIcon
                icon={iconKind === "image" ? Image01Icon : iconKind === "pdf" ? Pdf01Icon : Link04Icon}
                strokeWidth={2}
                className="size-3.5"
              />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1.5">
            <CardTitle className="line-clamp-2">{resource.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {resource.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline">{resource.type}</Badge>
          <Badge variant="outline">{resource.level}</Badge>
          <Badge variant="outline">{resource.cost}</Badge>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-3">
        <span className="text-xs text-muted-foreground">
          Added {format(new Date(resource.dateAdded), "MMM d, yyyy")}
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => setEditOpen(true)}
          >
            Edit
          </Button>

          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogTrigger render={<Button size="sm" variant="destructive" className="flex-1" />}>
              Delete
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete &quot;{resource.title}&quot;?</AlertDialogTitle>
                <AlertDialogDescription>
                  This can&apos;t be undone. The resource will be removed from the
                  public hub immediately.
                </AlertDialogDescription>
              </AlertDialogHeader>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting && <Spinner data-icon="inline-start" />}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>

      <EditResourceSheet open={editOpen} onOpenChange={setEditOpen} user={user} resource={resource} />
    </Card>
  )
}

export { MyResourceCard }
