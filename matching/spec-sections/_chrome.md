## shared chrome

Reference: `https://www.williamson-homes.com` (Webflow site `645ec08251dadc9000a072e5`),
captured whole in `matching/spec/` on 2026-09-30. `CSS:L<n>` is line n of
`matching/spec/files/cdn.prod.website-files.com/645ec08251dadc9000a072e5/css/fastflowkit-afb37a506657d-7ae411675eec5.shared.db45749fc.css`;
`HEAD-STYLE` is the inline `<style>` in each page's `<head>`; `IX2` is the
interaction data handed to `Webflow.require("ix2").init(...)` in
`…/js/fastflowkit-afb37a506657d-7ae411675eec5.5e4eec98.f460d6e016102e8a.js`.

### Phase 0 (measured 2026-10-01 on the live site, headless Chromium, DPR 1)

- Root font-size is 16px at 1440 / 834 / 390 on both sides; rem is not scaled.
- `document.body.clientWidth`: reference 1440 / 834 / 390. The candidate read
  1425 / 819 / 375 because `src/app.css` set `scrollbar-gutter: stable`; the
  rule is removed site-locally (skill Phase 0.4, LEDGER 2026-10-01).
- Fonts: the reference loads Lato and Montserrat from Google Fonts
  (`webfont.js`). Every rendered text node on home and about-us is Montserrat,
  weights 300 and 400, plus 300 italic for the footer `em`. No Adobe Fonts.
- Breakpoints (CSS `@media`): ≤991, ≤767, ≤479. The matrix in `harness.json`
  is 1440 / 834 / 390, one per layout with its own rules; 480–767 has no
  matrix viewport (LEDGER).

### Header (`section.headers`)

- `.headers` (CSS:L6517): `position: fixed; top: 0; z-index: 99; height:
120px; margin-bottom: -120px`. At ≤479 it is `height: 80px` (CSS:L7467).
- `.hero-header.max-w-1280.m-auto` (CSS:L5653): `position: absolute; inset:
0 0 auto; height: 120px; width: 100%`, max-width 1280, centred.
  - Logo `<img width="180" class="h-12 pr-8">`: 48px tall, 180 wide including
    the 2rem right padding, so the SVG is letterboxed into 148×48. The file is
    byte-identical to `static/images/williamson-homes-logo.svg` (md5
    `03ba5057…`).
  - Links: Montserrat 300 16px/20px white, `p-2 mx-2` (last `mr-0`),
    `display: block`; boxes 80 / 90 / 78 × 36 at 1440.
  - Columns are `.w-col` with 10px side padding (CSS:L725), so the logo sits
    at container + 10 and the last link ends at container + width − 10.
  - Measured: logo x=90 y=33 at 1440, x=10 y=33 at 834. The +1 is IX2 `a-5`'s
    `translateY(1px)`.
- `.sidekick-header` (CSS:L6527): an absolute teal (`--primary`,
  rgb(0,90,120)) bar 120px tall, parked at `margin-top: -120px`, with
  `transition: margin .2s`. A page script gives it `margin-top: 0` on an
  upscroll of 100–1000px. Below `hero height + 200`, or on any downscroll, it
  goes back to −120px. Hidden at ≤479 (CSS:L7471).
- ≤479: the hamburger (`.hamburger.filter-to-white`, 2rem, fixed, `margin:
1.5rem 2rem 0 0`, CSS:L7507) opens `.hero-header`, which
  `.su-cover-portrait` turns into a full-screen teal menu panel (CSS:L7395).
  IX2 e-17 and e-21 slide it down; e-19 and e-23 slide it up.

### Footer (`section.footer.bg-color-secondary`)

`spacer-32` (CSS:L5808), then a `w-row` of two `w-col-6`. The left column
holds two logos (`h-24`, and `h-16` with `filter-to-white`). The right column
holds four right-aligned links (Home, About, Contact Us, Projects) between
`spacer-16`s. Then the copyright `em.italic-text` (14px, `padding-left: 20px`,
body 14px/20 CSS:L2063, padding-left CSS:L6489), then `spacer-32`. On phones the link text is 14px/16.8px and the
copyright 8px.

### Global link and button rules

- `a` (CSS:L2120): `transition: background-color .7s ease-in-out, opacity
.35s ease-in`.
- `.button-default` (CSS:L5836): 12.8px; `padding: 9px 15px` from `.w-button`
  (CSS:L265), with the sides overridden to 10px; a 1px white bottom border;
  `transition: background-color .2s ease-in, opacity .25s ease-in`. The
  rendered box is 39px tall: 20px line + 18px padding + 1px border.

### Hover rules: all 15 `:hover` selectors in the stylesheet

| #   | selector                                              | change on hover                                                                    | transition (base rule)                                                  | where on the reference                                             |
| --- | ----------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 1   | `a:active, a:hover`                                   | `outline: 0`                                                                       | —                                                                       | every link                                                         |
| 2   | `.w-lightbox-control:hover` (≥768)                    | `opacity: 1`                                                                       | `all .3s`                                                               | no lightbox on any captured page                                   |
| 3   | `.w-lightbox-inactive:hover`                          | `opacity: 0`                                                                       | —                                                                       | no lightbox on any captured page                                   |
| 4   | `a:hover`                                             | `opacity: .8; background-color: transparent`                                       | `background-color .7s ease-in-out, opacity .35s ease-in`                | every link not overridden below                                    |
| 5   | `.text-color-secondary.mx-auto.max-width-600px:hover` | `color: var(--secondary)`, already its rest colour, so nothing visible changes     | `color, background-color .2s cubic-bezier(.215,.61,.355,1)` (CSS:L5713) | about-us, the Commercial Advantage h3                              |
| 6   | `.text-color-secondary.mx-auto.white-on-hover:hover`  | `color: #fff`                                                                      | `color, background-color .2s cubic-bezier(.215,.61,.355,1)` (CSS:L5713) | about-us, the 1/2/3 in the anchor circles                          |
| 7   | `.button-default:hover`                               | `background-color: #6d6a6959` (rgba(109,106,105,.35)), plus opacity .8 from rule 4 | `background-color .2s ease-in, opacity .25s ease-in`                    | home "Let's Talk"; about-us "Go To Site"                           |
| 8   | `.button-default.mx-6:hover`                          | `background-color: #6d6a6926` (rgba(109,106,105,.15)), plus opacity .8             | `background-color .25s ease-in, opacity .25s ease-in`                   | the home hero's Email Us / Call Us; the about-us hero's "About Us" |
| 9   | `.button-default.mx-6.text-color-secondary:hover`     | as rule 8                                                                          | as rule 8                                                               | the CTA band's "Email Us"                                          |
| 10  | `.button-default.mx-6.text-color-primary:hover`       | as rule 8                                                                          | as rule 8                                                               | the CTA band's "Call Us"                                           |
| 11  | `.content-block.home-project-item-image:hover`        | `background-color: #005a7896` behind the inline photo, plus opacity .8             | `background-color .7s ease-in-out, opacity .35s ease-in`                | home, the Featured Projects photos                                 |
| 12  | `.filled-circle.mx-auto:hover`                        | `opacity: 1`, cancelling rule 4's .8                                               | from `a`                                                                | about-us anchor circles                                            |
| 13  | `.filled-circle.mx-auto.flex-align-center:hover`      | `background-color: var(--secondary)`                                               | `background-color .7s ease-in-out`                                      | about-us anchor circles                                            |
| 14  | `.hamburger.filter-to-white:hover` (≤479)             | `opacity: .66`                                                                     | `opacity .2s`                                                           | every page at ≤479                                                 |
| 15  | `.menu-close.filter-to-white:hover` (≤479)            | `opacity: .66`                                                                     | `opacity .2s`                                                           | every page at ≤479, in the open menu                               |

The changes were read live with a real hover on 2026-10-01
(`matching/probes/hover.mjs`, local). `src/hover-rules.test.ts` names every
row.

### Scroll interactions: all 20 `SCROLL_INTO_VIEW` / `SCROLL_OUT_OF_VIEW` events in IX2

None of them reveals content. Every one targets a page's hero (or the project
template's gallery) and drives the header:

| events                                             | page                                 | media                      | action                                                                                                                                 |
| -------------------------------------------------- | ------------------------------------ | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| e-9 / e-10                                         | home (`645ec…72c4`)                  | all                        | hero into view → `a-5` show-hero-header (`translateY(1px)`, 500ms); out of view → `a-4` hide-hero-header (`translateY(-152px)`, 500ms) |
| e-11 / e-12                                        | projects (`6462a10b…`)               | all                        | same                                                                                                                                   |
| e-13 / e-14                                        | about-us (`6462a11c…`)               | all                        | same                                                                                                                                   |
| e-15 / e-16                                        | contact (`6462a125…`)                | all                        | same                                                                                                                                   |
| e-33 / e-34                                        | project template (`6466599e…`), hero | main, medium, small (≥480) | same                                                                                                                                   |
| e-35 / e-36                                        | project template, `.gallery-section` | main, small                | same                                                                                                                                   |
| e-25 / e-26, e-27 / e-28, e-29 / e-30, e-31 / e-32 | home, projects, about-us, contact    | tiny (≤479)                | hero into view → `a-13` `.headers` background to transparent; out of view → `a-12` to `--primary`, 500ms easeOut                       |

Measured live: at 1440 and y=1800 the hero header sits at `translateY(-152px)`.
At 390 and y=1800, `.headers` is an 80px fixed teal bar holding only the
hamburger.
