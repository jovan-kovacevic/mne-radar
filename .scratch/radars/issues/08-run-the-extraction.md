# 08 — Run the extraction and produce the validated dataset.

Type: task
Status: open
Blocked by: 05, 06, 07

## Question

Run the extraction and produce the validated dataset.

The one piece of execution deliberately carried onto this map, because no
downstream data decision can be made without it.

Produce `src/data/radars.json` for all 88 Locations plus an
`EXTRACTION_ISSUES.md` listing every field that could not be resolved. Nothing
is guessed: a field two independent readers disagree on goes to adjudication at
higher resolution, and anything still unresolved ships as null and appears in
the report.

Blocked until the schema is settled (sections), the pairing rule is known, and
the extraction contract is written — running before those means running twice.
