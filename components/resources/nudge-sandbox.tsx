"use client"

import * as React from "react"

import {
  ContributionNudgeCard,
  resolveNudgeVariant,
} from "@/components/resources/contribution-nudge"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { dismissNudgeForNow } from "@/hooks/use-contribution-nudge"
import type { AppUser } from "@/lib/auth/user"

type PretendState =
  | "anon-fresh"
  | "anon-engaged"
  | "anon-dismissed"
  | "new-contributor"
  | "contributor"

const STATES: { value: PretendState; label: string }[] = [
  { value: "anon-fresh", label: "Anonymous — just arrived" },
  { value: "anon-engaged", label: "Anonymous — engaged" },
  { value: "anon-dismissed", label: "Anonymous — dismissed \"Maybe later\"" },
  { value: "new-contributor", label: "Signed in — 0 contributions" },
  { value: "contributor", label: "Signed in — 1+ contributions" },
]

const SESSION_OPENS_KEY = "prb:session-resource-opens"
const ENGAGEMENT_EVENT = "prb:engagement-changed"

function resolvePretendVariant(state: PretendState) {
  if (state === "anon-fresh" || state === "anon-dismissed") {
    return null
  }
  if (state === "anon-engaged") {
    return resolveNudgeVariant(null, false)
  }
  return resolveNudgeVariant(
    { id: "preview", name: "Preview", email: null, avatarUrl: null },
    state === "contributor"
  )
}

function reasonForNull(state: PretendState): string {
  if (state === "anon-fresh") {
    return "Not engaged yet — nothing shows until ~3 resource opens or ~45s browsing."
  }
  if (state === "anon-dismissed") {
    return "\"Maybe later\" was clicked — suppressed for ~7 days."
  }
  return "Already contributed at least one resource — the nudge stops asking."
}

/** Lets you flip through every contribution-nudge state without needing to
 * sign in/out or dig through devtools. The "Add"/"Contribute" buttons here
 * always use your REAL current session (real AddResourceTrigger) — only the
 * displayed copy/variant is controlled by the selector below. */
function NudgeSandbox({
  realUser,
  realHasContributed,
}: {
  realUser: AppUser | null
  realHasContributed: boolean
}) {
  const [state, setState] = React.useState<PretendState>("anon-engaged")
  const variant = resolvePretendVariant(state)
  const showDismiss = state === "anon-engaged"

  function handleDismiss() {
    dismissNudgeForNow()
    toast.add({
      title: "Dismissed for real",
      description: "This also suppressed the real nudge on /browse for ~7 days. Use Reset below to undo.",
    })
  }

  function handleReset() {
    window.sessionStorage.removeItem(SESSION_OPENS_KEY)
    window.dispatchEvent(new Event(ENGAGEMENT_EVENT))
    dismissNudgeForNow()
    window.localStorage.removeItem("prb:contribution-nudge-dismissed-at")
    toast.add({ title: "Reset", description: "Cleared engagement + dismissal test state." })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        Your real session right now:{" "}
        <span className="font-medium text-foreground">
          {realUser
            ? `signed in as ${realUser.name} (${realHasContributed ? "1+ contributions" : "0 contributions"})`
            : "anonymous"}
        </span>
        . The buttons below always reflect this real session — only the
        card&apos;s copy is controlled by the selector.
      </div>

      <div className="flex flex-wrap gap-2">
        {STATES.map((option) => (
          <Button
            key={option.value}
            type="button"
            size="lg"
            variant={state === option.value ? "default" : "outline"}
            onClick={() => setState(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-muted-foreground">Desktop / tablet (inline card)</h2>
          <div className="rounded-2xl border border-border p-4">
            {variant ? (
              <ContributionNudgeCard
                variant={variant}
                layout="inline"
                user={realUser}
                onDismiss={showDismiss ? handleDismiss : undefined}
              />
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No nudge appears. {reasonForNull(state)}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-muted-foreground">Mobile (bottom banner)</h2>
          <div className="mx-auto w-full max-w-[380px] rounded-[2rem] border border-border bg-background p-3 shadow-sm">
            {variant ? (
              <ContributionNudgeCard
                variant={variant}
                layout="banner"
                user={realUser}
                onDismiss={showDismiss ? handleDismiss : undefined}
              />
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No nudge appears. {reasonForNull(state)}
              </p>
            )}
          </div>
        </div>
      </div>

      <div>
        <Button type="button" variant="outline" size="lg" onClick={handleReset}>
          Reset real test state
        </Button>
      </div>
    </div>
  )
}

export { NudgeSandbox }
