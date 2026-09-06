import { bearingDegrees, bearingDelta, haversineMeters, isAhead } from './geo'
import type { ActiveAlert, AlertTarget, EngineOutput, Fix, LatLon, Settings } from './types'

/** A fix worse than this tells us where we are but not accurately enough to warn on. */
export const MAX_ACCURACY_M = 100
/** Below this we are parked, walking, or stuck at a light — no new warnings. */
export const MIN_SPEED_MPS = 20 / 3.6
/** Half-angle of the cone counted as "ahead". */
export const AHEAD_HALF_ANGLE = 60
/** Close enough to an endpoint to count as having reached it. */
export const ENTER_RADIUS_M = 75
/** Consecutive fixes of growing distance before we call a target passed. */
export const RECEDING_FIXES = 3

type Phase = 'IDLE' | 'APPROACHING' | 'INSIDE' | 'PASSED'

interface TargetState {
  phase: Phase
  receding: number
  lastDistance: number | null
  /** For a section: which endpoint we entered by. */
  entryRole: 'A' | 'B' | null
}

export interface AlertEngine {
  update(fix: Fix): EngineOutput
  reset(): void
  /** Exposed for tests and for the debug panel. */
  phaseOf(targetId: string): Phase
}

function derivedHeading(prev: LatLon | null, cur: LatLon): number | null {
  if (!prev) return null
  if (haversineMeters(prev, cur) < 5) return null
  return bearingDegrees(prev, cur)
}

export function createAlertEngine(targets: AlertTarget[], getSettings: () => Settings): AlertEngine {
  const states = new Map<string, TargetState>()
  let prevPoint: LatLon | null = null

  const stateOf = (id: string): TargetState => {
    let s = states.get(id)
    if (!s) {
      s = { phase: 'IDLE', receding: 0, lastDistance: null, entryRole: null }
      states.set(id, s)
    }
    return s
  }

  function reset() {
    states.clear()
    prevPoint = null
  }

  function update(fix: Fix): EngineOutput {
    const settings = getSettings()
    const active: ActiveAlert[] = []
    const fired: string[] = []

    if (fix.accuracyM > MAX_ACCURACY_M) {
      // Still a position, just not one to warn on.
      prevPoint = { lat: fix.lat, lon: fix.lon }
      return { active, fired }
    }

    const heading = fix.headingDeg ?? derivedHeading(prevPoint, fix)
    // A null speed is unknown, not zero — unknown must not silence the app.
    const movingEnough = fix.speedMps === null || fix.speedMps >= MIN_SPEED_MPS
    const radius = settings.radiusM

    for (const target of targets) {
      const st = stateOf(target.id)

      if (target.kind === 'point') {
        const loc = target.location
        const d = haversineMeters(fix, loc)

        if (st.phase === 'PASSED') {
          if (d > radius * 1.5) Object.assign(st, { phase: 'IDLE', receding: 0, lastDistance: null })
          st.lastDistance = d
          continue
        }

        if (st.phase === 'IDLE') {
          if (d <= radius && movingEnough && isAhead(heading, fix, loc, AHEAD_HALF_ANGLE)) {
            st.phase = 'APPROACHING'
            fired.push(target.id)
          }
        } else if (st.phase === 'APPROACHING') {
          const receding = st.lastDistance !== null && d > st.lastDistance
          st.receding = receding ? st.receding + 1 : 0
          const behind =
            heading !== null &&
            Math.abs(bearingDelta(heading, bearingDegrees(fix, loc))) > 90
          if (st.receding >= RECEDING_FIXES || behind || d > radius * 1.5) {
            st.phase = 'PASSED'
            st.receding = 0
          }
        }

        if (st.phase === 'APPROACHING') {
          active.push({
            targetId: target.id,
            kind: 'point',
            phase: 'APPROACHING',
            distanceM: d,
            location: loc,
            section: null,
          })
        }
        st.lastDistance = d
        continue
      }

      // --- section ---------------------------------------------------------
      const sec = target.section
      const dA = haversineMeters(fix, sec.start)
      const dB = haversineMeters(fix, sec.end)
      const near = Math.min(dA, dB)

      if (st.phase === 'PASSED') {
        if (near > radius * 1.5) Object.assign(st, { phase: 'IDLE', receding: 0, lastDistance: null, entryRole: null })
        st.lastDistance = near
        continue
      }

      if (st.phase === 'IDLE') {
        const aheadA = isAhead(heading, fix, sec.start, AHEAD_HALF_ANGLE)
        const aheadB = isAhead(heading, fix, sec.end, AHEAD_HALF_ANGLE)
        const approachA = dA <= radius && aheadA
        const approachB = dB <= radius && aheadB
        if (movingEnough && (approachA || approachB)) {
          st.phase = 'APPROACHING'
          st.entryRole = approachA && (!approachB || dA <= dB) ? 'A' : 'B'
          fired.push(target.id)
        }
      }

      if (st.phase === 'APPROACHING') {
        const entryDist = st.entryRole === 'B' ? dB : dA
        if (entryDist <= ENTER_RADIUS_M) {
          st.phase = 'INSIDE'
          st.receding = 0
          st.lastDistance = null
          fired.push(target.id)
        } else {
          const receding = st.lastDistance !== null && entryDist > st.lastDistance
          st.receding = receding ? st.receding + 1 : 0
          if (st.receding >= RECEDING_FIXES || entryDist > radius * 1.5) {
            st.phase = 'PASSED'
            st.receding = 0
          }
          st.lastDistance = entryDist
        }
      } else if (st.phase === 'INSIDE') {
        const exitDist = st.entryRole === 'B' ? dA : dB
        if (exitDist <= ENTER_RADIUS_M) {
          st.phase = 'PASSED'
        } else if (dA > sec.lengthM * 1.3 && dB > sec.lengthM * 1.3) {
          // Left the corridor without reaching the far end.
          st.phase = 'PASSED'
        }
      }

      if (st.phase === 'APPROACHING' || st.phase === 'INSIDE') {
        const exitDist = st.entryRole === 'B' ? dA : dB
        const entryDist = st.entryRole === 'B' ? dB : dA
        active.push({
          targetId: target.id,
          kind: 'section',
          phase: st.phase,
          distanceM: st.phase === 'INSIDE' ? exitDist : entryDist,
          location: st.entryRole === 'B' ? sec.end : sec.start,
          section: sec,
        })
      }
      if (st.phase === 'APPROACHING') st.lastDistance = st.entryRole === 'B' ? dB : dA
    }

    prevPoint = { lat: fix.lat, lon: fix.lon }
    active.sort((x, y) => x.distanceM - y.distanceM)
    return { active, fired }
  }

  return { update, reset, phaseOf: (id) => stateOf(id).phase }
}
