"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { MoreVerticalIcon } from "@hugeicons/core-free-icons"

import { ResourceCard } from "@/components/resources/resource-card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Resource } from "@/lib/resources/types"

/** Wraps the existing, unmodified ResourceCard with drag-source support and an
 * overlaid overflow menu — keeps the card's own design untouched everywhere else. */
function DraggableResourceCard({
  resource,
  isOwner,
  onSelect,
  onEdit,
  onMove,
  onDelete,
  onDragStart,
  onDragEnd,
}: {
  resource: Resource
  isOwner: boolean
  onSelect: (resource: Resource) => void
  onEdit: () => void
  onMove: () => void
  onDelete: () => void
  onDragStart: (event: React.DragEvent) => void
  onDragEnd: () => void
}) {
  return (
    <div
      className="relative"
      draggable={isOwner}
      onDragStart={isOwner ? onDragStart : undefined}
      onDragEnd={onDragEnd}
    >
      <ResourceCard resource={resource} onSelect={onSelect} />
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-xs"
              className="absolute top-3 right-3 z-10 bg-background/80 backdrop-blur-sm"
              onClick={(event: React.MouseEvent) => event.stopPropagation()}
            />
          }
        >
          <HugeiconsIcon icon={MoreVerticalIcon} strokeWidth={2} />
          <span className="sr-only">Resource actions</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onSelect(resource)}>Open</DropdownMenuItem>
          {isOwner && (
            <>
              <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={onMove}>Move</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={onDelete}>
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export { DraggableResourceCard }
