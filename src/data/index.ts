import raw from './radars.json'
import { buildSections } from '../domain/sections'
import { validateLocations } from '../domain/validate'
import type { RadarLocation, Section } from '../domain/types'

export interface Dataset {
  locations: RadarLocation[]
  sections: Section[]
  unpaired: RadarLocation[]
  vintage: string
  source: string
  issues: ReturnType<typeof validateLocations>
}

interface RawFile {
  vintage: string
  source: string
  locations: RadarLocation[]
}

export function loadDataset(): Dataset {
  const file = raw as unknown as RawFile
  const locations = file.locations
  const issues = validateLocations(locations)
  const { sections, unpaired } = buildSections(locations)
  return { locations, sections, unpaired, vintage: file.vintage, source: file.source, issues }
}
