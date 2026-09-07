# Bugs

Open defects in the Montenegro radars app. One heading per bug. Anyone picking
one up: reproduce it first, then fix, then say how you verified.

---

## BUG-001 — The map yanks itself back to my position while I am reading a radar

**Status:** open
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
