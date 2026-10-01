## about-us

Not in the gate table yet. The 2026-10-01 baseline (`out-base0-about-us`, local)
failed every region, with Δh up to 23.5%. Gating the page is a geometry
project of its own (LEDGER, and BACKLOG in reddoor-maintenance). This section
records the about-us half of the counters, which OD7-P1b ports, plus the facts
read so far.

### Census (live, 1440 × 900, 2026-10-01)

| #   | section                                       | y @1440 | h @1440 |
| --- | --------------------------------------------- | ------- | ------- |
| 1   | `hero-section` (`surfers` photo)              | 0       | 623     |
| 2   | `about-us-section` (three anchor circles)     | 623     | 442     |
| 3   | `builders-section` (timeline, `-resp-rep` ≤479) | 1065  | 1592    |
| 4   | `cta-section` "We treat our clients like family" | 2657 | 573     |
| 5   | `commercial-advantage-section`                | 3230    | 907     |
| 6   | `collab-count` (counters, `-resp-rep` ≤479)   | 4137    | 3008    |
| 7   | `cta-section` "Let's get this project started!" | 7145  | 395     |
| 8   | `footer`                                      | 7540    | 612     |

Anchor hazards for whoever gates this page:

- "Commercial Advantage" first matches the uppercase label under circle 2
  (case-insensitive), at y=1193 when 390 is 3375. Anchor on "Our mission as
  a commercial company" instead.
- Every text in sections 3 and 6 is duplicated in a hidden `-resp-rep` twin.

### 6. Counters ("Collaborative approach")

- An `h-16` spacer, then `.counter-head.position-sticky.z-10.h-64` (16rem,
  sticky at `top: 0`, white). It holds the h4 (`pt-8`) and the intro p
  (`max-width-600px pt-6`), then `pb-4`.
- `.cols-counter-wrapper` (sticky at 256), right column:
  - `counter-one.pl-8.ml-8.h-40rem` (40rem, sticky 256, CSS:L6003)
  - `counter-three.about` (mt 40rem, 40rem, sticky 256, CSS:L6374)
  - `counter-placeholder.about` (40rem, CSS:L6565)
- Left column:
  - `counter-two.about` (mt 40rem, 40rem, sticky 256, CSS:L6400)
  - `counter-last.about` (mt 40rem, sticky 256, CSS:L6121)
- So the steps sit 40rem apart. The section is 64 + 256 + 4 × 640 + 128 =
  3008 tall.
- The script is `countersAnim.js` again, initialised when `.collab-count` is
  visible, with the same phases as home section 5.
- Circles 1/2/3 in section 2 link to `#builders`, `#commercial` and
  `#collab`; hover rules 6, 12 and 13.
