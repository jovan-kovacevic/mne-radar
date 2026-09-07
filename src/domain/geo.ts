import type { LatLon } from './types'

const R = 6_371_008.8
const rad = (d: number) => (d * Math.PI) / 180
const deg = (r: number) => (r * 180) / Math.PI

export function haversineMeters(a: LatLon, b: LatLon): number {
  const dLat = rad(b.lat - a.lat)
  const dLon = rad(b.lon - a.lon)
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)))
}

/** Initial bearing from a to b, degrees clockwise from north in [0, 360). */
export function bearingDegrees(a: LatLon, b: LatLon): number {
  const dLon = rad(b.lon - a.lon)
  const la1 = rad(a.lat)
  const la2 = rad(b.lat)
  const y = Math.sin(dLon) * Math.cos(la2)
  const x = Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dLon)
  return (deg(Math.atan2(y, x)) + 360) % 360
}

/** Smallest signed angle from bearing a to bearing b, in (-180, 180]. */
export function bearingDelta(a: number, b: number): number {
  let d = ((b - a + 540) % 360) - 180
  if (d === -180) d = 180
  return d
}

/**
 * True when `to` lies within `halfAngle` degrees of the direction of travel.
 *
 * The null-heading fail-safe belongs to average-speed sections, where missing the
 * entry gantry costs the driver the whole measured corridor. Point radars use
 * `alongAndCrossTrack` instead: for them a missing heading turns this cone into the
 * whole circle, which is what filled central Podgorica with warnings about streets
 * the driver was never going to take.
 */
export function isAhead(headingDeg: number | null, from: LatLon, to: LatLon, halfAngle: number): boolean {
  // No heading means we cannot tell — warn rather than stay silent.
  if (headingDeg === null || Number.isNaN(headingDeg)) return true
  return Math.abs(bearingDelta(headingDeg, bearingDegrees(from, to))) <= halfAngle
}

/**
 * The offset to `to` split along and across the driver's line of travel: how far
 * down the road it lies, and how far off to the side.
 *
 * Cross-track is what tells a radar on this street from one on the next street
 * over. At 440 m the two sit a handful of degrees apart, so a bearing cone cannot
 * separate them, but they differ by the width of a city block across the line of
 * travel. `alongM` is negative for anything already behind.
 *
 * A flat projection of one bearing and one distance — exact to centimetres over the
 * few hundred metres an alert is decided across.
 */
export function alongAndCrossTrack(
  headingDeg: number,
  from: LatLon,
  to: LatLon,
): { alongM: number; crossM: number } {
  const d = haversineMeters(from, to)
  const off = rad(bearingDelta(headingDeg, bearingDegrees(from, to)))
  return { alongM: d * Math.cos(off), crossM: Math.abs(d * Math.sin(off)) }
}
