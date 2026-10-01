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
const FIELDS = ["family", "weight", "size", "lineHeight", "letterSpacing", "transform", "colour"];

function onlyDiffers(row, allowed) {
  const ref = row.ref.split("|").map((v) => v.trim());
  const cand = row.cand.split("|").map((v) => v.trim());
  if (ref.length !== FIELDS.length || cand.length !== FIELDS.length) return false;
  return FIELDS.every((field, i) => ref[i] === cand[i] || allowed.includes(field));
}

function declare(labels, allowed, why) {
  return { why, match: (row) => labels.includes(row.label) && onlyDiffers(row, allowed) };
}

export const DECLARED = [
  declare(
    ['"-tim holmes, homeowner"'],
    ["transform"],
    "uppercase comes from CSS on the candidate and is typed into the reference's text (LEDGER 2026-10-01 (a))",
  ),
  declare(
    ['"1"', '"3"'],
    ["colour"],
    "counter number colour depends on how far the reference's script ran when the census captured it (LEDGER (b))",
  ),
  declare(
    ['"let\'s get this project started!"'],
    ["colour"],
    "reference h3 is #333 above 479; Statement has no heading-tone field (LEDGER (c))",
  ),
  declare(
    ['"home"', '"about"', '"contact us"', '"projects"'],
    ["colour"],
    "reference footer links are rgb(109,106,105) on the same background, i.e. invisible (LEDGER (d))",
  ),
];
