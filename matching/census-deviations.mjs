// Style-census rows the OPERATOR has looked at and chosen to keep. Same
// contract as matching/floors.mjs: nothing is hidden, everything is counted
// under its own heading, and every entry needs a LEDGER entry to stay honest.
//
//   node matching/census-count.mjs <log>   -> "<real> <ambiguous> <declared>"
//
// Without this, `census.sh` can never reach zero and an "N remaining" figure
// says nothing about how much work is left — one permanent decision is counted
// once per page per viewport, so a single ACK can account for dozens of rows.

/** A row is `{ label, ref, cand }`, each of ref/cand a "fam | wt | size | lh |
 *  ls | transform | colour" tuple string. */
/** Exact rows: the label AND both full tuples must match, so a regression on
 *  another element that shares the text (the header's "projects" link, any
 *  other "1") stays a real mismatch. */
const row = (label, ref, cand, why) => ({
  why,
  match: (r) => r.label === label && r.ref === ref && r.cand === cand,
});

export const DECLARED = [
  row("\"mark@williamson-homes.com\"", "Montserrat | 300 | 14px | 17px | ls=normal | none | rgb(109, 106, 105)", "Montserrat | 300 | 14px | 24px | ls=normal | none | rgb(109, 106, 105)", "contact links are inline-block at the paragraph's 24px line so each is a 24px target (WCAG 2.5.8); the reference's are 17px (LEDGER contact review)"),
  row("\"310.709.7380\"", "Montserrat | 300 | 14px | 17px | ls=normal | none | rgb(109, 106, 105)", "Montserrat | 300 | 14px | 24px | ls=normal | none | rgb(109, 106, 105)", "contact links are inline-block at the paragraph's 24px line so each is a 24px target (WCAG 2.5.8); the reference's are 17px (LEDGER contact review)"),
  row("\"310.570.7278\"", "Montserrat | 300 | 13px | 20px | ls=normal | none | rgb(147, 147, 147)", "Montserrat | 300 | 13px | 20px | ls=normal | none | rgb(255, 255, 255)", "contact hero phone button is #939393 on the teal ground, about 1.4:1; ours is white (LEDGER contact gate)"),
  row("\"-tim holmes, homeowner\"", "Montserrat | 300 | 17px | 32px | ls=normal | none | rgb(255, 255, 255)", "Montserrat | 300 | 17px | 32px | ls=normal | uppercase | rgb(255, 255, 255)", "uppercase from CSS here, typed into the reference's text (LEDGER (a))"),
  row("\"1\"", "Montserrat | 400 | 22px | 36px | ls=normal | none | rgb(109, 106, 105)", "Montserrat | 400 | 22px | 36px | ls=normal | none | rgb(255, 255, 255)", "counter number colour depends on how far the reference's script had run (LEDGER (b))"),
  row("\"let's get this project started!\"", "Montserrat | 400 | 22px | 36px | ls=normal | none | rgb(51, 51, 51)", "Montserrat | 400 | 22px | 36px | ls=normal | none | rgb(109, 106, 105)", "reference h3 is #333 above 479; Statement has no heading-tone field (LEDGER (c))"),
  row("\"home\"", "Montserrat | 300 | 16px | 20px | ls=normal | none | rgb(109, 106, 105)", "Montserrat | 300 | 16px | 20px | ls=normal | none | rgb(255, 255, 255)", "reference footer links are rgb(109,106,105) on the same background, i.e. invisible (LEDGER (d))"),
  row("\"about\"", "Montserrat | 300 | 16px | 20px | ls=normal | none | rgb(109, 106, 105)", "Montserrat | 300 | 16px | 20px | ls=normal | none | rgb(255, 255, 255)", "reference footer links are rgb(109,106,105) on the same background, i.e. invisible (LEDGER (d))"),
  row("\"contact us\"", "Montserrat | 300 | 16px | 20px | ls=normal | none | rgb(109, 106, 105)", "Montserrat | 300 | 16px | 20px | ls=normal | none | rgb(255, 255, 255)", "reference footer links are rgb(109,106,105) on the same background, i.e. invisible (LEDGER (d))"),
  row("\"-tim holmes, homeowner\"", "Montserrat | 300 | 14px | 32px | ls=normal | none | rgb(255, 255, 255)", "Montserrat | 300 | 14px | 32px | ls=normal | uppercase | rgb(255, 255, 255)", "uppercase from CSS here, typed into the reference's text (LEDGER (a))"),
  row("\"1\"", "Montserrat | 300 | 20px | 36px | ls=normal | none | rgb(109, 106, 105)", "Montserrat | 300 | 20px | 36px | ls=normal | none | rgb(255, 255, 255)", "counter number colour depends on how far the reference's script had run (LEDGER (b))"),
  row("\"let's get this project started!\"", "Montserrat | 300 | 20px | 36px | ls=normal | none | rgb(51, 51, 51)", "Montserrat | 300 | 20px | 36px | ls=normal | none | rgb(109, 106, 105)", "reference h3 is #333 above 479; Statement has no heading-tone field (LEDGER (c))"),
  row("\"home\"", "Montserrat | 300 | 14px | 20px | ls=normal | none | rgb(109, 106, 105)", "Montserrat | 300 | 14px | 20px | ls=normal | none | rgb(255, 255, 255)", "reference footer links are rgb(109,106,105) on the same background, i.e. invisible (LEDGER (d))"),
  row("\"about\"", "Montserrat | 300 | 14px | 20px | ls=normal | none | rgb(109, 106, 105)", "Montserrat | 300 | 14px | 20px | ls=normal | none | rgb(255, 255, 255)", "reference footer links are rgb(109,106,105) on the same background, i.e. invisible (LEDGER (d))"),
  row("\"contact us\"", "Montserrat | 300 | 14px | 20px | ls=normal | none | rgb(109, 106, 105)", "Montserrat | 300 | 14px | 20px | ls=normal | none | rgb(255, 255, 255)", "reference footer links are rgb(109,106,105) on the same background, i.e. invisible (LEDGER (d))"),
  row("\"-tim holmes, homeowner\"", "Montserrat | 300 | 12px | 24px | ls=normal | none | rgb(255, 255, 255)", "Montserrat | 300 | 12px | 24px | ls=normal | uppercase | rgb(255, 255, 255)", "uppercase from CSS here, typed into the reference's text (LEDGER (a))"),
  row("\"home\"", "Montserrat | 300 | 14px | 17px | ls=normal | none | rgb(109, 106, 105)", "Montserrat | 300 | 14px | 17px | ls=normal | none | rgb(255, 255, 255)", "reference footer links are rgb(109,106,105) on the same background, i.e. invisible (LEDGER (d))"),
  row("\"about\"", "Montserrat | 300 | 14px | 17px | ls=normal | none | rgb(109, 106, 105)", "Montserrat | 300 | 14px | 17px | ls=normal | none | rgb(255, 255, 255)", "reference footer links are rgb(109,106,105) on the same background, i.e. invisible (LEDGER (d))"),
  row("\"contact us\"", "Montserrat | 300 | 14px | 17px | ls=normal | none | rgb(109, 106, 105)", "Montserrat | 300 | 14px | 17px | ls=normal | none | rgb(255, 255, 255)", "reference footer links are rgb(109,106,105) on the same background, i.e. invisible (LEDGER (d))"),
  row("\"projects\"", "Montserrat | 300 | 14px | 17px | ls=normal | none | rgb(109, 106, 105)", "Montserrat | 300 | 14px | 17px | ls=normal | none | rgb(255, 255, 255)", "reference footer links are rgb(109,106,105) on the same background, i.e. invisible (LEDGER (d))"),
  row("\"email us\"", "Montserrat | 300 | 13px | 20px | ls=normal | none | rgb(147, 147, 147)", "Montserrat | 300 | 13px | 20px | ls=normal | none | rgb(109, 106, 105)", "reference #939393 is 3.0:1 on white; accessibility wins (operator 2026-10-01; LEDGER about-us gate)"),
  row("\"4\"", "Montserrat | 400 | 22px | 36px | ls=normal | none | rgb(109, 106, 105)", "Montserrat | 400 | 22px | 36px | ls=normal | none | color(srgb 1 1 1)", "the last step's circle is lit in the pinned stage, which replaces the counters by the operator's call (LEDGER 2026-10-01 steps stage)"),
  row("\"4\"", "Montserrat | 300 | 20px | 36px | ls=normal | none | rgb(109, 106, 105)", "Montserrat | 300 | 20px | 36px | ls=normal | none | color(srgb 1 1 1)", "the last step's circle is lit in the pinned stage, which replaces the counters by the operator's call (LEDGER 2026-10-01 steps stage)"),
  row("\"4\"", "Montserrat | 300 | 16px | 36px | ls=normal | none | rgb(109, 106, 105)", "Montserrat | 300 | 16px | 36px | ls=normal | none | color(srgb 1 1 1)", "the last step's circle is lit in the pinned stage, which replaces the counters by the operator's call (LEDGER 2026-10-01 steps stage)"),
  row("\"2\"", "Montserrat | 400 | 22px | 36px | ls=normal | none | rgb(109, 106, 105)", "Montserrat | 400 | 22px | 36px | ls=normal | none | color(srgb 0.828235 0.824706 0.823529)", "step circle colour follows the pinned stage, which replaces the counters by the operator's call (LEDGER 2026-10-01 steps stage)"),
  row("\"2\"", "Montserrat | 300 | 20px | 36px | ls=normal | none | rgb(109, 106, 105)", "Montserrat | 300 | 20px | 36px | ls=normal | none | color(srgb 0.828235 0.824706 0.823529)", "step circle colour follows the pinned stage, which replaces the counters by the operator's call (LEDGER 2026-10-01 steps stage)"),
  row("\"2\"", "Montserrat | 300 | 16px | 36px | ls=normal | none | rgb(109, 106, 105)", "Montserrat | 300 | 16px | 36px | ls=normal | none | color(srgb 0.828235 0.824706 0.823529)", "step circle colour follows the pinned stage, which replaces the counters by the operator's call (LEDGER 2026-10-01 steps stage)"),
  row("\"3\"", "Montserrat | 300 | 16px | 36px | ls=normal | none | rgb(109, 106, 105)", "Montserrat | 300 | 16px | 36px | ls=normal | none | color(srgb 1 1 1)", "step circle colour follows the pinned stage, which replaces the counters by the operator's call (LEDGER 2026-10-01 steps stage)"),
  row("\"1\"", "Montserrat | 300 | 16px | 36px | ls=normal | none | rgb(109, 106, 105)", "Montserrat | 300 | 16px | 36px | ls=normal | none | rgb(255, 255, 255)", "step circle colour follows the pinned stage, which replaces the counters by the operator's call (LEDGER 2026-10-01 steps stage)"),
  row("\"3\"", "Montserrat | 400 | 22px | 36px | ls=normal | none | rgb(109, 106, 105)", "Montserrat | 400 | 22px | 36px | ls=normal | none | color(srgb 1 1 1)", "step circle colour follows the pinned stage, which replaces the counters by the operator's call (LEDGER 2026-10-01 steps stage)"),
  row("\"3\"", "Montserrat | 300 | 20px | 36px | ls=normal | none | rgb(109, 106, 105)", "Montserrat | 300 | 20px | 36px | ls=normal | none | color(srgb 1 1 1)", "step circle colour follows the pinned stage, which replaces the counters by the operator's call (LEDGER 2026-10-01 steps stage)"),
];
