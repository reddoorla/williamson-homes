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

### 2026-10-01 — review round 2

Round 2 verified 13 of round 1's 14 fixes. Its one major was a round-1
regression, now fixed:

- [fixed] Making the hidden header `inert` broke the sticky bar's focus
  handback: `focus()` ran before Svelte had removed `inert`, so focus fell to
  `<body>`. jsdom ignores `inert` for focus, so the unit test passed for the
  wrong reason. Fix: `flushSync()` before the handback.
- [fixed] The mirror case (minor): a focused main-header link lost focus when
  the header slid away. The header now stays shown, and not inert, while it
  holds focus.
- Both cases are pinned by `tests/interaction/header-focus.spec.ts` (a real
  browser). Both tests went red on the round-1 code before the fix.
- Wording: "teal ground" in the round-1 entry on rule 11 means `--primary`
  (#005a78, CSS:L5906's `.ratio-box`), not `--color-teal` (#407f82).

### 2026-10-01 — operator decisions (BACKLOG 53)

- [ACK] Hover fidelity versus AA: **accessibility wins**. The clamps above
  stand as the shipped design, not a pending question.
- [ACK] The 17 census rows (a)–(d) are **accepted**. They are declared in
  `matching/census-deviations.mjs`. Each declaration matches its own labels
  and allows only the field that differs, colour or transform. Negative
  control: a copy of the 1440 log with a declared footer link's size changed
  to 18px counts 1 real mismatch. `census.sh home` exits 0: 0 undeclared, 17
  declared, 7 ambiguous rows that need no fix.

### 2026-10-01 — review round 3 (asked for by the operator): DIRTY, fixed

- [fixed, blocker] The fixed `<header>` box stayed in place, 120px tall, full
  width and transparent, at z-50, after its content slid away. It covered
  the sticky bar, so a mouse could not click a sidekick link, and the top
  120px of the page could not be clicked. The tests had reached the bar only
  through `locator.focus()`, which does no hit-testing. Now the box is
  `pointer-events: none`, and only its visible parts take pointer events:
  the hero header, the hamburger, and the bar background below md once it
  shows. A spec clicks a sidekick link with the mouse and asserts the
  navigation; it went red before the fix.
- [fixed, minor] Pointer focus pinned the header. Ctrl-click (or a
  right-click, then Escape) left focus on a header link, so the header
  never hid. Header focus now pins only when it is `:focus-visible`, i.e.
  keyboard focus. A spec covers the Ctrl-click case; it went red first.
- [fixed, minor] The census declarations are now exact rows: the label and
  both full tuples must match. A label-only match could have absorbed a
  regression on the header's "projects" link. Negative controls on a copied
  1440 log:
  - a declared footer link with its size changed counts 1 real mismatch;
  - a header "projects" row with the footer's colours injected counts 1
    real mismatch.
- [gate] r8 on the round-3 tree: `page-diff — PASS (threshold=0.1)`, 18 regions, no masks, worst "Featured Projects" @390 7.8% (unchanged); `census.sh home` exits 0.

## 2026-10-01 — the steps stage replaces the counters port (operator: "don't worry about matching webflow any more, just make it good")

- [deviation] steps section, home and about-us: the `countersAnim.js` port is
  gone. The heading and steps now pin together as one stage, centred in the
  viewport; each step rises one gap (240px, tall 360px) into the circle while
  the current one fades, with a dwell at each end of every step's scroll
  (0.6 viewport per step, tall 0.85). The last step parks alone and fills
  from `--color-secondary` to `--color-primary` over the first half of a
  0.8-viewport hold, with a one-shot ring, then the whole stage releases with
  it. The entries above that cite `counters.ts` / `counters.test.ts` describe
  the old port; `stage.ts`, `stage.test.ts`, `ProcessSteps.test.ts` and
  `tests/interaction/steps-stage.spec.ts` cover the stage. The waiting step
  shows only its outline circle, never faint text: the first version showed
  its title at 30% and `test:a11y` failed color-contrast on `/` and
  `/about-us` until it was split out. Phones and reduced motion keep the
  plain list. The home gate was not re-run against the reference for this
  section, by the operator's call.

## 2026-10-01 — the steps stage on phones

- [deviation] steps section below md: the stage now pins on phones whenever it
  fits the screen, in one column on the left rail (gap 200px, 300px tall,
  36px circles that fill when lit), and keeps the plain list when it does not
  (about-us at 390×664). In a single column the incoming title would rise
  through the outgoing paragraph, so the stacked handover clears the outgoing
  text by 40% of the step and brings the incoming title in from 55%
  (`stage.ts` STACKED). Reduced motion is still the plain list everywhere.

## 2026-10-01 — the click and gallery interactions (closes two "not ported" lines above)

- [fixed] menu: IX2 e-17/e-21 (a-6/a-10, translateY 0 → 100vh, 500ms
  `easeIn`) and e-19/e-23 (a-7/a-11, back to 0, 500ms `easeOut`) now drive
  the phone menu: it drops from above on open and lifts away on close, with
  IX2's curves as cubic-beziers (`src/lib/easing.ts`, .42,0,1,1 and
  0,0,.58,1). Reduced motion opens and closes in place.
- [deviation] menu at 480–767: the reference slides only at ≤479 (`tiny`);
  the candidate's hamburger shows up to 767, so it slides there too.
- [fixed] project gallery: IX2 e-35/e-36 (`.gallery-section`, a-5/a-4) now
  bring the hero header back while the gallery is on screen, at ≥992 and
  480–767 (`data-wh-header-show` on ProjectView's credits+gallery section,
  carrying that media query). On the reference and here the gallery starts
  where the hero ends, so at those widths the header never leaves a project
  page until the gallery does, and the gallery runs to the footer. Only the
  slide follows it; the phone bar's colour still follows the hero.

## 2026-10-04 — about-us gated: 19 of 21 regions pass; the two left are reference defects at 390

Operator, 2026-10-01: "about us and projects should be matched, my comment
was for the homepage and the steps specifically".

- [harness] `matching/gate-about.sh` runs gate.sh's exact page-diff call plus
  one disclosed `--pin-state` that removes `display:none` `<section>`s on both
  pages. Below 480 the reference hides its desktop builders and collab
  sections and shows later `-resp-rep` twins; page-diff resolves an anchor to
  the first element in document order, hidden or not, so every anchor in
  those sections cut at y=0 (`base1`). Removing a `display:none` section
  changes no pixel. gate.sh is the recipe's file and is not edited; a
  per-page pin in `harness.json` is the recipe change that would retire this
  script.
- [harness] anchors: "Collaborative approach" first matches circle 3's label
  under the intro, so the steps are cut at their first title, "Design and
  Construction". The step titles' "Step N:" moved from an sr-only span into
  each h3's `aria-label`, so the visible text starts with the title and
  heading navigation still announces the number.
- [harness] the dev surface gave every image 1600×1067. It now reads each
  captured file's real size (`src/lib/image-size.ts`), which is what Prismic
  serves in production; the timeline needs it for natural-width photos. Home
  was re-gated after this and the shared spacing changes: r9 PASS, 18 of 18.
- [fixed] hero: `top_space` 8rem and `image_position: bottom` (the
  `bg-about-beach` img, bottom-left, full width, full height below 992),
  `max-h-[90vh]`. 0.0% at 1440 and 834.
- [fixed] circles: the paragraph keeps its 10px margin (as padding, so it
  does not collapse into the list's 64), labels sit flush at 28px leading,
  Webflow row gutters (−10/10), 64px between stacked circles on phones, and
  the section ends at the labels (the third label's pb-6).
- [fixed] timeline rebuilt to the reference: text and photo on opposite
  sides of a 2px line (two 1px borders), alternating, in 32rem rows with a
  16rem last row; photos at natural width; the first photo up 9px; the last
  circle centred (`calc(50% - .625rem)` from the page's own style block, not
  the shared stylesheet's 49%). Phones get the `-resp-rep` layout: line at
  x=34, text from 67, the line stopping at the last entry.
- [fixed] family statement and closing CTA: Statement takes `top_space` /
  `bottom_space` (home's CTA is 0/8rem, about's 8rem/8rem), and the W mark is
  tan (`tan-w-icon`'s filter chain from about's page style block; contact's is
  `blue-w` at 8rem, field `mark_style`).
- [fixed] Commercial Advantage: a flush `w-container` panel, 80px inside
  (16 padding + 64 spacer), 64 between eyebrow and heading and before the
  logo, 444×250 photos from the row gutters, 728px under 992, full width on
  phones, heading `width: 80%`.
- [fixed] steps heading: `heading_style: eyebrow` on about; the tall pinned
  head is a fixed 16rem block as the reference's `counter-head.h-64`; the
  plain list (reduced motion, which is what page-diff captures) gets back the
  `md:min-h-64` #11 dropped and the phone geometry above.
- [content] desktop timeline copy has no trailing periods ("…1950",
  "…1976"); the seed now matches. The phone twin has periods, "1979
  commercial job-site" and "Williamson HQ consctruction"; those are typos in
  the twin and are not copied.
- [a11y] "email us" in the family statement: the reference is #939393, 3.0:1
  on white; ours stays secondary. Accessibility wins (operator 2026-10-01).
  Declared in `census-deviations.mjs`.
- [deviation] step circle numbers ("1"–"4") in the census follow the pinned
  stage; declared for home and about-us.
- [ACK-REQUIRED] vw390 "We treat our clients like family" FAIL, Δh 10.2%,
  mm 1.8%: the reference h3 is `width: 620px`, so on a 390 phone it runs off
  the screen (the page scrolls sideways). Ours wraps to four lines inside the
  screen. Matching it means shipping cut-off text.
- [ACK-REQUIRED] vw390 "Our mission as a commercial company" FAIL, Δh 9.4%,
  mm 0.4%: the region ends at the first step. The reference's phone steps
  twin has no intro paragraph and is headed "A Family of Builders" (a copy
  of the previous section's heading); ours keeps "Collaborative approach"
  and its intro on phones, so the region is taller.
- [gate] r10 (final tree): `page-diff — FAIL (threshold=0.1)`, pin-state disclosed, no
  masks; 19 PASS, worst passing region 1.8%; FAIL only the two rows above.
  Census over both pages: `home 0 0 0`, `about-us 0 0 0`, "Phase 3 CLEAN —
  0 undeclared type mismatches (45 declared, 17 ambiguous)"; the ambiguous
  rows are the numbers 1–4, where the anchor circles match and the stage
  circles sharing the text do not.
- [review] adversarial review of #16, one major and five minors fixed: the
  hero's `max-h-[90vh]` (added for about) applied to every hero and would clip
  a tall heading's buttons on a short phone, so it is gone (about never needed
  it: its photo is absolute); an empty step title no longer reads "Step 2:
  null"; timeline rows are `min-h-128`/`min-h-64`, so a tall CMS photo grows
  its row instead of overlapping the next; `md:pr-0` no longer rides beside
  `md:pr-16` on the same step; `max-[991px]`/`max-[479px]` (Tailwind v4:
  `width < 991px`) became `max-[992px]`/`max-[480px]` so 991 and 479 behave as
  Webflow's inclusive `max-width`. Re-gated: about-us r11 19 of 21 (same two
  ACK rows), home r11 PASS 18 of 18. The review also noted home's plain list
  changes on phones (the x=34 column and `md:min-h-64`): intended, both
  references share that geometry, and home passes.

## 2026-10-04 — projects and project gated: both PASS at 1440/834/390

- [fixed] projects hero is heading-first: the reference puts "Featured
  Projects" above the W, with the buttons 6rem below, on 8rem/4rem. PageHero
  took a `layout` field (`mark-first` default, `heading-first`).
- [fixed] project list: one column of 60% squares alternating sides above 480,
  stacked and centred under it, titles as eyebrows aligned to the photo's
  bottom edge. Before this it was a three-column card grid.
- [fixed] the 1px phone inset. Below 480 the reference's `.px-4` carries a
  transparent 1px left border (the same rule Timeline already copies), so its
  content is 357px wide at 390, not 358. Each photo is 1px shorter; over 14
  gallery photos that is 18px, which alone failed the 390 gallery region at
  19%. Both the list and the gallery take it now.
- [fixed] credits: the reference's paragraph scale (17/32, 14/32, 12/24) with
  10px under each line. The margin is kept inside the block (`flow-root`), or
  it collapses into the gallery's 8rem and the photos start 10px high.
- [fixed] gallery ends 4rem under the last photo (each reference item is
  followed by an `h-16` spacer), not 8rem.
- [fixed] footer 16px too tall on every page: the links sat in 24px list rows;
  the reference's links are `display:block` at their own 20px (16.8px on
  phones). The links are block now; 612px at 1440, as the reference.
- [fixed] project title takes the heading ladder (`wh-h3`: 22/400, 20/300,
  16/300); it was a fixed 22/400. Found by the census at 834 and 390.
- [content] pv-malaga-cove, manhattan-beach and hermosa-home-gym show a
  "Design: …" line from a separate Webflow field the migration dropped. The
  seed now carries it in `credits`; the live documents need it too (Prismic
  release). The reference spells it "Christien Vroom" on Malaga Cove and
  "Christine Vroom" on the other two; copied as is, and flagged to the
  operator.
- [instrument] the project page's "Home" anchor is dropped. page-diff's
  anchor query is `h1–h6,p,a,li,span,div,section,button`: it has `section`,
  which the reference's footer is, and not `footer`, which ours is. The
  reference cut at the footer top and ours at the first link, 128px lower,
  so every footer region read Δh 18–21% from the cut alone. The last region
  now runs from the credits through the footer.
- [gate] p8 (final tree): project 6/6 PASS, projects p5 9/9 PASS, no masks, no
  pin-state. Census: projects `0 0 0`, project `0 0 0`, "Phase 3 CLEAN".
  Re-gated after the shared footer change: home p6 18/18, about-us p6 19/21
  (the two ACK rows above, unchanged).
- [review] #17 adversarial review, no majors in code, four minors fixed: the
  footer links were block and so full-row tap targets on phones; they are
  `w-fit ml-auto` now. The project anchor is "Design:" so the operator's
  Christien/Christine call cannot unresolve it. The hero order test fails on
  an unexpected child instead of calling it "buttons", and the list test
  checks the title's bottom/left alignment. Re-gated p9: project 6/6, home
  18/18.

## 2026-10-04 — Malaga Cove credit corrected to "Christine"

- [content] the operator confirmed the designer is Christine Vroom; the
  reference's "Christien" on pv-malaga-cove is a typo and is not copied. The
  project gate anchors on "Design:", so it is unaffected.

## 2026-10-04 — contact gated: 6 of 9 regions pass; the 3 left are the a11y teal

- [fixed] headshots: the reference is a timeline, not a grid. Two columns
  share a centre line 640px tall. The first person sits 24rem down the left
  column and the second at the top of the right, each a 16rem block, with the
  192px photo centred on the line and the text 129px off it. A 20px circle caps
  the line. On phones each person is a 384px block with its own side line,
  right then left, 128px apart, and the photo 96px above the text. TeamContacts
  was rebuilt to that; DOM and reading order stay Mark, then Brian, as in the
  reference.
- [fixed] the links in the contact lines are 14px, 16px from 992, with a 1.2
  line on phones; they were inheriting the paragraph's 17px and 12px/24px.
  Found by the census.
- [fixed] hero `bottom_space: 4rem`, and the contact info Statement has no top
  space (`top_space: 0`): the blue W is its first child.
- [a11y] [ACK-REQUIRED] vw1440/834/390 `top` FAIL, mm 93–98%, dE ≈ 21: the
  hero ground is #407f82, not the reference's #77b9bc (white text 4.59:1
  against 2.3:1; LEDGER rule 8 above). Control: a disclosed diagnostic run
  that paints our hero the reference teal (`--pin-state` on `[data-wh-hero]`,
  `matching/out-diagteal-contact`, not a gate result) reads 0.0%, 0.0% and
  1.1%. The colour is the whole difference.
- [a11y] the hero's phone button is #939393 on teal in the reference (about
  1.4:1); ours is white. Declared in `census-deviations.mjs`.
- [deviation] at 390 the family heading is 620px wide in the reference, as on
  About Us; ours wraps. The region still passes (9.4%).
- [gate] c4: contact 6/9 PASS, the three FAILs the hero colour above, no masks,
  no pin-state. Census `contact 0 0 0`, Phase 3 CLEAN (10 declared).
