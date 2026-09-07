# 22 — The banner moved out of the browser chrome; the top bar and the sheet did not

Type: task
Status: open
Blocked by: 20 needs confirming on a real iPhone first

## Why this exists

Issue 20 fixed the alert banner by moving it out of the band an iOS browser bar
can cover. It did not fix the cause, because the cause is not established — it
moved the one thing a driver has to read at speed. Two other fixed elements are
still anchored to the edges the banner was moved away from, with the same
`env()` assumption that failed.

## What is still exposed

`#topbar` (`src/style.css:47-51`) is `position: fixed; top: 0` with

```css
  padding: max(.55rem, env(safe-area-inset-top)) .7rem .55rem;
```

If `env(safe-area-inset-top)` is 0 in a portrait Safari tab — which is what
issue 20's evidence points at — that padding is `.55rem` and the brand mark, the
app name, the `EN` language button and the `···` settings button all sit inside
the ~100 px the banner was losing. Nobody reported this, and the reason is
probably that the screenshot in issue 20 was taken with the banner up: the
banner is `z-index: 900` and the top bar `z-index: 500`, so the banner was
covering it.

`#sheet` (`src/style.css:107-111`) is `position: fixed; bottom: 0` with

```css
  padding: .35rem .8rem calc(.5rem + env(safe-area-inset-bottom));
```

iOS 26 Safari's default layout puts the address bar at the **bottom**, so this
is the same defect on the other edge for the majority configuration. The
`Počni vožnju` button is at the top of the sheet and survives; the data-vintage
footnote and the OpenStreetMap attribution are at its bottom and do not.

The attribution is the one with a consequence beyond cosmetics — it is the
OpenStreetMap credit, and it being unreadable is a licensing question, not a
layout preference.

## What is not yet known

The same thing issue 20 does not know: which mechanism puts the page under the
browser bars. `?probe=1` (added with issue 20, `src/main.ts`) prints the
banner's measured rect, `visualViewport`, `document.documentElement` size and a
measured `env(safe-area-inset-top)` into the banner. One screenshot from a real
iPhone answers it for all three elements at once, because they share a
containing block.

Do not fix this from the same screenshot issue 20 was fixed from. Run the probe
first — a guard band and a re-anchoring are different fixes and the measurement
picks between them.

## Acceptance

- `?probe=1` has been run on a real iPhone in Safari and the numbers recorded
  here.
- With the address bar visible, in whichever layout the device is set to, the
  language and settings buttons are reachable and the OpenStreetMap attribution
  is readable.
- Checked in the installed standalone PWA and in landscape, where the insets
  differ.
