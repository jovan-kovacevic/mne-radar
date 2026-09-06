# 11 — Is iOS a first-class alerting target or a declared best-effort tier? Measure it on a real phone.

Type: prototype
Status: open
Blocked by: nothing

## Question

Is iOS a first-class alerting target or a declared best-effort tier? Measure it on a real phone.

Unverified assumptions the whole alerting design rests on. On an installed
standalone iOS PWA, in a car, for a whole drive:

- Does a screen wake lock actually hold?
- Does audio still fire minutes after the gesture that unlocked it?
- What does the hardware ringer switch do to the alert?
- What does Low Power Mode do to position updates?
- What happens to `watchPosition` when the screen locks or the app backgrounds?

Measure, do not reason. The answer decides whether iOS gets the same promise as
Android or an explicit, stated best-effort tier.
