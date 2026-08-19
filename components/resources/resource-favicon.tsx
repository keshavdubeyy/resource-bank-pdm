"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Image01Icon, Link04Icon, Pdf01Icon } from "@hugeicons/core-free-icons"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"

/** Google's favicon service doesn't error for a domain it has no icon for —
 * it returns a generic placeholder as a "successful" image load, so onError
 * never fires. That placeholder is reliably exactly 16x16 regardless of the
 * requested size, unlike real cached favicons, so a too-small natural size
 * is the actual signal to fall back to our own default instead. */
const GENERIC_PLACEHOLDER_SIZE = 16

/** Shared favicon for a resource's primary link. A real fetched icon renders
 * plain — no circle, no border, no crop — so whatever shape the actual logo
 * is stays fully visible. Only the "no icon available" fallback gets the
 * circular badge treatment (and even then, without Avatar's default border
 * ring, which isn't needed on a plain icon glyph). */
function ResourceFavicon({
  avatarImageUrl,
  iconKind,
}: {
  avatarImageUrl: string | null
  iconKind: "pdf" | "image" | null
}) {
  const [imageFailed, setImageFailed] = React.useState(false)
  const showImage = !!avatarImageUrl && !imageFailed

  if (showImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- arbitrary external favicon URL, not a local/optimizable asset
      <img
        src={avatarImageUrl}
        alt=""
        className="size-6 shrink-0 object-contain"
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
    )
  }

  return (
    <Avatar size="sm" className="after:border-0">
      <AvatarFallback>
        <HugeiconsIcon
          icon={iconKind === "image" ? Image01Icon : iconKind === "pdf" ? Pdf01Icon : Link04Icon}
          strokeWidth={2}
          className="size-3.5"
        />
      </AvatarFallback>
    </Avatar>
  )
}

export { ResourceFavicon }
