# Radari Crna Gora

A map of the 88 traffic-enforcement locations recorded in a Montenegrin
technical document, with optional proximity warnings while you drive.

Unofficial. Not affiliated with any state body or with SAT-TRAKT.

Live: https://mne-radar.pages.dev

## Warnings are off by default, and that is deliberate

Article 23 of Montenegro's Road Traffic Safety Act prohibits using *or merely
carrying* a device capable of detecting the operation of speed-measuring
equipment. Penalties include a fine, possible imprisonment, penalty points and
a driving ban.

Whether that article reaches a map of already-published locations is
unresolved — it speaks of detecting the **operation** of equipment, and this
app detects nothing — but no court or authority has confirmed that reading.

So the app opens as a map only. Turning warnings on requires passing a gate
that quotes the article in full and states plainly that the question is
unsettled. The gate is not a dismissible banner and the choice is not
remembered across sessions.

This is not legal advice.

## What the data does and does not say

Each location carries a status of `ZAVRSENO` (processed) or `Nije obrađena`
(not processed). This is the state of the **vendor's design work**, not
whether a camera exists — location 009 is `ZAVRSENO` and its own legend reads
`Nema kamera`, zero cameras.

The app therefore never gates a warning on status, and never shows status to
the driver as "built" or "active". All 88 locations alert as one class.

Dataset vintage: 2026-09-01.

## Stack

Vanilla TypeScript, Leaflet, Vite, `vite-plugin-pwa`. No framework, no
backend, no analytics, no accounts. Position never leaves the device; the only
network traffic is map tiles and fonts.

## Develop

```sh
npm install
npm run dev        # vite dev server
npm run typecheck  # tsc --noEmit
npm test           # vitest
npm run build      # tsc --noEmit && vite build
npm run preview    # serve the production build
```

## Deploy

Cloudflare Pages, static:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |
| Root directory | `/` |

Node version comes from `.nvmrc`. There are no environment variables and no
secrets.

Geolocation requires a secure context, so the app works over HTTPS or on
`localhost` — never over a bare LAN IP.

## Attribution

Map tiles © OpenStreetMap contributors. Tiles are served from the OSM
Foundation's servers, which their Tile Usage Policy reserves for light use —
moving to a keyed provider is an open item, not a settled one.

## Licence

Code is MIT — see [LICENSE](LICENSE).

The dataset is **not** covered by that licence. `src/data/radars.json` carries
its own notice at [src/data/NOTICE.md](src/data/NOTICE.md): the facts are not
claimed as property, and whatever rights might vest in the compilation are
waived under CC0 1.0. If you believe you hold rights in the data, the notice
tells you how to have it taken down.
