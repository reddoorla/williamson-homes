import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/svelte";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { PAIR_HOVER, SINGLE_HOVER } from "$lib/components/WhButton.svelte";
import SiteFooter from "$lib/components/SiteFooter.svelte";
import SiteHeader from "$lib/components/SiteHeader.svelte";
import FeaturedProjects from "$lib/slices/FeaturedProjects/index.svelte";
import AnchorIntro from "$lib/slices/AnchorIntro/index.svelte";
import PageHero from "$lib/slices/PageHero/index.svelte";
import LetsTalk from "$lib/slices/LetsTalk/index.svelte";

afterEach(() => cleanup());

const root = resolve(__dirname, "..");
const css = readFileSync(join(root, "src/app.css"), "utf8");

function utility(name: string) {
  const at = css.indexOf(`@utility ${name} {`);
  if (at === -1) throw new Error(`no @utility ${name}`);
  let depth = 0;
  for (let i = css.indexOf("{", at); i < css.length; i++) {
    if (css[i] === "{") depth++;
    if (css[i] === "}" && --depth === 0) return css.slice(at, i + 1);
  }
  throw new Error(`unterminated @utility ${name}`);
}

const NAMED: Record<string, string> = { white: "#ffffff", black: "#000000" };

function achromaticOklch(value: string): number[] | null {
  const m = /^oklch\(\s*([\d.]+)(%?)\s+0(?:\.0+)?%?\s+-?[\d.]+(?:deg)?\s*\)$/i.exec(value);
  if (!m) return null;
  const linear = (Number(m[1]) / (m[2] ? 100 : 1)) ** 3;
  const encoded = linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055;
  return Array<number>(3).fill(Math.round(Math.min(1, Math.max(0, encoded)) * 255));
}

function hex(name: string): number[] {
  const raw = css.match(new RegExp(`--color-${name}:\\s*([^;]+);`))?.[1]?.trim() ?? "";
  const value = NAMED[raw] ?? raw;
  const grey = achromaticOklch(value);
  if (grey) return grey;
  if (!/^#[0-9a-f]{6}$/i.test(value)) throw new Error(`cannot measure --color-${name}: "${raw}"`);
  return [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16));
}

function contrast(a: number[], b: number[]) {
  const lum = (c: number[]) => {
    const [r, g, bl] = c.map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const mix = (a: number[], b: number[], t: number) => a.map((v, i) => t * v + (1 - t) * b[i]);
const WHITE = [255, 255, 255];
const secondary = hex("secondary");
const primary = hex("primary");
const light = hex("light");

type Tint = { colour: number[]; share: number };
const NO_TINT: Tint = { colour: WHITE, share: 0 };

function hoverContrast(text: number[], ground: number[], tint: Tint, opacity: number) {
  const bg = mix(mix(tint.colour, ground, tint.share), ground, opacity);
  return contrast(mix(text, ground, opacity), bg);
}

/** An opacity as CSS writes it, `.87` or `87%`. */
function alpha(value: string) {
  const m = /^([.\d]+)(%?)$/.exec(value.trim());
  const n = m ? Number(m[1]) / (m[2] ? 100 : 1) : NaN;
  if (!Number.isFinite(n)) throw new Error(`unreadable opacity "${value}"`);
  return n;
}

const opacityOf = (classes: string) => {
  const m = classes.match(/(?<!\S)hover:opacity-(?:(\d+)|\[([^\]]+)\])(?!\S)/);
  if (!m && /(?<!\S)hover:opacity-/.test(classes)) {
    throw new Error(`unreadable hover:opacity- in "${classes}"`);
  }
  return m ? (m[1] ? Number(m[1]) / 100 : alpha(m[2])) : 1;
};
const NOT_PAINT = new Set(["transparent", "current", "inherit"]);
const UNMEASURED =
  /^(?:[a-z]+-\d{2,3}|(?:linear|radial|conic)\b.*|\[(?:#|rgba?\(|hsla?\(|ok|lab|lch|color|var|url)[^\]]*\])$/;

/** The theme colour, and its alpha, that a `prefix-*` class in `classes`
 *  paints. A colour class this file cannot measure throws rather than being
 *  looked past, so an ancestor's colour is never measured in its place. */
function paint(classes: string, prefix: string): Tint | undefined {
  for (const [, value] of classes.matchAll(new RegExp(`(?<!\\S)${prefix}-(\\S+)`, "g"))) {
    const [, name, a] = /^(.+?)(?:\/(\d+|\[[^\]]+\]))?$/.exec(value)!;
    if (NOT_PAINT.has(name)) continue;
    if (!css.includes(`--color-${name}:`)) {
      if (UNMEASURED.test(name)) throw new Error(`cannot measure ${prefix}-${value}`);
      continue;
    }
    const share = a === undefined ? 1 : a.startsWith("[") ? alpha(a.slice(1, -1)) : Number(a) / 100;
    return { colour: hex(name), share };
  }
  return undefined;
}

const tintOf = (classes: string) => paint(classes, "hover:bg") ?? NO_TINT;

/** The opacity an element with `classes` fades to on hover: its own
 *  `--wh-hover-opacity` where `wh-hover-fade` reads one, else the utility's,
 *  or a `hover:opacity-*` beside it if that fades further. */
function fadeOf(classes: string) {
  if (!/(?<!\S)wh-hover-fade(?!\S)/.test(classes)) return opacityOf(classes);
  const fade = utility("wh-hover-fade");
  const hover = fade.indexOf(":hover");
  const block = hover === -1 ? "" : fade.slice(hover, fade.indexOf("}", hover));
  const rule = /opacity:\s*([^;]+);/.exec(block)?.[1]?.trim() ?? "";
  if (rule === "") return opacityOf(classes);
  const custom = /^var\(--wh-hover-opacity,\s*([^)]+)\)$/.exec(rule);
  const own = /\[--wh-hover-opacity:([^\]]+)\]/.exec(classes)?.[1];
  const value = alpha(custom ? (own ?? custom[1]) : rule);
  return Math.min(value, opacityOf(classes));
}

const classesOf = (el: Element) => el.getAttribute("class") ?? "";

/** The colour behind `el`: the nearest ancestor that paints a ground,
 *  composited over what is behind it where it is translucent. */
function groundOf(el: Element, fallback?: number[]): number[] {
  for (let at = el.parentElement; at; at = at.parentElement) {
    const fill = paint(classesOf(at), "bg");
    if (fill?.share === 1) return fill.colour;
    if (fill) return mix(fill.colour, groundOf(at, fallback), fill.share);
  }
  if (fallback) return fallback;
  throw new Error(`no ground behind "${el.textContent?.trim()}"`);
}

/** The colour `el`'s text is painted on `ground`, inherited where it sets none. */
function inkOf(el: Element, ground: number[]) {
  for (let at: Element | null = el; at; at = at.parentElement) {
    const ink = paint(classesOf(at), "text");
    if (ink) return mix(ink.colour, ground, ink.share);
  }
  throw new Error(`no text colour on "${el.textContent?.trim()}"`);
}

/** `link`'s hover contrast, from its own text colour, tint and fade, on its ground. */
function linkHoverContrast(link: Element, fallback?: number[]) {
  const classes = classesOf(link);
  const ground = groundOf(link, fallback);
  return hoverContrast(inkOf(link, ground), ground, tintOf(classes), fadeOf(classes));
}

const slice = (slice_type: string, primary: Record<string, unknown>, items: unknown[] = []) =>
  ({ slice_type, variation: "default", primary, items }) as never;

const webLink = { link_type: "Web", url: "https://example.com" };

describe("hover states keep AA", () => {
  it("the footer's text links on the secondary ground", () => {
    const { container } = render(SiteFooter);
    const links = [...container.querySelectorAll("footer a")].filter((a) => a.textContent?.trim());
    expect(links.length, "the footer renders no text links").toBeGreaterThan(0);
    for (const link of links) {
      expect(
        hoverContrast(WHITE, secondary, NO_TINT, fadeOf(classesOf(link))),
        link.textContent ?? "",
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("the Featured Projects titles on white", () => {
    const card = { id: "p1", uid: "palos-verdes-cove", title: "Palos Verdes Cove", image: {} };
    const { getByRole } = render(FeaturedProjects, {
      props: {
        slice: slice("featured_projects", { heading: null }, [
          {
            project: {
              link_type: "Document",
              id: card.id,
              type: "project",
              uid: card.uid,
              isBroken: false,
            },
          },
        ]),
        context: { projects: [card] as never },
      },
    });
    const title = getByRole("link", { name: card.title });
    expect(
      hoverContrast(secondary, WHITE, NO_TINT, fadeOf(classesOf(title))),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it.each([
    ["dark", WHITE],
    ["light", primary],
  ] as const)("the %s header's nav links", (tone, ground) => {
    const { container } = render(SiteHeader, { props: { tone } });
    const links = [...container.querySelectorAll("nav a")].filter((a) => a.textContent?.trim());
    expect(links.length, "the header renders no nav links").toBeGreaterThan(0);
    for (const link of links) {
      expect(linkHoverContrast(link, ground), link.textContent ?? "").toBeGreaterThanOrEqual(4.5);
    }
  });

  it("the anchor circles, whose number turns white on a secondary fill", () => {
    const { getByRole } = render(AnchorIntro, {
      props: {
        slice: slice("anchor_intro", { heading: null, body: [] }, [
          { label: "Family of Builders", anchor: "builders" },
        ]),
      },
    });
    const link = getByRole("link", { name: /Family of Builders/ });
    const opacity = fadeOf(classesOf(link));
    const circle = link.querySelector('[aria-hidden="true"]');
    expect(circle, "the anchor link renders no circle").not.toBeNull();
    const classes = classesOf(circle!);
    const fill = paint(classes, "group-hover:bg") ?? paint(classes, "bg") ?? NO_TINT;
    const ink = paint(classes, "group-hover:text") ?? paint(classes, "text");
    expect(ink, "the circle's number has no text colour").toBeDefined();
    const number = mix(ink!.colour, mix(fill.colour, WHITE, fill.share), ink!.share);
    expect(hoverContrast(number, WHITE, fill, opacity), "the number").toBeGreaterThanOrEqual(4.5);
    expect(hoverContrast(secondary, WHITE, NO_TINT, opacity), "the label").toBeGreaterThanOrEqual(
      4.5,
    );
  });

  it.each(["primary", "teal"])("a PageHero's buttons on its %s ground", (background) => {
    const { getByRole } = render(PageHero, {
      props: {
        slice: slice("page_hero", { background, heading: [] }, [
          { button_label: "Go", button_link: webLink },
        ]),
      },
    });
    expect(linkHoverContrast(getByRole("link", { name: "Go" }))).toBeGreaterThanOrEqual(4.5);
  });

  it("the Let's Talk button on its accent ground", () => {
    const { getByRole } = render(LetsTalk, {
      props: {
        slice: slice("lets_talk", {
          heading: null,
          image: {},
          button_label: "Go",
          button_link: webLink,
        }),
      },
    });
    expect(linkHoverContrast(getByRole("link", { name: "Go" }))).toBeGreaterThanOrEqual(4.5);
  });

  it.each([
    ["paired light on the primary ground", PAIR_HOVER.light, WHITE, primary],
    ["paired primary on white", PAIR_HOVER.primary, primary, WHITE],
    ["paired secondary on white", PAIR_HOVER.secondary, secondary, WHITE],
    ["paired secondary on light", PAIR_HOVER.secondary, secondary, light],
    ["single secondary on white", SINGLE_HOVER.secondary, secondary, WHITE],
    ["single secondary on light", SINGLE_HOVER.secondary, secondary, light],
  ] as const)("a WhButton, %s", (_, hover, text, ground) => {
    expect(hoverContrast(text, ground, tintOf(hover), opacityOf(hover))).toBeGreaterThanOrEqual(
      4.5,
    );
  });
});
