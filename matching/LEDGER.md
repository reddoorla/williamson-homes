# Deviations / masks / floors ledger

Append-only, and written at the moment a decision is made — not reconstructed at
the end of a round, when the reason has already been lost. An entry is never
edited to be right: a later entry corrects an earlier one and says which.

Every entry in `matching/floors.mjs` and `matching/census-deviations.mjs`, and
every mask in `matching/harness.json`, needs a line here. Without one the gate
has been quietly widened and nothing records who widened it, or why.

- [deviation | floor | mask | a11y] `<region or selector>` — what differs, why
  it is accepted, and the evidence: a spec citation, a census row, a gate run.

## 2026-10-01 — OD7-P1b (favicon, hovers, counters, header scroll interactions; Phase 1)

- [instrument] `gate.sh` proven on a known-good input before any of its FAILs
  were trusted. `MATCH_CAND=http://localhost:5174 SPEC_OPTIONAL=1 bash
  matching/gate.sh ctrl0` used a local proxy (`matching/probes/ref-as-cand.mjs`)
  that serves the LIVE reference at the candidate's paths, with a `<base>`
  pointing at the live host. Result: `ALL DONE (ctrl0) — 2 of 2 page(s)
  measured`, every region `mm=0.0% dE=0.0` at 1440/834/390, 18 home regions
  and 15 about-us regions, threshold 0.1, no masks, clock frozen. The baseline
  against the real candidate, run the same hour (`base0`), FAILed 6 home and
  15 about-us regions, so the same gate can also fail.
- [deviation] census → anchors on home: census section 5 (counters) is
  measured inside region "“I was kept in the loop", and section 8 (footer)
  inside "Make your dream home a reality.". Every counters text is duplicated
  in a `display:none` twin, and page-diff resolves anchors with no visibility
  test (skill `lib/capture.mjs:419-425`). At 390 the hidden desktop section
  wins, reads as y=0, and puts the regions out of order. The footer's link
  texts collide case-insensitively with the header's. Neither is a mask: both
  sections are still diffed, just inside a larger region. The counters'
  behaviour is verified separately (states evidence, `ProcessSteps` tests).
- [deviation] `scrollbar-gutter: stable` removed from `src/app.css`, site-local.
  The reference's `body.clientWidth` equals the viewport (1440/834/390) and
  the candidate's was 15px narrower, which shifted every centred element
  7.5px. Skill Phase 0.4; not to be upstreamed to the starter.
- [deviation] matrix: 480–767 has no matrix viewport. The reference shows the
  two-column counters from 480, while the candidate's counters switch to
  their two-column layout at `md` (768). Known and not measured; recorded so
  it is not mistaken for coverage.
- [deviation] about-us is specced (`spec-sections/about-us.md`) but not in the
  gate table. Its `base0` baseline FAILed every region (hero mm=82.4% at 1440;
  Δh 12–23.5% on three regions). Matching it is a separate geometry item, so
  OD7-P1b's gate is home's.
