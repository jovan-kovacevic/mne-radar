# 02 — What `ZAVRŠENO` / `Nije obrađena` actually means

**Status:** resolved
**Confidence:** likely (internal evidence is corpus-complete and strong; no external
as-built record was found to close it to *established*)
**Method:** full-corpus render + OCR of all 99 pages of
`/Users/jovankovacevic/Projects/montenegro-radars/Radars.pdf`, plus targeted
visual reads at 110–300 dpi. Not a sample.

---

## Answer

`ZAVRŠENO` / `Nije obrađena` describes **the state of the vendor's work on that
location inside the design document**, not whether an enforcement point is
physically installed.

The decisive fact is narrower and harder than the interpretation, and it is enough
on its own for the app:

> **Location 009 is `ZAVRŠENO` and lists zero cameras (`Nema kamera`).**
> (PDF p.17 — verified visually.)

Whatever the field means, it cannot mean "cameras are installed here", because one
of the twelve `ZAVRŠENO` Locations has no cameras at all. **The field must not gate
alerting as a built/live signal.**

---

## What was verified across all 88 Locations

### 1. Status vocabulary — exactly two values, no third

OCR of the `PODACI PROJEKTA` panel at 300 dpi on all 99 pages, `--psm 6`:

| Value | Count |
|---|---|
| `ZAVRŠENO` | **12** |
| `Nije obrađena` | **76** |
| total | **88** |

The 11 `Grafički prikaz lokacije` pages carry no `PODACI PROJEKTA` panel and
therefore no Status field.

Note the two values are not a matched pair, and that is itself evidence — see §6.

### 2. The 12 `ZAVRŠENO` Locations

| Loc | Type | Coordinates | Cameras in legend | AI function chips (±1) | Layout page? |
|---|---|---|---|---|---|
| 001 | INTERSECTION ENFORCEMENT | 42.44375, 19.24581111 | 8 | ~16 | yes (p.2) |
| 002 | INTERSECTION ENFORCEMENT | 42.44116389, 19.25468889 | 8 | ~15 | yes (p.4) |
| 003 | INTERSECTION ENFORCEMENT | 42.44546944, 19.25719722 | 8 | ~15 | yes (p.6) |
| 004 | ROAD ENFORCEMENT POINT | 42.44166667, 19.27483333 | 1 | ~15 | yes (p.8) |
| 005 | ROAD ENFORCEMENT POINT | 42.40829722, 19.24756111 | 2 | ~14 | yes (p.10) |
| 006 | ROAD ENFORCEMENT POINT | 42.37336111, 19.22502778 | 1 | ~15 | yes (p.12) |
| 007 | ASC POINT A | 42.31127778, 19.20563889 | 1 | ~15 | yes (p.14) |
| 008 | ASC POINT B | 42.30597222, 19.186 | 1 | ~15 | yes (p.16) |
| **009** | ROAD ENFORCEMENT POINT | 42.42983333, 19.27166667 | **`Nema kamera`** | ~9 | **no** |
| 016 | ASC POINT A | 42.38311111, 19.10158333 | 1 | ~10 | yes (p.25) |
| 029 | ASC POINT A | 42.37127778, 18.93452778 | 1 | ~15 | yes (p.39) |
| 048 | ROAD ENFORCEMENT POINT | 42.1425, 19.04577778 | 1 | ~15 | yes (p.59) |

33 Cameras total across 11 Locations. Every camera on every page is the same two
models (`ENGINE CELERITAS MVD 2022I`, `Vista EnVES10-4M-CTX`).

**The `ZAVRŠENO` set is 001–009 plus 016, 029, 048** — i.e. the first nine
consecutive Locations in document order, plus three scattered ones. Document order
is roughly geographic (Podgorica → Cetinje → coast → north), but it is not "all of
Podgorica": Locations 010, 011 and 018 are also PODGORICA and are `Nije obrađena`.

### 3. The 11 element-layout pages belong exclusively to `ZAVRŠENO` — but not exhaustively

`Grafički prikaz lokacije` pages exist for Locations **001, 002, 003, 004, 005, 006,
007, 008, 016, 029, 048** (PDF pages 2, 4, 6, 8, 10, 12, 14, 16, 25, 39, 59).

- All 11 belong to `ZAVRŠENO` Locations. **Confirmed — exclusive.**
- One `ZAVRŠENO` Location (**009**) has no layout page. **Not exhaustive.**
- No `Nije obrađena` Location has one.

What these pages contain matters: numbered `STUB` (pole) and `RO` (cabinet)
positions with **type specifications** — `Tipski Stub S2 sa konzolom 1 m, H=6 m`,
`Tipski RO-IP66-TIP-01` (PDF p.2, verified visually). "Tipski" = *standard-type*.
That is a specification of what to install, i.e. design output.

### 4. A→B pair distribution

Pairing is unambiguous: every `POINT A` is immediately followed by a `POINT B` in
Location-number order, with no orphans — 27 pairs, separation 0.69–2.22 km
(median 1.40 km).

| Pair state | Count |
|---|---|
| both `ZAVRŠENO` | **1** — (007, 008), 1.72 km apart |
| **split** (A `ZAVRŠENO`, B `Nije obrađena`) | **2** — (016, 017) 1.72 km; (029, 030) 1.13 km |
| both `Nije obrađena` | **24** |
| B `ZAVRŠENO` with A not | 0 |

Location 016's own function panel explicitly lists **`Mjerenje prosječne brzine`**
(average-speed measurement) alongside `Mjerenje trenutne brzine` — verified visually
on PDF p.24. Average speed cannot be measured with only the entry point built. As a
construction status this is incoherent; as "the design for A is worked up, B is not
yet", it is ordinary.

### 5. Structural differences between `ZAVRŠENO` and `Nije obrađena`

**Camera legend — the cleanest split.**

| | `Nema kamera` | camera legend present |
|---|---|---|
| `Nije obrađena` (76) | **76** | 0 |
| `ZAVRŠENO` (12) | **1** (Loc 009) | 11 |

All 76 planned Locations say `Nema kamera`. (68 read directly by OCR; the remaining
8 — Locations 020, 023, 024, 038, 054, 068, 070, 071 — were re-OCR'd at `--psm 6`
or read visually, and all say `Nema kamera`.)

**Ortho-photo overlay.** Locations with a camera legend carry numbered red element
markers on the ortho photo. Locations reading `Nema kamera` carry a single red
crosshair at the coordinate instead (verified visually on Locations 009, 020, 068,
071). So the coordinate is precisely sited on planned Locations too — planned
Locations are not vaguer data, only emptier.

**AI function chips.** Counted geometrically (chip fill-colour row runs, ±1):

| Type | `ZAVRŠENO` | `Nije obrađena` |
|---|---|---|
| INTERSECTION ENFORCEMENT | 15, 15, 16 | 9, 10 |
| ROAD ENFORCEMENT POINT | 9, 14, 15, 15, 15 | 6–11 (mode 7–8) |
| ASC POINT A | 10, 15, 15 | 8–11 (mode 9) |
| ASC POINT B | 15 | 7–11 (mode 9) |

`ZAVRŠENO` pages carry a longer, more elaborated list — they are the only ones
carrying `Pregledni i verifikacioni video`, `Brojanje saobraćaja`, `Vožnja u
zabranjenom smjeru`, `Nepropisno skretanje` with any regularity. Planned pages
cluster on a shorter core set. Note that Locations 009 and 016 — the two `ZAVRŠENO`
outliers — have chip counts in the *planned* range (9 and 10).

**Document framing.** All 88 Location pages carry the eyebrow
`SAT-TRAKT · IDEJNO TEHNIČKO RJEŠENJE` ("conceptual technical solution" —
preliminary design). Verified verbatim by OCR on 48 pages and by eye on 5 more;
measured as present on all 88 by ink-width in the eyebrow band (773–1124 px vs.
281 px for the `SAT-TRAKT · V8` eyebrow on the 11 layout pages). Every page footer
reads `SAT-TRAKT · V8 · AI TRAFFIC MONITORING · TECHNICAL DESIGN`.

The document is a **design deliverable at version 8**, not an as-built record.

### 6. The grammar

- **`Nije obrađena`** — feminine singular, agreeing with *lokacija*. "The location
  has not been **processed / worked up**." `Obraditi` in a design-document register
  means to elaborate or work up an item, not to build it.
- **`ZAVRŠENO`** — **neuter**, which agrees with *nothing* in the record. It is the
  impersonal "[it is] completed" — i.e. *the work* is finished. If the field
  described the Location, it would be **`ZAVRŠENA`** (feminine), and the negative
  value would be **`nije završena`**.

The two values do not form a matched pair, and are not even styled alike:
`ZAVRŠENO` renders as an all-caps token, `Nije obrađena` as a sentence-case phrase.
Both are bold, so this is not CSS `text-transform` — these are two literally
different stored strings. That is the shape of a generator rendering an enum value
on one branch and a "no record yet" default string on the other.

---

## Weighing the two readings

**Reading A — physical construction status.** Fits: `ZAVRŠENO` Locations have
cameras with model numbers and lane assignments; they have pole and cabinet layout
pages; three Podgorica intersections plus a few main-road points is a plausible
phase 1.

Fails on:
1. **Location 009 is `ZAVRŠENO` with zero cameras.** A built enforcement point with
   no cameras is not a thing.
2. **Two of three built A-points have an unbuilt B-point.** 016 and 029 would be
   average-speed entry gantries measuring nothing, while their own pages advertise
   `Mjerenje prosječne brzine`.
3. **The layout pages specify *tipski* (standard-type) poles and cabinets** — what
   to install, not what was installed.
4. **`ZAVRŠENO` clusters on document positions 001–009.** Under a construction
   reading, build order would have to coincide with the first nine rows of the list.
5. **The document is an `IDEJNO TEHNIČKO RJEŠENJE`, V8.** A preliminary design's
   per-item status field describes the design.
6. **The grammar points the other way** (§6).

**Reading B — state of the vendor's work on this Location.** Fits all of the above:
the contractor worked top-down through the list, finished the first nine plus three
others, and the finished ones acquired camera schedules, richer function lists, and
element-layout pages. Location 009 is a workflow untidiness — flagged done before
its elements were entered — which is unremarkable in a status field and impossible
in a construction field.

A third reading, "site/civil works completed", would also have to explain why
`ZAVRŠENO` tracks document order and why the layout pages specify standard types.
It does not survive point 4 or point 6, and in any case it is not "cameras are live"
either.

**Reading B is what the evidence supports.**

---

## External corroboration — NOT ESTABLISHED

No public list of operational Montenegrin speed cameras or average-speed sections
could be found to cross-check the `ZAVRŠENO` coordinates against. What was found:

- **OpenStreetMap holds 13 `highway=speed_camera` nodes in Montenegro** (Overpass
  query over the ME admin area, run 2026-09-06). All 13 are in the north-east
  (Berane / Andrijevica / Plav, lon 19.79–20.21). **The nearest OSM camera to any of
  the 12 `ZAVRŠENO` Locations is 53.3 km away** (Loc 004). Zero overlap with the
  programme's 88 Locations, including the three central-Podgorica intersections
  that would be the most conspicuous of all. OSM coverage in Montenegro is sparse,
  so this is weak evidence — but it points away from "built and live".
- **kolektiv.me, 29 Nov 2025**: 21 stationary radars for the Budva–Podgorica route
  were still awaiting completion of tender documentation, with cost not yet
  determined and rollout "from 2026 onwards". Location selection was based on
  2017–2024 crash analysis by the MUP with the Ministry of Transport and the
  Faculty of Engineering. *Caveat: this may be a different procurement from the
  SAT-TRAKT programme — do not treat the two as the same project without more.*
- **cdm.me, 20 Aug 2019**: an earlier 73-site stationary-radar plan stalled for lack
  of budget. Montenegro has been trying to install this class of system for years.
- Reporting about "TrueCam 2" devices is about police radar units, not this
  88-Location AI programme, and several aggregator summaries claiming the system is
  "currently operational" are not traceable to a primary source. Discard them.

**To close this to *established* would take**: a Ministry of Interior / Uprava
policije statement or a procurement record naming which of these 88 Locations are
commissioned; or a V9 of the document showing the status field moving in a way only
one reading can explain; or physical/Street-View confirmation of a gantry at, say,
42.38311111, 19.10158333 (Loc 016) and its absence at Loc 009.

---

## Consequences for the app

1. **`ZAVRŠENO` may not gate alerting.** It does not mean "this camera exists". The
   `CONTEXT.md` glossary entry for **Built / Planned** is wrong as written —
   `ZAVRŠENO` is not "the enforcement point exists", and `Nije obrađena` is not
   "specified, not yet installed". Both need rewording, and the rule "only Built
   Locations warn a driver by default" loses its justification.
2. **The app does not know which cameras are live.** Under Reading B nothing in the
   source document reports installation. That is a claim-scope problem for tickets
   03 (Article 23 / whether alerts ship), 16 (planned Locations at publish) and 17
   (what the app claims), not a data problem.
3. **The 76 `Nije obrađena` Locations are not lower-quality data.** Each has
   coordinates, city, type, a function list and a sited ortho crosshair. The only
   thing they lack is a camera schedule — which the driver never sees anyway
   (`CONTEXT.md`: Camera is source-document detail).
4. **The field is still worth carrying**, as document provenance — "design status in
   the source document, 01.09.2026" — and possibly as a display ordering. Not as a
   warn/don't-warn switch, and never surfaced to the driver as "built" or "active".

---

## Side finding — the map's type counts are wrong

The map and ticket brief state 31 ROAD ENFORCEMENT POINT / 26 POINT A / 26 POINT B /
5 INTERSECTION. Corpus-complete OCR at 300 dpi, cross-checked against a second
independent pass at 200 dpi with zero disagreements, gives:

| Type | Actual |
|---|---|
| ROAD ENFORCEMENT POINT | **29** |
| AVERAGE SPEED CONTROL · POINT A | **27** |
| AVERAGE SPEED CONTROL · POINT B | **27** |
| INTERSECTION ENFORCEMENT | **5** |
| total | 88 |

Spot-checked visually: Locations 044–047 (PDF pp. 54–57) are A, B, A, B — all
`AVERAGE SPEED CONTROL`, all BUDVA. There are **27** A→B pairs, not 26.

---

## Evidence trail

- Source: `/Users/jovankovacevic/Projects/montenegro-radars/Radars.pdf`, 99 pages,
  612×792 pt, no text layer, footer date `01.09.2026 13:38`, version `V8`.
- Pages read visually in full: 1, 2, 17, 24, 29, 79; panel crops read visually:
  7, 9, 82.
- Status/type/coords: `pdftoppm -r 300 -x 1660 -y 1700 -W 780 -H 1400` + `tesseract
  --psm 6`, all 99 pages.
- Camera legend: `pdftoppm -r 200 -x 120 -y 1400 -W 1000 -H 700`, all 99 pages,
  8 anomalies re-read individually.
- Function chips: counted from chip fill-colour row runs on
  `pdftoppm -r 300 -x 1660 -y 600 -W 720 -H 1750` crops (±1; OCR of the chip labels
  is too noisy to trust for exact counts, geometry is not).
- Overpass: `https://overpass-api.de/api/interpreter`, ME admin area,
  `highway=speed_camera` + `enforcement`, run 2026-09-06.
- Working files under
  `/private/tmp/claude-501/-Users-jovankovacevic-Projects-montenegro-radars/a42b1319-723c-463f-8739-593b882a576d/scratchpad/`
  (`rows9.json` is the full 88-row extraction; `pod3.txt`, `leg.txt`, `ai3.txt`,
  `head.txt` are the raw OCR dumps). These are scratch, not durable.

### Sources

- [kolektiv.me — Više sigurnosti na magistrali: 21 radar protiv saobraćajnih prekršaja (29 Nov 2025)](https://kolektiv.me/286809/vise-sigurnosti-na-magistrali-21-radar-protiv-saobracajnih-prekrsaja)
- [cdm.me — Na postavljanje kamera za kontrolu brzine još će se čekati (20 Aug 2019)](https://www.cdm.me/hronika/na-postavljanje-kamera-za-kontrolu-brzine-jos-ce-se-cekati/)
- [rtnk.me — Novi sistem saobraćajne kontrole u Crnoj Gori](https://rtnk.me/crna-hronika/novi-sistem-saobracajne-kontrole-u-crnoj-gori-prekoracenja-brzine-evidentirace-bez-zaustavljanja-vozila-radari-tesko-uocljivi-za-vozace/)
- [Overpass API](https://overpass-api.de/api/interpreter)
