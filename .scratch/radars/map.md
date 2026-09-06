# Map: Montenegro radars driving companion

Labels: `wayfinder:map`

## Destination

A locked implementation spec for a **publicly launched** Montenegro driving
companion PWA — real domain, installable, findable — with every judgement call
settled, so the build can start with nothing left to decide. Reaching the end
of this map produces a spec plus a validated dataset; it does not produce the
app.

## Notes

**Domain**: road-traffic enforcement in Montenegro. Read `CONTEXT.md` for the
glossary (Location, Camera, Built/Planned, Drive, Alert, Ahead, Fix, Data
vintage) before using any of those words loosely.

**Skills every session should consult**: `/grilling` and `/domain-modeling` by
default; `/research` for the research tickets; `/prototype` for the prototype
tickets.

**Prior art in the repo**: `docs/superpowers/specs/2026-09-06-montenegro-radars-design.md`
— written before the source document had been read past page 18. It is
**partly invalidated**: §4.4's two-value `type` enum omits the majority of the
corpus, and §5.2's point-alert machine is the wrong shape for average-speed
sections. Treat it as a starting position, not a decided spec.

**Standing decisions from the charting session** (not tickets — these framed
the map):

- Destination is a public launch, not a private tool. Publication, liability
  and attribution are therefore on the map, not deferred.
- Audience is locals and tourists at equal weight. Hence ME/EN from day one.
- The source document is an **official government document**. There is no
  rights-clearance blocker, and the app is free to cite its source — which is
  the strongest available answer to "why should I trust this data".
- Data vintage (01.09.2026) is a first-class UI element. Refresh means
  re-running extraction against a newer document, not a backend.
- Extraction is carried into this map as work, not just decisions — it is the
  one exception to plan-don't-do, because no data decision downstream can be
  made without it. The app build itself stays off the map.
- Architecture already settled and not up for re-litigation here: static PWA,
  no backend, Leaflet + OSM raster tiles, Cloudflare Pages.

## Decisions so far

<!-- one line per closed ticket -->

## Not yet specified

- How this programme's 88 locations relate to enforcement that already exists
  in Montenegro — legacy fixed cameras, mobile patrols — and therefore what
  fraction of real enforcement the app can ever cover.
- Battery, heat and thermal throttling of a lit screen plus continuous
  high-accuracy GPS in a windscreen mount over a three-hour summer drive.
- Whether being warned actually makes a driver safer, or just produces braking
  spikes at known points and faster driving everywhere else.
- Whether future versions of the source document (V9 and beyond) will be
  obtainable at all, and through whom.
- What happens at the borders — a driver continuing into Croatia, Bosnia,
  Serbia or Albania leaves both the dataset and the legal analysis behind.
- Night driving: dark chrome, a dimmed banner, and whether the keyless OSM
  raster basemap is usable at all after dark.
- The pull toward speed limits: the spec forbids them, but a driver receiving
  a warning will infer a limit whether or not the app states one. Average-speed
  sections sharpen this — the useful number there is an average, not a spot
  reading.
- Whether anyone other than the author ever uses this, and which of these
  decisions only become real if they do.

## Out of scope

- **Stability of location IDs 001–088 across document versions** — nothing
  persists anything keyed by ID; becomes real only when a second snapshot exists.
- **The pairing algorithm for POINT A→POINT B** (string match vs nearest
  neighbour vs manual) — whether pairing is derivable at all stays on the map;
  choosing the algorithm is downstream implementation.
- **Parsing the `van naselja` settlement marker into its own field** — no
  consumer in v1, and the moment there is one it is the speed-limit guessing
  that is already ruled out.
- **Monitoring OSM tile usage and buying a paid tile key from day one** — the
  mitigation is a one-line config constant; revisit on real traffic.
- **A separate dimmed low-power UI mode** — folded into the drive-screen
  ticket, where it is a real fork.
- **A dark basemap** — requires abandoning the keyless OSM raster; dark chrome
  alone is CSS that changes no contract.
- **Heading-up rotating map** — Leaflet 1.9 has no map bearing, so this is a
  stack change; within the chosen stack the answer is forced.
- **Graceful degradation on overheating / low battery** — cannot be phrased as
  a choice without device measurements first.
- **Geo-restricting alerts outside Montenegro** — the only in-scope fragment is
  a border-crossing line in the disclaimer copy, already absorbed elsewhere.
- **Who owns the domain, Cloudflare account and tile bill after launch** —
  post-launch operations; revisit once the thing is actually launching.
