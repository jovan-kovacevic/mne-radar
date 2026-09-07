import { alongAndCrossTrack, bearingDegrees, bearingDelta, haversineMeters, isAhead } from './geo'
import type { ActiveAlert, AlertTarget, EngineOutput, Fix, LatLon, Settings } from './types'

/** A fix worse than this tells us where we are but not accurately enough to warn on. */
export const MAX_ACCURACY_M = 100
/** Below this we are parked, walking, or stuck at a light — no new warnings. */
export const MIN_SPEED_MPS = 20 / 3.6
/**
 * How long a vehicle still counts as in motion after its last moving fix. One slow
 * fix in queued traffic is not "parked", and a queue at the very junction being
 * warned about must not be what silences the warning.
 */
export const MOVING_GRACE_MS = 15_000
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
 * The warning never shortens past this, however slowly the traffic is moving. Town
 * driving is stop-start, and a lead that tracked the speed all the way down would
 * hand the driver the warning after they had already stopped at the camera.
 */
export const MIN_LEAD_M = 200
/**
 * The corridor a point radar must sit in to be worth warning about, measured across
 * the line of travel: this half-width beside the driver, opening by CORRIDOR_SPREAD
 * for every metre down the road. A radar one street over is only a few degrees off
 * the bearing but a block away across it, and a cone could not tell those apart —
 * 500 m of one is 26 hectares of central Podgorica, or the full 78 with no heading.
 *
 * It opens with distance because a road is not a ray. On a 1 km bend a radar 400 m
 * ahead sits 80 m off the current tangent, and a corridor of constant width would
 * hold the warning back until the driver was almost on it. The spread is bounded by
 * what must stay out: at the reported 426 m the corridor is 83 m, still narrower
 * than the 110 m to the next street over.
 */
export const CORRIDOR_HALF_WIDTH_M = 40
/** How much the corridor opens per metre down the road — about 5.7 degrees. */
export const CORRIDOR_SPREAD = 0.1
/**
 * How far the driver must travel before the line between two fixes is a heading
 * rather than GPS noise. Measured from an anchor rather than the previous fix, so a
 * device sampling every half second still has a heading — under the old rule a fix
 * rate that outran this simply had none, and point warnings would never arm.
 */
export const HEADING_BASELINE_M = 15
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

export function createAlertEngine(targets: AlertTarget[], getSettings: () => Settings): AlertEngine {
  const states = new Map<string, TargetState>()
  /** Last position far enough back to take a heading from. */
  let headingAnchor: LatLon | null = null
  let derivedHeading: number | null = null
  let lastMovingT: number | null = null

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
    headingAnchor = null
    derivedHeading = null
    lastMovingT = null
  }

  function update(fix: Fix): EngineOutput {
    const settings = getSettings()
    const active: ActiveAlert[] = []
    const fired: string[] = []

    if (fix.accuracyM > MAX_ACCURACY_M) {
      // Still a position, just not one to warn on — and not one to take a heading from.
      return { active, fired }
    }

    if (headingAnchor === null) {
      headingAnchor = { lat: fix.lat, lon: fix.lon }
    } else if (haversineMeters(headingAnchor, fix) >= HEADING_BASELINE_M) {
      derivedHeading = bearingDegrees(headingAnchor, fix)
      headingAnchor = { lat: fix.lat, lon: fix.lon }
    }
    const reported =
      fix.headingDeg === null || Number.isNaN(fix.headingDeg) ? null : fix.headingDeg
    const heading = reported ?? derivedHeading

    // A null speed is unknown, not zero — unknown must not silence the app.
    const moving = fix.speedMps === null || fix.speedMps >= MIN_SPEED_MPS
    if (moving) lastMovingT = fix.t
    const movingEnough =
      moving || (lastMovingT !== null && fix.t - lastMovingT <= MOVING_GRACE_MS)
    const radius = settings.radiusM
    // An unknown speed falls back to the setting rather than to no warning at all.
    const leadM =
      fix.speedMps === null
        ? radius
        : Math.min(radius, Math.max(MIN_LEAD_M, fix.speedMps * WARNING_SECONDS))

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
            const corridorM = CORRIDOR_HALF_WIDTH_M + CORRIDOR_SPREAD * alongM
            // `d` as well as `alongM`, so the setting stays the ceiling it now claims
            // to be: the corridor opens sideways, and the driver chose a distance.
            if (alongM > 0 && alongM <= leadM && d <= radius && crossM <= corridorM) {
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

    active.sort((x, y) => x.distanceM - y.distanceM)
    return { active, fired }
  }

  return { update, reset, phaseOf: (id) => stateOf(id).phase }
}
