import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadSettings } from '../src/app/settings'

const store = new Map<string, string>()
vi.stubGlobal('localStorage', {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => { store.set(k, v) },
  removeItem: (k: string) => { store.delete(k) },
})

describe('settings', () => {
  beforeEach(() => store.clear())

  it('leaves alerts OFF for a first-time user', () => {
    expect(loadSettings().alertsEnabled).toBe(false)
  })

  it('only enables alerts for an explicit true, never a truthy value', () => {
    store.set('mne-radars-settings-v1', JSON.stringify({ alertsEnabled: 'yes' }))
    expect(loadSettings().alertsEnabled).toBe(false)
    store.set('mne-radars-settings-v1', JSON.stringify({ alertsEnabled: 1 }))
    expect(loadSettings().alertsEnabled).toBe(false)
    store.set('mne-radars-settings-v1', JSON.stringify({ alertsEnabled: true }))
    expect(loadSettings().alertsEnabled).toBe(true)
  })

  it('falls back to defaults on corrupt storage rather than throwing', () => {
    store.set('mne-radars-settings-v1', '{not json')
    expect(loadSettings().radiusM).toBe(500)
    expect(loadSettings().alertsEnabled).toBe(false)
  })

  it('rejects an out-of-range alert radius', () => {
    store.set('mne-radars-settings-v1', JSON.stringify({ radiusM: 99999 }))
    expect(loadSettings().radiusM).toBe(500)
  })
})
