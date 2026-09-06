# 15 — Under whose name, on which domain and jurisdiction, and do we tell anyone first?

Type: grilling
Status: open
Blocked by: 03, 04

## Question

Under whose name, on which domain and jurisdiction, and do we tell anyone first?

These are one decision because each forecloses the others.

- Named individual, company, or pseudonym? WHOIS, the repo owner and the
  Cloudflare account all leak the same answer anyway.
- Which TLD and hosting jurisdiction? A `.me` domain sits under Montenegrin
  registry authority — the single most reachable point of failure, where one
  registry-level order takes everything down without touching Cloudflare.
- Do we approach SAT-TRAKT or the Uprava policije before launching? Doing so
  identifies the requester and ends the anonymous option.
- What is the pre-agreed floor if a takedown demand arrives? Decide it now,
  in the quiet, rather than improvising under pressure.

A domain change after launch orphans every installed PWA and its cached service
worker, so this is close to irreversible.
