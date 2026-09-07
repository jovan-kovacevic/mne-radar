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
  // The source document's own field, which records DESIGN progress, not whether a
  // camera exists: location 009 is ZAVRSENO and its legend reads "Nema kamera".
  built: { me: 'Obrađeno', en: 'Processed' },
  planned: { me: 'Nije obrađeno', en: 'Not processed' },
  processedNote: { me: 'obrađeno u dokumentu', en: 'processed in the document' },
  unofficial: { me: 'Nezvanično', en: 'Unofficial' },
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

  gateTitle: { me: 'Prije nego uključite upozorenja', en: 'Before you turn warnings on' },
  gateLead: {
    me: 'Član 23 Zakona o bezbjednosti saobraćaja na putevima propisuje:',
    en: 'Article 23 of the Road Traffic Safety Act provides:',
  },
  gateQuote: {
    me: '„U vozilu se u saobraćaju na putu ne smije koristiti niti nalaziti uređaj, odnosno sredstvo kojim se može otkrivati ili ometati rad uređaja za mjerenje brzine kretanja vozila, odnosno drugih uređaja namijenjenih za otkrivanje i dokumentovanje prekršaja.”',
    en: '“In a vehicle in traffic on a road, it is prohibited to use or to have a device, or means, capable of detecting or interfering with the operation of devices for measuring vehicle speed, or of other devices intended to detect and document offences.”',
  },
  gateRisk: {
    me: 'Zabranjeno je i samo držanje takvog sredstva u vozilu, ne samo korišćenje. Kazne uključuju novčanu kaznu, moguću kaznu zatvora, kaznene bodove i zabranu upravljanja vozilom. Zakon nalaže policiji da vozača liši slobode.',
    en: 'Merely having such a means in the vehicle is prohibited, not only using it. Penalties include a fine, possible imprisonment, penalty points and a driving ban. The law directs police to detain the driver.',
  },
  gateUnclear: {
    me: 'Nije riješeno da li se ovaj član odnosi na mapu zvanično objavljenih lokacija. Član govori o otkrivanju RADA uređaja, a ova aplikacija ne detektuje ništa — ali to nije potvrdio nijedan sud ni nadležni organ. Ovo nije pravni savjet.',
    en: 'Whether this article reaches a map of officially published locations is unresolved. It speaks of detecting the OPERATION of equipment, and this app detects nothing — but no court or authority has confirmed that. This is not legal advice.',
  },
  gateAccept: { me: 'Razumijem — uključi upozorenja', en: 'I understand — turn warnings on' },
  gateDecline: { me: 'Vozi bez upozorenja', en: 'Drive without warnings' },
  alertsOff: { me: 'Upozorenja isključena', en: 'Warnings off' },
  mapOnly: { me: 'Samo mapa', en: 'Map only' },
  enableAlerts: { me: 'Upozorenja', en: 'Warnings' },

  locFixHelpDenied: {
    me: 'Otvorite ikonu pored adrese u pregledaču → Lokacija → Dozvoli, pa osvježite stranicu.',
    en: 'Open the icon beside the address bar → Location → Allow, then reload the page.',
  },
  locFixHelpUnavailable: {
    me: 'Pregledač ima dozvolu, ali sistem ne daje lokaciju. Na macOS-u: Sistemska podešavanja → Privatnost i bezbjednost → Lokacijske usluge.',
    en: 'The browser has permission but the system is not providing a position. On macOS: System Settings → Privacy & Security → Location Services.',
  },
  locFixHelpInsecure: {
    me: 'Lokacija radi samo preko HTTPS ili preko localhost. Otvorite http://localhost:5177 umjesto IP adrese.',
    en: 'Location only works over HTTPS or on localhost. Open http://localhost:5177 instead of an IP address.',
  },
  locFixHelpTimeout: {
    me: 'Nema signala. Unutra zna potrajati — izađite napolje ili sačekajte.',
    en: 'No fix yet. Indoors this can take a while — go outside or wait.',
  },
  locRetry: { me: 'Pokušaj ponovo', en: 'Try again' },
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
