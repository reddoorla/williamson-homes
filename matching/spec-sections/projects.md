## projects

The project index. Read from the captured source on 2026-10-04.

### Census (live, 1440 × 900, 2026-10-04)

| #   | section                                   | anchor                            | y @1440 | h @1440 |
| --- | ----------------------------------------- | --------------------------------- | ------- | ------- |
| 1   | `hero-section … surfers` (+ fixed header) | `top`                             | 0       | 695     |
| 2   | `all-projects-section`                    | "Featured Projects"               | 695     | 3961    |
| 3   | `cta-section` + `footer`                  | "Let's get this project started!" | 4656    | 395     |

At 390 the hero is 731 and the list 2872.

### 1. Hero

- `hero-section.overflow-hidden.position-relative.surfers` (CSS:L5749,
  L5754, L5766): the lets-talk photo as a centred cover background,
  `min-height: 50vh`, `max-height: 90vh`.
- Inside `px-4 max-w-600px w-container` (568 content): `spacer-32` (8rem),
  the heading h3 in primary at full width (four lines at 1440), `spacer-16`,
  the white W (`h-40`), `spacer-16` + `spacer-8` (6rem), the two primary
  buttons, `h-16` (4rem). Heading before the mark is the difference from
  every other hero (PageHero `layout: heading-first`).

### 2. Featured Projects

- `h-16`, h3 "Featured Projects", `h-16`, then `project-list-wrapper`
  (max 1280) inside a 948 container (`.px-4` max 980).
- Each CMS item renders three variants and shows one with
  `w-condition-invisible`: odd items `project-item-wrapper-float-right py-8`
  (title, then the photo, packed right), even items
  `project-item-wrapper-float-left py-8` (photo, then title).
- The photo is `_w-60pc` (60% of 948 = 569) in `ratio-box-2`
  (`padding-top: 100%`, so square), the image a `background-position:
50% 100%` cover. The title is an h4 `flex-child-align-end px-6 pt-2`.
- Each card is 569 + 64 = 633 tall; no padding after the last card.
- At ≤479 the card is a centred column, the photo full width, the title
  `order: 1` below it.

### 3. CTA and footer

As about-us: the `cta-section` is 8rem above and below.
