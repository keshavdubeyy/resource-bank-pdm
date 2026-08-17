import type { FolderRow } from "@/lib/resources/types"

export function buildChildrenMap(folders: FolderRow[]): Map<string | null, FolderRow[]> {
  const map = new Map<string | null, FolderRow[]>()
  for (const folder of folders) {
    const siblings = map.get(folder.parentFolderId) ?? []
    siblings.push(folder)
    map.set(folder.parentFolderId, siblings)
  }
  for (const siblings of map.values()) {
    siblings.sort((a, b) => a.name.localeCompare(b.name))
  }
  return map
}

/** Ordered root-to-current. Empty array means the folder is root itself (folderId null). */
export function getBreadcrumbPath(folders: FolderRow[], folderId: string | null): FolderRow[] {
  const byId = new Map(folders.map((folder) => [folder.id, folder]))
  const path: FolderRow[] = []
  let current = folderId ? byId.get(folderId) : undefined
  while (current) {
    path.unshift(current)
    current = current.parentFolderId ? byId.get(current.parentFolderId) : undefined
  }
  return path
}

export function getDescendantIds(folders: FolderRow[], folderId: string): Set<string> {
  const children = buildChildrenMap(folders)
  const descendants = new Set<string>()
  const queue = [...(children.get(folderId) ?? [])]
  while (queue.length > 0) {
    const next = queue.pop()
    if (!next || descendants.has(next.id)) {
      continue
    }
    descendants.add(next.id)
    queue.push(...(children.get(next.id) ?? []))
  }
  return descendants
}

export function getFolderPathLabel(folders: FolderRow[], folderId: string | null): string {
  const path = getBreadcrumbPath(folders, folderId)
  return path.length > 0 ? path.map((folder) => folder.name).join(" / ") : "All Resources"
}
