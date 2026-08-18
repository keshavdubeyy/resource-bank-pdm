"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  ArrowLeft01Icon,
  Folder01Icon,
  SearchRemoveIcon,
} from "@hugeicons/core-free-icons"

import { AddResourceSheet } from "@/components/resources/add-resource-sheet"
import { AddResourceTrigger } from "@/components/resources/add-resource-trigger"
import { AuthRequiredDialog } from "@/components/resources/auth-required-dialog"
import { DraggableResourceCard } from "@/components/resources/draggable-resource-card"
import { EditResourceSheet } from "@/components/resources/edit-resource-sheet"
import { FolderPicker } from "@/components/resources/folder-picker"
import { FolderRow } from "@/components/resources/folder-row"
import { MobileFolderNavBar } from "@/components/resources/mobile-folder-nav-bar"
import { ResourceDetail } from "@/components/resources/resource-detail"
import { ResourceSearch } from "@/components/resources/resource-search"
import {
  clearAuthReturnIntent,
  readAuthReturnIntent,
  type AuthActionIntent,
} from "@/lib/auth/client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent as SheetPanelContent,
  SheetHeader as SheetPanelHeader,
  SheetTitle as SheetPanelTitle,
} from "@/components/ui/sheet"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { useIsMobile } from "@/hooks/use-mobile"
import type { AppUser } from "@/lib/auth/user"
import { deleteResourceAction } from "@/lib/resources/actions"
import { notifySupabaseUsageChanged } from "@/lib/usage/client-events"
import type { SupabaseUsage } from "@/lib/usage/usage-metrics"
import {
  createFolderAction,
  deleteFolderAction,
  moveFolderAction,
  moveResourceToFolderAction,
  renameFolderAction,
} from "@/lib/resources/folder-actions"
import {
  buildChildrenMap,
  getBreadcrumbPath,
  getDescendantIds,
  getFolderPathLabel,
} from "@/lib/resources/folder-tree"
import { buildFolderShareUrl, buildResourceShareUrl, shareOrCopyLink } from "@/lib/resources/share"
import type { FolderRow as FolderRowType, Resource } from "@/lib/resources/types"

type DraggedItem =
  | { type: "folder"; id: string }
  | { type: "resource"; id: string }

type ActionDialogState =
  | { type: "newFolder"; parentId: string | null }
  | { type: "renameFolder"; folder: FolderRowType }
  | { type: "deleteFolder"; folder: FolderRowType }
  | { type: "moveFolder"; folder: FolderRowType }
  | { type: "moveResource"; resource: Resource }
  | { type: "deleteResource"; resource: Resource }
  | null

type AuthDialogState =
  | { intent: AuthActionIntent; folderId?: string | null; parentFolderId?: string | null }
  | null

function searchResources(resources: Resource[], query: string): Resource[] {
  const q = query.trim().toLowerCase()
  if (!q) {
    return []
  }
  return resources.filter((resource) => {
    const haystack = [resource.title, resource.description, resource.contributor]
      .join(" ")
      .toLowerCase()
    return haystack.includes(q)
  })
}

function searchFolders(folders: FolderRowType[], query: string): FolderRowType[] {
  const q = query.trim().toLowerCase()
  if (!q) {
    return []
  }
  return folders.filter((folder) => folder.name.toLowerCase().includes(q))
}

function formatSearchResultCount(folderCount: number, resourceCount: number): string {
  const parts: string[] = []
  if (folderCount > 0) {
    parts.push(`${folderCount} folder${folderCount === 1 ? "" : "s"}`)
  }
  if (resourceCount > 0) {
    parts.push(`${resourceCount} resource${resourceCount === 1 ? "" : "s"}`)
  }
  return parts.length > 0 ? parts.join(" and ") : "0 results"
}

function FolderExplorer({
  user,
  usage,
  resources: initialResources,
  folders: initialFolders,
  currentFolderId,
}: {
  user: AppUser | null
  usage: SupabaseUsage | null
  resources: Resource[]
  folders: FolderRowType[]
  /** Sourced from the URL (/browse or /browse/[folderId]) so refresh, back/forward,
   * and sharing a folder link all work — not owned as local component state. */
  currentFolderId: string | null
}) {
  const router = useRouter()
  const [resources, setResources] = React.useState(initialResources)
  const [folders, setFolders] = React.useState(initialFolders)

  function navigateToFolder(folderId: string | null) {
    router.push(folderId ? `/browse/${folderId}` : "/browse")
  }

  // Resync local state when fresh props arrive (e.g. after router.refresh()),
  // without an effect — see https://react.dev/learn/you-might-not-need-an-effect
  const [prevInitialResources, setPrevInitialResources] = React.useState(initialResources)
  if (initialResources !== prevInitialResources) {
    setPrevInitialResources(initialResources)
    setResources(initialResources)
  }
  const [prevInitialFolders, setPrevInitialFolders] = React.useState(initialFolders)
  if (initialFolders !== prevInitialFolders) {
    setPrevInitialFolders(initialFolders)
    setFolders(initialFolders)
  }

  const [searchQuery, setSearchQuery] = React.useState("")
  // A shared resource link (?resource=<slug>) opens straight into that
  // resource's detail sheet — derived once at mount, not via an effect.
  const [selectedResource, setSelectedResource] = React.useState<Resource | null>(() => {
    if (typeof window === "undefined") {
      return null
    }
    const slug = new URLSearchParams(window.location.search).get("resource")
    return slug ? (resources.find((resource) => resource.slug === slug) ?? null) : null
  })
  const [detailOpen, setDetailOpen] = React.useState(selectedResource !== null)
  const [editingResource, setEditingResource] = React.useState<Resource | null>(null)
  const [editOpen, setEditOpen] = React.useState(false)

  const [draggedItem, setDraggedItem] = React.useState<DraggedItem | null>(null)
  const [dragOverTarget, setDragOverTarget] = React.useState<string | null | undefined>(undefined)

  const [actionDialog, setActionDialog] = React.useState<ActionDialogState>(null)
  const [actionError, setActionError] = React.useState<string | null>(null)
  const [authDialog, setAuthDialog] = React.useState<AuthDialogState>(null)
  const handledAuthReturnRef = React.useRef(false)

  /** Backs a folder row's "Add Resource" menu item — scoped to that folder,
   * regardless of which folder is currently being viewed. */
  const [quickAddFolderId, setQuickAddFolderId] = React.useState<string | null | undefined>(
    undefined
  )

  function handleFolderRowAddResource(folderId: string) {
    if (!user) {
      setAuthDialog({ intent: "add-resource", folderId })
      return
    }
    setQuickAddFolderId(folderId)
  }

  function handleNewFolder(parentId: string | null) {
    if (!user) {
      setAuthDialog({ intent: "create-folder", parentFolderId: parentId })
      return
    }
    setActionDialog({ type: "newFolder", parentId })
  }

  React.useEffect(() => {
    if (!user || handledAuthReturnRef.current) {
      return
    }

    const intent = readAuthReturnIntent()
    if (intent?.action !== "create-folder") {
      return
    }

    handledAuthReturnRef.current = true
    window.setTimeout(
      () => setActionDialog({ type: "newFolder", parentId: intent.parentFolderId ?? null }),
      0
    )
    router.replace(clearAuthReturnIntent(), { scroll: false })
  }, [router, user])

  // Strips the one-time `?resource=<slug>` share param back out of the URL
  // once it's been consumed by the lazy state initializer above — a plain
  // sync with the browser's URL, so no setState belongs in this effect.
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (!params.has("resource")) {
      return
    }
    params.delete("resource")
    const query = params.toString()
    router.replace(`${window.location.pathname}${query ? `?${query}` : ""}`, { scroll: false })
    // Runs once on mount only — this is a one-time cleanup of the initial URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isSearching = searchQuery.trim().length > 0
  const searchResultsList = React.useMemo(
    () => searchResources(resources, searchQuery),
    [resources, searchQuery]
  )
  const searchFoldersList = React.useMemo(
    () => searchFolders(folders, searchQuery),
    [folders, searchQuery]
  )

  const childrenMap = React.useMemo(() => buildChildrenMap(folders), [folders])
  const resourceCountsByFolder = React.useMemo(() => {
    const counts = new Map<string | null, number>()
    resources.forEach((resource) => {
      counts.set(resource.folderId, (counts.get(resource.folderId) ?? 0) + 1)
    })
    return counts
  }, [resources])
  const breadcrumbPath = React.useMemo(
    () => getBreadcrumbPath(folders, currentFolderId),
    [folders, currentFolderId]
  )
  const currentFolder = breadcrumbPath.at(-1) ?? null
  const canManageCurrentFolder = !!user && currentFolder?.createdBy === user.id
  const currentSubfolders = childrenMap.get(currentFolderId) ?? []
  const currentResources = React.useMemo(
    () => resources.filter((resource) => resource.folderId === currentFolderId),
    [resources, currentFolderId]
  )
  // Being at the root view isn't "inside a folder" — Add Resource should still
  // ask where to put it there, same as from the header or search.
  const addResourceFolderId = currentFolderId === null ? undefined : currentFolderId

  function handleSelectResource(resource: Resource) {
    setSelectedResource(resource)
    setDetailOpen(true)
  }

  function handleEditResource(resource: Resource) {
    setDetailOpen(false)
    setEditingResource(resource)
    setEditOpen(true)
  }

  async function handleShareFolder(folder: FolderRowType) {
    const result = await shareOrCopyLink({
      title: folder.name,
      url: buildFolderShareUrl(folder.id),
    })
    if (result.ok && result.method === "copy") {
      toast.add({
        title: "Link copied",
        description: `Share this link to "${folder.name}".`,
        type: "success",
      })
    } else if (!result.ok) {
      toast.add({ title: "Couldn't share link", type: "error" })
    }
  }

  async function handleShareResource(resource: Resource) {
    const result = await shareOrCopyLink({
      title: resource.title,
      url: buildResourceShareUrl(resource.slug),
    })
    if (result.ok && result.method === "copy") {
      toast.add({
        title: "Link copied",
        description: `Share this link to "${resource.title}".`,
        type: "success",
      })
    } else if (!result.ok) {
      toast.add({ title: "Couldn't share link", type: "error" })
    }
  }

  function isValidDropTarget(targetFolderId: string | null): boolean {
    if (!draggedItem) {
      return false
    }
    if (draggedItem.type === "folder") {
      const folder = folders.find((f) => f.id === draggedItem.id)
      if (!user || folder?.createdBy !== user.id) {
        return false
      }
      if (draggedItem.id === targetFolderId) {
        return false
      }
      if (targetFolderId !== null && getDescendantIds(folders, draggedItem.id).has(targetFolderId)) {
        return false
      }
      return true
    }
    const resource = resources.find((r) => r.id === draggedItem.id)
    if (!user || resource?.createdBy !== user.id) {
      return false
    }
    return resource.folderId !== targetFolderId
  }

  function handleDragOverFolder(event: React.DragEvent, targetFolderId: string | null) {
    event.preventDefault()
    if (isValidDropTarget(targetFolderId)) {
      event.dataTransfer.dropEffect = "move"
      setDragOverTarget(targetFolderId)
    } else {
      event.dataTransfer.dropEffect = "none"
    }
  }

  function handleDragLeaveFolder() {
    setDragOverTarget(undefined)
  }

  async function handleDropOnFolder(event: React.DragEvent, targetFolderId: string | null) {
    event.preventDefault()
    setDragOverTarget(undefined)
    const item = draggedItem
    setDraggedItem(null)
    if (!item || !isValidDropTarget(targetFolderId)) {
      return
    }

    setActionError(null)

    if (item.type === "folder") {
      const result = await moveFolderAction(item.id, targetFolderId)
      if (!result.ok) {
        setActionError(result.error)
        return
      }
      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === item.id ? { ...folder, parentFolderId: targetFolderId } : folder
        )
      )
    } else {
      const result = await moveResourceToFolderAction(item.id, targetFolderId)
      if (!result.ok) {
        setActionError(result.error)
        return
      }
      setResources((prev) =>
        prev.map((resource) =>
          resource.id === item.id ? { ...resource, folderId: targetFolderId } : resource
        )
      )
    }
  }

  async function handleDeleteFolder(folder: FolderRowType) {
    const result = await deleteFolderAction(folder.id)
    if (!result.ok) {
      setActionError(result.error)
      setActionDialog(null)
      return
    }
    setFolders((prev) => prev.filter((f) => f.id !== folder.id))
    setActionDialog(null)
  }

  async function handleDeleteResource(resource: Resource) {
    const result = await deleteResourceAction(resource.id)
    if (result.error) {
      setActionError(result.error)
      setActionDialog(null)
      return
    }
    setResources((prev) => prev.filter((r) => r.id !== resource.id))
    setActionDialog(null)
    notifySupabaseUsageChanged()
  }

  return (
    <div className="flex flex-col gap-6">
      <MobileFolderNavBar
        currentFolder={currentFolder}
        canManage={canManageCurrentFolder}
        onBack={() => currentFolder && navigateToFolder(currentFolder.parentFolderId)}
        onShare={() => currentFolder && handleShareFolder(currentFolder)}
        onRename={() => currentFolder && setActionDialog({ type: "renameFolder", folder: currentFolder })}
        onDelete={() => currentFolder && setActionDialog({ type: "deleteFolder", folder: currentFolder })}
        user={user}
        usage={usage}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ResourceSearch value={searchQuery} onChange={setSearchQuery} />
        {!isSearching && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleNewFolder(currentFolderId)}
            >
              <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
              New Folder
            </Button>
            <AddResourceTrigger user={user} initialFolderId={addResourceFolderId}>
              {(onClick, isPending) => (
                <Button size="lg" onClick={onClick} disabled={isPending}>
                  <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
                  Add Resource
                </Button>
              )}
            </AddResourceTrigger>
          </div>
        )}
      </div>

      {actionError && (
        <div className="flex items-center justify-between gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <span>{actionError}</span>
          <Button variant="ghost" size="lg" onClick={() => setActionError(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {isSearching ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              {formatSearchResultCount(searchFoldersList.length, searchResultsList.length)} for &quot;
              {searchQuery.trim()}&quot;
            </p>
            <Button variant="ghost" size="lg" onClick={() => setSearchQuery("")}>
              Clear search
            </Button>
          </div>

          {searchFoldersList.length === 0 && searchResultsList.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HugeiconsIcon icon={SearchRemoveIcon} strokeWidth={2} />
                </EmptyMedia>
                <EmptyTitle>Nothing matches your search</EmptyTitle>
                <EmptyDescription>
                  Search looks across every folder and resource, so try a different term.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="flex flex-col gap-6">
              {searchFoldersList.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h2 className="text-sm font-medium text-muted-foreground">Folders</h2>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {searchFoldersList.map((folder) => (
                      <div key={folder.id} className="flex flex-col gap-1.5">
                        <FolderRow
                          name={folder.name}
                          folderCount={childrenMap.get(folder.id)?.length ?? 0}
                          resourceCount={resourceCountsByFolder.get(folder.id) ?? 0}
                          canCreateHere
                          canManage={!!user && folder.createdBy === user.id}
                          onOpen={() => {
                            setSearchQuery("")
                            navigateToFolder(folder.id)
                          }}
                          onShare={() => handleShareFolder(folder)}
                          onAddResource={() => handleFolderRowAddResource(folder.id)}
                          onNewSubfolder={() => handleNewFolder(folder.id)}
                          onRename={() => setActionDialog({ type: "renameFolder", folder })}
                          onMove={() => setActionDialog({ type: "moveFolder", folder })}
                          onDelete={() => setActionDialog({ type: "deleteFolder", folder })}
                          onDragStart={(event) => {
                            event.dataTransfer.effectAllowed = "move"
                            event.dataTransfer.setData("text/plain", folder.id)
                            setDraggedItem({ type: "folder", id: folder.id })
                          }}
                          isDragOver={dragOverTarget === folder.id}
                          onDragOver={(event) => handleDragOverFolder(event, folder.id)}
                          onDragLeave={handleDragLeaveFolder}
                          onDrop={(event) => handleDropOnFolder(event, folder.id)}
                        />
                        <button
                          type="button"
                          className="truncate px-1 text-left text-xs text-muted-foreground hover:text-foreground hover:underline"
                          onClick={() => {
                            setSearchQuery("")
                            navigateToFolder(folder.parentFolderId)
                          }}
                        >
                          {getFolderPathLabel(folders, folder.parentFolderId)}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchResultsList.length > 0 && (
                <div className="flex flex-col gap-3">
                  {searchFoldersList.length > 0 && (
                    <h2 className="text-sm font-medium text-muted-foreground">Resources</h2>
                  )}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {searchResultsList.map((resource) => (
                      <div key={resource.id} className="flex flex-col gap-1.5">
                        <DraggableResourceCard
                          resource={resource}
                          isOwner={!!user && resource.createdBy === user.id}
                          onSelect={handleSelectResource}
                          onShare={() => handleShareResource(resource)}
                          onEdit={() => handleEditResource(resource)}
                          onMove={() => setActionDialog({ type: "moveResource", resource })}
                          onDelete={() => setActionDialog({ type: "deleteResource", resource })}
                          onDragStart={(event) => {
                            event.dataTransfer.effectAllowed = "move"
                            event.dataTransfer.setData("text/plain", resource.id)
                            setDraggedItem({ type: "resource", id: resource.id })
                          }}
                          onDragEnd={() => setDraggedItem(null)}
                        />
                        <button
                          type="button"
                          className="truncate px-1 text-left text-xs text-muted-foreground hover:text-foreground hover:underline"
                          onClick={() => {
                            setSearchQuery("")
                            navigateToFolder(resource.folderId)
                          }}
                        >
                          {getFolderPathLabel(folders, resource.folderId)}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            {breadcrumbPath.length > 0 && (
              <Button
                variant="ghost"
                size="icon-lg"
                aria-label="Back to parent folder"
                onClick={() =>
                  navigateToFolder(breadcrumbPath[breadcrumbPath.length - 1].parentFolderId)
                }
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
              </Button>
            )}
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem
                  onDragOver={(event) => handleDragOverFolder(event, null)}
                  onDragLeave={handleDragLeaveFolder}
                  onDrop={(event) => handleDropOnFolder(event, null)}
                  className={
                    dragOverTarget === null && draggedItem
                      ? "rounded-lg bg-accent px-1 ring-1 ring-ring/40"
                      : undefined
                  }
                >
                  {breadcrumbPath.length > 0 ? (
                    <BreadcrumbLink
                      render={<button type="button" onClick={() => navigateToFolder(null)} />}
                    >
                      All Resources
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>All Resources</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {breadcrumbPath.map((folder, index) => {
                  const isLast = index === breadcrumbPath.length - 1
                  return (
                    <React.Fragment key={folder.id}>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem
                        onDragOver={!isLast ? (event) => handleDragOverFolder(event, folder.id) : undefined}
                        onDragLeave={!isLast ? handleDragLeaveFolder : undefined}
                        onDrop={!isLast ? (event) => handleDropOnFolder(event, folder.id) : undefined}
                        className={
                          dragOverTarget === folder.id && draggedItem
                            ? "rounded-lg bg-accent px-1 ring-1 ring-ring/40"
                            : undefined
                        }
                      >
                        {isLast ? (
                          <BreadcrumbPage>{folder.name}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink
                            render={
                              <button type="button" onClick={() => navigateToFolder(folder.id)} />
                            }
                          >
                            {folder.name}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  )
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {currentSubfolders.length === 0 && currentResources.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HugeiconsIcon icon={Folder01Icon} strokeWidth={2} />
                </EmptyMedia>
                <EmptyTitle>Nothing here yet</EmptyTitle>
                <EmptyDescription>
                  Create a folder or add a resource to get started.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <AddResourceTrigger user={user} initialFolderId={addResourceFolderId}>
                  {(onClick, isPending) => (
                    <Button onClick={onClick} disabled={isPending}>
                      Add Resource
                    </Button>
                  )}
                </AddResourceTrigger>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="flex flex-col gap-6">
              {currentSubfolders.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {currentSubfolders.map((folder) => (
                    <FolderRow
                      key={folder.id}
                      name={folder.name}
                      folderCount={childrenMap.get(folder.id)?.length ?? 0}
                      resourceCount={resourceCountsByFolder.get(folder.id) ?? 0}
                      canCreateHere
                      canManage={!!user && folder.createdBy === user.id}
                      onOpen={() => navigateToFolder(folder.id)}
                      onShare={() => handleShareFolder(folder)}
                      onAddResource={() => handleFolderRowAddResource(folder.id)}
                      onNewSubfolder={() => handleNewFolder(folder.id)}
                      onRename={() => setActionDialog({ type: "renameFolder", folder })}
                      onMove={() => setActionDialog({ type: "moveFolder", folder })}
                      onDelete={() => setActionDialog({ type: "deleteFolder", folder })}
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = "move"
                        event.dataTransfer.setData("text/plain", folder.id)
                        setDraggedItem({ type: "folder", id: folder.id })
                      }}
                      isDragOver={dragOverTarget === folder.id}
                      onDragOver={(event) => handleDragOverFolder(event, folder.id)}
                      onDragLeave={handleDragLeaveFolder}
                      onDrop={(event) => handleDropOnFolder(event, folder.id)}
                    />
                  ))}
                </div>
              )}

              {currentResources.length > 0 && (
                <div className="flex flex-col gap-3">
                  {currentFolderId === null && (
                    <h2 className="text-sm font-medium text-muted-foreground">Unfiled</h2>
                  )}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {currentResources.map((resource) => (
                      <DraggableResourceCard
                        key={resource.id}
                        resource={resource}
                        isOwner={!!user && resource.createdBy === user.id}
                        onSelect={handleSelectResource}
                        onShare={() => handleShareResource(resource)}
                        onEdit={() => handleEditResource(resource)}
                        onMove={() => setActionDialog({ type: "moveResource", resource })}
                        onDelete={() => setActionDialog({ type: "deleteResource", resource })}
                        onDragStart={(event) => {
                          event.dataTransfer.effectAllowed = "move"
                          event.dataTransfer.setData("text/plain", resource.id)
                          setDraggedItem({ type: "resource", id: resource.id })
                        }}
                        onDragEnd={() => setDraggedItem(null)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <ResourceDetail
        resource={selectedResource}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={
          user && selectedResource && selectedResource.createdBy === user.id
            ? () => handleEditResource(selectedResource)
            : undefined
        }
      />

      {user && editingResource && (
        <EditResourceSheet
          open={editOpen}
          onOpenChange={setEditOpen}
          user={user}
          resource={editingResource}
        />
      )}

      {user && quickAddFolderId !== undefined && (
        <AddResourceSheet
          open={quickAddFolderId !== undefined}
          onOpenChange={(open) => !open && setQuickAddFolderId(undefined)}
          user={user}
          initialFolderId={quickAddFolderId}
        />
      )}

      {authDialog && (
        <AuthRequiredDialog
          open={!!authDialog}
          onOpenChange={(open) => !open && setAuthDialog(null)}
          intent={authDialog.intent}
          folderId={authDialog.folderId}
          parentFolderId={authDialog.parentFolderId}
        />
      )}

      <FolderNameDialog
        open={actionDialog?.type === "newFolder"}
        onOpenChange={(open) => !open && setActionDialog(null)}
        title="New Folder"
        initialName=""
        onSubmit={async (name) => {
          if (actionDialog?.type !== "newFolder") {
            return { ok: false, error: "Something went wrong." }
          }
          const result = await createFolderAction(name, actionDialog.parentId)
          if (!result.ok) {
            return { ok: false, error: result.error }
          }
          setFolders((prev) => [...prev, result.folder])
          navigateToFolder(result.folder.id)
          return { ok: true }
        }}
      />

      <FolderNameDialog
        open={actionDialog?.type === "renameFolder"}
        onOpenChange={(open) => !open && setActionDialog(null)}
        title="Rename Folder"
        initialName={actionDialog?.type === "renameFolder" ? actionDialog.folder.name : ""}
        onSubmit={async (name) => {
          if (actionDialog?.type !== "renameFolder") {
            return { ok: false, error: "Something went wrong." }
          }
          const result = await renameFolderAction(actionDialog.folder.id, name)
          if (!result.ok) {
            return { ok: false, error: result.error }
          }
          setFolders((prev) =>
            prev.map((folder) =>
              folder.id === actionDialog.folder.id ? { ...folder, name } : folder
            )
          )
          return { ok: true }
        }}
      />

      <MoveDialog
        open={actionDialog?.type === "moveFolder"}
        onOpenChange={(open) => !open && setActionDialog(null)}
        folders={folders}
        onFoldersChange={setFolders}
        excludeIds={
          actionDialog?.type === "moveFolder"
            ? new Set([actionDialog.folder.id, ...getDescendantIds(folders, actionDialog.folder.id)])
            : undefined
        }
        currentFolderId={actionDialog?.type === "moveFolder" ? actionDialog.folder.parentFolderId : null}
        onMove={async (folderId) => {
          if (actionDialog?.type !== "moveFolder") {
            return { ok: false, error: "Something went wrong." }
          }
          const result = await moveFolderAction(actionDialog.folder.id, folderId)
          if (!result.ok) {
            return { ok: false, error: result.error }
          }
          setFolders((prev) =>
            prev.map((folder) =>
              folder.id === actionDialog.folder.id ? { ...folder, parentFolderId: folderId } : folder
            )
          )
          return { ok: true }
        }}
      />

      <MoveDialog
        open={actionDialog?.type === "moveResource"}
        onOpenChange={(open) => !open && setActionDialog(null)}
        folders={folders}
        onFoldersChange={setFolders}
        currentFolderId={actionDialog?.type === "moveResource" ? actionDialog.resource.folderId : null}
        onMove={async (folderId) => {
          if (actionDialog?.type !== "moveResource") {
            return { ok: false, error: "Something went wrong." }
          }
          const result = await moveResourceToFolderAction(actionDialog.resource.id, folderId)
          if (!result.ok) {
            return { ok: false, error: result.error }
          }
          setResources((prev) =>
            prev.map((resource) =>
              resource.id === actionDialog.resource.id ? { ...resource, folderId } : resource
            )
          )
          return { ok: true }
        }}
      />

      <AlertDialog
        open={actionDialog?.type === "deleteFolder"}
        onOpenChange={(open) => !open && setActionDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete &quot;{actionDialog?.type === "deleteFolder" ? actionDialog.folder.name : ""}
              &quot;?
            </AlertDialogTitle>
            <AlertDialogDescription>This can&apos;t be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => actionDialog?.type === "deleteFolder" && handleDeleteFolder(actionDialog.folder)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={actionDialog?.type === "deleteResource"}
        onOpenChange={(open) => !open && setActionDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete &quot;
              {actionDialog?.type === "deleteResource" ? actionDialog.resource.title : ""}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This can&apos;t be undone. The resource will be removed from the public hub
              immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() =>
                actionDialog?.type === "deleteResource" && handleDeleteResource(actionDialog.resource)
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function FolderNameDialog({
  open,
  onOpenChange,
  title,
  initialName,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  initialName: string
  onSubmit: (name: string) => Promise<{ ok: boolean; error?: string }>
}) {
  const isMobile = useIsMobile()
  const [name, setName] = React.useState(initialName)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Reset the form fields whenever the dialog transitions to open, without an effect.
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setName(initialName)
      setError(null)
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim() || isSubmitting) {
      return
    }
    setIsSubmitting(true)
    const result = await onSubmit(name.trim())
    setIsSubmitting(false)
    if (!result.ok) {
      setError(result.error ?? "Something went wrong.")
      return
    }
    onOpenChange(false)
  }

  const form = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Folder name"
        autoFocus
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Spinner data-icon="inline-start" />}
          {isSubmitting ? "Saving…" : "Save"}
        </Button>
      </DialogFooter>
    </form>
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetPanelContent side="bottom" className="max-h-[85dvh] w-full rounded-t-3xl">
          <SheetPanelHeader className="p-4 pb-3">
            <SheetPanelTitle>{title}</SheetPanelTitle>
          </SheetPanelHeader>
          <div className="px-4 pb-4">{form}</div>
        </SheetPanelContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {form}
      </DialogContent>
    </Dialog>
  )
}

function MoveDialog({
  open,
  onOpenChange,
  folders,
  onFoldersChange,
  excludeIds,
  currentFolderId,
  onMove,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  folders: FolderRowType[]
  onFoldersChange: (folders: FolderRowType[]) => void
  excludeIds?: Set<string>
  currentFolderId: string | null
  onMove: (folderId: string | null) => Promise<{ ok: boolean; error?: string }>
}) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSelect(folderId: string | null) {
    setIsSubmitting(true)
    setError(null)
    const result = await onMove(folderId)
    setIsSubmitting(false)
    if (!result.ok) {
      setError(result.error ?? "Something went wrong.")
      return
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move to...</DialogTitle>
        </DialogHeader>
        <FolderPicker
          folders={folders}
          onFoldersChange={onFoldersChange}
          excludeIds={excludeIds}
          value={currentFolderId}
          onSelect={handleSelect}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        {isSubmitting && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner />
            Moving…
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export { FolderExplorer }
