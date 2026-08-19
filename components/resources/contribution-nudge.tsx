"use client"

import * as React from "react"

import { AddResourceTrigger } from "@/components/resources/add-resource-trigger"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import {
  dismissNudgeForNow,
  isNudgeDismissed,
  useEngagement,
} from "@/hooks/use-contribution-nudge"
import { useIsMobile } from "@/hooks/use-mobile"
import type { AppUser } from "@/lib/auth/user"

export type ContributionNudgeVariant = "anonymous" | "new-contributor"

type NudgeCopy = {
  title: string
  description: string
  action: string
}

const NUDGE_COPY: Record<ContributionNudgeVariant, NudgeCopy> = {
  anonymous: {
    title: "Found something useful?",
    description:
      "This resource bank grows when everyone contributes. Share a link, PDF, video, or doc with the batch.",
    action: "Add a resource",
  },
  "new-contributor": {
    title: "Add your first resource",
    description:
      "Have a useful link, PDF, video, tool, or document? Add it so the batch can use it too.",
    action: "Contribute a resource",
  },
}

/** Which variant (if any) a visitor should see — pure, no storage/hooks, so
 * both the real nudge and the /nudge sandbox can share the exact same rule. */
export function resolveNudgeVariant(
  user: AppUser | null,
  hasContributed: boolean
): ContributionNudgeVariant | null {
  if (!user) {
    return "anonymous"
  }
  return hasContributed ? null : "new-contributor"
}

/** Just the card, no engagement/dismissal logic — reused by the real
 * ContributionNudge below and by the /nudge sandbox for previewing every
 * state side by side regardless of the real session or viewport. */
function ContributionNudgeCard({
  variant,
  layout,
  user,
  folderId,
  onDismiss,
}: {
  variant: ContributionNudgeVariant
  layout: "inline" | "banner"
  user: AppUser | null
  folderId?: string | null
  onDismiss?: () => void
}) {
  const copy = NUDGE_COPY[variant]

  const addButton = (
    <AddResourceTrigger user={user} initialFolderId={folderId}>
      {(onClick, isPending) => (
        <Button size={layout === "banner" ? "sm" : "lg"} onClick={onClick} disabled={isPending}>
          {copy.action}
        </Button>
      )}
    </AddResourceTrigger>
  )

  if (layout === "banner") {
    return (
      <Card size="sm" className="shadow-lg">
        <CardContent className="flex flex-col gap-3">
          <div className="flex min-w-0 flex-col gap-1.5">
            <CardTitle>{copy.title}</CardTitle>
            <CardDescription>{copy.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {addButton}
            {onDismiss && (
              <Button size="sm" variant="ghost" onClick={onDismiss}>
                Later
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <CardTitle>{copy.title}</CardTitle>
          <CardDescription>{copy.description}</CardDescription>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {addButton}
          {onDismiss && (
            <Button size="lg" variant="ghost" onClick={onDismiss}>
              Maybe later
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/** Soft, dismissible prompt to contribute — inline card on desktop/tablet,
 * fixed bottom banner on mobile. Only appears once the visitor has engaged
 * (a few resource opens, or ~45s browsing), never on first load. Reuses
 * AddResourceTrigger for the actual add flow (auth explainer, folder
 * context, the Add Resource Sheet) rather than inventing a new one. */
function ContributionNudge({
  user,
  hasContributed,
  folderId,
}: {
  user: AppUser | null
  /** Whether this signed-in user already has at least one resource — ignored for anonymous visitors. */
  hasContributed: boolean
  folderId?: string | null
}) {
  const isMobile = useIsMobile()
  const engaged = useEngagement()
  const [dismissed, setDismissed] = React.useState(() => isNudgeDismissed())

  const variant = resolveNudgeVariant(user, hasContributed)

  if (!engaged || !variant || (variant === "anonymous" && dismissed)) {
    return null
  }

  function handleDismiss() {
    dismissNudgeForNow()
    setDismissed(true)
  }

  const card = (
    <ContributionNudgeCard
      variant={variant}
      layout={isMobile ? "banner" : "inline"}
      user={user}
      folderId={folderId}
      onDismiss={variant === "anonymous" ? handleDismiss : undefined}
    />
  )

  if (isMobile) {
    return <div className="fixed inset-x-4 bottom-24 z-40 md:hidden">{card}</div>
  }

  return (
    <div className="sticky bottom-6 z-40 hidden md:block">
      {card}
    </div>
  )
}

export { ContributionNudge, ContributionNudgeCard }
