# Bugs

Open defects in the Montenegro radars app. One heading per bug. Anyone picking
one up: reproduce it first, then fix, then say how you verified.

---

## BUG-001 — The map yanks itself back to my position while I am reading a radar

**Status:** fixed, 2026-09-07
**Reported:** 2026-09-07, by the user
**Severity:** high — it makes the detail popups effectively unreadable

### What happens

Tap a radar marker, the popup opens with its name, city, type and enforcement
functions. A second or two later the map recentres on the driver's own position
without being asked, dragging the popup and its marker out of view. The same
thing undoes any manual pan or zoom.

### What should happen

1. Reading a popup is never interrupted. Once the user has touched the map —
   panned, zoomed, or opened a popup — the app stops moving the viewport on its
   own until the user asks for it back.
2. Recentring becomes a **manual** action: a visible "centre on me" control the
   user presses when they want it. Auto-follow may resume from that press.

### Cause

`src/app/map.ts:105-107` — inside `showMe()`:

```ts
} else if (follow) {
  map.setView(ll, Math.max(map.getZoom(), 14), { animate: true })
}
```

`follow` is turned on by `arm()` at `src/main.ts:260` (`map.followMe(true)`), so
for the whole of an armed Drive **every position fix** calls `setView`. On a
moving phone that is every second or two. Nothing anywhere checks whether the
user is currently interacting with the map, and there is no control to trigger
recentring by hand — `focus()` exists at `src/app/map.ts:109` but is only ever
called from the nearby-list rows (`src/main.ts:155`) and the simulator
(`src/main.ts:354`).

Note it also forces `zoom >= 14`, so zooming out to see the whole route is
overridden too.

There is a **second, separate trigger** at `src/app/map.ts:101-104`: the
first-fix auto-centre. It fires once even when the app is not armed, so a popup
opened in the first seconds after load gets yanked as well. Both paths need to
respect the same "the user is busy" rule.

### Suggested shape (not binding)

- Track a `userInteracting` flag in `createMap`, set by Leaflet's `dragstart`,
  `zoomstart` and `popupopen` events, cleared on `popupclose` or by the new
  centre control.
- `showMe()` skips `setView` whenever that flag is set — for both the follow
  path and the first-fix path.
- Add a "centre on me" button (bottom-right, above the zoom control) that
  recentres and re-enables following. Give it a visibly different state when
  following is active, so the driver can see whether the map will track them.
- Do not force a zoom level on the user; only recentre.

### Acceptance

- Open a popup, wait 30 s while armed and moving: the popup stays put and stays
  readable.
- Pan away while armed: the map stays where it was put.
- Press the centre control: the map returns to the driver and resumes following.
- Repeat with the app not armed, immediately after load, to cover the first-fix
  path.

### Fix

The decision of whether a fix may move the map is now a policy of its own,
`createViewportPolicy()` in `src/app/viewport.ts`, and `src/app/map.ts` only
obeys it:

- The driver takes the wheel on `dragstart`, `popupopen`, `zoomstart` and an
  arrow-key pan (Leaflet's keyboard pan goes through `panBy` and fires no
  `dragstart`). From then on **no** fix moves the map — the first-fix centre
  included, so a popup opened in the first seconds after load is safe too.
- The hold is sticky. Closing the popup does not hand the map back: a pan has
  no "done panning" event, and popups behaving differently from every other
  gesture is the surprise this bug is made of. The ways back are the centre
  control and arming a Drive, both presses.
- Following no longer calls `setView(zoom >= 14)`. It calls `panTo`, so a
  driver who zoomed out to see the whole route keeps that zoom.
- A "centre on me" control sits bottom-right above the zoom control. It
  recentres, hands following back, and is lit (`aria-pressed`) only while the
  map will actually track — so the driver can see which it is.
- `focus()` from a nearby-list row now takes the wheel as well: asking to look
  at a location and being dragged off it a second later was the same bug.

### Verified

`npm run typecheck`, `npx vitest run` (60 tests, 13 of them new in
`test/viewport.test.ts`) and `npm run build` are green. Behaviour was then
checked in Chrome against the acceptance list, each measurement paired with a
liveness check that fixes were still arriving (a backgrounded tab freezes the
simulator's timers and makes a frozen map look like a pass):

- **Armed, moving, popup open** — 6 s of fixes: map-pane transform constant at
  `translate3d(72px, -1px, 0px)`, popup top constant at `5.28`, popup open.
- **Closing the popup** — 3 s more of fixes, transform still `72px`.
- **Pan while armed** — drag moved it to `-68px` and it stayed there across 4 s
  of fixes.
- **Arrow-key pan while armed** — map panned, control went unlit.
- **Centre control** — recentred (me-dot 1 px off the map centre), lit again,
  and the following resumed on the next fixes.
- **Not armed, first fix after load** (geolocation mocked, popup opened before
  the fix) — position arrived (`±12 m`, me-dot drawn) with the view untouched:
  transform `translate3d(0px, 0px, 0px)`, zoom 8, popup unmoved.
- **Regression** — an untouched load still gets the first-fix centre: zoom 13,
  me-dot dead centre.
