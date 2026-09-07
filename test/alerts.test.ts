import { describe, expect, it } from 'vitest'
import { createAlertEngine } from '../src/domain/alerts'
import { buildSections } from '../src/domain/sections'
import { haversineMeters } from '../src/domain/geo'
import { DEFAULT_SETTINGS, type AlertTarget, type Fix, type LatLon, type Settings } from '../src/domain/types'
import { LOC_001, LOC_016, LOC_017, approachFrom, crawl, drive, offsetMeters, radarAt } from './helpers'

const settings = (o: Partial<Settings> = {}) => () => ({ ...DEFAULT_SETTINGS, ...o })

const POINT: AlertTarget[] = [{ kind: 'point', id: LOC_001.id, location: LOC_001 }]
const SECTION_TARGET: AlertTarget[] = (() => {
  const { sections } = buildSections([LOC_016, LOC_017])
  return [{ kind: 'section', id: sections[0]!.id, section: sections[0]! }]
})()

function run(targets: AlertTarget[], fixes: Fix[], s = settings()) {
  const engine = createAlertEngine(targets, s)
  const fired: string[] = []
  const outputs = fixes.map((f) => {
    const o = engine.update(f)
    fired.push(...o.fired)
    return o
  })
  return { engine, fired, outputs }
}

describe('point alerts', () => {
  const origin = approachFrom({ lat: 42.4300, lon: 19.2800 }, LOC_001, 1200)

  it('warns once on approach, not once per fix', () => {
    const { fired } = run(POINT, drive(origin, LOC_001))
    expect(fired.filter((f) => f === LOC_001.id)).toHaveLength(1)
  })

  it('stays quiet until inside the alert radius', () => {
    const fixes = drive(origin, LOC_001, { stepM: 25 })
    const { outputs } = run(POINT, fixes)
    const firstAlertIndex = outputs.findIndex((o) => o.active.length > 0)
    const distanceAtFirstAlert = haversineMeters(fixes[firstAlertIndex]!, LOC_001)
    expect(distanceAtFirstAlert).toBeLessThanOrEqual(DEFAULT_SETTINGS.radiusM)
    expect(distanceAtFirstAlert).toBeGreaterThan(DEFAULT_SETTINGS.radiusM - 60)
  })

  it('clears the warning after the radar is passed and does not fire again', () => {
    const { fired, outputs } = run(POINT, drive(origin, LOC_001, { overshootM: 900 }))
    expect(fired.filter((f) => f === LOC_001.id)).toHaveLength(1)
    expect(outputs[outputs.length - 1]!.active).toHaveLength(0)
  })

  it('never fires while stationary, however much the fix jitters', () => {
    const jitter: Fix[] = Array.from({ length: 60 }, (_, i) => ({
      lat: LOC_001.lat + 0.0002 + (i % 5) * 0.00002,
      lon: LOC_001.lon + 0.0002 - (i % 3) * 0.00002,
      headingDeg: (i * 47) % 360,
      speedMps: 0,
      accuracyM: 12,
      t: 1_700_000_000_000 + i * 1000,
    }))
    expect(run(POINT, jitter).fired).toHaveLength(0)
  })

  it('ignores fixes too inaccurate to act on', () => {
    const { fired } = run(POINT, drive(origin, LOC_001, { accuracyM: 140 }))
    expect(fired).toHaveLength(0)
  })

  it('still warns when the device reports no heading at all', () => {
    const { fired } = run(POINT, drive(origin, LOC_001, { heading: null }))
    expect(fired).toContain(LOC_001.id)
  })

  it('still warns when the device reports no speed', () => {
    const { fired } = run(POINT, drive(origin, LOC_001, { speedMps: null }))
    expect(fired).toContain(LOC_001.id)
  })

  it('does not warn about a radar behind the driver', () => {
    const past = approachFrom(LOC_001, { lat: 42.4300, lon: 19.2800 }, -300)
    const away = drive(past, { lat: 42.4300, lon: 19.2800 })
    expect(run(POINT, away).fired).toHaveLength(0)
  })

  it('re-arms after a U-turn back towards the radar', () => {
    const engine = createAlertEngine(POINT, settings())
    for (const f of drive(origin, LOC_001, { overshootM: 1600 })) engine.update(f)
    const back = approachFrom({ lat: 42.4300, lon: 19.2800 }, LOC_001, 1200)
    let refired = 0
    for (const f of drive(back, LOC_001)) refired += engine.update(f).fired.length
    expect(refired).toBe(1)
  })
})

describe('average-speed sections', () => {
  const before = approachFrom({ lat: 42.3760, lon: 19.1300 }, LOC_016, 1200)

  it('is one target, not two radars', () => {
    expect(SECTION_TARGET).toHaveLength(1)
    expect(SECTION_TARGET[0]!.kind).toBe('section')
  })

  it('warns on approach, then again exactly once when measurement starts', () => {
    const fixes = [...drive(before, LOC_016, { stepM: 40 }), ...drive(LOC_016, LOC_017, { stepM: 40 })]
    const { fired } = run(SECTION_TARGET, fixes)
    expect(fired).toHaveLength(2)
  })

  it('holds the warning up for the whole measured corridor', () => {
    const fixes = [...drive(before, LOC_016, { stepM: 40 }), ...drive(LOC_016, LOC_017, { stepM: 40 })]
    const { outputs } = run(SECTION_TARGET, fixes)
    const inside = outputs.filter((o) => o.active.some((a) => a.phase === 'INSIDE'))
    // The corridor is 1.72 km at 40 m a step — the driver must not be told it is over.
    expect(inside.length).toBeGreaterThan(30)
  })

  it('counts down the distance still being measured, not the distance travelled', () => {
    const fixes = [...drive(before, LOC_016, { stepM: 40 }), ...drive(LOC_016, LOC_017, { stepM: 40 })]
    const { outputs } = run(SECTION_TARGET, fixes)
    const insideDistances = outputs
      .flatMap((o) => o.active.filter((a) => a.phase === 'INSIDE'))
      .map((a) => a.distanceM)
    expect(insideDistances[0]!).toBeGreaterThan(insideDistances[insideDistances.length - 1]!)
    expect(insideDistances[0]!).toBeGreaterThan(1500)
  })

  it('goes quiet at the exit gantry instead of firing a useless second alert', () => {
    const fixes = [
      ...drive(before, LOC_016, { stepM: 40 }),
      ...drive(LOC_016, LOC_017, { stepM: 40, overshootM: 600 }),
    ]
    const { fired, outputs } = run(SECTION_TARGET, fixes)
    expect(fired).toHaveLength(2)
    expect(outputs[outputs.length - 1]!.active).toHaveLength(0)
  })

  it('works when the corridor is driven from the far end', () => {
    const beyond = approachFrom({ lat: 42.3900, lon: 19.0500 }, LOC_017, 1000)
    const fixes = [...drive(beyond, LOC_017, { stepM: 40 }), ...drive(LOC_017, LOC_016, { stepM: 40 })]
    const { fired, outputs } = run(SECTION_TARGET, fixes)
    expect(fired).toHaveLength(2)
    expect(outputs.some((o) => o.active.some((a) => a.phase === 'INSIDE'))).toBe(true)
  })

  it('gives up on the corridor if the driver turns off it', () => {
    const fixes = [
      ...drive(before, LOC_016, { stepM: 40 }),
      ...drive(LOC_016, { lat: 42.3400, lon: 19.1600 }, { stepM: 60 }),
    ]
    const { outputs } = run(SECTION_TARGET, fixes)
    expect(outputs[outputs.length - 1]!.active).toHaveLength(0)
  })
})

describe('planned locations', () => {
  it('can be excluded from alerting by setting', () => {
    const { sections } = buildSections([LOC_016, LOC_017])
    const target: AlertTarget[] = [{ kind: 'section', id: sections[0]!.id, section: sections[0]! }]
    const before = approachFrom({ lat: 42.3760, lon: 19.1300 }, LOC_016, 1200)
    // 016 is built, so the corridor still alerts even with planned excluded.
    const { fired } = run(target, drive(before, LOC_016, { stepM: 40 }), settings({ includePlanned: false }))
    expect(fired.length).toBeGreaterThan(0)
  })
})

/**
 * The drive reported on 2026-09-07 in central Podgorica: town speed, a grid of
 * streets, and a radar on one of them the driver was never going to take.
 */
describe('a town street grid', () => {
  const TOWN_MPS = 25 / 3.6
  const START: LatLon = { lat: 42.4400, lon: 19.2500 }
  /** 1.6 km straight east — the street actually being driven. */
  const ALONG_STREET = offsetMeters(START, 1600, 0)
  /** 440 m away, but a block north: the reported false alert. */
  const PARALLEL = radarAt('P1', offsetMeters(START, 426, 110))
  /** 440 m away on the street being driven. */
  const ON_ROUTE = radarAt('R1', offsetMeters(START, 440, 0))

  const townDrive = (from = START) => drive(from, ALONG_STREET, { stepM: 20, speedMps: TOWN_MPS })

  it('places the two radars the same distance away, so only the street differs', () => {
    expect(haversineMeters(START, PARALLEL)).toBeGreaterThan(430)
    expect(haversineMeters(START, PARALLEL)).toBeLessThan(450)
    expect(haversineMeters(START, ON_ROUTE)).toBeCloseTo(440, -1)
  })

  it('does not warn about a radar a block over on a parallel street', () => {
    const target: AlertTarget[] = [{ kind: 'point', id: PARALLEL.id, location: PARALLEL }]
    expect(run(target, townDrive()).fired).toHaveLength(0)
  })

  it('still warns about a radar on the street being driven', () => {
    const target: AlertTarget[] = [{ kind: 'point', id: ON_ROUTE.id, location: ON_ROUTE }]
    const { fired, outputs } = run(target, townDrive())
    expect(fired).toEqual([ON_ROUTE.id])
    // In town the warning arrives on time, not 440 m and half a minute early.
    const first = outputs.find((o) => o.active.length > 0)!
    expect(first.active[0]!.distanceM).toBeLessThan(200)
    expect(first.active[0]!.distanceM / TOWN_MPS).toBeGreaterThan(10)
  })

  it('stays silent about point radars while crawling with no heading at all', () => {
    // iOS reports no heading and no speed below walking pace; the old fail-safe
    // then treated the whole 500 m circle as ahead.
    const behind = radarAt('B1', offsetMeters(START, -300, 320))
    const targets: AlertTarget[] = [
      { kind: 'point', id: PARALLEL.id, location: PARALLEL },
      { kind: 'point', id: behind.id, location: behind },
    ]
    expect(run(targets, crawl(START, ALONG_STREET, 40)).fired).toHaveLength(0)
  })

  it('warns a motorway driver at 90 km/h with the full radius to act on', () => {
    const MOTORWAY_MPS = 90 / 3.6
    const far = radarAt('M1', offsetMeters(START, 3000, 0))
    const target: AlertTarget[] = [{ kind: 'point', id: far.id, location: far }]
    const fixes = drive(START, far, { stepM: 25, speedMps: MOTORWAY_MPS })
    const { outputs } = run(target, fixes)
    const i = outputs.findIndex((o) => o.active.length > 0)
    expect(i).toBeGreaterThanOrEqual(0)
    const d = haversineMeters(fixes[i]!, far)
    expect(d).toBeGreaterThan(DEFAULT_SETTINGS.radiusM - 60)
    expect(d / MOTORWAY_MPS).toBeGreaterThan(15)
  })
})
