# 01 — Does the data behind Radars.pdf exist in structured form from a public or government source, and can we get it?

Type: research
Status: resolved
Blocked by: nothing

## Question

Does the data behind Radars.pdf exist in structured form from a public or government source, and can we get it?

The pages are machine-generated: PDFium producer, an identical `01.09.2026 13:38`
footer on all 99 pages, and captions reading `Automatski uvezena slika:
088_Dosudje_-_magistralni_put_M-5_...-orthophoto.jpg`. Something upstream holds
these 88 records as rows. The document is an official government document, so an
open-data portal, a tender annex, or a published decision may carry them.

Find out whether that structured source is obtainable. If it is, the entire
double-blind vision pipeline collapses to a schema mapping, and every future
re-extraction becomes a re-import.

Resolve with: what exists, where, in what format, and a recommendation on
whether extraction should wait for it or run in parallel.

## Answer

No structured public source exists and none is obtainable on this timeline — the PDF has zero recoverable structure (no text layer, no embedded files, no EXIF), data.gov.me has nothing, and no CeJN tender exists yet. Extraction runs unconditionally. Attribute to the document, not to SAT-TRAKT as contractor: that link is unverified.

Full findings: `.scratch/radars/research/01-structured-source-behind-the-pdf.md`
