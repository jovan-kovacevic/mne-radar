# Ticket 01 — Does the data behind Radars.pdf exist in structured form from a public or government source?

Researched 2026-09-06. Author: research subagent.

**Short answer: No public structured source exists today, and none is obtainable
on any timeline this project can wait for. Extraction from the PDF must run now,
in parallel with (not after) any request for structured data.**

---

## 1. The PDF itself carries zero recoverable structure — VERIFIED

Measured directly against `/Users/jovankovacevic/Projects/montenegro-radars/Radars.pdf`
(28,788,045 bytes, PDF 1.7, 99 pages, 612×792 pt letter).

`pdfinfo`:

```
Creator:         PDFium
Producer:        PDFium
CreationDate:    (empty)
Custom Metadata: no
Metadata Stream: no
Tagged:          no
Form:            none
JavaScript:      no
Encrypted:       no
```

The whole Info dictionary is literally `<</CreationDate()/Creator(PDFium)/Producer(PDFium)>>`.
Raw byte scan of the file for structural keywords:

| keyword | occurrences |
|---|---|
| `/EmbeddedFile` | 0 |
| `/Filespec` | 0 |
| `/Names` | 0 |
| `/Outlines` | 0 |
| `/Metadata` (XMP) | 0 |
| `/StructTreeRoot` | 0 |
| `/Annots` | 0 |
| `/URI`, `/GoTo` | 0 |
| `/AcroForm` | 0 |

The catalog is `<</Pages 2 0 R /Type/Catalog>>` — nothing else. So: **no attachments,
no XMP, no outline, no tagged structure, no annotations, no links.**

Content:

- `pdffonts` → **zero fonts**. `pdftotext` over all 99 pages → **0 characters**. There
  is no text layer at all, not even a broken one.
- `pdfimages -list` → **1089 images, exactly 11 per page on all 99 pages**. Each page
  is a vertical stack of JPEG strips, 1589 px wide × 219 px tall (the 11th is 66 px),
  RGB, 204 ppi. 1589 px / 204 ppi = 7.79 in of content on an 8.5 in page.
- Raw JPEG marker walk found **796 distinct JPEG streams** carrying **only a JFIF APP0
  segment** — no EXIF, no XMP, no GPS, no IPTC, no original filenames, on any of them.
  (1089 references vs 796 streams ⇒ ~293 reused XObjects, consistent with identical
  header/footer strips shared across pages.)

**Conclusion (verified):** the document is a fully rasterized print, sliced into strips
by the producing pipeline. Nothing about the source rows survives inside the file.
Every fact in it must come out through OCR / vision over pixels. There is no shortcut
hiding in the container.

**Inference (not verified):** the strip-slicing plus `Producer: PDFium` plus an empty
`CreationDate` is the signature of a Chromium/PDFium "print to PDF" of an already-raster
page. The constant `01.09.2026 13:38` footer, the contiguous IDs 001–088, and captions of
the form `Automatski uvezena slika: 088_Dosudje_-_magistralni_put_M-5_dionica_Berane_-_Rozaje-orthophoto.jpg`
("automatically imported image") are the fingerprint of a template-driven report generator
iterating rows from a table and pulling a per-location orthophoto by filename convention.
I searched for that caption string to identify the generator and found nothing — the phrase
is generic Montenegrin, and no product surfaced. **The upstream row store almost certainly
exists; I found no evidence that it is public, and no evidence of what it is.**

## 2. Montenegro's open-data portal has nothing — VERIFIED

data.gov.me runs CKAN; I queried its API directly rather than the UI.

- `package_search?q=radar` → 6 hits, all viticulture registries (fuzzy stem match). Zero relevant.
- `q=kamer` (camera) → **0 datasets**.
- `q=policij` → 1 dataset: a list of political parties.
- `q=brzin` / `q=saobra` → only the traffic-counting-station series.

Publisher check, which is the more interesting part:

- **`uprava-za-saobracaj` (Transport Directorate) is an active, competent publisher**:
  195 datasets, e.g. "Prosječni godišnji dnevni saobraćaj (PGDS) za 2025 godinu", published
  as **XLSX under CC-BY**, plus ~190 per-station counter series last modified 2026-04-24.
  Dataset notes cite the Law on Roads as the mandate.
  <https://data.gov.me/api/3/action/package_show?id=prosjecni-godisnji-dnevni-saobracaj-pgds-za-2025-godinu-1>
- **`ministarstvo-unutrasnjih-poslova` (MUP) publishes 5 datasets**, all procedural guides
  (ID cards, passports, residence, and a *Guide to free access to information held by MUP*).
  It publishes no data.

So the channel exists and the likely data owner already uses it — it just has not published
this. That is a fact worth carrying: a future SPI request or a policy change could plausibly
land the location table on data.gov.me as XLSX/CC-BY, because that is exactly what this body
already does with its other tabular data.

## 3. The procurement portal shows the tender has not happened yet — VERIFIED (with one caveat)

CeJN (<https://cejn.gov.me>) is Montenegro's official e-procurement portal and its
register of procedures is **fully public without login** (47,994 procedures listed;
detail pages, including contracting-authority data and plan items, open anonymously).
I drove it in a real browser and full-text searched the procurement-subject field.

`radar` → **42 procedures**. The 15 most recent (covering 31.7.2025 → 1.9.2026):

| šifra | subject | authority | published |
|---|---|---|---|
| 121405 | Održavanje VTMIS sistema dvije faze bez radara | Uprava pomorske sigurnosti | 1.9.2026 |
| 120829 | Obuka radarskih tehničara … radara "Žirafa M-85" | Ministarstvo odbrane | 18.8.2026 |
| 119241 | Održavanje VTMIS sistema dvije faze bez radara | Uprava pomorske sigurnosti | 16.7.2026 |
| 116909 | Obuka radarskih tehničara … "Žirafa M-85" | Ministarstvo odbrane | 5.6.2026 |
| 116284 | Oprema … (ručni laserski radari sa video zapisom) | **MUP** | 28.5.2026 |
| 113012 | Nabavka ručnih radara | **MUP** | 7.5.2026 |
| 111604 | Servis i popravka radarskih uređaja i etilometara | **MUP** | 30.3.2026 |
| 110570 | Servis i popravka radarskih uređaja i etilometara | **MUP** | 17.3.2026 |
| 104444 | Nabavka radarskih znakova sa brojevima saobraćaja | Opština Budva | 1.12.2025 |
| 101528 | Nabavka ručnih radara | **MUP** | 14.10.2025 |
| 99460 / 98519 / 97716 | Servis i popravka radarskih uređaja i etilometara "Drager" | **MUP** | 2025 |
| 98301 | Održavanje VTMIS sistema (faza 1 i 2) bez radara | Uprava pomorske sigurnosti | 21.8.2025 |
| 97212 | Nabavka ručnih radara | **MUP** | 31.7.2025 |

Every MUP radar procurement in the last 13 months is **hand-held** radars, or servicing.
**There is no procurement for the 88-location stationary system, and none naming SAT-TRAKT.**

*Caveat, stated plainly:* I enumerated the newest 15 of 42 hits. The grid's page-size cap
is 15 and my pagination clicks did not advance; my attempts to re-run the search with other
terms (`stacionarn`, `sekcijsk`, `kontrole brzine`) silently returned the cached `radar`
result set, so **those terms were not actually tested**. Since the grid is date-descending,
the negative is solid for 31.7.2025–6.9.2026 on the term `radar`; it is *not* a proof that
no such tender exists under wording that omits the word "radar". Re-running this properly
is ~15 minutes of browser work.

## 4. What the programme actually is, and who holds the rows

Verified from Montenegrin press quoting the responsible official (secondary sources,
but direct quotation of the named director):

- **Boka News, 01.03.2026** — *"U prethodnom periodu definisano je 88 lokacija širom Crne
  Gore na kojima će biti postavljeni stacionarni radari."* Miroslav Mašić, director of
  **Uprava za saobraćaj**: *"Sad je naredni korak da se ta tehnička dokumentacija kompletira,
  da kažem da je to već u nekoj završnoj fazi … i da Ministarstvo unutrašnjih poslova izabere
  način kako će sprovesti nabavku tog sistema."* The system is described as measuring
  *"prosječnu brzinu kretanja vozila na određenim dionicama puta"* (average speed over
  sections). Estimated cost just under €10m.
  <https://bokanews.me/stacionarni-radari-do-kraja-godine-na-88-lokacija-u-crnoj-gori/>
  (same interview: <https://rtnk.me/drustvo/stacionarni-radari-do-kraja-godine-na-88-lokacija-kazna-direktno-na-kucnu-adresu/>)
- The programme is long-running: gov.me's document search for "stacionarni radari" returns
  exactly **one** item — MUP, **11.04.2022**, *"Uskoro raspisivanje tendera za stacionarni
  radarski sistem"*, announcing it was in the 2022 procurement plan.
  <https://www.gov.me/clanak/uskoro-raspisivanje-tendera-za-stacionarni-radarski-sistem>
- **Not the EBRD project.** EBRD's €30m sovereign loan to Montenegro (09.07.2026) funds ITS —
  traffic data collection, road meteorology, tunnel control, a national traffic management
  centre — and does **not** mention speed enforcement. Borrower: Ministry of Finance;
  implementers: Ministry of Transport, Monteput, Transport Administration.
  <https://www.ebrd.com/home/news-and-events/news/2026/ebrd-supports-safer-and-smarter-roads-in-montenegro-with--30-mil.html>
  So there is no IFI/EU project pipeline that would publish this dataset as a deliverable.
  (The earlier IPA-era *Road Safety Assessment of Montenegro*, Nov 2018–Feb 2020, iRAP survey
  of 1,853 km, is a plausible ancestor of the site selection but is a different, older output:
  <https://www.gov.me/en/transport-directorate/projects/road-safety-assessment-of-montenegro>)
- Legal backdrop: the amendment enabling unattended automatic enforcement was published in
  **Sl. list CG 111/2026 on 30.07.2026, in force 07.08.2026** — one month before this
  document's 01.09.2026 date. *(Second-hand: sluzbenilist.me returns HTTP 403 to fetching,
  so I have this from search-result summaries, not from the gazette text.)*

**Inference (labelled as such, and the most useful one in this ticket):** Radars.pdf is
the *tehnička dokumentacija* Mašić described — completed by 01.09.2026, held by **Uprava za
saobraćaj**, prepared by a contractor, awaiting MUP's procurement. That reading is consistent
with every verified fact (the count of 88, the average-speed sections, the "Built / Planned"
split, the date landing a month after the enabling law, and the absence of any tender).
I could **not** verify SAT-TRAKT's role: no procurement record, contract, or press item
anywhere names SAT-TRAKT in connection with this programme. The company exists and does fit
(SAT-TRAKT SECURITY, Podgorica — video surveillance and technical security integration,
<https://www.sattrakt.co.me/video-nadzor/>), but the PDF's own footer is currently the only
evidence linking it to this work.

## 5. So: does a structured source exist, where, and can we get it?

| Question | Answer |
|---|---|
| Does a structured source exist? | **Almost certainly yes** (inferred from the generated-report fingerprint), as an internal table at Uprava za saobraćaj and/or its contractor. |
| Is it public? | **No.** Verified absent from data.gov.me, from CeJN, and from gov.me's document library. |
| Is it obtainable? | **Not on a known timeline.** Two non-guaranteed routes exist (below). |
| Should extraction wait? | **No. Run extraction now.** |

### Route A — Free Access to Information (SPI) request
Montenegro's *Zakon o slobodnom pristupu informacijama* gives anyone the right to information
held by state bodies (Art. 51 of the Constitution). Requests may be filed in writing or
electronically, on the Agency's published form or not. Address **Uprava za saobraćaj**
(`upravazasaobracaj@uzs.gov.me`, +382 20 655 364) and/or **MUP**, asking explicitly for the
88-location register **in machine-readable form (XLSX/CSV/SHP/GeoJSON)** rather than "the
document". MUP even publishes its own SPI guide on data.gov.me.
*Not verified:* the exact statutory decision deadline (sources gave 5 days for
already-published information and 10 days for a confidentiality consent step; the general
deadline is commonly cited as 15 days — check the current text before relying on a number).
*Realistic expectation:* a refusal or a re-send of the same PDF is at least as likely as a
spreadsheet; and any answer arrives in weeks, not days.

### Route B — wait for MUP's tender on CeJN
CeJN procedure detail pages are public and unauthenticated, and tender documentation is
downloadable. When MUP finally tenders the ~€10m system, the location schedule will very
likely be in the tender pack — possibly as an XLSX annex. **But:** this has been "about to be
tendered" since April 2022, the tender did not exist as of 6.9.2026, and even when it lands
the annex may be the same rasterized PDF.

**Neither route is a dependency.** Both are asynchronous, both may return nothing, and the
map's destination (a validated dataset) cannot be held hostage to either. Extraction from the
pixels is the only path with a known cost and a known completion condition.

## 6. Recommendation

1. **Start extraction now.** Nothing found here changes the plan or reduces the work.
2. **File the SPI request in parallel, today** — it costs one email, its 15-ish-day clock
   starts immediately, and if it returns an XLSX it becomes a free, independent
   cross-check of the OCR output rather than a replacement for it. Ask for machine-readable
   form explicitly.
3. **Set a standing check on CeJN** for the MUP stationary-radar tender — that is also the
   trigger for the map's open question about how future document versions will be obtained
   (V9 and beyond), and the first place a *newer* vintage will surface publicly.
4. **Do not cite SAT-TRAKT as the contractor** in any user-facing attribution until it is
   independently confirmed. Attribute to the document and its date. The safe, verified
   attribution line is: an official document of the Government of Montenegro dated 01.09.2026,
   relating to the 88-location stationary-radar programme of Uprava za saobraćaj / MUP.
5. **Re-run the CeJN search properly** (15 min) with `stacionarn`, `sekcijsk`, `kontrol brzin`,
   `automatsk`, and by contracting authority = Uprava za saobraćaj / MUP, before treating the
   "no tender exists" finding as final.

## 7. Flag for another ticket — possible launch blocker

While reading the draft amendment to the Road Traffic Safety Law I hit a provision that is
outside this ticket but too serious to leave in a footnote.

**Član 23 of the Zakon o bezbjednosti saobraćaja na putevima is already in force**
(Sl. list CG 33/2012, 58/2014, 14/2017, 66/2019):

> "U vozilu se u saobraćaju na putu ne smije koristiti niti nalaziti uređaj, odnosno sredstvo
> kojim se može otkrivati ili ometati rad uređaja za mjerenje brzine kretanja vozila, odnosno
> drugih uređaja namijenjenih za otkrivanje i dokumentovanje prekršaja.
>
> Zabranjeno je stavljati u promet ili reklamirati uređaje i sredstva iz stava 1 ovog člana."

— i.e. a ban both on *using or carrying* such a device or **means** in a vehicle, and on
**placing on the market or advertising** it. The draft amendment (PREDLOG ZAKON O IZMJENAMA I
DOPUNAMA ZoBS, <https://wapi.gov.me/download/f1f9d8e7-2d5e-439a-af4b-c29b4947e2fe?version=1.0>,
Art. 97 amending čl. 318) attaches **€300–€1,000 or up to 60 days' imprisonment** to both
limbs, and Art. 86 adds an aggravated-offence entry for possessing or using such a device.

Whether a static map of officially published enforcement locations is "a device or means by
which the operation of speed-measuring devices can be detected" is a real legal question, not
a rhetorical one — most European jurisdictions read detector bans as covering RF/laser
detection, not maps, but the Montenegrin wording says *sredstvo* ("means"), and the second
paragraph reaches *advertising*, which a public launch necessarily does. **This belongs in
front of the publication/liability ticket before the domain is bought.** I did not research it
further; I am reporting what I found, not opining on the outcome.

---

## Sources

- Local file inspection: `pdfinfo`, `pdffonts`, `pdfimages -list`, `pdftotext`, raw byte/JPEG
  marker scan of `/Users/jovankovacevic/Projects/montenegro-radars/Radars.pdf`
- <https://data.gov.me/api/3/action/package_search> (CKAN API; queries `radar`, `kamer`, `policij`, `brzin`, `saobra`)
- <https://data.gov.me/api/3/action/package_show?id=prosjecni-godisnji-dnevni-saobracaj-pgds-za-2025-godinu-1>
- <https://cejn.gov.me/tenders> (public procurement register, browsed anonymously)
- <https://bokanews.me/stacionarni-radari-do-kraja-godine-na-88-lokacija-u-crnoj-gori/>
- <https://rtnk.me/drustvo/stacionarni-radari-do-kraja-godine-na-88-lokacija-kazna-direktno-na-kucnu-adresu/>
- <https://www.gov.me/clanak/uskoro-raspisivanje-tendera-za-stacionarni-radarski-sistem>
- <https://www.gov.me/en/transport-directorate>
- <https://www.gov.me/en/transport-directorate/projects/road-safety-assessment-of-montenegro>
- <https://www.ebrd.com/home/news-and-events/news/2026/ebrd-supports-safer-and-smarter-roads-in-montenegro-with--30-mil.html>
- <https://www.paragraf.me/propisi-crnegore/zakon-o-bezbjednosti-saobracaja-na-putevima.html> (čl. 23, consolidated text)
- <https://wapi.gov.me/download/f1f9d8e7-2d5e-439a-af4b-c29b4947e2fe?version=1.0> (PREDLOG ZoBS amendments)
- <https://www.sattrakt.co.me/video-nadzor/>
