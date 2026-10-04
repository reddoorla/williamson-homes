## contact

Read from the captured source on 2026-10-04.

### Census (live, 1440 × 900, 2026-10-04)

| #   | section                | anchor                             | y @1440 | h @1440 |
| --- | ---------------------- | ---------------------------------- | ------- | ------- |
| 1   | `hero-section bg-teal` | `top`                              | 0       | 623     |
| 2   | `headshot-section`     | "We would love to talk"            | 623     | 1096    |
| 3   | `contact-info-section` | "We treat our clients like family" | 1719    | 487     |
| 4   | `footer`               | —                                  | 2206    | 612     |

At 390: hero 623, headshots 1352, contact info 451, footer 830.

### 1. Hero

- `px-4 max-w-600px`: `spacer-32` + `spacer-16` (12rem), the ocean W
  (`h-40`), `spacer-16`, the h3 in white, `spacer-8` (2rem), two buttons,
  `h-16` (4rem). PageHero mark-first with `bottom_space: 4rem`.
- Ground `bg-teal` is #77b9bc; ours is #407f82 (white text 4.59:1 against
  2.3:1), LEDGER a11y row of 2026-09.

### 2. Headshots

- `px-4 max-w-600px` (568), `h-32`, h3 primary centred, `h-32`, a `w-row`
  (588, −10px gutters) of two 294 columns, `h-32`.
- ≥480: the left column (Mark) starts with `h-64` + `h-32` (384) and holds a
  16rem block; the right column (Brian) holds its 16rem block at the top.
  The columns' shared border is the centre line, 640 tall; the 192px
  `_12rem-circle` photos sit centred on it at each block's top; text starts
  129px from the line (165 wide on the left, right-aligned; 155 on the
  right). `contact-timeline-circle` (20px, white, 1px border) caps the
  line at the row's bottom.
- Text: h3 name `<br>` role (22/36), then a paragraph opening with an empty
  line, email and phone (17/32).
- <480: each column is a 384 block with its own border (right for the first,
  left for the second), a 128 gap between, the photo 96px above the block's
  text, text 33px in from the line.

### 3. Contact info

- No top space: the blue W (`_w-32`) is the section's first child, `h-16`,
  the family h3 (`max-w-620px`), `h-16`, two buttons, `h-32`. Statement
  `top_space: 0`, `bottom_space: 8rem`, `mark_style: blue`.
- At 390 the h3 is 620px wide on a 390 screen (runs off it), as on About Us.
