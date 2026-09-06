import { DEFAULT_SETTINGS, type Settings } from '../domain/types'

const KEY = 'mne-radars-settings-v1'

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    const parsed = JSON.parse(raw) as Partial<Settings>
    return {
      // Never inherit an "on" from a malformed value: this one must be a deliberate act.
      alertsEnabled: parsed.alertsEnabled === true,
      radiusM: [300, 500, 1000].includes(Number(parsed.radiusM))
        ? Number(parsed.radiusM)
        : DEFAULT_SETTINGS.radiusM,
      includePlanned: typeof parsed.includePlanned === 'boolean' ? parsed.includePlanned : DEFAULT_SETTINGS.includePlanned,
      soundOn: typeof parsed.soundOn === 'boolean' ? parsed.soundOn : DEFAULT_SETTINGS.soundOn,
      language: parsed.language === 'en' ? 'en' : 'me',
    }
  } catch {
    // Private mode, blocked storage, corrupt value — defaults are always usable.
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    // Not being able to remember a preference is not worth breaking a drive over.
  }
}
