import { describe, expect, it, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import CtaBanner from "./index.svelte";

afterEach(() => cleanup());

/** sRGB, each channel 0–1 and gamma-encoded: the space a browser blends in. */
type Rgb = number[];

/** A resting colour class, read: the class, and its colour and alpha when they
 *  can be measured. One that cannot be is still a colour — it fails as
 *  unmeasured rather than being skipped. */
type Paint = { cls: string; rgb?: Rgb; alpha?: number };

/** `--color-*` declarations in a stylesheet, as raw CSS values. */
const declared = (css: string): Record<string, string> =>
  Object.fromEntries(
    [...css.matchAll(/--color-([a-z0-9-]+):\s*([^;]+);/gi)].map((m) => [m[1], m[2].trim()]),
  );

/** Every colour a class can name: Tailwind's default palette, overridden by
 *  app.css's `@theme` (cwd-relative: under jsdom `import.meta.url` is not a
 *  file: URL — see theme-contrast.test.ts). */
const NAMED: Record<string, string> = {
  ...declared(readFileSync(resolve(process.cwd(), "node_modules/tailwindcss/theme.css"), "utf8")),
  ...declared(
    /@theme\s*\{([\s\S]*?)\n\}/.exec(
      readFileSync(resolve(process.cwd(), "src/app.css"), "utf8"),
    )?.[1] ?? "",
  ),
};

/** A CSS colour as sRGB: hex, white/black, or `oklch()` (OKLab to linear sRGB,
 *  clipped to the gamut). Anything else is undefined: unmeasured. */
function parse(value: string): Rgb | undefined {
  const v = ({ white: "#fff", black: "#000" } as Record<string, string>)[value] ?? value;
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v)?.[1];
  if (hex) {
    const six = hex.length === 3 ? hex.replace(/./g, (c) => c + c) : hex;
    return [0, 2, 4].map((i) => parseInt(six.slice(i, i + 2), 16) / 255);
  }
  const ok = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)(%?)\s+(-?[\d.]+|none)(?:deg)?\s*\)$/i.exec(v);
  if (!ok) return undefined;
  const L = Number(ok[1]) / (ok[2] ? 100 : 1);
  const C = Number(ok[3]) * (ok[4] ? 0.004 : 1);
  const h = ok[5] === "none" ? 0 : (Number(ok[5]) * Math.PI) / 180;
  const [a, b] = [C * Math.cos(h), C * Math.sin(h)];
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((c) => {
    const x = Math.min(1, Math.max(0, c));
    return x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
  });
}

/** Whether a class's colour part names a colour: a palette or `@theme` name,
 *  a palette-shaped `<hue>-<shade>`, or an arbitrary colour value. */
const isColour = (name: string) =>
  name in NAMED ||
  ["transparent", "current", "inherit"].includes(name) ||
  /^(?!(?:linear|radial|conic)-)[a-z]+-\d{2,3}$/.test(name) ||
  /^\[(?:#|(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(|color:)/i.test(name);

/** A `<prefix>-<colour>[/<alpha>]` class read as paint; undefined for a class
 *  that is not a colour (`border-2`, `text-sm/6`, `hover:bg-dark`). */
function paint(cls: string, prefix: string): Paint | undefined {
  const [, name, modifier] =
    new RegExp(`^${prefix}-(\\[[^\\]]+\\]|[^/]+)(?:/(.+))?$`).exec(cls) ?? [];
  if (!name || !isColour(name)) return undefined;
  if (name === "transparent") return { cls, rgb: [0, 0, 0], alpha: 0 };
  const value = NAMED[name] ?? /^\[(.+)\]$/.exec(name)?.[1].replace(/_/g, " ");
  const alpha =
    modifier === undefined ? 1 : /^\d+$/.test(modifier) ? Number(modifier) / 100 : undefined;
  return { cls, rgb: value === undefined ? undefined : parse(value), alpha };
}

/** `fg` at `alpha`, laid over the opaque `bg`. */
const over = (fg: Rgb, alpha: number, bg: Rgb): Rgb =>
  fg.map((c, i) => alpha * c + (1 - alpha) * bg[i]);

/** WCAG 2.x contrast between two sRGB colours. */
function contrast(a: Rgb, b: Rgb): number {
  const luminance = (rgb: Rgb) =>
    rgb
      .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
      .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** The element's own resting colour of that prefix. `transparent`, `current`
 *  and `inherit` show what is beneath them, so they are walked past. */
const own = (el: Element, prefix: string): Paint | undefined =>
  (el.getAttribute("class") ?? "")
    .split(/\s+/)
    .map((c) => paint(c, prefix))
    .find(
      (p) =>
        p !== undefined &&
        !["transparent", "current", "inherit"].includes(p.cls.slice(prefix.length + 1)),
    );

/** The nearest such colour on the element or an ancestor: what it is painted in. */
const painted = (el: Element | null, prefix: string): Paint | undefined =>
  el ? (own(el, prefix) ?? painted(el.parentElement, prefix)) : undefined;

/** What an element sits on: its nearest background, laid over the ones
 *  beneath it while that background is translucent. */
const ground = (el: Element | null): Paint | undefined => {
  if (!el) return undefined;
  const top = own(el, "bg");
  if (!top) return ground(el.parentElement);
  if (!top.rgb || top.alpha === undefined || top.alpha >= 1) return top;
  const under = ground(el.parentElement);
  return {
    cls: `${top.cls} over ${under?.cls}`,
    rgb: under?.rgb && over(top.rgb, top.alpha, under.rgb),
    alpha: 1,
  };
};

const heading = [{ type: "heading2", text: "Ready to start your project?", spans: [] }];
const link = { link_type: "Web", url: "https://example.com" };

const makeSlice = (primary: Record<string, unknown> = {}) =>
  ({
    slice_type: "cta_banner",
    variation: "default",
    primary: {
      heading,
      buttonLabel: "Talk with us",
      buttonLink: link,
      background: "light",
      ...primary,
    },
    items: [],
  }) as never;

describe("CtaBanner slice", () => {
  it("renders the heading and the CTA as an anchor", () => {
    const { container, getByRole } = render(CtaBanner, {
      props: { slice: makeSlice() },
    });

    expect(getByRole("heading", { level: 2 }).textContent).toContain(
      "Ready to start your project?",
    );
    const cta = getByRole("link", { name: "Talk with us" });
    expect(cta.tagName).toBe("A");
    expect(cta.getAttribute("href")).toBe("https://example.com");
    // A navigating CTA is an <a>, never a <button> nested inside one.
    expect(cta.querySelector("button")).toBeNull();
    expect(container.querySelector('[data-slice-type="cta_banner"]')).not.toBeNull();
  });

  it("paints the selected ground, and keeps the heading and the CTA legible on each", () => {
    const grounds: Record<string, Rgb | undefined> = {};
    for (const background of ["light", "dark", "white"]) {
      const { getByRole, unmount } = render(CtaBanner, {
        props: { slice: makeSlice({ background }) },
      });
      const heading = getByRole("heading", { level: 2 });
      const cta = getByRole("link", { name: "Talk with us" });
      const behind = ground(cta.parentElement);
      grounds[background] = behind?.rgb;
      const pairs: [string, Paint | undefined, Paint | undefined, number][] = [
        ["heading", painted(heading, "text"), ground(heading), 4.5],
        ["CTA label", painted(cta, "text"), ground(cta), 4.5],
      ];
      // WCAG 1.4.11: the outline, or the CTA's own fill, is what draws the
      // button. With neither it is a text link, and its label is the measure.
      const outline =
        own(cta, "border") ??
        (cta.classList.contains("border-current") ? painted(cta, "text") : own(cta, "bg"));
      if (outline) pairs.push(["CTA outline", outline, behind, 3]);
      for (const [what, fg, bg, floor] of pairs) {
        const label = `${what} on the ${background} ground: ${fg?.cls} on ${bg?.cls}`;
        expect(fg?.rgb && fg.alpha !== undefined && bg?.rgb, `${label} is unmeasured`).toBeTruthy();
        expect(
          contrast(over(fg!.rgb!, fg!.alpha!, bg!.rgb!), bg!.rgb!),
          label,
        ).toBeGreaterThanOrEqual(floor);
      }
      unmount();
    }
    expect(grounds.dark).not.toEqual(grounds.light);
  });

  it("omits the CTA when the link or the label is missing", () => {
    const { container: noLabel } = render(CtaBanner, {
      props: { slice: makeSlice({ buttonLabel: "" }) },
    });
    expect(noLabel.querySelector(`a[href="${link.url}"]`)).toBeNull();
    cleanup();

    const { container: noLink } = render(CtaBanner, {
      props: { slice: makeSlice({ buttonLink: null }) },
    });
    expect(noLink.textContent).not.toContain("Talk with us");
  });
});
