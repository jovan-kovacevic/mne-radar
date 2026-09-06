# Montenegro Radars — Design

Date: 2026-09-06
Status: **superseded in part** — see the banner below

> **PARTLY INVALIDATED — 2026-09-06, after reading the full source document.**
>
> This spec was written having read 18 of 99 pages. Reading the rest broke it:
>
> - **§4.4's `type` union is wrong.** The document has four values, not two:
>   INTERSECTION ENFORCEMENT (5), ROAD ENFORCEMENT POINT (31),
>   AVERAGE SPEED CONTROL · POINT A (26), AVERAGE SPEED CONTROL · POINT B (26).
> - **52 of 88 records (59%) are average-speed section endpoints**, which this
>   spec does not model at all. §4.5 halts the build on an unmappable label, so
>   extraction cannot run as written.
> - **§5.2's alert machine is the wrong shape for them.** Corridors run 690 m to
>   2221 m. A point alert at POINT A tells the driver to brake and then
>   accelerate into the measured zone.
> - **§2's status string is wrong**: `Nije obrađena`, not `Nije obrađeno`. And
>   what `ZAVRŠENO` means — camera built, or drawing finished — is unresolved.
>
> Verified directly: p.24 loc 016 POINT A `ZAVRŠENO`; p.26 loc 017 POINT B
> `Nije obrađena`; 1.72 km apart.
>
> The live plan is the wayfinder map at `.scratch/radars/map.md`. Treat the
> sections below as a starting position, not decided.

## 1. Purpose

A web app that shows the user where traffic-enforcement radars are in
Montenegro relative to their current position, and warns them while
driving when they approach one.

Primary audience: drivers in Montenegro (locals and tourists).
Success condition: standing anywhere in Montenegro with location
permission granted, the user sees their position on a map with every
known radar, sorted by distance; while driving, they get an audible and
visual warning before reaching a radar that lies ahead of them.

## 2. Source data

`Radars.pdf` (28.8 MB, 99 pages) — "SAT-TRAKT · IDEJNO TEHNIČKO
RJEŠENJE", an AI traffic-monitoring technical design document.

Structure observed:

- 88 distinct locations, numbered `001`–`088`.
- Most locations occupy one page. Some have a second page titled
  "Grafički prikaz lokacije" (element layout over orthophoto). 99 pages
  total, so 11 locations carry the extra page.
- The PDF has **no text layer** (`pdftotext` yields 99 bytes = page
  separators only). Every page is a rendered image. Extraction is
  therefore a vision/OCR problem.

Fields present on a location page:

| Field | Example | Notes |
|---|---|---|
| ID | `001` | zero-padded, unique |
| Name | `Raskrsnica bulevara Mihaila Lalića, S.P. Cetinjskog i Džordža Vašingtona` | Montenegrin, may wrap 3 lines |
| City (`Grad`) | `PODGORICA`, `GUSINJE` | |
| GPS | `42.44375, 19.24581111` | appears twice per page (header + `Koordinate`) |
| Type (`Tip`) | `INTERSECTION ENFORCEMENT`, `ROAD ENFORCEMENT POINT` | closed set, confirm during extraction |
| Status | `ZAVRŠENO`, `Nije obrađeno` | built vs planned |
| AI functions | `Mjerenje trenutne brzine`, `Detekcija sigurnosnog pojasa`, `Prolazak kroz crveno svjetlo`, … | 0..n per location |
| Camera legend | `K.001.1 ENGINE CELERITAS MVD 2022I — LANE 3` | 0..n rows; some pages read `Nema kamera` |

The GPS value appearing twice per page is exploited as a free
consistency check during extraction.

## 3. Product decisions (settled with the user)

1. **Live driving alerts (PWA)**, not just a static map.
2. **Static PWA, no backend.** Data baked into the bundle. Data updates
   mean re-running extraction, committing, redeploying.
3. **Leaflet + OpenStreetMap raster tiles.** No API key, no signup.
   Accepted trade-off: OSM's tile usage policy discourages heavy
   traffic; if the app gets popular the tile URL must move to a paid
   provider. This is a one-line change, isolated behind a config
   constant.
4. **All 88 locations shipped, visually distinct by status.** Built
   (`ZAVRŠENO`) render solid; planned (`Nije obrađeno`) render hollow.
   Alerts fire for built locations by default; a setting lets the user
   include planned ones.
5. **Montenegrin default, English toggle.** Persisted.
6. **Heading-aware, tunable alerts.** Warn only when the radar lies
   ahead; radius and sound are user-settable.

## 4. Data extraction pipeline

Safety-critical: a mis-read digit moves a radar up to ~1 km. The
pipeline is built for detection of its own errors, not for speed.

### 4.1 Render

`pdftoppm -r 200 -png` over all 99 pages into a scratch directory
(not committed). 200 DPI chosen so the small grey `Koordinate` text is
legible; the adjudication step re-renders disputed pages at 400 DPI.

### 4.2 Double-blind read

Every page is read by two independent agents that never see each
other's output. Each emits a JSON object per the schema in §4.4.
Agents are instructed to return `null` for a field they cannot read
rather than guess.

### 4.3 Adjudication

Fields where the two reads disagree (or either returned `null`) go to a
third agent that re-reads only that page at 400 DPI and only that
field. If the adjudicator cannot resolve it, the field is recorded as
`null` and the location is listed in an `EXTRACTION_ISSUES.md` report
for human resolution. Nothing is silently guessed.

### 4.4 Record schema

```ts
type Radar = {
  id: string            // "001"
  name: string          // Montenegrin, as printed
  city: string          // "PODGORICA"
  lat: number           // 42.44375
  lon: number           // 19.24581111
  type: 'INTERSECTION_ENFORCEMENT' | 'ROAD_ENFORCEMENT_POINT'
  status: 'BUILT' | 'PLANNED'
  functions: string[]   // normalized enum keys, see §4.5
  cameraCount: number   // 0 when "Nema kamera"
}
```

### 4.5 Function normalization

The AI-function labels are a closed Montenegrin vocabulary. They are
mapped to stable enum keys (`INSTANT_SPEED`, `RED_LIGHT`, `SEAT_BELT`,
`MOBILE_PHONE`, `HELMET`, `ANPR`, `VEHICLE_DETECTION`,
`VEHICLE_CLASSIFICATION`, `WRONG_WAY`, `LANE_VIOLATION`, `NO_TURN`,
`ILLEGAL_STOPPING`, `ILLEGAL_OVERTAKING`, `TRAFFIC_COUNTING`,
`REVIEW_VIDEO`). The exact set is finalized from the extracted corpus;
any label that fails to map halts the build rather than being dropped.

### 4.6 Validators (run in CI; failure blocks the build)

- Every coordinate inside Montenegro's bbox: lat 41.75–43.60,
  lon 18.40–20.40.
- IDs form the complete run `001`–`088`, no gaps, no duplicates.
- No two distinct IDs closer than 25 m (catches a coordinate copied
  from the previous page).
- Header GPS equals `Koordinate` GPS for the same page.
- `city` is consistent with the coordinate: the point must fall within
  50 km of the named municipality's centroid (a small static lookup of
  Montenegrin municipality centroids ships with the validator).
- `type`, `status`, and every entry in `functions` are members of their
  enums.

The output artifact is `src/data/radars.json`, committed. The scratch
PNGs and the PDF are **not** committed (`Radars.pdf` is 28.8 MB and is
a third-party technical document).

## 5. Application architecture

Small, isolated modules. Geo math and alert logic contain no DOM or
browser API references so they are testable as pure functions.

```
src/
  data/radars.json          generated, schema-validated
  domain/
    geo.ts                  haversine, bearing, bearingDelta — pure
    alerts.ts               alert state machine — pure
    types.ts                Radar, Settings, AlertState
  app/
    map.ts                  Leaflet init, markers, clustering, recentring
    location.ts             watchPosition wrapper, permission states
    alerts-ui.ts            banner, sound, vibration, wake lock
    nearby.ts               distance-sorted list
    settings.ts             localStorage-backed settings store
    i18n.ts                 strings, language toggle
  main.ts                   composition root
```

### 5.1 Geo module (`domain/geo.ts`)

Pure functions, no state:

- `haversineMeters(a, b)` — great-circle distance.
- `bearingDegrees(from, to)` — initial bearing, 0–360.
- `bearingDelta(a, b)` — smallest signed angle between two bearings,
  −180..180. Handles wraparound at 0/360.

### 5.2 Alert state machine (`domain/alerts.ts`)

One state per radar, advanced by each position fix. Input is a
position fix (`lat`, `lon`, `heading`, `speed`, `accuracy`) plus
settings; output is a list of alerts to raise or clear. No timers, no
side effects — the caller owns those. This makes every scenario a unit
test.

States: `IDLE → APPROACHING → WARNED → PASSED → IDLE`.

Transitions:

- `IDLE → APPROACHING` when distance ≤ settings.radius AND the radar is
  ahead AND speed ≥ 20 km/h.
- "ahead" means `|bearingDelta(heading, bearingToRadar)| ≤ 60°`.
- `APPROACHING → WARNED` fires the alert once. Re-firing is impossible
  until the state returns to `IDLE`.
- `→ PASSED` when distance starts increasing for 3 consecutive fixes,
  or the bearing delta exceeds 90°.
- `PASSED → IDLE` when distance > radius × 1.5. The hysteresis stops
  a radar re-alerting while the user idles at a light next to it.

Guards against bad GPS:

- Fixes with `accuracy > 100 m` are ignored for alerting (still used
  for map display).
- `heading` is `null` when stationary on most devices; when heading is
  unavailable the machine falls back to a heading derived from the last
  two fixes, and if that is unavailable it treats every radar as ahead
  (fails safe — warns rather than stays silent).
- Speed below 20 km/h suppresses alerts (walking, parked).

### 5.3 Map (`app/map.ts`)

Leaflet 1.9, OSM raster tiles behind a single `TILE_URL` constant.
88 markers; Podgorica is dense, so `leaflet.markercluster` groups them
below zoom 13. Built radars: filled marker. Planned: hollow marker,
lower opacity. User position: distinct pulsing marker with an accuracy
circle. Tapping a marker opens a detail sheet (name, city, type,
status, functions, camera count, distance from user).

### 5.4 Location (`app/location.ts`)

`navigator.geolocation.watchPosition` with `enableHighAccuracy: true`.
Explicit handling for: permission denied, permission prompt pending,
position unavailable, timeout, and insecure context (geolocation
requires HTTPS — localhost excepted). Each state has its own message in
both languages; the app remains usable as a plain map when location is
refused.

Alerts are armed by an explicit "Start drive" control, not on page
load. Arming acquires a screen wake lock and starts audio; disarming
releases both. This is deliberate: continuous high-accuracy GPS is a
battery cost the user should opt into.

### 5.5 Settings (`app/settings.ts`)

localStorage-backed, defaults in code:

| Setting | Default | Values |
|---|---|---|
| `radiusMeters` | 500 | 300, 500, 1000 |
| `sound` | on | on / off |
| `includePlanned` | off | on / off |
| `language` | `me` | `me` / `en` |

### 5.6 i18n (`app/i18n.ts`)

A flat `Record<key, {me: string, en: string}>`. Radar *names* stay in
Montenegrin in both languages — they are proper place names. Field
labels, statuses, types, AI-function names, and UI chrome are
translated.

### 5.7 Offline (`vite-plugin-pwa`)

Precache: app shell, `radars.json`, alert sound, icons. Runtime cache:
OSM tiles, `CacheFirst`, LRU capped at 300 tiles with a 30-day expiry —
enough for a recently-driven corridor without unbounded storage growth.
Installable, `display: standalone`, portrait-primary.

## 6. Testing

| Layer | Tool | Covers |
|---|---|---|
| Geo math | vitest | haversine against known distances; bearing wraparound at 0/360; antipodal and identical-point edge cases |
| Alert machine | vitest | straight approach fires once; passing the radar transitions to PASSED and does not re-fire; U-turn re-arms; stationary GPS jitter never fires; low accuracy suppressed; missing heading falls back; planned radars respect `includePlanned` |
| Data | vitest | every §4.6 validator, run against the real `radars.json` |
| i18n | vitest | every key present in both languages; no key unused |
| UI | Playwright | mocked geolocation driving a synthetic route past a known radar: marker renders, banner appears once, nearby list reorders; permission-denied path still renders the map |

## 7. Deployment

Cloudflare Pages, static output of `vite build`. HTTPS is mandatory for
geolocation, which Pages provides. No environment variables, no
secrets, no backend.

## 8. Explicit non-goals

- No user accounts, no reporting of new radars, no crowd-sourcing.
- No routing or navigation; this is not a satnav.
- No speed-limit data — the source document does not contain it, and
  guessing limits would be worse than omitting them.
- No background alerts when the browser is closed. A web app cannot do
  this reliably; the app must be open with the screen awake.

## 9. Open items requiring a human decision

1. **Publication.** The source is an internal SAT-TRAKT technical
   design document that includes *planned* enforcement points. Deciding
   whether this is published publicly, kept private, or published with
   planned locations withheld is the user's call. Default until then:
   build it, do not deploy it publicly.
2. **PDF in git.** `Radars.pdf` stays out of the repository
   (`.gitignore`) — 28.8 MB and third-party. If it must be preserved,
   Git LFS or an out-of-band copy.
