"use client"

import { format } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link04Icon, PencilEdit02Icon, UserIcon } from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { ResourceFavicon } from "@/components/resources/resource-favicon"
import { getUploadKindIcon, guessLinkIconKind } from "@/lib/resources/storage"
import { CATEGORY_LABELS, type Resource } from "@/lib/resources/types"
import { getFaviconUrl, hasMeaningfulDescription } from "@/lib/resources/utils"

function ResourceDetailBody({ resource }: { resource: Resource }) {
  return (
    <div className="flex flex-col gap-6 px-4 pb-6 sm:px-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-1.5">
          {resource.category && <Badge>{CATEGORY_LABELS[resource.category]}</Badge>}
          <Badge variant="outline">{resource.type}</Badge>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Links</h3>
          <div className="flex flex-col gap-2">
            {resource.links.map((link) => {
              const linkIconKind = guessLinkIconKind(link.url)
              return (
                <Button
                  key={link.url}
                  variant="outline"
                  className="justify-start"
                  nativeButton={false}
                  render={<a href={link.url} target="_blank" rel="noopener noreferrer" />}
                >
                  <HugeiconsIcon
                    icon={getUploadKindIcon(linkIconKind) ?? Link04Icon}
                    strokeWidth={2}
                    data-icon="inline-start"
                  />
                  <span className="font-sans">{link.label}</span>
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      {resource.whyUseful && (
        <>
          <Separator />
          <div className="flex flex-col gap-1.5">
            <h3 className="text-sm font-medium">Why it&apos;s useful</h3>
            <p className="text-sm text-muted-foreground">{resource.whyUseful}</p>
          </div>
        </>
      )}

      <Separator />

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <HugeiconsIcon icon={UserIcon} strokeWidth={2} className="size-4 shrink-0" />
        <span>
          Recommended by <span className="font-medium text-foreground">{resource.contributor}</span>
          {" · "}
          {format(new Date(resource.dateAdded), "MMM d, yyyy")}
        </span>
      </div>
    </div>
  )
}

function ResourceDetailHeaderActions({ onEdit }: { onEdit?: () => void }) {
  if (!onEdit) {
    return null
  }
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="self-start"
      onClick={onEdit}
    >
      <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} data-icon="inline-start" />
      Edit
    </Button>
  )
}

function ResourceDetail({
  resource,
  open,
  onOpenChange,
  onEdit,
}: {
  resource: Resource | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Only pass this when the viewer owns the resource — renders an Edit button in the header. */
  onEdit?: () => void
}) {
  const isMobile = useIsMobile()

  if (!resource) {
    return null
  }

  const primaryUrl = resource.links[0]?.url
  const iconKind = guessLinkIconKind(primaryUrl)
  const avatarImageUrl = iconKind ? null : getFaviconUrl(primaryUrl)

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85dvh]">
          <DrawerHeader className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <ResourceFavicon avatarImageUrl={avatarImageUrl} iconKind={iconKind} />
              <ResourceDetailHeaderActions onEdit={onEdit} />
            </div>
            {/* User-submitted content — force the app font, not Drawer*'s font-heading. */}
            <DrawerTitle className="font-sans">{resource.title}</DrawerTitle>
            {hasMeaningfulDescription(resource) && (
              <DrawerDescription className="font-sans">{resource.description}</DrawerDescription>
            )}
          </DrawerHeader>
          <ScrollArea className="flex-1">
            <ResourceDetailBody resource={resource} />
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-[38rem]">
        <SheetHeader className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <ResourceFavicon avatarImageUrl={avatarImageUrl} iconKind={iconKind} />
            <ResourceDetailHeaderActions onEdit={onEdit} />
          </div>
          {/* User-submitted content — force the app font, not Sheet*'s font-heading. */}
          <SheetTitle className="font-sans">{resource.title}</SheetTitle>
          {hasMeaningfulDescription(resource) && (
            <SheetDescription className="font-sans">{resource.description}</SheetDescription>
          )}
        </SheetHeader>
        <ScrollArea className="flex-1">
          <ResourceDetailBody resource={resource} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

export { ResourceDetail }
