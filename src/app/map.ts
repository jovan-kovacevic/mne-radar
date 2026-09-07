import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Dataset } from '../data'
import type { LatLon, RadarLocation, Section } from '../domain/types'
import { functionLabel, typeLabel, type Lang } from './i18n'

export const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATTRIB = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
const MNE_CENTER: L.LatLngTuple = [42.75, 19.25]

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
  let follow = false
  let centredOnce = false

  return {
    setLang(l) {
      for (const { marker, loc } of markers) marker.setPopupContent(popupHtml(loc, l))
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
      if (!centredOnce) {
        // The country view says nothing useful; the first fix is where the driver is.
        centredOnce = true
        map.setView(ll, 13, { animate: true })
      } else if (follow) {
        map.setView(ll, Math.max(map.getZoom(), 14), { animate: true })
      }
    },
    focus(p, zoom = 15) {
      map.setView([p.lat, p.lon], zoom, { animate: true })
    },
    followMe(on) {
      follow = on
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
