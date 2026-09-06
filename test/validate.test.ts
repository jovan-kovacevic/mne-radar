import { describe, expect, it } from 'vitest'
import { validateLocations } from '../src/domain/validate'
import type { RadarLocation } from '../src/domain/types'
import { LOC_001, LOC_016, LOC_017 } from './helpers'

const mk = (o: Partial<RadarLocation> & { id: string }): RadarLocation => ({
  name: 'test', city: 'PODGORICA', lat: 42.4, lon: 19.2,
  type: 'ROAD_ENFORCEMENT_POINT', status: 'ZAVRSENO', functions: [],
  sectionId: null, sectionRole: null, ...o,
})

describe('validateLocations', () => {
  it('accepts real locations from the source document', () => {
    expect(validateLocations([LOC_001, LOC_016, LOC_017])).toEqual([])
  })

  it('rejects a coordinate outside Montenegro', () => {
    const issues = validateLocations([mk({ id: '001', lat: 45.1, lon: 19.2 })])
    expect(issues[0]!.field).toBe('coords')
  })

  it('catches a longitude digit dropped from 19.2 to 1.92', () => {
    const issues = validateLocations([mk({ id: '001', lon: 1.92 })])
    expect(issues).toHaveLength(1)
  })

  it('catches duplicate ids', () => {
    const issues = validateLocations([mk({ id: '001' }), mk({ id: '001', lat: 42.9 })])
    expect(issues.some((i) => i.problem === 'duplicate id')).toBe(true)
  })

  it('catches a coordinate copied from the previous page', () => {
    const issues = validateLocations([mk({ id: '001' }), mk({ id: '002' })])
    expect(issues.some((i) => i.problem.includes('within 25 m'))).toBe(true)
  })

  it('does not flag genuinely distinct nearby locations', () => {
    const issues = validateLocations([mk({ id: '001' }), mk({ id: '002', lat: 42.4009 })])
    expect(issues).toEqual([])
  })

  it('rejects an unknown type rather than passing it through', () => {
    const issues = validateLocations([mk({ id: '001', type: 'SPEED_TRAP' as never })])
    expect(issues.some((i) => i.field === 'type')).toBe(true)
  })
})
