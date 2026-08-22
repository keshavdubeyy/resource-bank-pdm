export type ResourceCategory =
  | "Product"
  | "Design"
  | "Business"
  | "Dev"
  | "AI"
  | "General"

export type KnownResourceType =
  | "Article"
  | "Video"
  | "Course"
  | "Book"
  | "Template"
  | "Podcast"
  | "Tool"
  | "Case Study"
  | "Community"
  | "PDF"
  | "Image"
  | "Spreadsheet"
  | "Document"
  | "Repository"

/** The suggested types plus anything a contributor names themselves — stored as free text.
 * The `string & {}` intersection keeps known literals autocompleting instead of
 * collapsing the union down to plain `string`. */
export type ResourceType = KnownResourceType | (string & {})

export type ResourceLevel = "Beginner" | "Intermediate" | "Advanced"

export type ResourceCost = "Free" | "Freemium" | "Paid"

export type ResourcePurpose =
  | "Learn a concept"
  | "Practice / drill"
  | "Portfolio / case study"
  | "Interview prep"
  | "Career guidance"
  | "Reference / lookup"

export interface ResourceLink {
  label: string
  url: string
}

/** A user-created folder. parentFolderId is null for a root-level folder. */
export interface FolderRow {
  id: string
  name: string
  parentFolderId: string | null
  createdBy: string | null
  /** Display name captured at creation time — null for folders created before this was tracked. */
  createdByName: string | null
  createdAt: string
}

export interface Resource {
  id: string
  slug: string
  title: string
  description: string
  /** Legacy taxonomy — kept for the 30 seed resources and /resources' filters, no longer collected. */
  category: ResourceCategory | null
  purpose: ResourcePurpose | null
  type: ResourceType
  level: ResourceLevel | null
  cost: ResourceCost | null
  /** Optional note on why this resource is worth a PDM candidate's time. */
  whyUseful: string
  contributor: string
  links: ResourceLink[]
  /** ISO date string (yyyy-mm-dd). */
  dateAdded: string
  /** Supabase auth user id of the submitter, or null for the curated seed catalog. */
  createdBy: string | null
  /** The folder this resource is filed in, or null for unfiled/root. */
  folderId: string | null
}

export interface NewResourceInput {
  title: string
  /** Where to file this resource — null means unfiled/root. */
  folderId: string | null
  /** Auto-detected from the attachment (URL or file) — no longer contributor-chosen. */
  type: ResourceType
  whyUseful: string
  links: ResourceLink[]
}

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  "Product",
  "Design",
  "Business",
  "Dev",
  "AI",
  "General",
]

export const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  Product: "Product Management",
  Design: "Design & UX",
  Business: "Business & Strategy",
  Dev: "Development",
  AI: "Data & AI",
  General: "General",
}

export const RESOURCE_TYPES: KnownResourceType[] = [
  "Article",
  "Video",
  "Course",
  "Book",
  "Template",
  "Podcast",
  "Tool",
  "Case Study",
  "Community",
  "PDF",
  "Image",
  "Spreadsheet",
  "Document",
  "Repository",
]

/** Shown directly in the type picker — the types auto-detection actually produces most often. */
export const PROMINENT_RESOURCE_TYPES: KnownResourceType[] = [
  "Article",
  "Video",
  "PDF",
  "Repository",
  "Course",
  "Spreadsheet",
  "Document",
]

/** Tucked behind "Other" in the type picker — still valid, just less common. */
export const OTHER_RESOURCE_TYPES: KnownResourceType[] = RESOURCE_TYPES.filter(
  (type) => !PROMINENT_RESOURCE_TYPES.includes(type)
)

export const RESOURCE_LEVELS: ResourceLevel[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
]

export const RESOURCE_COSTS: ResourceCost[] = ["Free", "Freemium", "Paid"]

export const RESOURCE_PURPOSES: ResourcePurpose[] = [
  "Learn a concept",
  "Practice / drill",
  "Portfolio / case study",
  "Interview prep",
  "Career guidance",
  "Reference / lookup",
]
