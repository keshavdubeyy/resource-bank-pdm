"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Folder01Icon, MoreVerticalIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

function FolderRow({
  name,
  folderCount,
  resourceCount,
  canCreateHere,
  canManage,
  onOpen,
  onShare,
  onAddResource,
  onNewSubfolder,
  onRename,
  onMove,
  onDelete,
  onDragStart,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  name: string
  folderCount: number
  resourceCount: number
  /** Any signed-in user can add resources/subfolders here, regardless of ownership. */
  canCreateHere: boolean
  /** Only the folder's creator can rename/move/delete it (or drag it elsewhere). */
  canManage: boolean
  onOpen: () => void
  onShare: () => void
  onAddResource: () => void
  onNewSubfolder: () => void
  onRename: () => void
  onMove: () => void
  onDelete: () => void
  onDragStart: (event: React.DragEvent) => void
  isDragOver: boolean
  onDragOver: (event: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (event: React.DragEvent) => void
}) {
  const metadata = formatFolderMetadata(folderCount, resourceCount)

  return (
    <Card
      role="button"
      tabIndex={0}
      draggable={canManage}
      onDragStart={canManage ? onDragStart : undefined}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onOpen()
        }
      }}
      className={cn(
        "flex min-h-32 cursor-pointer flex-col items-stretch gap-3 rounded-[min(var(--radius-4xl),24px)] p-4 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
        isDragOver && "bg-accent ring-2 ring-ring/40"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <HugeiconsIcon
          icon={Folder01Icon}
          strokeWidth={2}
          className="size-6 shrink-0 text-muted-foreground"
        />
        <FolderActions
          canCreateHere={canCreateHere}
          canManage={canManage}
          onOpen={onOpen}
          onShare={onShare}
          onAddResource={onAddResource}
          onNewSubfolder={onNewSubfolder}
          onRename={onRename}
          onMove={onMove}
          onDelete={onDelete}
          triggerClassName="-mt-2 -mr-2"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {/* User-submitted content — force the app font, not font-heading. */}
        <span className="line-clamp-2 break-words font-sans text-base leading-snug font-medium">
          {name}
        </span>
        <span className="text-xs text-muted-foreground">{metadata}</span>
      </div>
    </Card>
  )
}

function formatFolderMetadata(folderCount: number, resourceCount: number): string {
  if (folderCount === 0 && resourceCount === 0) {
    return "Empty"
  }
  const folderLabel = `${folderCount} folder${folderCount === 1 ? "" : "s"}`
  const resourceLabel = `${resourceCount} resource${resourceCount === 1 ? "" : "s"}`
  if (folderCount > 0 && resourceCount > 0) {
    return `${folderLabel} · ${resourceLabel}`
  }
  return folderCount > 0 ? folderLabel : resourceLabel
}

function FolderActions({
  canCreateHere,
  canManage,
  onOpen,
  onShare,
  onAddResource,
  onNewSubfolder,
  onRename,
  onMove,
  onDelete,
  triggerClassName,
}: {
  canCreateHere: boolean
  canManage: boolean
  onOpen: () => void
  onShare: () => void
  onAddResource: () => void
  onNewSubfolder: () => void
  onRename: () => void
  onMove: () => void
  onDelete: () => void
  triggerClassName?: string
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-lg"
            className={triggerClassName}
            onClick={(event: React.MouseEvent) => event.stopPropagation()}
          />
        }
      >
        <HugeiconsIcon icon={MoreVerticalIcon} strokeWidth={2} />
        <span className="sr-only">Folder actions</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
        <DropdownMenuItem onClick={onOpen}>Open</DropdownMenuItem>
        <DropdownMenuItem onClick={onShare}>Share</DropdownMenuItem>
        <DropdownMenuItem onClick={onAddResource}>Add Resource</DropdownMenuItem>
        {canCreateHere && (
          <DropdownMenuItem onClick={onNewSubfolder}>New Subfolder</DropdownMenuItem>
        )}
        {canManage && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onRename}>Rename</DropdownMenuItem>
            <DropdownMenuItem onClick={onMove}>Move</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { FolderRow }
