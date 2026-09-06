# 06 — Do average-speed sections become real in the schema and the alert machine, or do the endpoints ship as independent point radars?

Type: grilling
Status: open
Blocked by: 02, 05

## Question

Do average-speed sections become real in the schema and the alert machine, or do the endpoints ship as independent point radars?

52 of 88 records (59%) are section-control endpoints. This is the dominant
category in the dataset and the spec does not model it at all.

Measured corridors run 690 m to 2221 m, median around 1.2 km. With the alert
machine as specified, the driver is warned at POINT A, the state goes PASSED
about three fixes (~10 s) later, and the banner clears while they are still
being measured for another 0.7–2.2 km. Then a second, useless alert fires at
POINT B, where slowing down changes nothing. A point alert at a section entry
tells the driver to brake and then accelerate into the measured zone — actively
worse than silence.

The decisions:

- One enforced zone with a held "in section" state from A to B, or two
  independent point alerts?
- How does the record carry it — a four-member `type` union, or three types
  plus `sectionRole` and a pair key?
- What does a POINT B do? What do its marker and detail sheet tell a driver
  about a Location the app deliberately never warns on?
- What happens to a section whose A is `ZAVRSENO` and whose B is not — does
  the status filter operate per-Location (hiding the exit) or per-section?

This is a new state, a second anchor and an exit condition in the alert engine,
plus the legend, the filter UI, the i18n table and the record schema. And a
schema change means a full re-extraction, so it must be settled before
extraction runs.
