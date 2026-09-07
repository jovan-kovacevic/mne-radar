import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Dataset } from '../data'
import type { LatLon, RadarLocation, Section } from '../domain/types'
import { functionLabel, t, typeLabel, type Lang } from './i18n'
import { createViewportPolicy } from './viewport'

export const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATTRIB = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
const MNE_CENTER: L.LatLngTuple = [42.75, 19.25]
const FIRST_FIX_ZOOM = 13

const CROSSHAIR = `<svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true"
  fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
  <circle cx="12" cy="12" r="6.2" /><circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none" />
  <path d="M12 2.2v3.1M12 18.7v3.1M2.2 12h3.1M18.7 12h3.1" /></svg>`

function pinIcon(loc: RadarLocation): L.DivIcon {
  const built = loc.status === 'ZAVRSENO'
  const isSection = loc.type === 'SECTION_START' || loc.type === 'SECTION_END'
  const size = built ? 14 : 12
  return L.divIcon({
    className: '',
    html: `<div class="pin ${built ? 'built' : 'planned'} ${isSection ? 'section' : ''}" style="width:${size}px;height:${size}px"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function popupHtml(loc: RadarLocation, lang: Lang): string {
  const fns = loc.functions
    .map((f) => `<span class="fn">${functionLabel(f, lang)}</span>`)
    .join('')
  const status = loc.status === 'ZAVRSENO'
    ? (lang === 'me' ? 'Postavljeno' : 'Built')
    : (lang === 'me' ? 'Planirano' : 'Planned')
  return `<div class="pop">
    <div class="t">${loc.id} · ${loc.name}</div>
    <div class="m">${loc.city} · ${typeLabel(loc.type, lang)} · ${status}</div>
    ${fns ? `<div class="fns">${fns}</div>` : ''}
  </div>`
}

export interface MapView {
  setLang(lang: Lang): void
  showMe(p: LatLon, accuracyM: number): void
  focus(p: LatLon, zoom?: number): void
  followMe(on: boolean): void
  highlight(sectionId: string | null): void
}

export function createMap(el: HTMLElement, data: Dataset, lang: Lang): MapView {
  const map = L.map(el, { zoomControl: false, attributionControl: true }).setView(MNE_CENTER, 8)
  L.control.zoom({ position: 'bottomright' }).addTo(map)
  L.tileLayer(TILE_URL, { maxZoom: 19, attribution: ATTRIB }).addTo(map)

  const sectionLines = new Map<string, L.Polyline>()
  for (const s of data.sections) {
    const line = L.polyline(
      [[s.start.lat, s.start.lon], [s.end.lat, s.end.lon]],
      { color: '#f0a63c', weight: 4, opacity: 0.55, dashArray: '1 7', lineCap: 'round' },
    ).addTo(map)
    sectionLines.set(s.id, line)
  }

  const markers: { marker: L.Marker; loc: RadarLocation }[] = []
  for (const loc of data.locations) {
    const m = L.marker([loc.lat, loc.lon], { icon: pinIcon(loc) })
      .bindPopup(popupHtml(loc, lang))
      .addTo(map)
    markers.push({ marker: m, loc })
  }

  let meMarker: L.Marker | null = null
  let meCircle: L.Circle | null = null
  let mePos: L.LatLngTuple | null = null

  const policy = createViewportPolicy()

  // Leaflet fires `zoomstart` for programmatic zooms as well as the driver's,
  // and defers it into a requestAnimationFrame, so a synchronous flag around
  // setView cannot tell the two apart. The first fix is the only zoom the app
  // performs uninvited, so one consume-once token covers it.
  let ownZoom = false

  const centreBtn = L.DomUtil.create('button', 'centre-ctl') as HTMLButtonElement
  centreBtn.type = 'button'
  centreBtn.innerHTML = CROSSHAIR
  L.DomEvent.disableClickPropagation(centreBtn)
  L.DomEvent.on(centreBtn, 'click', () => {
    policy.release()
    if (mePos) map.panTo(mePos, { animate: true })
    syncCentre()
  })
  // Added after the zoom control: Leaflet stacks bottom controls upwards, so
  // this sits above it.
  const centreControl = new L.Control({ position: 'bottomright' })
  centreControl.onAdd = () => centreBtn
  centreControl.addTo(map)

  function syncCentre(): void {
    const tracking = policy.tracking
    centreBtn.setAttribute('aria-pressed', tracking ? 'true' : 'false')
    centreBtn.classList.toggle('on', tracking)
  }

  function labelCentre(l: Lang): void {
    const label = t('centreOnMe', l)
    centreBtn.title = label
    centreBtn.setAttribute('aria-label', label)
  }

  /** The driver took the wheel; nothing moves the map until they hand it back. */
  function hold(): void {
    policy.takeOver()
    syncCentre()
  }

  map.on('dragstart', hold)
  map.on('popupopen', hold)
  // Leaflet's arrow-key pan goes through panBy, which fires no dragstart.
  L.DomEvent.on(map.getContainer(), 'keydown', (e) => {
    if ((e as KeyboardEvent).key.startsWith('Arrow')) hold()
  })
  map.on('zoomstart', () => {
    if (ownZoom) { ownZoom = false; return }
    hold()
  })

  labelCentre(lang)
  syncCentre()

  return {
    setLang(l) {
      for (const { marker, loc } of markers) marker.setPopupContent(popupHtml(loc, l))
      labelCentre(l)
    },
    showMe(p, accuracyM) {
      const ll: L.LatLngTuple = [p.lat, p.lon]
      if (!meMarker) {
        meMarker = L.marker(ll, {
          icon: L.divIcon({ className: '', html: '<div class="me-dot"></div>', iconSize: [16, 16], iconAnchor: [8, 8] }),
          zIndexOffset: 1000,
          interactive: false,
        }).addTo(map)
        meCircle = L.circle(ll, { radius: accuracyM, color: '#58b6c9', weight: 1, opacity: .35, fillOpacity: .07 }).addTo(map)
      } else {
        meMarker.setLatLng(ll)
        meCircle?.setLatLng(ll)
        meCircle?.setRadius(accuracyM)
      }
      mePos = ll
      const move = policy.onFix()
      if (move === 'first-fix') {
        // The country view says nothing useful; the first fix is where the driver is.
        ownZoom = map.getZoom() !== FIRST_FIX_ZOOM
        map.setView(ll, FIRST_FIX_ZOOM, { animate: true })
      } else if (move === 'follow') {
        // Recentre only. Forcing a zoom floor overrode a driver who had zoomed
        // out to see the whole route.
        map.panTo(ll, { animate: true })
      }
      syncCentre()
    },
    focus(p, zoom = 15) {
      // Asking to look at a location is taking the wheel: a following map must
      // not drag itself back off it a second later.
      hold()
      map.setView([p.lat, p.lon], zoom, { animate: true })
    },
    followMe(on) {
      policy.setFollow(on)
      syncCentre()
    },
    highlight(sectionId) {
      for (const [id, line] of sectionLines) {
        const on = id === sectionId
        line.setStyle({ opacity: on ? 1 : 0.55, weight: on ? 7 : 4, dashArray: on ? undefined : '1 7' })
      }
    },
  }
}

export function sectionMidpoint(s: Section): LatLon {
  return { lat: (s.start.lat + s.end.lat) / 2, lon: (s.start.lon + s.end.lon) / 2 }
}
