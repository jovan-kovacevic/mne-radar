import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { MAX_FUNCTIONS, bannerLines } from '../src/app/banner'
import type { ActiveAlert, RadarLocation, Section } from '../src/domain/types'
import { LOC_001, LOC_016, LOC_017 } from './helpers'
import type { Lang } from '../src/app/i18n'

/** A Podgorica intersection: the source document lists these by the dozen. */
const BUSY: RadarLocation = {
  ...LOC_001,
  id: '002',
  functions: [
    'Mjerenje trenutne brzine',
    'Prolazak kroz crveno svjetlo',
    'Detekcija sigurnosnog pojasa',
    'Detekcija upotrebe mobilnog telefona',
    'Detekcija kacige',
    'Automatsko prepoznavanje registarskih oznaka',
  ],
}

const SECTION: Section = {
  id: 'S1', city: 'PODGORICA', name: 'M-10, dionica Podgorica - Cetinje',
  start: LOC_016, end: LOC_017, lengthM: 17_400,
}

function alert(over: Partial<ActiveAlert> = {}): ActiveAlert {
  return {
    targetId: '001', kind: 'point', phase: 'APPROACHING',
    distanceM: 440, location: BUSY, section: null,
    ...over,
  }
}

/** Every shape the banner is ever asked to draw. */
const EVERY_SHAPE: ActiveAlert[] = [
  alert(),
  alert({ location: LOC_001 }), // nothing listed
  alert({ distanceM: 90 }),
  alert({ targetId: 'S1', kind: 'section', location: LOC_016, section: SECTION }),
  alert({ targetId: 'S1', kind: 'section', phase: 'INSIDE', distanceM: 1100, location: LOC_016, section: SECTION }),
]

const LANGS: Lang[] = ['me', 'en']

describe('what the alert banner says', () => {
  it('says the distance first, so an assertive live region reaches it', () => {
    for (const lang of LANGS) {
      for (const a of EVERY_SHAPE) expect(bannerLines(a, lang)[0]?.role).toBe('dist')
    }
  })

  it('puts nothing between the start of the announcement and the number', () => {
    // The region is rewritten on every fix, about once a second. Whatever is
    // spoken before the number is what cuts the number off.
    for (const lang of LANGS) {
      for (const a of EVERY_SHAPE) {
        const spokenFirst = bannerLines(a, lang)[0]!
        expect(spokenFirst.text).toMatch(/^\d/)
      }
    }
  })

  it('always says a distance, whatever the alert is', () => {
    for (const lang of LANGS) {
      for (const a of EVERY_SHAPE) {
        const dist = bannerLines(a, lang).find((l) => l.role === 'dist')
        expect(dist?.text).toMatch(/\d/)
      }
    }
  })

  it('never paints an empty line', () => {
    for (const lang of LANGS) {
      for (const a of EVERY_SHAPE) {
        for (const l of bannerLines(a, lang)) expect(l.text.trim()).not.toBe('')
      }
    }
  })

  it('paints the kind line topmost: it is the one nearest the edge that can be lost', () => {
    // Painted order is the reverse of this array — see .banner's column-reverse.
    for (const lang of LANGS) {
      for (const a of EVERY_SHAPE) expect(bannerLines(a, lang).at(-1)?.role).toBe('kind')
    }
  })

  it('names the kind, the place and what it catches, above the number', () => {
    expect(bannerLines(alert(), 'me').map((l) => l.role)).toEqual(['dist', 'what', 'where', 'kind'])
  })

  it('drops the function line rather than showing an empty strip', () => {
    expect(bannerLines(alert({ location: LOC_001 }), 'me').map((l) => l.role)).toEqual(['dist', 'where', 'kind'])
  })

  it('shows only the first three functions, because more cannot be read at speed', () => {
    const what = bannerLines(alert(), 'me').find((l) => l.role === 'what')!
    expect(what.text).toBe('Trenutna brzina · Crveno svjetlo · Sigurnosni pojas')
    expect(what.text.split(' · ')).toHaveLength(MAX_FUNCTIONS)
  })

  it('counts down to the end of a section while inside it', () => {
    const inside = EVERY_SHAPE[4]!
    expect(bannerLines(inside, 'me')[0]?.text).toBe('1.1 km do kraja')
    expect(bannerLines(inside, 'en')[0]?.text).toBe('1.1 km to the end')
    expect(bannerLines(inside, 'me').at(-1)?.text).toBe('MJERENJE U TOKU')
  })

  it('says how far to a section, not to its end, while still approaching it', () => {
    const ahead = EVERY_SHAPE[3]!
    expect(bannerLines(ahead, 'me')[0]?.text).toBe('440 m')
    expect(bannerLines(ahead, 'me').at(-1)?.text).toBe('SEKCIJSKO MJERENJE')
  })

  it('calls a point a radar', () => {
    expect(bannerLines(alert(), 'me').at(-1)?.text).toBe('RADAR')
  })

  it('trims the road prose so the place fits one line', () => {
    const where = bannerLines(alert({ location: LOC_016 }), 'me').find((l) => l.role === 'where')
    expect(where?.text).toBe('M-10, dionica Podgorica')
  })
})

/**
 * The stylesheet, asserted as text. Where the banner is anchored is the whole
 * fix for issue 20 and the one thing this project cannot run — no DOM harness
 * here, no iPhone — so the rule itself is pinned against a silent revert.
 */
const CSS = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8')

function rule(selector: string): string {
  const m = CSS.match(new RegExp(`\\n${selector.replace(/[.#[\]()*+?^$|\\{}]/g, '\\$&')} \\{([^}]*)\\}`))
  if (!m) throw new Error(`no rule for ${selector} in src/style.css`)
  return m[1]!
}

describe('where the alert banner is anchored', () => {
  it('hangs off the sheet, not off the top of the screen', () => {
    expect(rule('.banner')).toContain('bottom: var(--sheet-h)')
    expect(rule('.banner')).not.toMatch(/(^|[;\s])top:/)
  })

  it('ends exactly where the map ends, so it can never reach the browser chrome', () => {
    expect(rule('#map')).toContain('inset: 0 0 var(--sheet-h) 0')
  })

  it('asks nothing of a top inset that iOS Safari reports as 0', () => {
    expect(rule('.banner')).not.toContain('safe-area-inset-top')
  })

  it('is drawn over the map and the sheet', () => {
    expect(rule('.banner')).toContain('z-index: 900')
    expect(rule('#sheet')).toContain('z-index: 600')
    expect(rule('#map')).not.toContain('z-index')
  })

  it('is only ever as tall as its own lines, never a share of the screen', () => {
    expect(rule('.banner')).not.toContain('height')
  })

  it('paints the lines upward, so the number the DOM says first lands last', () => {
    expect(rule('.banner')).toContain('flex-direction: column-reverse')
  })

  it('still obeys the hidden attribute it sets itself, despite that display', () => {
    // An author `display` outranks the UA's `[hidden] { display: none }`, so
    // giving .banner a display without this leaves a finished drive's last
    // warning painted over the map for ever.
    expect(rule('.banner')).toContain('display:')
    expect(rule('.banner[hidden]')).toContain('display: none')
  })

  it('ends where the sheet begins: the sheet is exactly the gap it hangs off', () => {
    expect(rule('#sheet')).toContain('height: var(--sheet-h)')
  })

  it('lifts leaflet’s corner controls over itself instead of burying them', () => {
    expect(rule('.leaflet-bottom')).toContain('var(--banner-h')
    expect(rule('.leaflet-bottom.leaflet-right')).toContain('var(--banner-h')
  })

  it('refuses a selector that is not there, rather than checking nothing', () => {
    expect(() => rule('.no-such-thing')).toThrow()
  })
})
