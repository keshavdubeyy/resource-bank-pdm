"use client"

import { format } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, Image01Icon, Link04Icon, Pdf01Icon } from "@hugeicons/core-free-icons"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { guessLinkIconKind } from "@/lib/resources/storage"
import type { Resource } from "@/lib/resources/types"
import { getFaviconUrl } from "@/lib/resources/utils"

function ResourceCard({
  resource,
  onSelect,
}: {
  resource: Resource
  onSelect: (resource: Resource) => void
}) {
  const primaryUrl = resource.links[0]?.url
  const iconKind = guessLinkIconKind(primaryUrl)
  const avatarImageUrl = iconKind ? null : getFaviconUrl(primaryUrl)

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onSelect(resource)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onSelect(resource)
        }
      }}
      className="h-full cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
    >
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
          <CardTitle className="line-clamp-2">{resource.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline">{resource.type}</Badge>
        </div>
      </CardContent>
      <CardFooter className="justify-between text-xs text-muted-foreground">
        <span>
          {resource.contributor} · {format(new Date(resource.dateAdded), "MMM d, yyyy")}
        </span>
        <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4 shrink-0" />
      </CardFooter>
    </Card>
  )
}

export { ResourceCard }
