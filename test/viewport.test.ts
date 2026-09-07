import { describe, expect, it } from 'vitest'
import { createViewportPolicy } from '../src/app/viewport'

/** A drive's worth of fixes, one every second or two. */
function fixes(p: ReturnType<typeof createViewportPolicy>, n: number): string[] {
  return Array.from({ length: n }, () => p.onFix())
}

describe('viewport policy', () => {
  it('centres on the first fix, because the country view says nothing', () => {
    const p = createViewportPolicy()
    expect(p.onFix()).toBe('first-fix')
  })

  it('does not move again after the first fix unless a drive is armed', () => {
    const p = createViewportPolicy()
    p.onFix()
    expect(fixes(p, 5)).toEqual(['none', 'none', 'none', 'none', 'none'])
  })

  it('follows every fix while armed', () => {
    const p = createViewportPolicy()
    p.onFix()
    p.setFollow(true)
    expect(fixes(p, 3)).toEqual(['follow', 'follow', 'follow'])
  })

  it('leaves an open popup alone for a whole armed drive', () => {
    const p = createViewportPolicy()
    p.onFix()
    p.setFollow(true)
    p.takeOver() // popupopen
    // 30 s at a fix every second, and the map never moves.
    expect(fixes(p, 30).every((m) => m === 'none')).toBe(true)
  })

  it('stays where a pan put it while armed', () => {
    const p = createViewportPolicy()
    p.onFix()
    p.setFollow(true)
    p.takeOver() // dragstart
    expect(p.onFix()).toBe('none')
  })

  it('stays where a zoom put it: no fix may reimpose a zoom level', () => {
    const p = createViewportPolicy()
    p.onFix()
    p.setFollow(true)
    p.takeOver() // zoomstart, e.g. zoomed out to see the whole route
    expect(fixes(p, 4).every((m) => m === 'none')).toBe(true)
  })

  it('suppresses the first-fix centre when the driver is already busy', () => {
    const p = createViewportPolicy()
    p.takeOver() // a popup opened in the first seconds after load
    expect(p.onFix()).toBe('none')
  })

  it('never fires the first-fix centre late, at a zoom the driver did not choose', () => {
    const p = createViewportPolicy()
    p.takeOver()
    p.onFix()
    p.release()
    p.setFollow(true)
    // Following resumes, but as a recentre — not as the zoom-13 first-fix jump.
    expect(p.onFix()).toBe('follow')
  })

  it('resumes following when the centre control is pressed during a drive', () => {
    const p = createViewportPolicy()
    p.onFix()
    p.setFollow(true)
    p.takeOver()
    p.release()
    expect(p.onFix()).toBe('follow')
  })

  it('does not start following from the centre control outside a drive', () => {
    const p = createViewportPolicy()
    p.onFix()
    p.takeOver()
    p.release()
    // The press recentres once; the map is not armed, so it must not track.
    expect(fixes(p, 3).every((m) => m === 'none')).toBe(true)
  })

  it('hands the map back when a drive is armed after panning around', () => {
    const p = createViewportPolicy()
    p.onFix()
    p.takeOver()
    p.setFollow(true)
    expect(p.onFix()).toBe('follow')
  })

  it('stops following when the drive ends', () => {
    const p = createViewportPolicy()
    p.onFix()
    p.setFollow(true)
    p.setFollow(false)
    expect(p.onFix()).toBe('none')
  })

  it('reports tracking only while the map will actually move on its own', () => {
    const p = createViewportPolicy()
    expect(p.tracking).toBe(false)
    p.setFollow(true)
    expect(p.tracking).toBe(true)
    p.takeOver()
    expect(p.tracking).toBe(false)
    p.release()
    expect(p.tracking).toBe(true)
    p.setFollow(false)
    expect(p.tracking).toBe(false)
  })
})
