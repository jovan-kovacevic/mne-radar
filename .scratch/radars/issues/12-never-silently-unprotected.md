# 12 — Must arming verify its own output channel, and when a fix is unusable does alerting fail open or closed?

Type: grilling
Status: open
Blocked by: 10, 11

## Question

Must arming verify its own output channel, and when a fix is unusable does alerting fail open or closed?

The failure that matters is not a false alarm. It is the app showing "armed"
while muted, wake-lock-denied, or receiving fixes it has discarded — a driver
trusting silence that means nothing.

- Does arming prove the channel works: a confirmation tone, an explicit
  wake-lock-denied state, a ringer/mute precondition, and a refusal to display
  "armed" otherwise?
- Which audio pipeline does that force? HTML5 `<audio>` plays under the iOS
  mute switch; Web Audio does not. That is a product decision about whether a
  muted phone should still shout at the driver, not a technical detail.
- Symmetrically: when `coords.speed` is null, or a fix is discarded for
  accuracy worse than 100 m, does alerting fail open, fail closed, or derive
  the missing value — and is the driver told?
