# Context

Glossary for the Montenegro radars project. Terms only — no implementation
detail, no decisions. Decisions live in `docs/superpowers/specs/` and on the
wayfinder map.

## Location

A numbered site in the source document, `001` through `088`. A Location is a
*place where enforcement happens*, not a device. It has coordinates, a name, a
city, a type, a status, a set of Enforcement Functions, and zero or more
Cameras.

Called `Lokacija` in the source document.

**Not** a synonym for Camera or Radar — a single Location at a Podgorica
intersection carries eight Cameras.

## Camera

A physical device installed at a Location. A Location has 0..n Cameras; a
Location reading `Nema kamera` has none. Cameras carry equipment identifiers
(`K.001.1`) and a lane assignment.

Cameras are source-document detail. The driver never needs to know how many
there are — that is why Location, not Camera, is the unit the app maps.

## Radar

The everyday word a driver uses for what the app shows them. It maps to
Location, never to Camera. Used in user-facing copy and the project name;
avoided in code and on the map, where Location is the precise term.

## Built / Planned

The two states a Location can be in.

- **Built** — `ZAVRŠENO` in the source document. The enforcement point exists.
- **Planned** — `Nije obrađeno` in the source document. Specified, not yet
  installed.

Both are shown on the map. Only Built Locations warn a driver by default,
because warning about a camera that does not exist teaches the driver to
distrust the app.

## Enforcement Function

One capability a Location performs: instant speed, red light, seat belt,
mobile phone, helmet, plate recognition (ANPR), and others. A Location has
0..n. The source document lists them per Location under
`ZAHTIJEVANI SISTEMI / FUNKCIJE`.

This is what makes a Location more than a speed camera — several Locations
detect phone use and seat belts, which no driver expects.

## Drive

An explicitly armed session in which the app warns the driver. A Drive is
started by the user, holds a screen wake lock, consumes high-accuracy
position, and ends when the user stops it.

Outside a Drive the app is a map. This distinction is deliberate: continuous
GPS is a battery cost the user opts into, and it is the boundary between
"looking something up" and "being warned".

## Alert

A single warning raised for one Location during one Drive. A Location alerts
at most once per approach — the driver being warned twice about the same
camera is a bug, not caution.

## Ahead

A Location is Ahead when the bearing from the driver to it differs from the
driver's heading by no more than a set angle. A Location behind the driver has
already been passed and must not alert.

Ahead is why the app can be quiet in central Podgorica, where a driver is
almost always within a few hundred metres of *some* Location.

## Fix

One position sample from the device: coordinates, accuracy, heading, speed,
timestamp. Fixes are the only input to alerting. A Fix may have a null
heading, and its accuracy may be too poor to act on — both are normal, and
both are the app's problem, not the driver's.

## Data vintage

The date of the source document the shipped data was extracted from
(01.09.2026). Locations change: cameras get built, moved, decommissioned.
The vintage is shown to the user, because a warning the driver trusts is
worse than no warning when the underlying data has gone stale.
