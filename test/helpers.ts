import { bearingDegrees, haversineMeters } from '../src/domain/geo'
import type { Fix, LatLon, RadarLocation } from '../src/domain/types'

export const LOC_016: RadarLocation = {
  id: '016', name: 'M-10, dionica Podgorica - Cetinje', city: 'PODGORICA',
  lat: 42.38311111, lon: 19.10158333,
  type: 'SECTION_START', status: 'ZAVRSENO', functions: ['Mjerenje trenutne brzine'],
  sectionId: null, sectionRole: 'A',
}
export const LOC_017: RadarLocation = {
  id: '017', name: 'M-10, dionica Podgorica - Cetinje', city: 'PODGORICA',
  lat: 42.38605556, lon: 19.08097222,
  type: 'SECTION_END', status: 'NIJE_OBRADENA', functions: [],
  sectionId: null, sectionRole: 'B',
}
export const LOC_001: RadarLocation = {
  id: '001', name: 'Raskrsnica bulevara Mihaila Lalica', city: 'PODGORICA',
  lat: 42.44375, lon: 19.24581111,
  type: 'INTERSECTION_ENFORCEMENT', status: 'ZAVRSENO', functions: [],
  sectionId: null, sectionRole: null,
}

/** Interpolate a straight run, extended `overshootM` past the destination. */
export function drive(
  from: LatLon,
  to: LatLon,
  opts: { stepM?: number; overshootM?: number; speedMps?: number | null; accuracyM?: number; heading?: 'real' | null } = {},
): Fix[] {
  const stepM = opts.stepM ?? 50
  const overshoot = opts.overshootM ?? 0
  const speed = opts.speedMps === undefined ? 25 : opts.speedMps
  const acc = opts.accuracyM ?? 8
  const total = haversineMeters(from, to) + overshoot
  const n = Math.max(2, Math.ceil(total / stepM))
  const span = total / haversineMeters(from, to)
  const fixes: Fix[] = []
  let t = 1_700_000_000_000
  for (let i = 0; i <= n; i++) {
    const f = (i / n) * span
    const lat = from.lat + (to.lat - from.lat) * f
    const lon = from.lon + (to.lon - from.lon) * f
    const heading = opts.heading === null ? null : bearingDegrees(from, to)
    fixes.push({ lat, lon, headingDeg: heading, speedMps: speed, accuracyM: acc, t })
    t += 2000
  }
  return fixes
}

/** Start a run `metres` before `target`, on the line from `origin`. */
export function approachFrom(origin: LatLon, target: LatLon, metres: number): LatLon {
  const d = haversineMeters(origin, target)
  const f = (d - metres) / d
  return { lat: origin.lat + (target.lat - origin.lat) * f, lon: origin.lon + (target.lon - origin.lon) * f }
}

/** Move a point `eastM` east and `northM` north. Flat-earth, exact enough over a block. */
export function offsetMeters(from: LatLon, eastM: number, northM: number): LatLon {
  const dLat = northM / 111_132
  const dLon = eastM / (111_320 * Math.cos((from.lat * Math.PI) / 180))
  return { lat: from.lat + dLat, lon: from.lon + dLon }
}

/** A point radar at an arbitrary place, for geometry the real dataset does not happen to hold. */
export function radarAt(id: string, at: LatLon): RadarLocation {
  return { ...LOC_001, id, lat: at.lat, lon: at.lon }
}

/** Crawling in traffic: steps too short to derive a heading, and iOS reporting neither. */
export function crawl(from: LatLon, to: LatLon, fixes: number, stepM = 3): Fix[] {
  const d = haversineMeters(from, to)
  const out: Fix[] = []
  for (let i = 0; i < fixes; i++) {
    const f = (i * stepM) / d
    out.push({
      lat: from.lat + (to.lat - from.lat) * f,
      lon: from.lon + (to.lon - from.lon) * f,
      headingDeg: null,
      speedMps: null,
      accuracyM: 10,
      t: 1_700_000_000_000 + i * 1000,
    })
  }
  return out
}
