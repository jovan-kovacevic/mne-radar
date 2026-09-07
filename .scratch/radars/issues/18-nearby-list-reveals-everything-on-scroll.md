# 18 — Let the nearby list reach every location, but only if the user keeps scrolling

Type: task
Status: open
Blocked by: nothing

## Question

The nearby list stops at the 12 closest targets. A user who keeps scrolling
should be able to reach every location in the country — but the list must still
open short, so the first thing a driver sees is what is near them, not a wall of
88 rows.

## What happens now

`src/main.ts:136` caps the list:

```ts
    .sort((a, b) => a.d - b.d)
    .slice(0, 12)
```

There is **no 10 km cut-off** anywhere — the cap is a fixed count of 12, and
distance never filters anything. Worth stating plainly because the reported
symptom ("only shows radars within 10 km") and the actual cause are different
things.

Uncapped, the list is **61 rows, not 88**: `buildTargets`
(`src/domain/sections.ts`) collapses each average-speed pair into a single row,
so 88 locations become 34 point targets plus 27 section targets. Whoever
implements this should not "fix" that back to 88 — one row per section is
deliberate, for the same reason the alert engine treats a corridor as one thing.

## What should happen

1. Opens showing roughly what it shows today — the nearest handful.
2. Scrolling to the bottom reveals more, and keeps revealing until every one of
   the 61 rows is reachable.
3. Nothing is revealed until the user actually scrolls for it.

## The trap

`renderNearby()` rebuilds the whole `<ul>` from scratch, and it is called from
`handleFix()` on **every position fix** (`src/main.ts` — `handleFix` →
`renderNearby(fix)`). While a Drive is armed that is every second or two.

So a naive "how many rows are shown" variable held inside `renderNearby` gets
reset constantly, and worse, the rebuild will throw away the user's scroll
position mid-scroll. The revealed-count has to live outside the render, and the
render needs to preserve scroll offset — otherwise this reads as a second,
more annoying version of BUG-001, where the app keeps yanking things away from
someone trying to read.

Reaching the end of the list should also not be a dead end while moving: rows
re-sort by distance on every fix, so an item can move under the user's finger.
Consider freezing the ordering while the user is scrolled past the initial page,
or accept the re-sort and say why it is fine.

## Acceptance

- On load, the list shows only the nearest few; the remaining rows are not in
  the DOM or not reachable without scrolling.
- Scrolling to the bottom repeatedly eventually reaches all 61 rows, with
  sections still appearing as one row each.
- With a Drive armed and fixes arriving every second, scrolling down and
  stopping does not reset the list or jump the scroll position.
- The distance on each row still updates as the user moves.
