# 09 — What does the app actually say to the driver — which string, and does it name what is enforced?

Type: grilling
Status: open
Blocked by: 06, 07

## Question

What does the app actually say to the driver — which string, and does it name what is enforced?

Printed names run long and prose-heavy: `065 - Carine - magistralni put M-8,
dionica Niksic - Grahovo (van naselja)`, and one ends
`(u blizini restorana Manjez)`.

- Does the schema extract `road` and `section` as fields, or leave them as
  prose inside `name`?
- During a Drive, does the banner render the printed 90-character name or a
  derived short label — and is it the same string the nearby list and the
  detail sheet use?
- Does the alert name what is enforced there, or say "radar" for everything?
  Several Locations detect seat belts, phone use and helmets. A driver told
  only "radar" will slow down and keep holding their phone.
