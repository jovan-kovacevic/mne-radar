/** A location is a place where enforcement happens — not a camera. See CONTEXT.md. */

export type LocationType =
  | 'INTERSECTION_ENFORCEMENT'
  | 'ROAD_ENFORCEMENT_POINT'
  | 'SECTION_START'
  | 'SECTION_END'

/**
 * As printed in the source document. What ZAVRSENO actually describes — a built
 * camera or a finished drawing — is still open (wayfinder ticket 02), so the app
 * shows the status but does not use it to silence warnings.
 */
export type LocationStatus = 'ZAVRSENO' | 'NIJE_OBRADENA'

export interface LatLon {
  lat: number
  lon: number
}

export interface RadarLocation extends LatLon {
  id: string
  name: string
  city: string
  type: LocationType
  status: LocationStatus
  functions: string[]
  /** Set on both endpoints of an average-speed section. */
  sectionId: string | null
  sectionRole: 'A' | 'B' | null
}

/** An average-speed corridor: two endpoints and the road between them. */
export interface Section {
  id: string
  city: string
  name: string
  start: RadarLocation
  end: RadarLocation
  lengthM: number
}

/**
 * What the alert engine tracks. A section is ONE target, not two — warning at the
 * entry and again at the exit tells the driver to brake and then accelerate through
 * the measured stretch.
 */
export type AlertTarget =
  | { kind: 'point'; id: string; location: RadarLocation }
  | { kind: 'section'; id: string; section: Section }

export interface Fix extends LatLon {
  /** Degrees clockwise from north, or null — commonly null below walking pace. */
  headingDeg: number | null
  /** Metres per second, or null. */
  speedMps: number | null
  accuracyM: number
  /** Epoch millis. */
  t: number
}

export type AlertPhase = 'APPROACHING' | 'INSIDE'

export interface ActiveAlert {
  targetId: string
  kind: 'point' | 'section'
  phase: AlertPhase
  /** Metres to the point, or to the end of the section while inside it. */
  distanceM: number
  location: RadarLocation
  section: Section | null
}

export interface EngineOutput {
  active: ActiveAlert[]
  /** Target ids that crossed into a new phase on this fix — the sound triggers. */
  fired: string[]
}

export interface Settings {
  /**
   * Alerts are OFF until the driver turns them on, having read what Article 23
   * of the Zakon o bezbjednosti saobracaja na putevima says. Whether a static
   * map of published locations is a "sredstvo" under that article is unresolved
   * (wayfinder ticket 03), and the penalty falls on the driver.
   */
  alertsEnabled: boolean
  radiusM: number
  includePlanned: boolean
  soundOn: boolean
  language: 'me' | 'en'
}

export const DEFAULT_SETTINGS: Settings = {
  alertsEnabled: false,
  radiusM: 500,
  includePlanned: true,
  soundOn: true,
  language: 'me',
}
