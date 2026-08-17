import type { Resource, ResourceCategory, ResourceType } from "@/lib/resources/types"

export interface ResourceFilters {
  search: string
  category: ResourceCategory | "All"
  type: ResourceType | "All"
}

export const DEFAULT_FILTERS: ResourceFilters = {
  search: "",
  category: "All",
  type: "All",
}

export function filterResources(
  resources: Resource[],
  filters: ResourceFilters
): Resource[] {
  const query = filters.search.trim().toLowerCase()

  return resources.filter((resource) => {
    if (filters.category !== "All" && resource.category !== filters.category) {
      return false
    }
    if (filters.type !== "All" && resource.type !== filters.type) {
      return false
    }
    if (query) {
      const haystack = [resource.title, resource.description, resource.contributor]
        .join(" ")
        .toLowerCase()
      if (!haystack.includes(query)) {
        return false
      }
    }
    return true
  })
}

export function sortResources(resources: Resource[]): Resource[] {
  return [...resources].sort((a, b) => b.dateAdded.localeCompare(a.dateAdded))
}

export function countActiveFilters(filters: ResourceFilters): number {
  let count = 0
  if (filters.type !== "All") count += 1
  return count
}
