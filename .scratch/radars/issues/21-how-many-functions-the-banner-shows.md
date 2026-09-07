# 21 — The banner shows three enforcement functions and drops 545

Type: task
Status: open
Blocked by: nothing

## Why this exists

Issue 20 said to note this while the banner layout was open and not to fold it
in silently. The banner was re-anchored for issue 20; the number of functions it
prints was left exactly as it was.

## What happens now

`src/app/banner.ts` keeps the cap the banner has always had, now named:

```ts
/** As many enforcement functions as can be read in a glance. */
export const MAX_FUNCTIONS = 3
```

It was `top.location.functions.slice(0, 3)` in `renderBanner`. Behaviour is
unchanged, and `test/banner.test.ts` pins it so a change has to be deliberate.

## What the dataset actually holds

Counted over all 88 locations in `src/data/radars.json`:

| functions at a location | locations |
|---|---|
| 7 | 8 |
| 8 | 29 |
| 9 | 38 |
| 10 | 3 |
| 14 | 1 |
| 15 | 9 |

The floor is seven. **Every one of the 88 loses at least one function to the
cap**, and 545 entries are dropped in total. This is not an edge case at the
busy Podgorica intersections — it is every alert the app has ever raised.

## The decision that is actually open

Not "three or fifteen". The source document's function list mixes two different
things, and only one of them is about the driver:

Things a driver can act on — a reason to slow down, buckle up, or put the phone
down:

```
Mjerenje trenutne brzine · Prolazak kroz crveno svjetlo ·
Detekcija sigurnosnog pojasa · Detekcija upotrebe mobilnog telefona ·
Detekcija kacige · Nepropisno preticanje · Vožnja u zabranjenom smjeru ·
Nepropisno kretanje po traci · Nepropisno skretanje ·
Nepropisno zaustavljanje i parkiranje
```

Things that describe the installation, not the driver's exposure:

```
Detekcija vozila · Klasifikacija vozila · Brojanje saobraćaja ·
Pregledni i verifikacioni video · Automatsko prepoznavanje registarskih oznaka
```

`Brojanje saobraćaja` is traffic counting. `Pregledni i verifikacioni video` is
the operator's own review footage. Neither is a thing anyone can be fined for,
and both are inside the first three at some locations — so today the banner
sometimes spends one of its three lines telling a driver at 90 km/h that the
site counts traffic.

The labels already exist in `FUNCTION_LABELS` (`src/app/i18n.ts:100-116`), so
whatever is chosen is mostly a filter and an ordering, not new copy.

## One label is missing, and it is the second most common one

`FUNCTION_LABELS` has no entry for `Mjerenje prosječne brzine`. `functionLabel`
falls back to the raw string (`src/app/i18n.ts:127-129`), so the banner prints
the full 24-character Montenegrin phrase — untranslated even with the app in
English. 55 of the 88 locations carry that function and 54 of them carry it
inside the first three, so this is on the banner for 54 of 88 alerts.

It is also the longest thing on the `.what` line, which is the line that pushed
the number off an iPhone in the first place. Whatever is decided above, the
short label is worth adding on its own:

```ts
'Mjerenje prosječne brzine': { me: 'Prosječna brzina', en: 'Average speed' },
```

## Against showing more

The banner is read in a moving car, in one glance. The whole point of issue 20
was that the driver was getting the function list and not the distance. Adding
lines to the thing that already crowded out the number needs an argument, not
just the observation that data is being dropped.

## Acceptance

- A decision is recorded on whether the banner filters by driver relevance,
  orders by it, caps by count, or keeps all three as they are.
- If the rule changes, `MAX_FUNCTIONS` and the tests that pin it in
  `test/banner.test.ts` change with it.
- The banner's height stays bounded: whatever is shown, the distance line stays
  where issue 20 put it, against the top of the sheet.
