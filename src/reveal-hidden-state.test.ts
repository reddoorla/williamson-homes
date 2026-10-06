import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { animateIn } from "$lib/actions/animateIn";

// The scroll reveal's hidden state has three halves that have to agree, and
// the first two are not reachable from jsdom (which resolves no stylesheets
// and never parses app.html):
//
//   1. app.css hides `[data-reveal]` under `prefers-reduced-motion:
//      no-preference`, so server-rendered markup is hidden at FIRST PAINT
//      rather than yanked to opacity 0 at hydration.
//   2. app.html's <noscript> style forces it back, so a browser that will
//      never run the reveal is never shown less than a crawler gets.
//   3. animateIn's inline write has to be byte-identical to (1), or hydration
//      is a visible state change instead of the no-op it is meant to be.
//
// Resolved from the project root, not `import.meta.url`: under the jsdom
// environment vite serves this module over http, so `new URL(..., import.meta.url)`
// is not a file: URL and readFileSync rejects it.
const root = process.cwd();
const css = readFileSync(resolve(root, "src/app.css"), "utf-8");
const html = readFileSync(resolve(root, "src/app.html"), "utf-8");

/** The body of the `[data-reveal]` rule in `source`, or null unless it sits
 *  inside a `prefers-reduced-motion: no-preference` block. Located by string
 *  and sliced to the closing brace rather than matched by regex: a selector
 *  regex with `[^)]*` in it stops at a nested `)` and matches nothing however
 *  good the CSS is, which is how a check that can only ever fail gets written. */
function gatedRule(source: string) {
  const bare = source.replace(/\/\*[\s\S]*?\*\//g, "");
  const at = bare.indexOf("[data-reveal] {");
  if (at === -1) return null;
  const gate = bare.lastIndexOf("@media", at);
  if (gate === -1) return null;
  const between = bare.slice(gate, at);
  const depth = between.split("{").length - between.split("}").length;
  if (depth < 1 || !between.startsWith("@media (prefers-reduced-motion: no-preference)")) {
    return null;
  }
  return bare.slice(at, bare.indexOf("}", at) + 1);
}

/** The declaration `property` sets in `rule`, if any. */
const declared = (rule: string | null, property: string) =>
  new RegExp(`(?<![\\w-])${property}:\\s*([^;}]+)`).exec(rule ?? "")?.[1]?.trim();

/** What animateIn writes on an element it hides with its default options. */
const hiddenByAction = (() => {
  const node = document.createElement("div");
  const { destroy } = animateIn(node);
  const state = { opacity: node.style.opacity, transform: node.style.transform };
  destroy();
  return state;
})();

const noscript = html.slice(html.indexOf("<noscript>"), html.indexOf("</noscript>"));

/** The value each property a hidden state may set reads when nothing hides. */
const SHOWN: Record<string, string> = {
  opacity: "1",
  transform: "none",
  translate: "none",
  scale: "none",
  rotate: "none",
  filter: "none",
  "clip-path": "none",
  visibility: "visible",
};

describe("the scroll reveal's first-paint hidden state", () => {
  // If the CSS hides an element 50% down and the action reveals it from 24px,
  // hydration is a jump rather than the byte-identical no-op the whole design
  // rests on. The two are asserted against each other so they cannot drift.
  it("hides [data-reveal] in app.css exactly as animateIn does, gated on no-preference", () => {
    const rule = gatedRule(css);
    expect(rule, "no [data-reveal] rule inside a no-preference block").not.toBeNull();
    expect(hiddenByAction.transform, "animateIn wrote no translateY when hiding").toMatch(
      /^translateY\(.+\)$/,
    );
    expect(declared(rule, "opacity")).toBe(hiddenByAction.opacity);
    expect(declared(rule, "transform")).toBe(hiddenByAction.transform);
  });

  it("gives scripting-off browsers a way back out of everything it hides, in app.html", () => {
    expect(noscript, "no <noscript> block in app.html").toContain("data-reveal");
    const rule = gatedRule(css) ?? "";
    const hidden = [...rule.slice(rule.indexOf("{")).matchAll(/([a-z-]+)\s*:/g)].map((m) => m[1]);
    expect(hidden.length, "no declarations in the hidden state").toBeGreaterThan(0);
    for (const property of hidden) {
      expect(SHOWN[property], `no shown value known for ${property}`).toBeDefined();
      expect(noscript, property).toMatch(
        new RegExp(
          `(?<![\\w-])${property}:\\s*(?:${SHOWN[property]}|initial|unset|revert)\\s*!important`,
        ),
      );
    }
  });

  // The guard has to be a STYLE, not an inline `classList.add("js")` script:
  // this template's CSP ships script-src without 'unsafe-inline', so on
  // server-rendered routes (policy as a nonce-bearing header) the script is
  // silently dropped while prerendered routes keep it. A guard that is live on
  // some routes and dead on others is worse than no guard. style-src already
  // allows inline styles, so this half works identically everywhere.
  it("uses a style for that escape hatch, never a script", () => {
    expect(noscript).toContain("<style>");
    expect(noscript).not.toContain("<script");
  });
});
