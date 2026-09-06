import { describe, expect, it } from 'vitest'
import { bearingDegrees, bearingDelta, haversineMeters, isAhead } from '../src/domain/geo'
import { LOC_016, LOC_017 } from './helpers'

describe('haversineMeters', () => {
  it('measures the real 016 to 017 section at about 1.72 km', () => {
    expect(haversineMeters(LOC_016, LOC_017)).toBeGreaterThan(1690)
    expect(haversineMeters(LOC_016, LOC_017)).toBeLessThan(1760)
  })

  it('is zero for identical points', () => {
    expect(haversineMeters(LOC_016, { ...LOC_016 })).toBe(0)
  })

  it('is symmetric', () => {
    expect(haversineMeters(LOC_016, LOC_017)).toBeCloseTo(haversineMeters(LOC_017, LOC_016), 6)
  })

  it('matches a known one-degree-of-latitude distance', () => {
    const d = haversineMeters({ lat: 42, lon: 19 }, { lat: 43, lon: 19 })
    expect(d).toBeGreaterThan(111_000)
    expect(d).toBeLessThan(111_400)
  })
})

describe('bearingDegrees', () => {
  it('reads due north as 0', () => {
    expect(bearingDegrees({ lat: 42, lon: 19 }, { lat: 43, lon: 19 })).toBeCloseTo(0, 5)
  })

  it('reads an eastward leg as an INITIAL bearing just under 90', () => {
    // A great circle heading east from 42N curves poleward, so its initial
    // bearing is 89.67, not 90. Asserting 90 would be asserting a rhumb line.
    expect(bearingDegrees({ lat: 42, lon: 19 }, { lat: 42, lon: 20 })).toBeCloseTo(89.67, 1)
  })
})

describe('bearingDelta', () => {
  it('wraps across north instead of taking the long way', () => {
    expect(bearingDelta(350, 10)).toBe(20)
    expect(bearingDelta(10, 350)).toBe(-20)
  })

  it('returns 180 for a reversal, never -180', () => {
    expect(bearingDelta(0, 180)).toBe(180)
    expect(bearingDelta(180, 0)).toBe(180)
  })

  it('is zero for identical bearings', () => {
    expect(bearingDelta(137, 137)).toBe(0)
  })
})

describe('isAhead', () => {
  it('treats a null heading as ahead, so a device without heading still warns', () => {
    expect(isAhead(null, LOC_016, LOC_017, 60)).toBe(true)
  })

  it('excludes a target behind the driver', () => {
    const north = bearingDegrees(LOC_016, LOC_017)
    expect(isAhead(north, LOC_016, LOC_017, 60)).toBe(true)
    expect(isAhead((north + 180) % 360, LOC_016, LOC_017, 60)).toBe(false)
  })
})
