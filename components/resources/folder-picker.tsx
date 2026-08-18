"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  Folder01Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createFolderAction } from "@/lib/resources/folder-actions"
import {
  buildChildrenMap,
  getBreadcrumbPath,
  getFolderPathLabel,
} from "@/lib/resources/folder-tree"
import type { FolderRow } from "@/lib/resources/types"
import { cn } from "@/lib/utils"

function SearchResultRow({
  label,
  sublabel,
  selected,
  onClick,
}: {
  label: string
  sublabel?: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-0.5 rounded-xl px-2 py-1.5 text-left text-sm hover:bg-accent",
        selected && "bg-accent text-accent-foreground"
      )}
    >
      <span className="flex items-center gap-1.5">
        <HugeiconsIcon
          icon={Folder01Icon}
          strokeWidth={2}
          className="size-4 shrink-0 text-muted-foreground"
        />
        {label}
      </span>
      {sublabel && <span className="pl-5.5 text-xs text-muted-foreground">{sublabel}</span>}
    </button>
  )
}

/** One row of the nested tree: clicking the row selects the folder; clicking
 * the chevron (a separate, smaller hit target) only expands/collapses its
 * children. The two never overlap, so there's no ambiguity about what a
 * click does. */
function TreeRow({
  folder,
  depth,
  hasChildren,
  expanded,
  selected,
  onToggle,
  onSelect,
}: {
  folder: FolderRow
  depth: number
  hasChildren: boolean
  expanded: boolean
  selected: boolean
  onToggle: () => void
  onSelect: () => void
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-xl pr-2 text-sm hover:bg-accent",
        selected && "bg-accent text-accent-foreground"
      )}
      style={{ paddingLeft: 8 + depth * 20 }}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          onToggle()
        }}
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent-foreground/10",
          !hasChildren && "invisible"
        )}
        aria-label={expanded ? "Collapse" : "Expand"}
        tabIndex={hasChildren ? 0 : -1}
      >
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          strokeWidth={2}
          className={cn("size-4 transition-transform", !expanded && "-rotate-90")}
        />
      </button>
      <button
        type="button"
        onClick={onSelect}
        className="flex flex-1 items-center gap-1.5 py-1.5 text-left"
      >
        <HugeiconsIcon
          icon={Folder01Icon}
          strokeWidth={2}
          className="size-4 shrink-0 text-muted-foreground"
        />
        <span className="flex-1 truncate">{folder.name}</span>
        {selected && (
          <HugeiconsIcon
            icon={CheckmarkCircle02Icon}
            strokeWidth={2}
            className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
          />
        )}
      </button>
    </div>
  )
}

function TreeBranch({
  parentId,
  depth,
  childrenMap,
  expandedIds,
  selectedId,
  onToggle,
  onSelect,
}: {
  parentId: string | null
  depth: number
  childrenMap: Map<string | null, FolderRow[]>
  expandedIds: Set<string>
  selectedId: string | null
  onToggle: (folderId: string) => void
  onSelect: (folderId: string) => void
}) {
  const children = childrenMap.get(parentId) ?? []

  return (
    <>
      {children.map((folder) => {
        const hasChildren = (childrenMap.get(folder.id)?.length ?? 0) > 0
        const expanded = expandedIds.has(folder.id)
        return (
          <React.Fragment key={folder.id}>
            <TreeRow
              folder={folder}
              depth={depth}
              hasChildren={hasChildren}
              expanded={expanded}
              selected={selectedId === folder.id}
              onToggle={() => onToggle(folder.id)}
              onSelect={() => onSelect(folder.id)}
            />
            {hasChildren && expanded && (
              <TreeBranch
                parentId={folder.id}
                depth={depth + 1}
                childrenMap={childrenMap}
                expandedIds={expandedIds}
                selectedId={selectedId}
                onToggle={onToggle}
                onSelect={onSelect}
              />
            )}
          </React.Fragment>
        )
      })}
    </>
  )
}

function FolderPicker({
  folders,
  onFoldersChange,
  excludeIds,
  value,
  onSelect,
  listClassName,
}: {
  folders: FolderRow[]
  onFoldersChange: (folders: FolderRow[]) => void
  /** Folder ids to hide from selection — used by Move to exclude the item itself and its descendants. */
  excludeIds?: Set<string>
  value: string | null
  onSelect: (folderId: string | null) => void
  /** Overrides the tree/results list's max-height — e.g. a taller value when hosted in a mobile bottom sheet with room to spare. */
  listClassName?: string
}) {
  const [query, setQuery] = React.useState("")
  const [creating, setCreating] = React.useState(false)
  const [newFolderName, setNewFolderName] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const visibleFolders = React.useMemo(
    () => folders.filter((folder) => !excludeIds?.has(folder.id)),
    [folders, excludeIds]
  )

  // Start with the path to the current selection expanded, so opening the
  // picker on a deeply nested folder shows it in context right away.
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(
    () => new Set(getBreadcrumbPath(visibleFolders, value).map((folder) => folder.id))
  )

  function toggleExpanded(folderId: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(folderId)) {
        next.delete(folderId)
      } else {
        next.add(folderId)
      }
      return next
    })
  }

  const trimmedQuery = query.trim().toLowerCase()
  const isSearching = trimmedQuery.length > 0

  const searchResults = React.useMemo(() => {
    if (!isSearching) {
      return []
    }
    return visibleFolders.filter((folder) => folder.name.toLowerCase().includes(trimmedQuery))
  }, [visibleFolders, trimmedQuery, isSearching])

  const childrenMap = React.useMemo(() => buildChildrenMap(visibleFolders), [visibleFolders])
  const selectedLabel = getFolderPathLabel(visibleFolders, value)

  async function handleCreate() {
    const name = newFolderName.trim()
    if (!name) {
      return
    }
    setIsSubmitting(true)
    setError(null)
    const result = await createFolderAction(name, value)
    setIsSubmitting(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    onFoldersChange([...folders, result.folder])
    if (value) {
      setExpandedIds((prev) => new Set(prev).add(value))
    }
    onSelect(result.folder.id)
    setCreating(false)
    setNewFolderName("")
  }

  return (
    <div className="flex flex-col gap-3">
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search folders..."
      />

      {isSearching ? (
        <div
          className={cn(
            "flex max-h-64 flex-col gap-1 overflow-y-auto rounded-2xl border border-border p-2",
            listClassName
          )}
        >
          <SearchResultRow
            label="All Resources"
            selected={value === null}
            onClick={() => onSelect(null)}
          />
          {searchResults.map((folder) => (
            <SearchResultRow
              key={folder.id}
              label={folder.name}
              sublabel={getFolderPathLabel(visibleFolders, folder.parentFolderId)}
              selected={value === folder.id}
              onClick={() => onSelect(folder.id)}
            />
          ))}
          {searchResults.length === 0 && (
            <p className="px-2 py-1.5 text-sm text-muted-foreground">No folders match.</p>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "flex max-h-72 flex-col gap-0.5 overflow-y-auto rounded-2xl border border-border p-2",
            listClassName
          )}
        >
          <button
            type="button"
            onClick={() => onSelect(null)}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-left text-sm hover:bg-accent",
              value === null && "bg-accent text-accent-foreground"
            )}
          >
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              strokeWidth={2}
              className="size-4 shrink-0 text-muted-foreground opacity-0"
            />
            <span className="flex-1 truncate font-medium">All Resources</span>
            {value === null && (
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                strokeWidth={2}
                className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
              />
            )}
          </button>
          <TreeBranch
            parentId={null}
            depth={1}
            childrenMap={childrenMap}
            expandedIds={expandedIds}
            selectedId={value}
            onToggle={toggleExpanded}
            onSelect={onSelect}
          />
        </div>
      )}

      {creating ? (
        <div className="flex flex-col gap-2">
          <Input
            value={newFolderName}
            onChange={(event) => setNewFolderName(event.target.value)}
            placeholder="Folder name"
            autoFocus
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setCreating(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="button" size="lg" onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? "Creating…" : "Create"}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => setCreating(true)}
          className="self-start"
        >
          <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
          New folder in &quot;{selectedLabel}&quot;
        </Button>
      )}
    </div>
  )
}

export { FolderPicker }
