import { describe, expect, it } from 'vitest'
import { createAlertEngine } from '../src/domain/alerts'
import { buildSections } from '../src/domain/sections'
import { haversineMeters } from '../src/domain/geo'
import { DEFAULT_SETTINGS, type AlertTarget, type Fix, type LatLon, type Settings } from '../src/domain/types'
import { LOC_001, LOC_016, LOC_017, approachFrom, arc, crawl, drive, drivePath, offsetMeters, radarAt } from './helpers'

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

  it('does not warn about that parallel street on a poor fix either', () => {
    // A position known only to +/-95 m is a reason to trust the corridor less, not a
    // reason to widen it: widening put the reported false alert straight back.
    const target: AlertTarget[] = [{ kind: 'point', id: PARALLEL.id, location: PARALLEL }]
    const fixes = townDrive().map((f) => ({ ...f, accuracyM: 95 }))
    expect(run(target, fixes).fired).toHaveLength(0)
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

/**
 * The corridor is the whole fix, so its edges are pinned here. Widening or narrowing
 * it silently would put back either the false alerts or the missed ones.
 */
describe('the corridor a point radar has to sit in', () => {
  const MOTORWAY_MPS = 90 / 3.6
  const START: LatLon = { lat: 42.4400, lon: 19.2500 }
  const AHEAD = offsetMeters(START, 3000, 0)

  const firstAlert = (across: number) => {
    const loc = radarAt('X', offsetMeters(START, 400, across))
    const fixes = drive(START, AHEAD, { stepM: 10, speedMps: MOTORWAY_MPS })
    const { outputs } = run([{ kind: 'point', id: loc.id, location: loc }], fixes)
    const i = outputs.findIndex((o) => o.active.length > 0)
    return i < 0 ? null : haversineMeters(fixes[i]!, loc)
  }

  it('warns about a radar well inside it', () => {
    expect(firstAlert(0)).toBeGreaterThan(390)
  })

  it('warns about a radar offset by less than the corridor opens to at that range', () => {
    // 400 m down the road the corridor is 40 + 40 = 80 m wide either side.
    expect(firstAlert(70)).not.toBeNull()
  })

  it('stays silent about a radar wider than that until the driver is nearer', () => {
    const d = firstAlert(120)
    expect(d === null || d < 300).toBe(true)
  })

  it('never warns about the next street over, at any point of the drive', () => {
    // Two blocks: far enough across that the corridor never reaches it.
    const loc = radarAt('Y', offsetMeters(START, 400, 220))
    const fixes = drive(START, AHEAD, { stepM: 10, speedMps: MOTORWAY_MPS })
    expect(run([{ kind: 'point', id: loc.id, location: loc }], fixes).fired).toHaveLength(0)
  })
})

describe('roads that are not straight lines', () => {
  const MOTORWAY_MPS = 90 / 3.6
  const START: LatLon = { lat: 42.3800, lon: 19.1000 }

  it('still gives a motorway driver time to act on a 1 km bend', () => {
    const path = arc(START, 90, 1000, 600, 25)
    const loc = radarAt('C1', path[path.length - 1]!)
    const fixes = drivePath(path, { speedMps: MOTORWAY_MPS })
    const { outputs } = run([{ kind: 'point', id: loc.id, location: loc }], fixes)
    const i = outputs.findIndex((o) => o.active.length > 0)
    expect(i).toBeGreaterThanOrEqual(0)
    const d = haversineMeters(fixes[i]!, loc)
    // A constant-width corridor held this back to about 200 m — under 8 s at 90 km/h.
    expect(d).toBeGreaterThan(330)
    expect(d / MOTORWAY_MPS).toBeGreaterThan(13)
  })
})

describe('what the engine does without a heading', () => {
  const START: LatLon = { lat: 42.4400, lon: 19.2500 }

  it('raises no point warning at all on the first fix of a drive', () => {
    // Nothing has been travelled yet, so there is no line of travel to test against.
    const loc = radarAt('N1', offsetMeters(START, 0, 300))
    const fix: Fix = { ...START, headingDeg: null, speedMps: null, accuracyM: 10, t: 1_700_000_000_000 }
    const { fired } = run([{ kind: 'point', id: loc.id, location: loc }], [fix])
    expect(fired).toHaveLength(0)
  })

  it('warns about the same radar the moment a heading is known', () => {
    const loc = radarAt('N1', offsetMeters(START, 0, 300))
    const fix: Fix = { ...START, headingDeg: 0, speedMps: null, accuracyM: 10, t: 1_700_000_000_000 }
    const { fired } = run([{ kind: 'point', id: loc.id, location: loc }], [fix])
    expect(fired).toEqual(['N1'])
  })

  it('takes a heading from the drive itself when the device never reports one', () => {
    // Half-second fixes at 28 km/h are 4 m apart: a heading read off consecutive
    // fixes would be GPS noise, and reading it off none at all was silence.
    const loc = radarAt('N2', offsetMeters(START, 400, 0))
    const path = arc(START, 90, 1e7, 400, 4)
    const fixes = drivePath(path, { speedMps: 8, heading: null, everyMs: 500 })
    expect(run([{ kind: 'point', id: loc.id, location: loc }], fixes).fired).toEqual(['N2'])
  })
})

describe('traffic that stops and starts', () => {
  const START: LatLon = { lat: 42.4400, lon: 19.2500 }

  it('warns a driver who slows to a crawl before reaching the warning distance', () => {
    // 25 km/h to 250 m out, then queued at 10 km/h to the stop line. The junction
    // being queued at is the one with the camera on it.
    const loc = radarAt('Q1', offsetMeters(START, 500, 0))
    const path = arc(START, 90, 1e7, 480, 10)
    const fixes = drivePath(path, { speedMps: 25 / 3.6, everyMs: 1440 }).map((f, i) =>
      i * 10 < 250 ? f : { ...f, speedMps: 10 / 3.6 },
    )
    expect(run([{ kind: 'point', id: loc.id, location: loc }], fixes).fired).toEqual(['Q1'])
  })

  it('still says nothing to a driver who has been stopped for a minute', () => {
    const loc = radarAt('Q2', offsetMeters(START, 300, 0))
    const path = arc(START, 90, 1e7, 200, 10)
    const moving = drivePath(path, { speedMps: 25 / 3.6, everyMs: 1440 })
    const parked: Fix[] = Array.from({ length: 60 }, (_, i) => ({
      ...moving[moving.length - 1]!,
      speedMps: 0,
      t: moving[moving.length - 1]!.t + (i + 1) * 1000,
    }))
    const { fired } = run([{ kind: 'point', id: loc.id, location: loc }], [...moving, ...parked])
    // It fires once on the approach and never again while sitting there.
    expect(fired).toEqual(['Q2'])
  })
})

describe('how far ahead the warning arrives', () => {
  const START: LatLon = { lat: 42.4400, lon: 19.2500 }
  const AHEAD = offsetMeters(START, 3000, 0)

  const leadAt = (mps: number) => {
    const loc = radarAt('L', offsetMeters(START, 900, 0))
    const fixes = drive(START, AHEAD, { stepM: 10, speedMps: mps })
    const { outputs } = run([{ kind: 'point', id: loc.id, location: loc }], fixes)
    const i = outputs.findIndex((o) => o.active.length > 0)
    return haversineMeters(fixes[i]!, loc)
  }

  it('is twenty seconds of driving at 50 km/h', () => {
    const d = leadAt(50 / 3.6)
    expect(d).toBeGreaterThan(265)
    expect(d).toBeLessThan(290)
  })

  it('stops shortening below the floor in slow traffic', () => {
    expect(leadAt(22 / 3.6)).toBeGreaterThan(190)
    expect(leadAt(22 / 3.6)).toBeLessThan(215)
  })

  it('is capped by the radius the driver chose', () => {
    expect(leadAt(120 / 3.6)).toBeLessThanOrEqual(DEFAULT_SETTINGS.radiusM)
  })
})

describe('what sections keep that points gave up', () => {
  const before = approachFrom({ lat: 42.3760, lon: 19.1300 }, LOC_016, 1200)

  it('warns on the entry gantry with no heading at all, where a point would stay silent', () => {
    // Missing a section entry costs the driver the whole measured corridor, so the
    // fail-safe stays here even though it was the town noise for point radars.
    const at = approachFrom({ lat: 42.3760, lon: 19.1300 }, LOC_016, 300)
    const fix: Fix = { ...at, headingDeg: null, speedMps: null, accuracyM: 10, t: 1_700_000_000_000 }
    expect(run(SECTION_TARGET, [fix]).fired).toHaveLength(1)
  })

  it('holds the same time-based lead as a point radar does', () => {
    const fixes = drive(before, LOC_016, { stepM: 10, speedMps: 25 / 3.6 })
    const { outputs } = run(SECTION_TARGET, fixes)
    const i = outputs.findIndex((o) => o.active.length > 0)
    const d = haversineMeters(fixes[i]!, LOC_016)
    expect(d).toBeGreaterThan(180)
    expect(d).toBeLessThan(215)
  })
})
