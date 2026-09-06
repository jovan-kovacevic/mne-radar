export type Lang = 'me' | 'en'

type Dict = Record<string, { me: string; en: string }>

export const UI: Dict = {
  appName: { me: 'Radari Crna Gora', en: 'Montenegro Radars' },
  arm: { me: 'Počni vožnju', en: 'Start drive' },
  disarm: { me: 'Završi vožnju', en: 'End drive' },
  armed: { me: 'Vožnja aktivna', en: 'Drive active' },
  idle: { me: 'Mirovanje', en: 'Idle' },
  nearby: { me: 'U blizini', en: 'Nearby' },
  locating: { me: 'Tražim lokaciju…', en: 'Finding you…' },
  locationDenied: {
    me: 'Pristup lokaciji odbijen. Mapa i dalje radi.',
    en: 'Location denied. The map still works.',
  },
  locationUnavailable: { me: 'Lokacija nedostupna', en: 'Location unavailable' },
  insecure: { me: 'Lokacija zahtijeva HTTPS', en: 'Location needs HTTPS' },
  sectionAhead: { me: 'SEKCIJSKO MJERENJE', en: 'AVERAGE SPEED SECTION' },
  radarAhead: { me: 'RADAR', en: 'RADAR' },
  inSection: { me: 'MJERENJE U TOKU', en: 'BEING MEASURED' },
  toEnd: { me: 'do kraja', en: 'to the end' },
  sectionLength: { me: 'dužina', en: 'length' },
  built: { me: 'Postavljeno', en: 'Built' },
  planned: { me: 'Planirano', en: 'Planned' },
  settings: { me: 'Podešavanja', en: 'Settings' },
  alertRadius: { me: 'Upozori na', en: 'Warn at' },
  sound: { me: 'Zvuk', en: 'Sound' },
  showPlanned: { me: 'Uključi planirane', en: 'Include planned' },
  on: { me: 'Uklj.', en: 'On' },
  off: { me: 'Isklj.', en: 'Off' },
  close: { me: 'Zatvori', en: 'Close' },
  dataVintage: { me: 'Podaci od', en: 'Data as of' },
  coverageWarning: {
    me: 'Tišina ne znači da nema kontrole. Ovo je jedan program, ne sve kamere u Crnoj Gori.',
    en: 'Silence is not an all-clear. This is one programme, not every camera in Montenegro.',
  },
  locations: { me: 'lokacija', en: 'locations' },
  sections: { me: 'sekcija', en: 'sections' },
  noneNearby: { me: 'Nema lokacija u blizini', en: 'Nothing nearby' },
  enforces: { me: 'Kontroliše', en: 'Enforces' },
  km: { me: 'km', en: 'km' },
  m: { me: 'm', en: 'm' },
}

export const TYPE_LABELS: Dict = {
  INTERSECTION_ENFORCEMENT: { me: 'Raskrsnica', en: 'Intersection' },
  ROAD_ENFORCEMENT_POINT: { me: 'Tačka na putu', en: 'Road point' },
  SECTION_START: { me: 'Početak sekcije', en: 'Section start' },
  SECTION_END: { me: 'Kraj sekcije', en: 'Section end' },
}

/** The enforcement vocabulary as printed in the source document. */
export const FUNCTION_LABELS: Dict = {
  'Mjerenje trenutne brzine': { me: 'Trenutna brzina', en: 'Instant speed' },
  'Prolazak kroz crveno svjetlo': { me: 'Crveno svjetlo', en: 'Red light' },
  'Detekcija sigurnosnog pojasa': { me: 'Sigurnosni pojas', en: 'Seat belt' },
  'Detekcija upotrebe mobilnog telefona': { me: 'Mobilni telefon', en: 'Mobile phone' },
  'Detekcija kacige': { me: 'Kaciga', en: 'Helmet' },
  'Automatsko prepoznavanje registarskih oznaka': { me: 'Registarske oznake', en: 'Plate recognition' },
  'Detekcija vozila': { me: 'Detekcija vozila', en: 'Vehicle detection' },
  'Klasifikacija vozila': { me: 'Klasifikacija vozila', en: 'Vehicle classification' },
  'Vožnja u zabranjenom smjeru': { me: 'Zabranjeni smjer', en: 'Wrong way' },
  'Nepropisno kretanje po traci': { me: 'Kretanje po traci', en: 'Lane discipline' },
  'Nepropisno skretanje': { me: 'Nepropisno skretanje', en: 'Illegal turn' },
  'Nepropisno zaustavljanje i parkiranje': { me: 'Zaustavljanje i parkiranje', en: 'Stopping and parking' },
  'Nepropisno preticanje': { me: 'Nepropisno preticanje', en: 'Illegal overtaking' },
  'Pregledni i verifikacioni video': { me: 'Verifikacioni video', en: 'Verification video' },
  'Brojanje saobraćaja': { me: 'Brojanje saobraćaja', en: 'Traffic counting' },
}

export function t(key: string, lang: Lang): string {
  return UI[key]?.[lang] ?? key
}

export function typeLabel(type: string, lang: Lang): string {
  return TYPE_LABELS[type]?.[lang] ?? type
}

/** Unknown labels pass through as printed rather than being dropped. */
export function functionLabel(raw: string, lang: Lang): string {
  return FUNCTION_LABELS[raw]?.[lang] ?? raw
}
