/**
 * How much of the country the nearby list shows.
 *
 * The list opens on the nearest handful, and every scroll to the bottom reveals
 * one more page, until every target is reachable. Nothing is revealed on its own:
 * the reveal happens on a scroll event, never on a position fix.
 *
 * The revealed count lives here, outside `renderNearby()`, because that function
 * is called on every fix — once a second while a Drive is armed — and a counter
 * held inside it would reset constantly.
 *
 * Ordering is frozen whenever the user is at the bottom of the list. Rows re-sort
 * by distance on every fix, and a row that moves while it is under the reader's
 * finger is the same complaint as BUG-001 in a smaller box. At the top of the
 * list the nearest-first order is the whole point, so scrolling back up hands
 * the ordering back to the driver's position. Distances keep updating either way.
 *
 * Reaching the bottom of an already fully revealed list still freezes: the
 * gesture is what arms it, not whether there were rows left to reveal.
 */
import { haversineMeters } from '../domain/geo'
import type { AlertTarget, LatLon, RadarLocation, Section } from '../domain/types'

/** Rows shown on open, and rows added by each scroll to the bottom. */
export const PAGE = 12

export interface NearbyRow {
  /** The target id — stable across fixes, which is what lets the DOM be reused. */
  id: string
  distanceM: number
  location: RadarLocation
  /** Set when this row stands for a whole average-speed corridor, not a point. */
  section: Section | null
}

export interface NearbyList {
  /**
   * The rows to show now: fresh distances, in live or frozen order.
   * `fromRealFix` is false while `fix` is still the fallback origin — an order
   * frozen against that is a ranking of Podgorica, not of the driver.
   */
  rows(fix: LatLon, targets: AlertTarget[], fromRealFix?: boolean): NearbyRow[]
  /** The user scrolled to the bottom. True when more rows became visible. */
  revealMore(total: number): boolean
  /** The user scrolled back to the top: order by distance again. */
  backToTop(): void
  /** How many rows are currently revealed. */
  readonly revealed: number
  /** 'frozen' while the user is reading past the first page. */
  readonly ordering: 'live' | 'frozen'
}

/** Distance to a point, or to the nearer end of a section. */
function measure(fix: LatLon, target: AlertTarget): NearbyRow {
  if (target.kind === 'point') {
    return { id: target.id, distanceM: haversineMeters(fix, target.location), location: target.location, section: null }
  }
  const s = target.section
  const distanceM = Math.min(haversineMeters(fix, s.start), haversineMeters(fix, s.end))
  return { id: target.id, distanceM, location: s.start, section: s }
}

export function createNearbyList(): NearbyList {
  let revealed = PAGE
  let frozenOrder: string[] | null = null
  /** Set by revealMore; the order itself is captured on the next render. */
  let freezeWanted = false
  /** True while the frozen order was ranked around the fallback origin. */
  let frozenBeforeFirstFix = false

  return {
    rows(fix, targets, fromRealFix = true) {
      // Someone who scrolls during the half-minute the GPS takes to answer froze
      // a list ranked around Podgorica. The first real fix is not "the user
      // moved" — it is the first time the ranking means anything, so it is
      // captured again rather than held.
      if (frozenOrder && frozenBeforeFirstFix && fromRealFix) {
        frozenOrder = null
        freezeWanted = true
      }

      const measured = targets.map((t) => measure(fix, t))
      const byDistance = [...measured].sort((a, b) => a.distanceM - b.distanceM)

      if (freezeWanted && !frozenOrder) {
        frozenOrder = byDistance.map((r) => r.id)
        frozenBeforeFirstFix = !fromRealFix
        freezeWanted = false
      }

      let ordered = byDistance
      if (frozenOrder) {
        const order = frozenOrder
        const rank = new Map(order.map((id, i) => [id, i]))
        // A target that has appeared since the freeze (a settings change rebuilds
        // them) has no rank, so it sorts after the frozen run rather than pushing
        // a row the user is reading out from under them.
        ordered = byDistance.sort((a, b) => (rank.get(a.id) ?? order.length) - (rank.get(b.id) ?? order.length))
      }
      return ordered.slice(0, Math.min(revealed, ordered.length))
    },

    revealMore(total) {
      // Arm the freeze on the gesture, before the "nothing left" exit. Reaching
      // the bottom of a fully revealed list is still someone reading down there,
      // and without this the freeze could never come back for the rest of the
      // session once all 61 rows were out.
      freezeWanted = true
      if (revealed >= total) return false
      revealed = Math.min(total, revealed + PAGE)
      return true
    },

    backToTop() {
      frozenOrder = null
      freezeWanted = false
      frozenBeforeFirstFix = false
    },

    get revealed() {
      return revealed
    },
    get ordering() {
      return frozenOrder || freezeWanted ? 'frozen' : 'live'
    },
  }
}

interface ScrollMetrics {
  scrollTop: number
  clientHeight: number
  scrollHeight: number
}

/** Within a row's height of the end — a thumb rarely lands on the exact pixel. */
export function atBottom(m: ScrollMetrics, slackPx = 32): boolean {
  return m.scrollTop + m.clientHeight >= m.scrollHeight - slackPx
}

export function atTop(m: ScrollMetrics, slackPx = 8): boolean {
  return m.scrollTop <= slackPx
}
