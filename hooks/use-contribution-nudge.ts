import * as React from "react"

const SESSION_START_KEY = "prb:session-start"
const SESSION_OPENS_KEY = "prb:session-resource-opens"
const DISMISSED_AT_KEY = "prb:contribution-nudge-dismissed-at"
const ENGAGEMENT_EVENT = "prb:engagement-changed"

/** Approximate, session-local engagement signals — either is enough to
 * consider a visitor "engaged" per the contribution nudge spec. */
const OPEN_COUNT_THRESHOLD = 3
const TIME_THRESHOLD_MS = 45_000
const DISMISS_SUPPRESS_MS = 7 * 24 * 60 * 60 * 1000
const POLL_INTERVAL_MS = 5_000

function readSessionStart(): number {
  const stored = window.sessionStorage.getItem(SESSION_START_KEY)
  if (stored) {
    return Number(stored)
  }
  const now = Date.now()
  window.sessionStorage.setItem(SESSION_START_KEY, String(now))
  return now
}

function readOpenCount(): number {
  return Number(window.sessionStorage.getItem(SESSION_OPENS_KEY) ?? "0")
}

/** Call whenever a resource is opened — feeds the "opened 2-3 resources" signal. */
export function recordResourceOpened(): void {
  if (typeof window === "undefined") {
    return
  }
  window.sessionStorage.setItem(SESSION_OPENS_KEY, String(readOpenCount() + 1))
  window.dispatchEvent(new Event(ENGAGEMENT_EVENT))
}

/** True once this session has crossed the "engaged" bar (resource opens or time
 * browsing) — independent of auth state, which callers layer on separately. */
export function useEngagement(): boolean {
  const [engaged, setEngaged] = React.useState(false)

  React.useEffect(() => {
    const sessionStart = readSessionStart()

    function check() {
      const elapsed = Date.now() - sessionStart
      setEngaged(readOpenCount() >= OPEN_COUNT_THRESHOLD || elapsed >= TIME_THRESHOLD_MS)
    }

    check()
    window.addEventListener(ENGAGEMENT_EVENT, check)
    const interval = window.setInterval(check, POLL_INTERVAL_MS)
    return () => {
      window.removeEventListener(ENGAGEMENT_EVENT, check)
      window.clearInterval(interval)
    }
  }, [])

  return engaged
}

/** Whether "Maybe later" was chosen within the last ~7 days — anonymous-only;
 * authenticated suppression instead comes from their real contribution count. */
export function isNudgeDismissed(): boolean {
  if (typeof window === "undefined") {
    return false
  }
  const stored = window.localStorage.getItem(DISMISSED_AT_KEY)
  if (!stored) {
    return false
  }
  return Date.now() - Number(stored) < DISMISS_SUPPRESS_MS
}

export function dismissNudgeForNow(): void {
  if (typeof window === "undefined") {
    return
  }
  window.localStorage.setItem(DISMISSED_AT_KEY, String(Date.now()))
}
