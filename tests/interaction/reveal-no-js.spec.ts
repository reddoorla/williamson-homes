import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test, type Page } from "@playwright/test";

// THE SCROLL REVEAL'S HIDDEN STATE BELONGS TO THE FIRST PAINT.
//
// animateIn can only hide its targets from JS at hydration, which is 150-850ms
// after the browser has already painted them: content arrived in final
// position, sat there, then dropped and vanished before floating back — a page
// that looks like it is breaking. The fix is a CSS hidden state that
// server-rendered markup carries (`[data-reveal]`), so the element is hidden
// BEFORE the first paint and animateIn's inline write is a no-op re-write.
//
// The price of that fix is that pre-hidden content depends on JS to ever
// appear. These three tests are the bill:
//
//   - the server actually ships a hidden target (without this the other two
//     can pass on a page that has no reveal at all);
//   - with scripting OFF it is fully visible (app.html's <noscript> escape);
//   - with scripting ON it is hidden on the first painted frame and ends
//     visible, with no visible→hidden flash in between.
//
// EVERY test here must set `reducedMotion: "no-preference"`. The shared
// Playwright config (@reddoorla/maintenance/configs/playwright-a11y) forces
// `reduce` on every context, and the hidden state is gated on no-preference —
// so a spec that inherits the default measures a page where the CSS never
// applies and passes no matter what the template ships.
const FIXTURE = "/dev/animate-in";

/** The computed value each property a hidden state may set reads when nothing hides. */
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

/** Every property app.css's `[data-reveal]` hidden state sets, so a property
 *  added there is checked here without editing this spec. */
const HIDDEN_PROPERTIES = (() => {
  const css = readFileSync(resolve(process.cwd(), "src/app.css"), "utf-8").replace(
    /\/\*[\s\S]*?\*\//g,
    "",
  );
  const at = css.indexOf("[data-reveal] {");
  if (at === -1) return [];
  const rule = css.slice(css.indexOf("{", at), css.indexOf("}", at));
  return [...rule.matchAll(/([a-z-]+)\s*:/g)].map((m) => m[1]!);
})();

/** Per-frame opacity of the first server-hidden reveal target, sampled from
 *  before the first script the page ships.
 *
 *  The element reference is captured once and held: animateIn REMOVES
 *  `data-reveal` the moment it reveals, so re-querying each frame would stop
 *  tracking exactly when the interesting part happens. */
async function traceFirstRevealTarget(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __trace: number[] };
    w.__trace = [];
    let held: Element | null = null;
    const t0 = performance.now();
    const tick = () => {
      held ??= document.querySelector("[data-reveal]");
      if (held) w.__trace.push(Number(getComputedStyle(held).opacity));
      if (performance.now() - t0 < 4000) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

test("the server ships a hidden reveal target in the markup", async ({ page }) => {
  // Asserted on the SSR bytes, not the hydrated DOM: the whole point is that
  // the attribute is in the response, not added by the client.
  const html = await (await page.request.get(FIXTURE)).text();
  expect(
    (html.match(/data-reveal/g) ?? []).length,
    `${FIXTURE} server-renders at least one hidden reveal target`,
  ).toBeGreaterThan(0);
});

test(
  "with scripting off, the same markup paints at full opacity",
  { tag: "@smoke" },
  async ({ browser }) => {
    // A browser that will never run the reveal must never be shown less content
    // than a crawler reading the SSR HTML gets. The whole hidden state is gated
    // on the <noscript> style in app.html; without it this content is stranded
    // at opacity 0 forever.
    const context = await browser.newContext({
      javaScriptEnabled: false,
      reducedMotion: "no-preference",
    });
    try {
      const page = await context.newPage();
      await page.goto(FIXTURE, { waitUntil: "domcontentloaded" });

      const properties = [...new Set(["opacity", "transform", ...HIDDEN_PROPERTIES])];
      const states = await page.evaluate(
        (props) =>
          Array.from(document.querySelectorAll("[data-reveal]")).map((el) => {
            const cs = getComputedStyle(el);
            return Object.fromEntries(props.map((p) => [p, cs.getPropertyValue(p)]));
          }),
        properties,
      );

      // Non-vacuity guards: with no subject, "every subject is visible" is true
      // and says nothing; with no hidden properties read, nothing was checked.
      expect(states.length, "the page ships data-reveal markup").toBeGreaterThan(0);
      expect(HIDDEN_PROPERTIES.length, "app.css's [data-reveal] rule was read").toBeGreaterThan(0);
      for (const s of states) {
        expect(s.opacity, "scripting off: opacity").toBe("1");
        expect(s.transform, "scripting off: transform").toBe("none");
        for (const property of HIDDEN_PROPERTIES) {
          expect(SHOWN[property], `no shown value known for ${property}`).toBeDefined();
          expect(s[property], `scripting off: ${property}`).toBe(SHOWN[property]);
        }
      }
    } finally {
      await context.close();
    }
  },
);

test("with scripting on, it is hidden on the first frame and never flashes", async ({
  browser,
}) => {
  const context = await browser.newContext({ reducedMotion: "no-preference" });
  try {
    const page = await context.newPage();
    await traceFirstRevealTarget(page);
    await page.goto(FIXTURE, { waitUntil: "load" });

    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const t = (window as unknown as { __trace: number[] }).__trace;
            return t.length > 5 && t[t.length - 1] === 1;
          }),
        { timeout: 10_000, message: `${FIXTURE}: the reveal never completed` },
      )
      .toBe(true);

    const trace: number[] = await page.evaluate(
      () => (window as unknown as { __trace: number[] }).__trace,
    );

    // Hidden from the very first frame the element exists in — this is the
    // assertion that the CSS hidden state is genuinely in force in the browser,
    // and not merely present in the source file.
    expect(trace[0], "first painted frame").toBe(0);
    // And never the other way round: no visible frame with a hidden frame after
    // it. That single assertion IS the "content paints, then vanishes" bug.
    const flashAt = trace.findIndex((o, i) => i > 0 && trace[i - 1]! > 0.5 && o < 0.5);
    expect(
      flashAt,
      `opacity went ${trace[flashAt - 1]} → ${trace[flashAt]} at frame ${flashAt}`,
    ).toBe(-1);
    expect(trace[trace.length - 1], "ends visible").toBe(1);
  } finally {
    await context.close();
  }
});
