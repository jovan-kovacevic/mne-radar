import { alongAndCrossTrack, bearingDegrees, bearingDelta, haversineMeters, isAhead } from './geo'
import type { ActiveAlert, AlertTarget, EngineOutput, Fix, LatLon, Settings } from './types'

/** A fix worse than this tells us where we are but not accurately enough to warn on. */
export const MAX_ACCURACY_M = 100
/** Below this we are parked, walking, or stuck at a light — no new warnings. */
export const MIN_SPEED_MPS = 20 / 3.6
/** Half-angle of the cone counted as "ahead". Sections only — points use the corridor. */
export const AHEAD_HALF_ANGLE = 60
/**
 * How much warning is worth giving, in seconds. The distance follows from the speed,
 * so one number is right in town and on the open road: 111 m at 20 km/h, 278 m at
 * 50 km/h, 500 m at 90 km/h. That last figure is the default radius, which is why
 * this leaves motorway warnings exactly where they were and only shortens them in
 * town, where 500 m of notice was half a minute of red banner about a junction the
 * driver had not reached.
 */
export const WARNING_SECONDS = 20
/**
 * How far off the line of travel a point radar may sit and still be worth warning
 * about. A radar one street over is only a few degrees off the bearing but a block
 * away across it, and the cone could not tell those apart: 500 m of it is 26
 * hectares of central Podgorica, or the full 78 when the heading is unknown.
 *
 * Widened by the fix's own accuracy, because a position known to +/-10 m cannot
 * resolve a 40 m corridor any finer than that.
 */
export const CORRIDOR_HALF_WIDTH_M = 40
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
    // An unknown speed falls back to the setting rather than to no warning at all.
    const leadM =
      fix.speedMps === null ? radius : Math.min(radius, fix.speedMps * WARNING_SECONDS)
    const corridorM = CORRIDOR_HALF_WIDTH_M + fix.accuracyM

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
          // No heading, no point warning. Without a line of travel there is no
          // corridor to test, and warning about the whole circle instead is the
          // town noise itself, not a fail-safe.
          if (movingEnough && heading !== null) {
            const { alongM, crossM } = alongAndCrossTrack(heading, fix, loc)
            if (alongM > 0 && alongM <= leadM && crossM <= corridorM) {
              st.phase = 'APPROACHING'
              fired.push(target.id)
            }
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
        // A section keeps the cone and its no-heading fail-safe: missing the entry
        // gantry costs the driver the whole measured corridor, and these sit on open
        // road where there is no parallel street to confuse them with.
        const approachA = dA <= leadM && aheadA
        const approachB = dB <= leadM && aheadB
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
