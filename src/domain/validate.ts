import { haversineMeters } from './geo'
import type { LocationStatus, LocationType, RadarLocation } from './types'

/** Montenegro, generously bounded. A coordinate outside this is a misread digit. */
export const MNE_BBOX = { minLat: 41.75, maxLat: 43.6, minLon: 18.4, maxLon: 20.4 }

const TYPES: LocationType[] = [
  'INTERSECTION_ENFORCEMENT',
  'ROAD_ENFORCEMENT_POINT',
  'SECTION_START',
  'SECTION_END',
]
const STATUSES: LocationStatus[] = ['ZAVRSENO', 'NIJE_OBRADENA']

export interface ValidationIssue {
  id: string
  field: string
  problem: string
}

export function validateLocations(locations: RadarLocation[]): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const seen = new Set<string>()

  for (const l of locations) {
    if (seen.has(l.id)) issues.push({ id: l.id, field: 'id', problem: 'duplicate id' })
    seen.add(l.id)

    if (!Number.isFinite(l.lat) || !Number.isFinite(l.lon)) {
      issues.push({ id: l.id, field: 'coords', problem: 'not a number' })
    } else if (
      l.lat < MNE_BBOX.minLat || l.lat > MNE_BBOX.maxLat ||
      l.lon < MNE_BBOX.minLon || l.lon > MNE_BBOX.maxLon
    ) {
      issues.push({ id: l.id, field: 'coords', problem: `outside Montenegro: ${l.lat}, ${l.lon}` })
    }

    if (!TYPES.includes(l.type)) issues.push({ id: l.id, field: 'type', problem: `unknown type ${l.type}` })
    if (!STATUSES.includes(l.status)) issues.push({ id: l.id, field: 'status', problem: `unknown status ${l.status}` })
    if (!l.name?.trim()) issues.push({ id: l.id, field: 'name', problem: 'empty' })
    if (!l.city?.trim()) issues.push({ id: l.id, field: 'city', problem: 'empty' })
  }

  // Two distinct locations at the same spot means a coordinate was copied.
  const sorted = [...locations].sort((a, b) => a.id.localeCompare(b.id))
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const a = sorted[i]!, b = sorted[j]!
      if (Math.abs(a.lat - b.lat) > 0.01) break
      if (haversineMeters(a, b) < 25) {
        issues.push({ id: a.id, field: 'coords', problem: `within 25 m of ${b.id}` })
      }
    }
  }

  return issues
}
