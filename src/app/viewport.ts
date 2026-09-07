/**
 * Who owns the map viewport.
 *
 * Automatic recentring is a courtesy, not a right. The moment the driver pans,
 * zooms or opens a popup the app stops moving the map, and it stays stopped
 * until they ask for it back — reading a popup is never interrupted.
 *
 * The hold is deliberately sticky: a pan has no "I am done panning" event, so
 * clearing it on popupclose would make popups behave differently from every
 * other gesture. The only ways back are the centre control and arming a Drive,
 * both of them presses.
 */
export type ViewMove = 'none' | 'first-fix' | 'follow'

export interface ViewportPolicy {
  /** What a new position fix is allowed to do to the viewport. */
  onFix(): ViewMove
  /** The driver panned, zoomed, or opened a popup. */
  takeOver(): void
  /** The driver pressed "centre on me": the app may move the map again. */
  release(): void
  /** An armed Drive wants the map to track the driver. */
  setFollow(on: boolean): void
  /** True when the next fix will move the map — what the control reports. */
  readonly tracking: boolean
}

export function createViewportPolicy(): ViewportPolicy {
  let held = false
  let following = false
  let seenFix = false

  return {
    onFix() {
      const first = !seenFix
      seenFix = true
      // The first-fix courtesy expires the moment the driver is busy: it must
      // not fire later, out of nowhere, at a zoom they did not choose.
      if (held) return 'none'
      if (first) return 'first-fix'
      return following ? 'follow' : 'none'
    },
    takeOver() {
      held = true
    },
    release() {
      held = false
    },
    setFollow(on) {
      following = on
      // Pressing "start drive" is asking the app to take the map back.
      if (on) held = false
    },
    get tracking() {
      return following && !held
    },
  }
}
