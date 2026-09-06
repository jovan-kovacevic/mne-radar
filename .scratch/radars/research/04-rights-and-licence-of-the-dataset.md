# 04 — Rights and licence of the dataset

Research ticket. Resolved for the questions asked; two sub-questions come back
**not established** and are marked as such.

Everything below separates **VERIFIED** (read in a primary text, or seen in the
PDF at a named page) from **INFERRED** (reasoning on top of verified material).

---

## 0. What I checked in the source document itself

VERIFIED, `Radars.pdf`:

- **p.1** (Location 001) and **p.50** (Location 040) and **p.99** (Location 088)
  all carry the header `SAT-TRAKT · IDEJNO TEHNIČKO RJEŠENJE`, a SAT-TRAKT
  wordmark top-right, and the footer `SAT-TRAKT · V8 · AI TRAFFIC MONITORING ·
  TECHNICAL DESIGN · 1` with a timestamp `01.09.2026 13:38`. The page number in
  the footer is `1` on every page — i.e. each Location is generated as its own
  one-page document, and there is **no cover page, no government crest, no
  ministry letterhead and no signature block anywhere in the 99 pages I
  sampled** (pp. 1, 2, 40, 50, 88, 99 rendered and read).
- **p.1** the coordinates appear as *text* in two places: in the sub-header
  (`PODGORICA · GPS 42.44375, 19.24581111`) and in the `PODACI PROJEKTA` panel
  (`Koordinate 42.44375 / 19.24581111`). They are **not** read off the image.
- **p.1, p.50, p.99** the orthophoto carries, burned into the image, the exact
  string:

  > `Imagery ©2026 Airbus, CNES / Airbus, Maxar Technologies`

  A SAT-TRAKT logo is overlaid on the bottom-left corner of the orthophoto —
  the position where the Google wordmark normally sits in a Google Maps /
  Google Earth viewport. No `Google` wordmark is visible on any page I rendered.
- **p.50, p.99** carry a caption under the orthophoto:
  `Automatski uvezena slika: 040_Van_naselja_-_magistralni_put_M-8_dionica_Lipci_Grahovo-orthophoto.jpg`
  — the images are auto-imported JPEGs, not live map embeds.

INFERRED (stated as inference): the credit string
`Imagery ©YYYY Airbus, CNES / Airbus, Maxar Technologies` is **Google's**
standard satellite-imagery attribution format. Combined with the SAT-TRAKT logo
sitting exactly where Google's wordmark goes, the most likely history is that
SAT-TRAKT captured these from Google Maps/Earth satellite view and overlaid
their own logo. I have **not** established that, and it does not change any
recommendation below (see §4).

### A caveat the map's standing decision deserves

The map records as settled that "the source document is an **official
government document**". Nothing *in the document* evidences that — it is
branded end-to-end as a contractor's design deliverable. Provenance may well be
settled by how the file was obtained (ticket 01 territory), and I take the
standing decision as given. But two of the conclusions below turn on it, and I
flag exactly where, because if the document is a contractor deliverable that
merely *reached* a government body, the analysis in §1 shifts.

---

## 1. Montenegro's regime for reuse of public sector information

### 1.1 Copyright: official texts are excluded, facts were never in

VERIFIED. Law on Copyright and Related Rights, Official Gazette of Montenegro
No. 37/2011 (WIPO Lex ME022, WIPO's own English text), **Article 8**:

> Copyright protection shall not include:
> 1) ideas, principles and inventions;
> 2) **official texts in the legislative, administrative and judicial domain**;
> 3) official translations of the texts under subparagraph 2 of this Article;
> 4) traditional culture expressions (hereinafter: works of folklore);
> 5) news of the day or other facts having the character of common media
>    information.

VERIFIED that Article 8 is still in force in that form: the 145/2021 amendment
(Official Gazette 145/2021, in force 08.01.2022) amends Articles 37, 48, 53,
69e, 69f, 73, 145a, 146, 147–180k, 181, 199 and adds 145b — **it does not touch
Article 8 or Articles 139–145**.

Two consequences:

- **The 88 coordinates, names, cities, types and statuses are facts.** No
  copyright subsists in a coordinate pair or in "Raskrsnica bulevara Mihaila
  Lalića" regardless of who wrote it down. Article 8(1) and the general
  idea/expression line put them outside copyright entirely. This is the least
  contestable thing in this whole document.
- **The PDF pages themselves are a different matter.** The page layout, the
  rendered design, the orthophoto composites — that is expression. Whether
  Article 8(2) exempts it depends on whether an `idejno tehničko rješenje`
  produced by a private contractor counts as an "official text in the
  administrative domain". INFERRED, and I put it at **unlikely**: Art. 8(2) is
  the Berne Art. 2(4) carve-out for laws, decisions and administrative acts, not
  for every document a state body holds. Practical upshot: **do not redistribute
  the PDF or renders of its pages.** Ship the facts, not the artefact.

### 1.2 PSI re-use: the statutory default is "without restrictions"

VERIFIED. Law on Free Access to Information, consolidated text of Official
Gazette of Montenegro 44/12 (09.08.2012) + 30/17 (09.05.2017), read in full at
katalogpropisa.me. This law already contains a public-sector-information re-use
chapter (added by the 2017 amendments — the older PSI Directive 2003/98/EC as
amended by 2013/37/EU, not yet 2019/1024).

**Član 3a** — the right itself:

> Svako domaće i strano, fizičko i pravno lice ima pravo na ponovnu upotrebu
> informacija u skladu sa ovim zakonom.
> Ponovna upotreba informacija, u smislu ovog zakona, je upotreba informacija
> koje su u posjedu organa vlasti, **u komercijalne i nekomercijalne namjene,
> različite od početne namjene** za koju su te informacije nastale.

**Član 22a** — the licence regime:

> Organ vlasti dužan je da podnosiocu zahtjeva dostavi tražene informacije,
> **bez ograničenja, u otvorenom formatu, radi ponovne upotrebe.**
> Izuzetno od stava 1 ovog člana, organ vlasti može, ako to priroda informacije
> zahtijeva, da ponovnu upotrebu informacija dozvoli uz posebne uslove.
> Dozvola za ponovnu upotrebu informacija iz stava 2 ovog člana, ne smije
> ograničavati ponovnu upotrebu informacija, kao ni konkurenciju na tržištu i ne
> smije da sadrži uslove koji su diskriminatorni [...]
> Organ vlasti dužan je da na svojoj internet stranici objavi dozvole kojima
> određuje uslove za ponovnu upotrebu informacija.

**Član 26 (odbijanje)** — the two refusal grounds that matter here:

> Organ vlasti odbiće zahtjev za ponovnu upotrebu informacija, ako: [...]
> 9) se ponovnom upotrebom informacije **povređuje pravo intelektualne svojine**;
> 10) te informacije nijesu nastale u okviru djelovanja organa vlasti od koga se
> taj podatak traži.
> Ako organ vlasti odbije zahtjev [...] zbog zaštite prava intelektualne svojine,
> dužan je da obavijesti podnosioca zahtjeva o nosiocu prava intelektualne
> svojine [...]

So: **re-use is the default and it is unconditioned unless the body publishes a
licence saying otherwise** — and even then the licence may not restrict re-use.
Attribution is *not* a statutory condition of re-use in Montenegro. There is
**no national open-data licence** prescribed in the statute; Član 22a(4) leaves
licence *types* to a ministerial regulation, and I did **not** find such a
regulation published. NOT ESTABLISHED: whether a `pravilnik o vrstama dozvola`
exists. It would take a targeted search of Službeni list CG or a written query
to the Ministry of Public Administration to settle.

Important limits on how far this helps us:
- Član 3a/22a govern what an *organ vlasti* must do **on a request**. They do
  not retroactively licence a document you already hold. They establish the
  *policy default*, which is the useful part: Montenegro's own legislature says
  PSI is re-usable commercially, without restrictions, by anyone including
  foreigners.
- Ground 10 is a real caveat if the document is a contractor deliverable rather
  than material "nastale u okviru djelovanja organa vlasti".

### 1.3 The national portal

VERIFIED (data.gov.me/about): the portal states it uses "standardne otvorene
licence koje se koriste širom svijeta tzv. **Creative Commons licence**", that
use is free of charge and open to an unlimited number of users, and cites the
Law on Free Access to Information and Directive (EU) 2019/1024 as its basis.
It does **not** name a specific CC variant (no CC0 / CC BY / CC BY-SA
designation). So there is no single national open-data licence string to adopt.

### 1.4 EU Open Data Directive 2019/1024 transposition

LIKELY, not fully verified. Multiple legal publishers and search consensus
report that Montenegro's Parliament adopted a **new** Law on Free Access to
Information on **27.12.2025**, published in **Službeni list CG 160/2025 of
30.12.2025**, in force **07.01.2026**, applying **six months after entry into
force** (so ~07.07.2026 — already in application as of today, 06.09.2026),
repealing 44/12 and 30/17, and carrying re-use / open-format-portal obligations
aligned to Directive 2019/1024. I read the *old* consolidated text directly; I
did **not** obtain the 160/2025 text itself and could not confirm it against the
Official Gazette. To settle it: pull Sl. list CG 160/2025 from sluzbenilist.me
or the Ministry of Public Administration.

This does not change any recommendation. Both the old and the reported new
regime point the same way: re-use is the default, no attribution is imposed by
statute, and there is no mandatory national licence text to quote.

**Conclusion for §1: nothing in Montenegrin law requires us to attach a
particular licence or a particular attribution string to these facts. The
constraint is not statutory. It is reputational and takedown-risk shaped, and
that is what §5 designs for.**

---

## 2. Sui generis database right over the 88-Location compilation

VERIFIED. Same law, Chapter "RIGHTS OF MAKERS OF DATABASES", Articles 139–145.

**Article 139** (definition, and the investment threshold):

> A database is a collection of independent data, copyright works or other
> materials, arranged in a systematic or methodical way and individually
> accessible by electronic or other means, whereby **the obtaining, verification
> or presentation of the contents demands a qualitatively or quantitatively
> substantial investment.**
> The protection of a database or its contents shall apply **irrespective of its
> eligibility for protection by copyright** [...]

**Article 140** (scope — this is the "does taking the whole corpus matter"
answer):

> The protection of a database in accordance with this Act comprises:
> 1) **the entire contents of a database**,
> 2) every qualitatively or quantitatively [substantial] part of its contents,
> 3) qualitatively or quantitatively insubstantial parts of its contents, **if
> they are used repeatedly and systematically**, which conflicts with a normal
> exploitation of the database [...]

**Article 141** (the exclusive rights): reproduce / distribute / rent / make
available to the public.

**Article 143** (who ends up holding it):

> Where a database is made within employment relations or where it is made
> **under a contract for hire**, it shall be deemed that **all economic rights to
> such database are exclusively and without limitations assigned to the employer
> or to the ordering party**, unless otherwise provided by contract.

**Article 145**: 15 years from making, or 15 years from first disclosure;
a substantial change resetting the clock.

### Does a right actually subsist here?

Three questions, in order.

**(a) Is it a database at all?** Almost certainly yes. 88 independent records,
systematically arranged, individually accessible. Article 139's structural test
is met easily.

**(b) Was there a substantial investment in *obtaining* the contents?** This is
where it probably fails, and it is the strongest point in our favour.

VERIFIED, CJEU C-203/02 *British Horseracing Board v William Hill* (Grand
Chamber, 9 Nov 2004), paras 30–35 and 42: "investment in the obtaining of the
contents" means the resources used **to seek out existing independent materials
and collect them**, and *not* the resources used for the **creation** of those
materials. Race-entry lists were held to be data *created* by BHB, so the
expenditure did not count. Verification likewise means checking material already
collected, not quality-checking during creation.

INFERRED, and this is the load-bearing inference of §2: the 88 coordinates are
**created** data, not obtained data. SAT-TRAKT did not go out and collect a
pre-existing list of enforcement sites; it *decided where the cameras go* and
recorded its own siting decisions. Under the *BHB* line, the money spent
designing an enforcement programme is investment in **creating** the data, and
buys no sui generis right in the resulting list. The residual argument for the
other side is presentation investment — but Art. 139 requires the investment to
be substantial and Art. 140 protects contents, not layout.

Weight of that inference: *BHB* is CJEU case law and **is not binding in
Montenegro**. Montenegro is not an EU member. Articles 139–145 transpose
Directive 96/9/EC nearly verbatim, and under the Stabilisation and Association
Agreement Montenegro is committed to aligning with the acquis, so a Montenegrin
court would have every reason to read them the same way — but that is
persuasive, not settled. NOT ESTABLISHED: whether any Montenegrin court has
applied Articles 139–145 at all. Settling it would need a search of Montenegrin
case law, which is not systematically published.

**(c) If a right does subsist, who holds it?** Article 143 answers cleanly. If
SAT-TRAKT built this under contract to a Montenegrin state body, the economic
rights are **deemed assigned to the ordering party** — i.e. **the state, not
SAT-TRAKT** — unless their contract says otherwise. Which means, on the map's
own standing decision that this is government material, the plausible
rightsholder is also the body whose statutory default (§1.2) is that its
information is re-usable "bez ograničenja". Those two facts point the same way,
which is a comfortable place to be.

INFERRED but worth stating plainly: **if a database right does subsist, taking
all 88 records is the maximally infringing act available** — Art. 140(1)
protects "the entire contents", and there is no de minimis argument left once
you have taken everything. Our exposure is therefore binary. Either no right
subsists (my assessment) or we are squarely inside it. There is no middle
posture achieved by shipping fewer fields.

**Practical translation:** the risk is not that we lose a lawsuit. It is that a
rightsholder sends a takedown and we have to decide in an afternoon. That is
exactly the pre-agreed floor ticket 15 asks for, and §5.6 gives it a concrete
form.

---

## 3. What "Imagery ©2026 Airbus, CNES / Airbus, Maxar Technologies" reaches

VERIFIED that the string is present on the orthophoto of every Location page
(pp. 1, 50, 99 checked directly).

**The distinction the ticket proposes — we ship coordinates and text, not
imagery — does resolve it. Yes. Genuinely.** Reasoning:

1. Copyright in a satellite image protects **the image**. It does not protect
   the geographic facts the image depicts. Article 8(1) of the Montenegrin law
   ("ideas, principles and inventions") and the universal idea/expression line
   both put "there is a road junction at 42.44375, 19.24581111" outside anyone's
   copyright. Airbus, CNES and Maxar have a right in the pixels; nobody has a
   right in the place.
2. VERIFIED at p.1 and p.50: **the coordinates are printed as text**, in the
   sub-header and in the `PODACI PROJEKTA` panel. They were not measured off the
   imagery by us. Even the tracing/digitising objection — the one thing Google's
   Geo Guidelines expressly prohibit for Street View ("Creating data from Street
   View images, such as digitizing or tracing information from the imagery") —
   has no factual hook, because there is nothing to trace: the numbers are
   already text on the page.
3. `radars.json` will contain zero pixels. Nothing in it is a reproduction,
   adaptation or derivative of an Airbus/CNES/Maxar photograph.

So: **shipping the app is clear of the imagery credit.** But two live hazards
sit right next to it, and both are ours to avoid, not theirs:

- **Do not commit page renders.** The extraction pipeline necessarily rasterises
  PDF pages to PNG (that is how this very report read them). Committing those
  PNGs to a public repo — as extraction artefacts, as OCR inputs, as
  verification screenshots, as fixtures in a test suite — **is** redistribution
  of Airbus/CNES/Maxar imagery, and of a probably-copyrighted contractor
  document besides. Add `*.png` page renders to `.gitignore` and keep them in
  the scratchpad only.
- **Do not redistribute `Radars.pdf` itself.** VERIFIED: Google's Geo Guidelines
  require that "All uses of Google Maps, Google Earth, and Street View content
  must provide attribution to Google and, if applicable, to our data providers",
  and "Don't remove, obscure, or crop out the attribution information", and
  "When there are third-party data providers cited with the imagery, only
  including 'Google' or the Google logo is not proper attribution". If the
  inference in §0 is right — that these are Google captures with a SAT-TRAKT
  logo placed over Google's own credit — then the PDF's compliance with Google's
  terms is **SAT-TRAKT's problem, and it becomes ours the moment we host the
  file**. Never mirror the PDF from the project's own domain or repo. Cite it;
  don't serve it.

`Radars.pdf` is currently **tracked in the repo root** and is 28.8 MB. VERIFIED
via `git log`: three commits, no `.gitignore` entry covering it. Before the repo
goes public (ticket 15), this file must be removed from history, not merely
deleted from HEAD — a public repo with the source PDF in its git objects is the
single most takedown-attracting artefact in the project.

---

## 4. OpenStreetMap: attribution and the Tile Usage Policy

### 4.1 The attribution requirement

VERIFIED, OSMF Attribution Guideline (adopted by the OSMF board 2021-06-25),
read as wiki source:

> Attribution must be to "OpenStreetMap".
> Attribution must also make it clear that the data is available under the Open
> Database License. This may be done by making the text "OpenStreetMap" a link
> to openstreetmap.org/copyright [...]
> The historical forms of attribution "**© OpenStreetMap contributors**" or
> "© OpenStreetMap" are acceptable.

On placement, for our case ("Interactive maps"):

> For a browsable map (e.g., embedded in a web page or application), the credit
> should typically appear in a corner of the map. [...] While the lower right
> corner is traditional, any corner of the map is acceptable.

The guideline permits collapsing the credit (dismiss interaction, on pan/zoom,
or automatically after five seconds) **provided** the licence information stays
findable via an (i) or About affordance.

### 4.2 The Tile Usage Policy is stricter, and it governs us

VERIFIED, https://operations.osmfoundation.org/policies/tiles/ read in full.
Because the app uses **raster tiles from `tile.openstreetmap.org`** (a settled
architecture decision on the map), this policy — not just the attribution
guideline — is the binding document. Its requirements, verbatim where they bite:

**Must:**
- "Use the correct URL: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`" —
  HTTPS, exactly that host, no legacy `a/b/c.tile.` subdomains.
- "Provide visible licence attribution, following the Attribution Guidelines."
- "Send a valid HTTP User-Agent that clearly identifies your application" —
  satisfied automatically for a browser PWA: "Browsers will use the browser's
  default User-Agent."
- "From web pages, ensure a valid HTTP `Referer` header is sent."
- "Cache tiles locally according to HTTP caching headers (or at least 7 days if
  your cache cannot read them)."

**Must not:**
- "Bulk download ('scrape') tiles or **offer prefetch features**."
- "Send `Cache-Control: no-cache`, `Pragma: no-cache`, or similar no-cache
  headers by default."
- "**Set a restrictive `Referrer-Policy` that prevents the HTTP `Referer` header
  being sent.**"

On attribution specifically, §2 of the policy is *harder* than the guideline:

> Show OpenStreetMap licence attribution clearly on the map (typically
> bottom-right). Typically: © OpenStreetMap contributors
> [...] **Do not hide attribution beneath UI, behind toggles, or off-screen.**

### 4.3 Two findings that land outside this ticket but must be recorded

**(i) "Offline-capable PWA" collides head-on with the tile policy.** §4 of the
policy:

> Bulk downloading is any pre-emptive fetching of tiles other than those a user
> is actively viewing. [...] **Offline use is not permitted on
> tile.openstreetmap.org.** Features such as "Download city/country for offline
> use" or "Save area for later" rely on prefetch/bulk downloading and are
> therefore prohibited.
> [...] Enforcement: Prefetch/offline patterns [...] **will be blocked without
> notice.**

What *is* permitted: "Normal interactive viewing by a human where the client
requests only the tiles needed for the current viewport", and "Re-visits served
from your local cache honouring server caching headers (or ≥ 7-day TTL)".

So the app may precache its **shell, code and `radars.json`** and be fully
functional offline in the sense that matters — alerting works without network,
because alerting needs coordinates and a GPS fix, not tiles. It may **not**
precache a tile area, and must not ship a "download Montenegro for offline"
button. On a drive through a dead zone the driver gets alerts and grey tiles.
That is a UI decision (drive-screen ticket), and it needs to be made knowing the
alternative is prohibited, not merely expensive.

**(ii) `Referrer-Policy: no-referrer` would breach the policy.** The standard
security-hardening `_headers` block for a Cloudflare Pages static site commonly
sets `Referrer-Policy: no-referrer` or `same-origin`. Either would strip the
`Referer` on tile requests and put the app in the class the policy says "may be
blocked without notice". Use `strict-origin-when-cross-origin` (the browser
default) or `origin`, so the origin still reaches the tile server.

Both of these are pre-existing constraints the map's "keyless OSM raster tiles"
decision carries with it. Neither is negotiable within that decision; both are
one-line fixes if caught before launch and an outage if caught after.

**(iii) Never let OSM data touch `radars.json`.** ODbL is a share-alike database
licence. If any coordinate in `radars.json` is *adjusted* using OSM — snapped to
an OSM road geometry, corrected against an OSM junction, reverse-geocoded to an
OSM city name — the file becomes a **Derivative Database** and the whole of
`radars.json` falls under ODbL, defeating the licensing design in §5. Rule for
the extraction tickets (07/08): **OSM may be used to eyeball a coordinate for
plausibility, never to change one.** If a coordinate looks wrong, flag it; do
not fix it from OSM. Record which values, if any, were touched.

---

## 5. Recommendations

### 5.1 Licence for the code — MIT

`LICENSE` at the repo root, MIT, standard text, with the copyright line naming
whoever ticket 15 settles on. Add this line immediately above the MIT text so
the carve-out is unmissable:

```
This licence applies to the source code in this repository.
It does NOT apply to src/data/radars.json — see src/data/NOTICE.md.
```

Rationale: MIT is the least surprising choice for a static PWA, and the ticket's
concern about MIT is entirely about the *data*, which §5.3 removes from its
scope.

### 5.2 Yes — carve the data out of the repo licence

Unambiguously yes. A repo-root MIT with no carve-out is a positive assertion
that the author owns and may sublicense the coordinate set. Per §2, we probably
hold nothing to sublicense, and per §1.1 large parts of it are not ownable by
anyone. Asserting it is (a) false, (b) the exact posture that makes a takedown
letter easy to write, and (c) as the ticket says, much harder to walk back than
silence.

### 5.3 Licence for `src/data/radars.json` — CC0 1.0, applied only to our own
### contribution, plus a NOTICE

Choose **CC0 1.0 Universal**, not MIT, not CC BY, not ODbL. Why each of the
others is wrong:

| Candidate | Why not |
|---|---|
| MIT | A software licence; says nothing about database rights, which are the actual exposure (§2). |
| CC BY 4.0 | Requires downstream attribution *to us* — an assertion of authorship over facts we did not author. |
| ODbL | Share-alike enclosure of state data, and asserts a sui generis right we almost certainly do not hold. Worse optics than MIT. |
| No licence at all | Default "all rights reserved" — the strongest possible claim, by silence. |

CC0 is the right instrument precisely because it **waives rather than asserts**,
and because it expressly covers sui generis database rights and operates "to the
extent allowed by law" — so it works even where we hold nothing. It is the only
option whose meaning is "we are not claiming this".

Create `src/data/NOTICE.md` with this content (ME first, EN second — the map's
ME/EN-from-day-one decision):

```markdown
# radars.json — porijeklo i prava / provenance and rights

## Izvor
Podaci u ovoj datoteci izvučeni su iz dokumenta:

  SAT-TRAKT — "Idejno tehničko rješenje", V8, AI Traffic Monitoring,
  99 strana, datum dokumenta 01.09.2026.

Izvučene su isključivo činjenice: identifikator lokacije, naziv, grad,
koordinate, tip i status. Nijedna slika, stranica, snimak ekrana ni prelom
iz izvornog dokumenta nije uključen u ovaj repozitorijum, niti se distribuira.

## Šta se ne tvrdi
Autori ovog projekta ne polažu autorsko pravo niti pravo proizvođača baze
podataka na same činjenice. Koordinate, nazivi i statusi su činjenice i, u
skladu sa članom 8 Zakona o autorskom i srodnim pravima Crne Gore
("Sl. list CG", br. 037/11, 053/16, 145/21), nijesu predmet autorskog prava.

## Šta se odriče
U mjeri u kojoj bi autorima ovog projekta pripadalo bilo kakvo pravo na
odabiru, provjeri ili prikazu ove kompilacije — uključujući pravo
proizvođača baze podataka — ono se ovim putem odriče prema
CC0 1.0 Universal (https://creativecommons.org/publicdomain/zero/1.0/).

## Kontakt
Ako smatrate da ste nosilac prava na ovim podacima i da ova datoteka
ne bi trebalo da bude javno dostupna, javite se na <KONTAKT> — datoteka
će biti uklonjena dok se pitanje ne razriješi.

---

## Source
Data in this file was extracted from:

  SAT-TRAKT — "Idejno tehničko rješenje" (Conceptual Technical Solution),
  V8, AI Traffic Monitoring, 99 pages, document date 2026-09-01.

Only facts were extracted: location id, name, city, coordinates, type and
status. No image, page, screenshot or layout from the source document is
included in this repository or distributed with it.

## What is not claimed
The authors of this project claim neither copyright nor a database maker's
right in the underlying facts. Coordinates, names and statuses are facts and,
under Article 8 of Montenegro's Law on Copyright and Related Rights (Official
Gazette of Montenegro No. 37/2011, 53/2016, 145/2021), are not subject to
copyright.

## What is waived
To the extent any right in the selection, verification or presentation of this
compilation would vest in the authors of this project — including any database
maker's right — it is hereby waived under CC0 1.0 Universal
(https://creativecommons.org/publicdomain/zero/1.0/).

## Contact
If you believe you hold rights in this data and that this file should not be
publicly available, contact <CONTACT> — the file will be taken down pending
resolution.
```

Note the NOTICE deliberately names **SAT-TRAKT and the document**, not "the
Government of Montenegro". Per §0, no government body is named anywhere on the
99 pages. Naming one on the strength of an unverified provenance chain would be
the project's first false statement, on the page whose whole job is being
truthful about provenance. If ticket 01 establishes the issuing body, amend the
NOTICE then.

### 5.4 Extraction agent logs — do not publish

Keep them out of the repo. `.gitignore` the extraction working directory.

Reasons, in descending weight:

1. **They are the closest thing to a republication of the source document.** The
   logs carry equipment identifiers (`K.001.1`), camera model strings (verified
   at p.1: `ENGINE CELERITAS MVD 2022I`, `Vista EnVES10-4M-CTX`) and lane
   assignments — content the record schema deliberately drops. Publishing them
   moves the repo from "a driver-facing dataset of facts" to "a systematic dump
   of a state enforcement-infrastructure design". That is precisely what
   Article 140(1) reaches if any database right subsists, and it is precisely the
   framing that makes a takedown letter easy to write (ticket 15's "pre-agreed
   floor" gets much harder to hold if we published the equipment inventory).
2. **They serve no user.** CONTEXT.md already settles that "the driver never
   needs to know how many there are". Nothing in the app consumes a camera model.
3. **They are likely to contain rendered page images** (§3), which we must not
   redistribute.

Counter-argument, acknowledged: reproducibility. Ticket 17 asks whether the
extraction pipeline is a committed deliverable. It should be — commit the
*pipeline* (the code, the prompts, the schema, the checksum of `Radars.pdf`), so
a third party who independently obtains the PDF can re-derive `radars.json` and
verify us. That gives full reproducibility without republishing the corpus.
Publish the method, not the intermediate dump.

### 5.5 The exact on-screen attribution

**Persistent, on the map, both on the idle map screen and during a Drive.** Do
not collapse it — the Attribution Guideline would permit collapsing after five
seconds, but the Tile Usage Policy §2 says "Do not hide attribution beneath UI,
behind toggles, or off-screen", and the tile policy is what governs our use of
`tile.openstreetmap.org`. Where the two documents differ, follow the stricter.

Bottom-right of the map, one line, always visible:

```
© OpenStreetMap contributors · Podaci: SAT-TRAKT V8, 01.09.2026 · Nezvanično
```

English locale:

```
© OpenStreetMap contributors · Data: SAT-TRAKT V8, 2026-09-01 · Unofficial
```

Link targets:
- `OpenStreetMap` → `https://www.openstreetmap.org/copyright` (mandatory — this
  link is how the ODbL notice requirement is satisfied).
- `SAT-TRAKT V8, 01.09.2026` → the in-app About screen.

Three things this one line does at once: it discharges the OSM obligation, it
carries the data vintage that the map made a first-class UI element, and
`Nezvanično` / `Unofficial` pre-empts the impression that a government-sourced
dataset makes this a government app — which the OSM guideline separately
requires we avoid ("Other attribution, logos, or text must not create any false
or misleading impression").

**On the About screen** (reachable from the map, one tap), in full:

- The provenance paragraph from `NOTICE.md` (ME/EN), naming the document, its
  version and its date.
- `Karta: © OpenStreetMap contributors, podaci pod Open Database License (ODbL)`
  with the link to openstreetmap.org/copyright.
- A "Report a map issue" link to `https://www.openstreetmap.org/fixthemap` —
  recommended by the Tile Usage Policy ("should"), and free to add.
- A contact address — recommended by the tile policy ("Publish a contact email
  on your website or app store listing"), and it doubles as ticket 17's
  zero-infrastructure correction route and as the takedown channel in §5.6.
- The coverage disclaimer (ticket 17's territory, cross-referenced here only
  because it shares the screen).

### 5.6 The pre-agreed floor, since §2 makes it concrete

Ticket 15 asks for a floor decided in the quiet. §2 says our exposure is binary,
so the floor should be too. Recommendation: **on a written demand from
SAT-TRAKT or a Montenegrin state body, `radars.json` comes down the same day,
without argument, and the app degrades to a map with a notice.** Everything in
§5.3 and §5.5 is designed so that this is a cheap, dignified action rather than
a climbdown: we never claimed to own the data, we published a takedown contact
ourselves, and the file is one artefact in a static build.

---

## 6. What is not established

| Question | Status | What it would take |
|---|---|---|
| Whether the new FOI law (Sl. list CG 160/2025) exists as reported and what its re-use articles say | LIKELY — publisher consensus, not read | Pull Sl. list CG 160/2025 from sluzbenilist.me or ask the Ministry of Public Administration |
| Whether a ministerial regulation prescribing re-use licence types (ZOSPI čl. 22a st. 4) exists | NOT ESTABLISHED | Search Službeni list CG for a `pravilnik` under that article |
| Whether any Montenegrin court has applied Arts. 139–145 | NOT ESTABLISHED | Montenegrin case law is not systematically published; would need local counsel |
| Whether the orthophotos are Google captures | INFERRED only | Irrelevant to the recommendations — §3 holds either way |
| Which state body, if any, issued or commissioned the document | NOT ESTABLISHED from the document itself | Ticket 01; nothing in 99 pages names one |
| Whether SAT-TRAKT's contract varies the Art. 143 default assignment | NOT ESTABLISHED | Would require the contract; a public-procurement records request could reach it |

None of these change the recommendations. Every recommendation above is
deliberately robust to all six outcomes, because each is a *minimum-assertion*
choice: MIT on code we did write, CC0 waiver on a compilation we may not own,
truthful provenance naming only what the document itself says, and no
redistribution of the artefact.

---

## Citations

Primary:

- Law on Copyright and Related Rights, Official Gazette of Montenegro No.
  37/2011 — WIPO's English text, Arts. 5–8, 139–145:
  https://wipolex-res.wipo.int/edocs/lexdocs/laws/en/me/me022en.html
  (record: https://www.wipo.int/wipolex/en/legislation/details/11369)
- Law on Amendments to the Law on Copyright and Related Rights, Official Gazette
  of Montenegro No. 145/2021 (does not touch Arts. 8 or 139–145):
  https://www.wipo.int/wipolex/en/legislation/details/21355
- Law on Free Access to Information, consolidated text of Official Gazette of
  Montenegro 44/12 + 30/17, Arts. 1, 3a, 6, 12a, 22a, 26:
  https://www.katalogpropisa.me/propisi-crne-gore/zakon-o-slobodnom-pristupu-informacijama-3/
- CJEU C-203/02, *The British Horseracing Board Ltd and Others v William Hill
  Organization Ltd* (Grand Chamber, 9 Nov 2004), paras 30–35, 42:
  https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A62002CJ0203
- OSMF Attribution Guideline (adopted 2021-06-25):
  https://osmfoundation.org/wiki/Licence/Attribution_Guidelines
- OSMF Tile Usage Policy:
  https://operations.osmfoundation.org/policies/tiles/
- Google Geo Guidelines (attribution, no cropping of credits, no digitising):
  https://about.google/brand-resource-center/products-and-services/geo-guidelines/
- data.gov.me — portal description and licence statement:
  https://data.gov.me/about
- `Radars.pdf`, pp. 1, 50, 99 (rendered at 110–400 dpi and read directly):
  header/footer branding, coordinates as text, `Imagery ©2026 Airbus, CNES /
  Airbus, Maxar Technologies`, `Automatski uvezena slika: …-orthophoto.jpg`.
