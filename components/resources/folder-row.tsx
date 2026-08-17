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
  canCreateHere,
  canManage,
  onOpen,
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
  /** Any signed-in user can add resources/subfolders here, regardless of ownership. */
  canCreateHere: boolean
  /** Only the folder's creator can rename/move/delete it (or drag it elsewhere). */
  canManage: boolean
  onOpen: () => void
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
        "flex cursor-pointer flex-row items-center gap-2 border border-dashed border-border bg-muted/40 px-3 py-2.5 shadow-none transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
        isDragOver && "border-solid border-ring bg-accent ring-2 ring-ring/40"
      )}
    >
      <HugeiconsIcon
        icon={Folder01Icon}
        strokeWidth={2}
        className="size-5 shrink-0 text-muted-foreground"
      />
      <span className="flex-1 truncate text-sm font-medium">{name}</span>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={(event: React.MouseEvent) => event.stopPropagation()}
            />
          }
        >
          <HugeiconsIcon icon={MoreVerticalIcon} strokeWidth={2} />
          <span className="sr-only">Folder actions</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
          <DropdownMenuItem onClick={onOpen}>Open</DropdownMenuItem>
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
    </Card>
  )
}

export { FolderRow }
