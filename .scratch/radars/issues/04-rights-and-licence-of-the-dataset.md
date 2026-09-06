# 04 — Given an official government source, what licence does the extracted dataset ship under, and what does the repo claim to own?

Type: research
Status: open
Blocked by: nothing

## Question

Given an official government source, what licence does the extracted dataset ship under, and what does the repo claim to own?

The provenance question is settled — this is an official government document —
so this is no longer about permission. It is about what we assert.

Open: whether the 88-Location compilation carries a database right the
government retains; whether Montenegrin public-sector information is reusable
by default or requires attribution under stated terms; what the orthophoto
imagery credited to Airbus/CNES/Maxar means for anything derived from those
pages; what OpenStreetMap's attribution requires on screen.

The default reflex — MIT at the repo root — is an affirmative claim to own and
sublicense the coordinate set, and is far harder to walk back than silence. If
the repo goes public, decide whether `src/data/radars.json` is carved out under
its own provenance NOTICE, and whether the extraction agent logs (which contain
camera-model and pole strings the record schema deliberately drops) stay out.

Resolve with: the licence for the code, the licence and NOTICE for the data,
and the on-screen attribution the app must carry.
