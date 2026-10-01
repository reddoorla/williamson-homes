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
- [deviation] counters release: the reference's "stick last" step (`countersAnim.js`
  `countersAnimation`, final `if`) hides steps 1–3, unpins the head and
  `scrollTo`s. Its upscroll listener then immediately undoes this. Measured live
  2026-10-01: at 1440 the page stayed at y=3578 for 52 consecutive 60px wheel
  steps and 25 consecutive 200px steps; at 834 it jumped back 700px once, then
  stayed at y=3756. The port releases instead by the sticky containing block
  ending: the last step reaches 256 just as the list ends, every step is at
  opacity 0 except step 4, and the section scrolls away
  (`matching/probes/counters-cand.mjs`). Everything before the release follows
  the script's phases (src/lib/slices/ProcessSteps/counters.test.ts pins the
  live trace's 0.65 and 0.23).
- [deviation] counters phase one: the script measures `prog` against 240 in
  phase one and 256 in the later phases. The port uses 256 throughout, so step
  2's text fades in 16px earlier than the reference's (measured live: 0.60 where
  the port reads 0.70 at the same scroll).
- [a11y] counters at rest: under reduced motion, without JS, and below `md`,
  every step's text shows. The reference hides texts 2–4 at rest
  (`.counter-subtext { opacity: 0 }`, CSS:L4319, L4360) and reveals them only by
  script. Step 1's circle is lit at md+, as on the reference at rest; on phones
  no circle is lit, as in `-resp-rep`. In the pixel gate this sits inside region
  "“I was kept in the loop": r5 0.4% / 0.5% / 1.8%.
- [deviation] fonts: `static/fonts/montserrat-latin.woff2` is replaced by the
  file the live reference actually loads in headless Chromium,
  `fonts.gstatic.com/s/montserrat/v31/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2` (37956 B,
  md5 311d352d…), and `montserrat-latin-italic.woff2` is added from
  `…/JTUQjIg1_i6t8kCHKm459WxRyS7m.woff2` (39632 B, md5 7921052e…). The capture
  (and the old file, md5 c154477b…) holds the unhinted build Google gave the
  capture tool, and its advance widths differ: "WILLIAMSON HOMES" at 300 14px
  is 161px with it and 152px with the served file, which equals the
  reference's 152. That difference made Construction Partner's first paragraph
  wrap to 3 lines instead of 4 at 834 (Δh 11.3% in r1). macOS ignores hinting,
  so every platform renders what the reference serves it. The italic replaces
  a synthesized oblique in the footer.
- [a11y] `.opacity-75` (CSS:L4884) is not applied to the Featured Projects
  titles or the Let's Talk heading: 0.75 × #6d6a69 on white is about 3.2:1.
  This was already the repo's decision (`review-fixes.test.ts` "renders
  featured project titles … at full opacity"); recorded here so the census
  reader knows it is deliberate.
- [a11y] hover clamps, where the reference's hover takes text below 4.5:1 on a
  flat ground (`src/hover-rules.test.ts` computes each):
  - Rule 1 (`a:hover { outline: 0 }`) is not adopted, so a hovered, focused
    link keeps its focus ring.
  - Rule 4 is .87 on the footer links (white on secondary: 4.11 at .8) and .92
    on the Featured titles (secondary on white: 3.53 at .8). It is exactly .8
    on the header links, logos and photo links.
  - Rule 9 (secondary paired button) keeps #6's 4% tint with no fade (the
    reference's .15 + .8 is 3.02).
  - Rule 10 (primary paired button) keeps the .15 tint with a .85 fade
    (4.09 at .8).
  - Rules 7 and 8 on photo grounds (Let's Talk, hero) are exact: contrast on a
    photo has no flat ground to clamp against.
  - ACK-REQUIRED as a class: fidelity or AA on hover is a product call (see
    BACKLOG Operator decisions).
- [a11y] the CTA "Email Us" (`.button-default.mx-6.text-color-secondary`,
  CSS:L5858) is #939393 on white on the reference, 3.07:1. The candidate keeps
  `--color-secondary`. This is census row "email us" (ambiguous) at every
  viewport.
- [deviation, ACK-REQUIRED] census rows left after r5, none of them a size,
  weight or line-height:
  - (a) "—tim holmes, homeowner": uppercase comes from CSS on the candidate and
    is typed into the reference's text. The glyphs are identical.
  - (b) counter numbers "1" and "3": their colour depends on how far the
    reference's script had run when the census captured it. It lit circle 3 /
    unlit circle 1 mid-scroll.
  - (c) "let's get this project started!": the reference is #333 (an h3 with
    no colour class, body colour CSS:L2063) above 479 and secondary at ≤479
    (CSS:L7265). Statement has no heading-tone field, so the candidate is
    secondary everywhere. Matching it needs a model field.
  - (d) footer links "home/about/contact us/projects": the reference computes
    rgb(109,106,105) on a background of the same colour, so its links are
    invisible. The candidate keeps them white. This is a reference defect.
- [deviation] header:
  - It is now `position: fixed` and runs IX2 e-9…e-16 and e-25…e-32 (shared
    chrome table), keyed off `#main-content`'s first child, i.e. the hero.
  - At ≤479 the logo is hidden and the 2rem hamburger (the reference's
    `menu.svg`) sits at top 24 / right 32, as live.
  - The open menu is still the starter's dialog: the click IX (e-17…e-23
    slide) is outside OD7-P1b.
  - The hamburger's .66 hover applies below `md` (768), not only at ≤479,
    because the candidate shows the hamburger up to 767.
  - The sidekick now waits until hero bottom + 200px, as the page script does,
    but still shows on any upscroll. The script's 100–1000px delta window is
    not ported.
- [a11y] footer copyright is 14px/20 from md up (body, CSS:L2063; `.italic-text` adds only `padding-left: 20px`, CSS:L6489) and 12px below,
  where the reference inherits 8px (body ≤767, CSS:L7010). 8px is not legible.
- [gate] r5, run on the working tree that this PR commits: `page-diff — PASS (threshold=0.1)`,
  18 regions at 1440/834/390, no masks, worst "Featured Projects" @390
  mm=7.8%. Strikes clear. The run history r1 → r5: r1 FAILed top/featured
  on width and font; r2 FAILed Construction Partner Δh; r3 PASSed; r4 was NOT
  MEASURED (svelte-kit sync reloaded the page mid-capture); r5 PASSed.

### 2026-10-01 — review round 1 (three lenses) folded in

Corrections to the entries above, made before this PR landed. The review
caught three wrong statements:

- The phase-one entry first said "16px later". It is earlier: the reference
  subtracts 240, so its `prog` is larger at the same scroll and its opacity
  lower. Corrected in place.
- The copyright and h3-weight citations cited the wrong lines (CSS:L6489 is
  only `.italic-text { padding-left: 20px }`; the h3's 300 is CSS:L6830).
  Corrected in place.
- The rule-9 clamp's stated reason named white. The binding ground is
  `--color-light` (#f1f2f2). Secondary text there is 4.78:1 at rest, and the
  tint reaches 4.5 at 5% (4.555 at 4%, 4.444 at 6%), which is why the
  candidate keeps 4% (`review-fixes.test.ts` checks both grounds). The
  reference's own figure uses its #939393 text, not #6d6a69: 2.02, not 3.02.

New entries:

- [a11y] rule 7 is clamped on about-us's "Go To Site" too (secondary single
  button). It gets the same 4% tint with no fade as rule 9; the reference's
  .35 + .8 is below 3:1 there.
- [fixed] rule 11: the faded photo link now sits on the teal ground, as the
  reference's `.ratio-box` does (CSS:L5906). Before this, the photo faded
  toward white.
- [fixed] counters: the step number now fades with the title in the final
  approach. `this.three.find("h3")` selects both, because the number is an h3
  inside `.circle-three`.
- [fixed] header easing: IX2 `a-4`/`a-5` have `easing: ""`, which IX2 applies
  as linear. The hamburger and close buttons use CSS `opacity .2s`, i.e.
  `ease`. Both were on Tailwind's default curve.
- [deviation] header at 480–767: the bar is 80px tall (the reference keeps
  120 down to 480). The sidekick shows from 768 (the reference's from 480).
  IX2 e-9/e-10's translate also runs at ≤479 on the reference, where
  `.hero-header` is the off-screen menu panel, so nothing visible moves. The
  candidate's breakpoint is `md` (768) everywhere, and the matrix has no
  480–767 viewport.
- [deviation] project template: the hero is the first `section[data-wh-hero]`
  in ProjectView. IX2 e-35/e-36 (the gallery shows the header again while it
  is in view, at ≥992 and 480–767) are not ported; project pages are not in
  the gate.
- [deviation] about-us counters: on the reference, `reinit()` sets
  `.counter-last` to `margin-top: 240px` inline on every frame, which
  overrides the 40rem `.counter-last.about` rule (CSS:L6121) while the
  script runs. The port keeps 40rem spacing (`step_height: tall`). The live
  Prismic about-us document has no `step_height` yet; until someone sets it to
  "tall" in Prismic (a content edit, outside this item), live about-us runs
  the 15rem spacing.
- [fixed] counters on a heading taller than 16rem (live about-us's intro is
  284–316px at 800–1600 wide): the steps now pin at the measured heading
  height, never under it, and `counterStates` uses the same value.
- [fixed] header on pages with no hero: the hero is now marked
  (`data-wh-hero`), not guessed from the first child. On project pages the
  first child was a 14331px `<article>`, so the fixed header never hid.
  Without a hero, the header behaves as if the hero were the header's own
  120px. The slid-away header is `inert`, so Tab cannot reach links that are
  off-screen.
- [a11y] rule 7 on Let's Talk (primary text on `--color-accent` #dee8eb, a
  flat ground behind the photo): the reference's .35 + .8 is 2.91:1. The
  candidate uses the same colour at a .10 tint and .90 opacity (4.52).
- [a11y] rule 8 on the teal hero (`/contact`, white text on #407f82, 4.59 at
  rest): any fade breaks AA (3.66 at .8). The paired light buttons there
  (`flat`) keep the .15 tint with no fade (4.73). On photo heroes (the
  `--primary` ground) the exact .15 + .8 stays (5.39).
- [deviation] the scrolled bar's teal background applies below `md`, not only at
  ≤479. Otherwise the white hamburger sat on white content at 480–767.
- [a11y] `scroll-padding-top` is 80px below `md` and 120px from `md` up, so a
  focused element or an anchor target is never under the fixed bar (WCAG
  2.4.11). The reference has none.
- [a11y] the phone menu dialog carries a home logo link at its top. The
  reference's menu panel holds the same logo (`.hero-header` is the panel at
  ≤479); without it, home was reachable only from the footer.
- [a11y] the sidekick's logo sits inside its "Main, sticky" nav landmark
  (axe `region`).
- [gate] r7 on the round-1 tree: `page-diff — PASS (threshold=0.1)`, 18 regions,
  no masks, the same numbers as r5 (worst "Featured Projects" @390 7.8%). r6
  was NOT MEASURED: `svelte-kit sync`, run by the build just before, reloaded
  the dev page mid-capture. The census is unchanged: 17 rows + 7 ambiguous,
  all of them the ACK-REQUIRED colour/transform rows above.
