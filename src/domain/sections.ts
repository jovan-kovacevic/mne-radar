import { haversineMeters } from './geo'
import type { AlertTarget, RadarLocation, Section, Settings } from './types'

/**
 * Pair section endpoints. In the source document every POINT A is followed by its
 * POINT B at the next consecutive id, in the same municipality — a rule that must
 * hold for the pairing to be trusted, so an unpaired endpoint is returned rather
 * than silently guessed at. A wrong pairing invents an enforced corridor across
 * the wrong road.
 */
export function buildSections(locations: RadarLocation[]): {
  sections: Section[]
  unpaired: RadarLocation[]
} {
  const byId = [...locations].sort((a, b) => a.id.localeCompare(b.id))
  const sections: Section[] = []
  const unpaired: RadarLocation[] = []
  const used = new Set<string>()

  byId.forEach((loc, i) => {
    if (loc.type !== 'SECTION_START' || used.has(loc.id)) return
    const next = byId[i + 1]
    if (next && next.type === 'SECTION_END' && !used.has(next.id) && next.city === loc.city) {
      used.add(loc.id)
      used.add(next.id)
      sections.push({
        id: `S-${loc.id}-${next.id}`,
        city: loc.city,
        name: loc.name,
        start: loc,
        end: next,
        lengthM: haversineMeters(loc, next),
      })
    }
  })

  for (const loc of byId) {
    if ((loc.type === 'SECTION_START' || loc.type === 'SECTION_END') && !used.has(loc.id)) {
      unpaired.push(loc)
    }
  }
  return { sections, unpaired }
}

/** Sections become one target; everything else stays a point. */
export function buildTargets(
  locations: RadarLocation[],
  sections: Section[],
  settings: Settings,
): AlertTarget[] {
  const inSection = new Set(sections.flatMap((s) => [s.start.id, s.end.id]))
  const keep = (l: RadarLocation) => settings.includePlanned || l.status === 'ZAVRSENO'

  const targets: AlertTarget[] = []
  for (const s of sections) {
    if (keep(s.start) || keep(s.end)) targets.push({ kind: 'section', id: s.id, section: s })
  }
  for (const l of locations) {
    if (!inSection.has(l.id) && keep(l)) targets.push({ kind: 'point', id: l.id, location: l })
  }
  return targets
}
