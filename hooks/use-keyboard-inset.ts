import * as React from "react"

function getKeyboardInset(): number {
  const viewport = window.visualViewport
  if (!viewport) {
    return 0
  }
  return Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
}

function subscribe(onChange: () => void) {
  const viewport = window.visualViewport
  if (!viewport) {
    return () => {}
  }
  viewport.addEventListener("resize", onChange)
  viewport.addEventListener("scroll", onChange)
  return () => {
    viewport.removeEventListener("resize", onChange)
    viewport.removeEventListener("scroll", onChange)
  }
}

function getServerSnapshot() {
  return 0
}

/** How much of the viewport's bottom edge the on-screen keyboard currently
 * covers. `position: fixed; bottom: 0` alone pins to the layout viewport,
 * which most mobile browsers don't shrink when the keyboard opens — so
 * fixed bottom-anchored UI needs this to shift up and stay above it. */
export function useKeyboardInset(): number {
  return React.useSyncExternalStore(subscribe, getKeyboardInset, getServerSnapshot)
}
