import './style.css'
import { loadDataset } from './data'
import { createAlertEngine } from './domain/alerts'
import { bearingDegrees, haversineMeters } from './domain/geo'
import { buildTargets } from './domain/sections'
import type { ActiveAlert, Fix, LatLon, Settings } from './domain/types'
import { createMap, sectionMidpoint } from './app/map'
import { createChime } from './app/sound'
import { loadSettings, saveSettings } from './app/settings'
import { formatDistance, shortName } from './app/format'
import { atBottom, atTop, createNearbyList, type NearbyRow } from './app/nearby'
import { functionLabel, t, typeLabel, type Lang } from './app/i18n'

const $ = <T extends HTMLElement>(id: string): T => {
  const el = document.getElementById(id)
  if (!el) throw new Error(`missing #${id}`)
  return el as T
}

const data = loadDataset()
if (data.issues.length) {
  // Loud in the console, never silent: a bad coordinate is a wrong warning.
  console.error('[radars] dataset validation issues', data.issues)
}

let settings: Settings = loadSettings()
let targets = buildTargets(data.locations, data.sections, settings)
let engine = createAlertEngine(targets, () => settings)
const chime = createChime(() => settings.soundOn)
const map = createMap($('map'), data, settings.language)

const nearby = createNearbyList()
let armed = false
let lastFix: Fix | null = null
let watchId: number | null = null
let wakeLock: WakeLockSentinel | null = null

const lang = (): Lang => settings.language

// --- rendering -------------------------------------------------------------

function renderChrome(): void {
  $('appName').textContent = t('appName', lang())
  $('armBtn').textContent = armed ? t('disarm', lang()) : t('arm', lang())
  $<HTMLButtonElement>('langBtn').textContent = lang() === 'me' ? 'EN' : 'CG'
  $('setTitle').textContent = t('settings', lang())
  $('lblRadius').textContent = t('alertRadius', lang())
  $('lblAlerts').textContent = t('enableAlerts', lang())
  $('lblSound').textContent = t('sound', lang())
  $('gateTitle').textContent = t('gateTitle', lang())
  $('gateLead').textContent = t('gateLead', lang())
  $('gateQuote').textContent = t('gateQuote', lang())
  $('gateRisk').textContent = t('gateRisk', lang())
  $('gateUnclear').textContent = t('gateUnclear', lang())
  $('gateAccept').textContent = t('gateAccept', lang())
  $('gateDecline').textContent = t('gateDecline', lang())
  $('closeSet').textContent = t('close', lang())
  $('coverage').textContent = t('coverageWarning', lang())
  const processed = data.locations.filter((l) => l.status === 'ZAVRSENO').length
  $('footnote').textContent =
    `${t('dataVintage', lang())} 01.09.2026 · ${data.locations.length} ${t('locations', lang())} · ` +
    `${data.sections.length} ${t('sections', lang())} · ${processed} ${t('processedNote', lang())}`
  $('attrib').textContent =
    `© OpenStreetMap contributors · ${data.source.split('·')[0]!.trim()} V8, 01.09.2026 · ${t('unofficial', lang())}`
  renderSettings()
}

function renderSettings(): void {
  const seg = $('radiusSeg')
  seg.innerHTML = ''
  for (const r of [300, 500, 1000]) {
    const b = document.createElement('button')
    b.type = 'button'
    b.textContent = `${r} m`
    b.className = settings.radiusM === r ? 'on' : ''
    b.onclick = () => { settings = { ...settings, radiusM: r }; persist() }
    seg.appendChild(b)
  }
  const alerts = $<HTMLButtonElement>('alertsToggle')
  alerts.textContent = settings.alertsEnabled ? t('on', lang()) : t('off', lang())
  alerts.className = `toggle ${settings.alertsEnabled ? 'on' : ''}`
  const sound = $<HTMLButtonElement>('soundToggle')
  sound.textContent = settings.soundOn ? t('on', lang()) : t('off', lang())
  sound.className = `toggle ${settings.soundOn ? 'on' : ''}`
}

function persist(): void {
  saveSettings(settings)
  targets = buildTargets(data.locations, data.sections, settings)
  engine = createAlertEngine(targets, () => settings)
  map.setLang(lang())
  renderChrome()
  renderNearby(lastFix ?? FALLBACK_ORIGIN, lastFix !== null)
}

function renderBanner(active: ActiveAlert[]): void {
  const banner = $('banner')
  const top = active[0]
  if (!top) {
    banner.hidden = true
    map.highlight(null)
    return
  }
  const isSection = top.kind === 'section'
  const inside = top.phase === 'INSIDE'
  banner.className = `banner ${isSection ? 'section' : ''} ${inside ? 'inside' : ''}`.trim()
  const kind = inside ? t('inSection', lang()) : isSection ? t('sectionAhead', lang()) : t('radarAhead', lang())
  const tail = inside ? ` ${t('toEnd', lang())}` : ''
  const fns = top.location.functions.slice(0, 3).map((f) => functionLabel(f, lang())).join(' · ')
  banner.innerHTML =
    `<div class="kind">${kind}</div>` +
    `<div class="dist">${formatDistance(top.distanceM, lang())}${tail}</div>` +
    `<div class="where">${shortName(top.location.name)}</div>` +
    (fns ? `<div class="what">${fns}</div>` : '')
  banner.hidden = false
  map.highlight(isSection ? top.targetId : null)
}

/** Podgorica, used only to have something on screen before the first fix. */
const FALLBACK_ORIGIN: LatLon = { lat: 42.44, lon: 19.26 }

/**
 * The list is rebuilt on every fix, so it never destroys what it can update.
 * Reusing the rows that are already there keeps the distances live without
 * touching the scroll offset — a rebuild mid-scroll is BUG-001 in a smaller box.
 */
function nearbyRowEl(r: NearbyRow): HTMLLIElement {
  const li = document.createElement('li')
  li.dataset.id = r.id
  const built = r.location.status === 'ZAVRSENO'
  const meta = r.section
    ? `${t('sectionAhead', lang())} · ${formatDistance(r.section.lengthM, lang())}`
    : typeLabel(r.location.type, lang())
  li.innerHTML =
    `<span class="d">${formatDistance(r.distanceM, lang())}</span>` +
    `<span class="txt"><span class="n">${shortName(r.location.name)}</span>` +
    `<span class="meta"><span class="dot ${built ? 'built' : 'planned'}"></span>${r.location.city} · ${meta}</span></span>`
  li.onclick = () => map.focus(r.section ? sectionMidpoint(r.section) : r.location, r.section ? 13 : 15)
  return li
}

/** The language the rows on screen were written in; a switch forces a rebuild. */
let renderedLang: Lang | null = null

function renderNearby(fix: LatLon, fromRealFix = true): void {
  const list = $<HTMLUListElement>('nearby')
  $('nearbyTitle').innerHTML = fromRealFix
    ? t('nearby', lang())
    : `${t('nearby', lang())} <span class="refpoint">· Podgorica</span>`
  const rows = nearby.rows(fix, targets)

  if (!rows.length) {
    const li = document.createElement('li')
    li.textContent = t('noneNearby', lang())
    list.replaceChildren(li)
    renderedLang = lang()
    return
  }

  const existing = Array.from(list.children) as HTMLLIElement[]
  const extendable =
    renderedLang === lang() &&
    existing.length <= rows.length &&
    existing.every((li, i) => li.dataset.id === rows[i]!.id)

  if (extendable) {
    // Same rows in the same order: only the distances have moved.
    existing.forEach((li, i) => {
      const d = li.querySelector('.d')
      if (d) d.textContent = formatDistance(rows[i]!.distanceM, lang())
    })
    for (const r of rows.slice(existing.length)) list.appendChild(nearbyRowEl(r))
    return
  }

  // A real rebuild — hold the scroll offset so the reader keeps their place.
  const offset = list.scrollTop
  list.replaceChildren(...rows.map(nearbyRowEl))
  list.scrollTop = offset
  renderedLang = lang()
}

function setStatus(msg: string): void {
  $('status').textContent = msg
}

// --- location --------------------------------------------------------------

function onPosition(pos: GeolocationPosition): void {
  const c = pos.coords
  handleFix({
    lat: c.latitude,
    lon: c.longitude,
    headingDeg: c.heading === null || Number.isNaN(c.heading) ? null : c.heading,
    speedMps: c.speed === null || Number.isNaN(c.speed) ? null : c.speed,
    accuracyM: c.accuracy,
    t: pos.timestamp,
  })
}

function handleFix(fix: Fix): void {
  lastFix = fix
  hideLocTrouble()
  map.showMe(fix, fix.accuracyM)
  renderNearby(fix)

  if (!armed) {
    setStatus(`±${Math.round(fix.accuracyM)} m`)
    return
  }
  if (!settings.alertsEnabled) {
    // Following the driver on the map is not warning them. Say which one this is.
    setStatus(`${t('mapOnly', lang())} · ±${Math.round(fix.accuracyM)} m`)
    return
  }
  const { active, fired } = engine.update(fix)
  for (const id of fired) {
    const wasInside = active.find((a) => a.targetId === id)?.phase === 'INSIDE'
    wasInside ? chime.enter() : chime.alert()
  }
  renderBanner(active)
  const kmh = fix.speedMps === null ? '—' : Math.round(fix.speedMps * 3.6)
  setStatus(`${t('armed', lang())} · ${kmh} km/h · ±${Math.round(fix.accuracyM)} m`)
}

function showLocTrouble(helpKey: string): void {
  $('locHelp').textContent = t(helpKey, lang())
  $<HTMLButtonElement>('locRetry').textContent = t('locRetry', lang())
  $('locTrouble').hidden = false
}

function hideLocTrouble(): void {
  $('locTrouble').hidden = true
}

function onPositionError(err: GeolocationPositionError): void {
  // Three different failures used to share one unreadable message. Each has a
  // different fix, and the driver is the only one who can apply it.
  if (err.code === err.PERMISSION_DENIED) {
    setStatus(t('locationDenied', lang()))
    showLocTrouble('locFixHelpDenied')
  } else if (err.code === err.TIMEOUT) {
    setStatus(t('locating', lang()))
    showLocTrouble('locFixHelpTimeout')
  } else {
    setStatus(t('locationUnavailable', lang()))
    showLocTrouble('locFixHelpUnavailable')
  }
}

function startWatching(): void {
  if (!('geolocation' in navigator)) { setStatus(t('locationUnavailable', lang())); return }
  if (!window.isSecureContext) {
    setStatus(t('insecure', lang()))
    showLocTrouble('locFixHelpInsecure')
    return
  }
  if (watchId !== null) return
  setStatus(t('locating', lang()))
  watchId = navigator.geolocation.watchPosition(onPosition, onPositionError, {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 30_000,
  })
}

async function acquireWakeLock(): Promise<void> {
  try {
    wakeLock = (await navigator.wakeLock?.request('screen')) ?? null
    wakeLock?.addEventListener('release', () => { wakeLock = null })
  } catch {
    // No wake lock means the screen will sleep — the drive still works while it is awake.
  }
}

// --- arming ----------------------------------------------------------------

function arm(): void {
  armed = true
  engine.reset()
  chime.prime()
  void acquireWakeLock()
  map.followMe(true)
  startWatching()
  $('armBtn').classList.add('armed')
  renderChrome()
}

function disarm(): void {
  armed = false
  map.followMe(false)
  map.highlight(null)
  $('banner').hidden = true
  void wakeLock?.release()
  wakeLock = null
  $('armBtn').classList.remove('armed')
  setStatus(t('idle', lang()))
  renderChrome()
}

function requestDrive(): void {
  if (armed) { disarm(); return }
  if (!settings.alertsEnabled && !sessionStorage.getItem('gate-seen')) {
    $('gate').hidden = false
    return
  }
  arm()
}

$('locRetry').onclick = () => {
  if (watchId !== null) { navigator.geolocation.clearWatch(watchId); watchId = null }
  hideLocTrouble()
  startWatching()
}

$('armBtn').onclick = requestDrive

// More of the country appears only because the user asked for it with a scroll —
// never because a fix arrived. Reaching the top hands the ordering back to distance.
const nearbyList = $<HTMLUListElement>('nearby')
nearbyList.addEventListener(
  'scroll',
  () => {
    if (atTop(nearbyList)) {
      nearby.backToTop()
      return
    }
    if (atBottom(nearbyList) && nearby.revealMore(targets.length)) {
      renderNearby(lastFix ?? FALLBACK_ORIGIN, lastFix !== null)
    }
  },
  { passive: true },
)
$('gateAccept').onclick = () => {
  sessionStorage.setItem('gate-seen', '1')
  settings = { ...settings, alertsEnabled: true }
  saveSettings(settings)
  $('gate').hidden = true
  persist()
  arm()
}
$('gateDecline').onclick = () => {
  sessionStorage.setItem('gate-seen', '1')
  $('gate').hidden = true
  arm()
}
$('alertsToggle').onclick = () => {
  if (settings.alertsEnabled) {
    settings = { ...settings, alertsEnabled: false }
    persist()
  } else {
    $('settings').hidden = true
    $('gate').hidden = false
  }
}
$('langBtn').onclick = () => { settings = { ...settings, language: lang() === 'me' ? 'en' : 'me' }; persist() }
$('setBtn').onclick = () => { $('settings').hidden = false }
$('closeSet').onclick = () => { $('settings').hidden = true }
$('soundToggle').onclick = () => { settings = { ...settings, soundOn: !settings.soundOn }; persist() }

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && armed && !wakeLock) void acquireWakeLock()
})

renderChrome()
setStatus(t('idle', lang()))
startWatching()
if (data.locations.length) renderNearby(FALLBACK_ORIGIN, false)

// --- simulated drive (dev only, ?sim=1) ------------------------------------
// Lets the alert path be seen at a desk. It feeds the same engine as a real
// fix, so what you watch here is the code that runs in the car.
if (new URLSearchParams(location.search).has('sim')) {
  const section = data.sections[0]
  const first = section ?? null
  if (first) {
    const { start, end } = first
    // Begin 900 m short of the entry, on the line running into it.
    const backF = -900 / haversineMeters(start, end)
    const from: LatLon = {
      lat: start.lat + (end.lat - start.lat) * backF,
      lon: start.lon + (end.lon - start.lon) * backF,
    }
    const to: LatLon = {
      lat: end.lat + (end.lat - start.lat) * (600 / haversineMeters(start, end)),
      lon: end.lon + (end.lon - start.lon) * (600 / haversineMeters(start, end)),
    }
    const totalM = haversineMeters(from, to)
    const stepM = 25
    const steps = Math.ceil(totalM / stepM)
    const bearing = bearingDegrees(from, to)
    let i = 0
    if (watchId !== null) { navigator.geolocation.clearWatch(watchId); watchId = null }
    map.focus(start, 14)
    // The simulator exists to show the alert path, so it opts in explicitly
    // rather than silently inheriting the consent gate's default.
    settings = { ...settings, alertsEnabled: true }
    sessionStorage.setItem('gate-seen', '1')
    arm()
    setInterval(() => {
      const f = Math.min(1, i / steps)
      handleFix({
        lat: from.lat + (to.lat - from.lat) * f,
        lon: from.lon + (to.lon - from.lon) * f,
        headingDeg: bearing,
        speedMps: 25,
        accuracyM: 6,
        t: Date.now(),
      })
      i = i >= steps ? 0 : i + 1
    }, 350)
  }
}
