import { describe, expect, it } from 'vitest'
import { buildSections, buildTargets } from '../src/domain/sections'
import { DEFAULT_SETTINGS, type RadarLocation } from '../src/domain/types'
import { LOC_001, LOC_016, LOC_017 } from './helpers'

const mk = (o: Partial<RadarLocation> & { id: string }): RadarLocation => ({
  name: 'test', city: 'PODGORICA', lat: 42.4, lon: 19.2,
  type: 'ROAD_ENFORCEMENT_POINT', status: 'ZAVRSENO', functions: [],
  sectionId: null, sectionRole: null, ...o,
})

describe('buildSections', () => {
  it('pairs a POINT A with the POINT B at the next id', () => {
    const { sections, unpaired } = buildSections([LOC_016, LOC_017])
    expect(sections).toHaveLength(1)
    expect(sections[0]!.start.id).toBe('016')
    expect(sections[0]!.end.id).toBe('017')
    expect(unpaired).toHaveLength(0)
  })

  it('measures the corridor length', () => {
    const { sections } = buildSections([LOC_016, LOC_017])
    expect(sections[0]!.lengthM).toBeGreaterThan(1690)
    expect(sections[0]!.lengthM).toBeLessThan(1760)
  })

  it('refuses to pair consecutive ids in different cities', () => {
    // The real trap: 040 is a POINT B in Kotor, 041 a POINT A in Budva.
    const b040 = mk({ id: '040', type: 'SECTION_END', city: 'KOTOR' })
    const a041 = mk({ id: '041', type: 'SECTION_START', city: 'BUDVA' })
    const b042 = mk({ id: '042', type: 'SECTION_END', city: 'BUDVA' })
    const { sections } = buildSections([b040, a041, b042])
    expect(sections).toHaveLength(1)
    expect(sections[0]!.start.id).toBe('041')
    expect(sections[0]!.end.id).toBe('042')
  })

  it('reports an endpoint it cannot pair instead of inventing a partner', () => {
    const orphan = mk({ id: '050', type: 'SECTION_START' })
    const point = mk({ id: '051', type: 'ROAD_ENFORCEMENT_POINT' })
    const { sections, unpaired } = buildSections([orphan, point])
    expect(sections).toHaveLength(0)
    expect(unpaired.map((u) => u.id)).toEqual(['050'])
  })

  it('never reuses an endpoint in two sections', () => {
    const a = mk({ id: '060', type: 'SECTION_START' })
    const b = mk({ id: '061', type: 'SECTION_END' })
    const c = mk({ id: '062', type: 'SECTION_END' })
    const { sections } = buildSections([a, b, c])
    expect(sections).toHaveLength(1)
    expect(sections.flatMap((s) => [s.start.id, s.end.id])).toEqual(['060', '061'])
  })
})

describe('buildTargets', () => {
  it('collapses each pair into one target and leaves points alone', () => {
    const { sections } = buildSections([LOC_016, LOC_017])
    const targets = buildTargets([LOC_016, LOC_017, LOC_001], sections, DEFAULT_SETTINGS)
    expect(targets).toHaveLength(2)
    expect(targets.filter((t) => t.kind === 'section')).toHaveLength(1)
    expect(targets.filter((t) => t.kind === 'point')).toHaveLength(1)
  })

  it('drops planned points when the driver asks for built ones only', () => {
    const planned = mk({ id: '070', status: 'NIJE_OBRADENA' })
    const built = mk({ id: '071', status: 'ZAVRSENO' })
    const targets = buildTargets([planned, built], [], { ...DEFAULT_SETTINGS, includePlanned: false })
    expect(targets.map((t) => t.id)).toEqual(['071'])
  })

  it('keeps a corridor whose entry is built and exit is only planned', () => {
    // 016 built, 017 planned — the driver is still measured from the built end.
    const { sections } = buildSections([LOC_016, LOC_017])
    const targets = buildTargets([LOC_016, LOC_017], sections, { ...DEFAULT_SETTINGS, includePlanned: false })
    expect(targets).toHaveLength(1)
    expect(targets[0]!.kind).toBe('section')
  })
})
