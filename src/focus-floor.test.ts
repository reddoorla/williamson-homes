import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Focus styling in this template is opt-in per component: the buttons on the
// fixtures page carry their own rings and everything else falls back to the
// UA's 1px hairline, which is invisible on a dark nav or over a photo hero
// (WCAG 2.4.7). There was no floor at all — `grep -a "focus-visible" src/app.css`
// returned nothing. This asserts the floor exists, since a CSS cascade rule is
// not reachable from jsdom, which resolves no stylesheets.
// Resolved from the project root, not `import.meta.url`: under the jsdom
// environment vite serves this module over http, so `new URL(..., import.meta.url)`
// is not a file: URL and readFileSync rejects it.
const css = readFileSync(resolve(process.cwd(), "src/app.css"), "utf-8").replace(
  /\/\*[\s\S]*?\*\//g,
  "",
);

const names = (selector: string, el: string) =>
  new RegExp(`(?:^|[(,\\s])${el.replace(/[[\]]/g, "\\$&")}(?=[,):[\\s]|$)`).test(selector);

/** The floor: the `:focus-visible` rule whose selector names plain `a` and
 *  `button`, read from the rule itself rather than the comment above it. */
const floor = [...css.matchAll(/([^{};]+):focus-visible\s*\{([^}]*)\}/g)]
  .map((m) => ({ selector: m[1].trim(), body: m[2] }))
  .find(({ selector }) => ["a", "button"].every((el) => names(selector, el)));

describe("the keyboard-focus floor", () => {
  it("gives every interactive element a visible outline on :focus-visible", () => {
    expect(floor, "no :focus-visible floor over a and button in app.css").toBeDefined();
    for (const el of ["a", "button", "summary", "[tabindex]"]) {
      expect(names(floor!.selector, el), `the floor does not cover ${el}`).toBe(true);
    }
    const style =
      /(?<![\w-])outline(?:-style)?:[^;]*?\b(none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset|auto)\b/.exec(
        floor!.body,
      )?.[1];
    expect(style, "the floor's outline has no style, so it draws nothing").toBeDefined();
    expect(["none", "hidden"]).not.toContain(style);
    expect(floor!.body).not.toMatch(/(?<![\w-])outline(?:-width)?:\s*0(?![.\d])/);
  });

  // `:where()` contributes ZERO specificity, so the floor weighs one
  // pseudo-class and every authored `focus-visible:ring-*` still wins twice
  // over — higher specificity AND a later cascade layer. Written as a bare
  // selector it would outrank the utilities it is meant to sit under.
  it("is written with :where() so authored rings still win", () => {
    expect(floor?.selector).toMatch(/^:where\(.*\)$/);
  });

  it("is never stripped on hover", () => {
    expect(css).not.toMatch(
      /:hover[^{]*\{[^}]*outline(?:-style|-width)?:\s*(?:0(?![.\d])|none\b|hidden\b)/,
    );
  });
});
