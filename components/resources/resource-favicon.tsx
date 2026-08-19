"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Image01Icon, Link04Icon, Pdf01Icon } from "@hugeicons/core-free-icons"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

/** Google's favicon service doesn't error for a domain it has no icon for —
 * it returns a generic placeholder as a "successful" image load, so onError
 * never fires. That placeholder is reliably exactly 16x16 regardless of the
 * requested size, unlike real cached favicons, so a too-small natural size
 * is the actual signal to fall back to our own default instead. */
const GENERIC_PLACEHOLDER_SIZE = 16

/** Shared avatar for a resource's primary link — favicon if one genuinely
 * loaded, otherwise the usual link/pdf/image icon on the default background. */
function ResourceFavicon({
  avatarImageUrl,
  iconKind,
  className,
}: {
  avatarImageUrl: string | null
  iconKind: "pdf" | "image" | null
  className?: string
}) {
  const [imageFailed, setImageFailed] = React.useState(false)
  const showImage = !!avatarImageUrl && !imageFailed

  return (
    <Avatar size="sm" className={className}>
      {showImage && (
        <AvatarImage
          src={avatarImageUrl}
          alt=""
          onLoad={(event) => {
            const image = event.currentTarget
            if (
              image.naturalWidth <= GENERIC_PLACEHOLDER_SIZE &&
              image.naturalHeight <= GENERIC_PLACEHOLDER_SIZE
            ) {
              setImageFailed(true)
            }
          }}
          onError={() => setImageFailed(true)}
        />
      )}
      {!showImage && (
        <AvatarFallback className="rounded-md">
          <HugeiconsIcon
            icon={iconKind === "image" ? Image01Icon : iconKind === "pdf" ? Pdf01Icon : Link04Icon}
            strokeWidth={2}
            className="size-3.5"
          />
        </AvatarFallback>
      )}
    </Avatar>
  )
}

export { ResourceFavicon }
