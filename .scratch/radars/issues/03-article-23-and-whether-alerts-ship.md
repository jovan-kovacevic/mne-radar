# 03 — Does Montenegrin law restrict warning drivers about enforcement locations, and if it might, which of three products ships?

Type: research
Status: open
Blocked by: nothing

## Question

Does Montenegrin law restrict warning drivers about enforcement locations, and if it might, which of three products ships?

The design spec has no legal section and never mentions this. It is the only
open question that can invalidate the core feature rather than just the data —
and the exposure would land on users, not on the publisher: every user of the
alert feature would be committing an offence the app instructed them to commit.

Several European countries restrict radar-warning devices and apps. Establish
what Montenegro's road traffic safety law says — Art. 23 and its amendments,
including the Sluzbeni list CG text the gazette site does not serve
automatically — and whether it reaches a static POI database on a phone as
opposed to a live detector.

If it cannot be ruled out, the fork is: (a) map only, no alerts; (b) alerts
default-off behind an informed acknowledgement; (c) alerts as designed. The
arming gate makes all three shippable from one codebase, but the choice must
precede launch copy, screenshots, and anything cached offline.

Resolve with: the legal position, the confidence in it, and a recommended
product shape.
