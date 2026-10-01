## home

Reference `/`, candidate `/dev/match/home` (assemblies in `src/lib/site-pages.js`).
Citations use the forms set out in "shared chrome".

### Section census (live, 1440 × 900, 2026-10-01)

| #   | section (reference class)         | anchor                              | y @1440 | h @1440                  | y @390                   |
| --- | --------------------------------- | ----------------------------------- | ------- | ------------------------ | ------------------------ |
| 1   | `hero-section` (+ fixed header)   | `top`                               | 0       | 810                      | 0                        |
| 2   | `featured-projects`               | "Featured Projects"                 | 810     | 647                      | 810                      |
| 3   | `construction-partner`            | "Construction Partner"              | 1457    | 492                      | 2225                     |
| 4   | `home-image-quote-block`          | "“I was kept in the loop"           | 1949    | 934                      | 2701                     |
| 5   | `dream-home-count` (≥480) / `dream-home-count-resp-rep` (≤479) | merged into 4, see below | 2882 | 1216 | 3699 |
| 6   | `cta-section`                     | "Let's get this project started!"   | 4098    | 267                      | 4431                     |
| 7   | `lets-talk-section`               | "Make your dream home a reality."   | 4365    | 830                      | 4698                     |
| 8   | `footer`                          | merged into 7, see below            | 5195    | 612                      | 5027                     |

Page height: 5807 / 5376 / 5857 at 1440 / 834 / 390.

Two census sections have no anchor of their own, and the LEDGER records both:

- **5 (counters).** Every text in `.dream-home-count` also appears in
  `.dream-home-count-resp-rep`, and one of the two is `display: none` at
  every viewport. page-diff resolves an anchor to the first element in
  document order with no visibility test (`lib/capture.mjs:419-425` in the
  skill). At 390 that is the hidden desktop section, read as y=0, so the
  regions come out of order. Section 5 is therefore measured inside region 4.
- **8 (footer).** Its link texts ("Home", "About", …) collide
  case-insensitively with the header links, and its only unique string sits
  at its bottom. It is measured inside region 7.

### 1. Hero

- `.hero-section` (CSS:L5749, L5754, L5776): `min-height: 90vh; max-height:
  90vh`, so 810 at 900 tall. `--primary` ground, `overflow: hidden`,
  `display: flex; align-items: baseline`, so the content column sits at the
  TOP of the band.
- Photo: `img.ken-burns-bg` (CSS:L6508): `position: absolute; top: 50%;
  min-width: 100%; min-height: 100%`. A page script sets `margin-top:
  -height/2`, which centres it. At ≤991 it is `height: 100%; width: auto;
  object-fit: cover` (CSS:L6953). HEAD-STYLE animates `ken-burns` from
  `scale(1)` to `scale(1.8)`, 60s, ease-in-out, infinite alternate.
- Content: `.px-4.w-container` (max 940, CSS:L689), in this order:
  - `spacer-32` 8rem + `spacer-16` 4rem, so the W mark starts at y=192.
  - The W mark `h-40`: 160 tall, 244.3 wide, centred.
  - `spacer-16` (64).
  - h3, 22px/36px white Montserrat 400, `px-8`. The column is 482 wide and
    the h3 450, so the text wraps over 2 lines (72 tall) at y=416.
  - `spacer-8` (32).
  - Buttons: two `button-default mx-6`, 39 tall, at y=520.
  - `h-32`.
- Phones: the h3 is 16px Montserrat 300 (CSS:L7022, plus the body weight)
  and the column is 357 wide. The h3 is 20px at 834.

### 2. Featured Projects

- `.px-4.max-w-1280.w-container`: inner width 1248 at 1440, 802 at 834,
  357 at 390. Then `h-16`, the h3 "Featured Projects" (22px/36 primary;
  20px at 834; 16px/36 at ≤767), `h-16`, then a `w-row` of three `w-col-4`
  (10px padding, row −10px).
- Card width is (inner − 40)/3: 402.7 at 1440, 254 at 834. At ≤767 the
  columns stack (CSS:L873) with no gap between rows, and each card is the
  inner width − 20: 337 at 390.
- Each card is a `.ratio-box` (square, `--primary` ground, CSS:L5906). The
  photo is an inline `background-image` with `background-size: cover` and
  `background-position: 50%` (CSS:L5927). Then `h-8` (32), then the h4
  title (15px/24px, letter-spacing 2px, uppercase, `opacity: .75`,
  CSS:L4884), then `pb-6` (24). One item is box + 80px tall.

### 3. Construction Partner

`h-16`, h4 "Construction Partner" (`opacity-75`), `h-8`, two centred
paragraphs (`m-width-620px`; 17px/32 Montserrat 300, 12px/24 on phones)
separated by `h-8`, then `h-16`. Passing in the baseline at every viewport.

### 4. Quote band (with section 5)

The `.home-quote-bg-image` photo (`testimonial-url.jpg`, cover, 50%), `h-64`,
the W mark `_w-32` (8rem wide), `h-16`, the h3 quote in white with a `<br>`,
`h-8`, the attribution p, `h-64`, `h-32`.

### 5. Counters ("Let's Build Your Dream Home")

- Structure: `section.dream-home-count > .w-container`, then:
  - `.counter-head.h-64.position-sticky.bg-color-white` — 16rem, sticky at
    `top: 0`, z-index 4, white (CSS:L3506, L6636). It holds `h-32` and the
    h3.
  - `.cols-counter-wrapper.display-flex` — sticky at `top: 256px`
    (CSS:L5953). It holds two `_w-half` columns, each with a 0.5px secondary
    border on the shared edge (CSS:L5967, L5975).
    - Right column: `counter-one` (15rem, sticky 256, CSS:L5993), then
      `counter-three` (mt 15rem, 15rem, sticky 256, CSS:L6358), then a 15rem
      invisible `counter-placeholder` (CSS:L6548).
    - Left column: `counter-two` (mt 15rem, 15rem, sticky 256, CSS:L6381),
      then `counter-last.home` (mt 15rem, 15rem, sticky 256, CSS:L6109).
  - So the steps sit 15rem apart in document flow, alternating right and
    left, and the section is 256 + 4 × 240 = 1216 tall.
- Circles: 5rem, 1px secondary border, white. Active is `--secondary`
  (CSS:L6009, L6023), with `transition: background-color .2s
  cubic-bezier(.215,.61,.355,1)` (CSS:L6027). HEAD-STYLE offsets them
  `left: calc(-4.5rem - 1px)` (odd) and `right: calc(-4.5rem - 1px)` (even).
  The number h3 turns white on `.active` (CSS:L5717).
- Behaviour (`countersAnim.js`, loaded with `$.getScript` from raw.githack;
  never loaded at runtime here):
  - It runs only while `.counter-head` is pinned at `top: 0`.
  - Phase p is the index of the furthest step whose top has reached 256.
    `prog` is the next step's (top − 256) / its height.
  - The active circle is step p. The step before p fades by
    `easeInQuintic(prog)`. Steps before that are at opacity 0.
  - Step p+1's subtext fades in by `1 − easeInCubic(prog)`; later subtexts
    are 0.
  - In the final approach, step 3's title and text fade by
    `easeOutCubic(prog)`, and the last circle lights once `prog < .1`.
  - When the last step reaches 256, its "stick last" step hides steps 1–3,
    unpins the head and `scrollTo`s.
- Measured live (`matching/probes/counters-live.mjs`, 2026-10-01):
  - The phases and fades follow that description exactly, step by step, at
    1440 and 834.
  - The release step TRAPS the wheel. At 1440 the page stayed at y=3578 for
    52 consecutive 60px wheel steps, and for 25 consecutive 200px steps.
  - At 834 it jumped back 700px once, then stayed at y=3756.
  - This is a defect in the reference, not a design; LEDGER records the
    deviation.
- ≤479: `.dream-home-count` is hidden (CSS:L7419) and `-resp-rep` shown
  (CSS:L7555): a static bordered list, with 2.25em circles at −2.2em
  (CSS:L7559). It has no sticky positioning and no script.

### 6. CTA band

`h3` "Let's get this project started!" (22px/36 #333), `h-16`, then two
`button-default mx-6`: secondary #939393 with a #b1afae border (CSS:L5858),
and primary (CSS:L5872). Then `h-32`.

### 7. Let's Talk band (with section 8)

A `.ratio-box-2._16-9` (56.25%, CSS:L6175) holding the `.img-container.surf`
photo (cover, 50% 40%, CSS:L6179). Over it: the h2 "Make your dream home a
reality." (32px/36, uppercase, 2px, `opacity-75`) and a primary
`button-default`. Then `h-32` and the footer (shared chrome).

### Interaction inventory: 11 entries

1. Header links ×3 and logo: `a:hover` (hover rule 4).
2. Header show and hide on hero in/out of view (IX2 e-9/e-10).
3. Sidekick header on upscroll (page script).
4. ≤479 header background on/off (IX2 e-25/e-26).
5. ≤479 hamburger: opens the menu panel; hover rules 14 and 15.
6. Hero Email Us and Call Us (hover rule 8).
7. Featured cards: photo link ×3 (hover rule 11) and title link ×3 (rule 4).
8. Counters, scroll-driven (section 5).
9. CTA buttons ×2 (hover rules 9 and 10).
10. Let's Talk button (hover rule 7).
11. Footer links ×6 (rule 4).

### Animation census

- Hero ken-burns: CSS keyframes, 60s, `scale(1)` to `scale(1.8)`
  (HEAD-STYLE).
- Header show and hide: IX2 transforms, 500ms.
- Sidekick: CSS margin transition, .2s.
- Counters: scroll-linked, per frame (section 5).
- There are no scroll-in content reveals on this page; IX2 has none.
