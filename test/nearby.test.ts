import { describe, expect, it } from 'vitest'
import { atBottom, atTop, createNearbyList, PAGE } from '../src/app/nearby'
import { loadDataset } from '../src/data'
import { buildTargets } from '../src/domain/sections'
import { DEFAULT_SETTINGS, type AlertTarget, type LatLon, type RadarLocation } from '../src/domain/types'
import { LOC_016, LOC_017 } from './helpers'

const ORIGIN: LatLon = { lat: 42.44, lon: 19.26 }

const point = (id: string, lat: number): AlertTarget => ({
  kind: 'point',
  id,
  location: {
    id, name: `point ${id}`, city: 'PODGORICA', lat, lon: ORIGIN.lon,
    type: 'ROAD_ENFORCEMENT_POINT', status: 'ZAVRSENO', functions: [],
    sectionId: null, sectionRole: null,
  } satisfies RadarLocation,
})

/** `n` points on one meridian, each 1 km further north than the last. */
const ladder = (n: number): AlertTarget[] =>
  Array.from({ length: n }, (_, i) => point(String(i).padStart(3, '0'), ORIGIN.lat + (i + 1) * 0.009))

const ids = (rows: { id: string }[]): string[] => rows.map((r) => r.id)

describe('nearby list paging', () => {
  it('opens on the nearest page, not the whole country', () => {
    const list = createNearbyList()
    const rows = list.rows(ORIGIN, ladder(61))
    expect(rows).toHaveLength(PAGE)
    expect(ids(rows)).toEqual(ladder(PAGE).map((t) => t.id))
  })

  it('reveals one more page per scroll to the bottom, and reaches every row', () => {
    const targets = ladder(61)
    const list = createNearbyList()
    let guard = 0
    while (list.revealMore(targets.length)) {
      expect(++guard).toBeLessThan(20)
    }
    expect(list.rows(ORIGIN, targets)).toHaveLength(61)
    expect(list.revealMore(targets.length)).toBe(false)
  })

  it('never reveals more than the targets there are', () => {
    const targets = ladder(5)
    const list = createNearbyList()
    expect(list.revealMore(targets.length)).toBe(false)
    expect(list.rows(ORIGIN, targets)).toHaveLength(5)
  })

  it('keeps what it revealed across a drive-worth of fixes', () => {
    const targets = ladder(61)
    const list = createNearbyList()
    list.revealMore(targets.length)
    // A fix every second or two for a minute: the render must not walk it back.
    for (let i = 0; i < 60; i++) {
      expect(list.rows({ lat: ORIGIN.lat + i * 0.0001, lon: ORIGIN.lon }, targets)).toHaveLength(PAGE * 2)
    }
    expect(list.revealed).toBe(PAGE * 2)
  })

  it('holds the order still once the user is reading past the first page', () => {
    const targets = ladder(61)
    const list = createNearbyList()
    list.revealMore(targets.length)
    const order = ids(list.rows(ORIGIN, targets))
    expect(list.ordering).toBe('frozen')

    // Drive 20 km north: the far end of the ladder is now the near end.
    const moved = { lat: ORIGIN.lat + 0.18, lon: ORIGIN.lon }
    expect(ids(list.rows(moved, targets))).toEqual(order)
  })

  it('still updates the distance on every frozen row', () => {
    const targets = ladder(61)
    const list = createNearbyList()
    list.revealMore(targets.length)
    const before = list.rows(ORIGIN, targets)
    const after = list.rows({ lat: ORIGIN.lat + 0.18, lon: ORIGIN.lon }, targets)
    expect(ids(after)).toEqual(ids(before))
    expect(after[0]!.distanceM).toBeGreaterThan(before[0]!.distanceM + 15_000)
  })

  it('sorts by distance again once the user scrolls back to the top', () => {
    const targets = ladder(61)
    const list = createNearbyList()
    list.revealMore(targets.length)
    const moved = { lat: ORIGIN.lat + 0.18, lon: ORIGIN.lon }
    list.rows(moved, targets)
    list.backToTop()
    expect(list.ordering).toBe('live')
    const rows = list.rows(moved, targets)
    // Still 24 revealed — going back to the top re-sorts, it does not re-collapse.
    expect(rows).toHaveLength(PAGE * 2)
    expect(rows[0]!.distanceM).toBeLessThan(rows[rows.length - 1]!.distanceM)
  })

  it('does not drop a row when the target set is rebuilt under a frozen list', () => {
    const targets = ladder(61)
    const list = createNearbyList()
    list.revealMore(targets.length)
    list.rows(ORIGIN, targets)
    const withNewcomer = [point('999', ORIGIN.lat + 0.0005), ...targets]
    const rows = list.rows(ORIGIN, withNewcomer)
    // The newcomer is the nearest of all, and still must not shove the row the
    // user is reading down the list.
    expect(rows[0]!.id).toBe('000')
    expect(rows).toHaveLength(PAGE * 2)
  })

  it('freezes again at the bottom of a list that is already fully revealed', () => {
    const targets = ladder(61)
    const list = createNearbyList()
    while (list.revealMore(targets.length)) { /* the user keeps scrolling */ }
    list.rows(ORIGIN, targets)
    list.backToTop()
    expect(list.ordering).toBe('live')

    // Scrolling back down to the bottom: revealMore has nothing left to reveal,
    // but the user is reading down there and the order must hold for them.
    expect(list.revealMore(targets.length)).toBe(false)
    const moved = { lat: ORIGIN.lat + 0.18, lon: ORIGIN.lon }
    const order = ids(list.rows(moved, targets))
    expect(list.ordering).toBe('frozen')
    expect(ids(list.rows({ lat: ORIGIN.lat + 0.36, lon: ORIGIN.lon }, targets))).toEqual(order)
  })

  it('re-ranks a list frozen before the first fix arrived', () => {
    const targets = ladder(61)
    const list = createNearbyList()
    // The GPS has not answered yet, so the list is ranked around the fallback
    // origin and the user scrolls anyway.
    list.revealMore(targets.length)
    const fallbackOrder = ids(list.rows(ORIGIN, targets, false))
    expect(fallbackOrder[0]).toBe('000')

    // The first real fix lands 20 km up the ladder: the frozen Podgorica ranking
    // is not the driver's, so it is thrown away and taken again from here.
    const real = { lat: ORIGIN.lat + 0.18, lon: ORIGIN.lon }
    const realOrder = ids(list.rows(real, targets, true))
    expect(realOrder).not.toEqual(fallbackOrder)
    expect(realOrder[0]).toBe('019')
    // And it holds from there, rather than re-sorting on every later fix.
    expect(ids(list.rows({ lat: ORIGIN.lat + 0.36, lon: ORIGIN.lon }, targets, true))).toEqual(realOrder)
  })

  it('still owes the driver a re-rank after several renders on the fallback origin', () => {
    const targets = ladder(61)
    const list = createNearbyList()
    list.revealMore(targets.length)
    const first = ids(list.rows(ORIGIN, targets, false))
    // Rendering again while the GPS is still silent must not launder the
    // Podgorica ranking into one that looks like the driver's.
    expect(ids(list.rows(ORIGIN, targets, false))).toEqual(first)

    // A settings change during the wait rebuilds the targets. The freeze still
    // holds, so a newcomer nearer than everything sorts after the rows the
    // reader is looking at rather than shoving them down.
    const withNewcomer = [point('999', ORIGIN.lat + 0.0005), ...targets]
    expect(ids(list.rows(ORIGIN, withNewcomer, false))[0]).toBe('000')

    const real = ids(list.rows({ lat: ORIGIN.lat + 0.18, lon: ORIGIN.lon }, targets, true))
    expect(real[0]).toBe('019')
    expect(real).not.toEqual(first)
  })

  it('measures a section from its nearer end and shows it as one row', () => {
    const list = createNearbyList()
    const targets = buildTargets([LOC_016, LOC_017], [
      { id: 'S-016-017', city: 'PODGORICA', name: LOC_016.name, start: LOC_016, end: LOC_017, lengthM: 1720 },
    ], DEFAULT_SETTINGS)
    const rows = list.rows({ lat: LOC_017.lat, lon: LOC_017.lon }, targets)
    expect(rows).toHaveLength(1)
    expect(rows[0]!.section?.id).toBe('S-016-017')
    expect(rows[0]!.distanceM).toBeLessThan(1)
  })

  it('reaches all 61 rows of the shipped dataset, sections counted once', () => {
    const data = loadDataset()
    const targets = buildTargets(data.locations, data.sections, DEFAULT_SETTINGS)
    expect(targets).toHaveLength(61)
    const list = createNearbyList()
    while (list.revealMore(targets.length)) { /* the user keeps scrolling */ }
    const rows = list.rows(ORIGIN, targets)
    expect(rows).toHaveLength(61)
    expect(new Set(ids(rows)).size).toBe(61)
    expect(rows.filter((r) => r.section !== null)).toHaveLength(data.sections.length)
  })
})

describe('scroll edges', () => {
  const m = (scrollTop: number, scrollHeight = 1000, clientHeight = 300) => ({ scrollTop, clientHeight, scrollHeight })

  it('counts the last thumb-width as the bottom', () => {
    expect(atBottom(m(700))).toBe(true)
    expect(atBottom(m(690))).toBe(true)
    expect(atBottom(m(500))).toBe(false)
  })

  it('counts only the very start as the top', () => {
    expect(atTop(m(0))).toBe(true)
    expect(atTop(m(40))).toBe(false)
  })
})
