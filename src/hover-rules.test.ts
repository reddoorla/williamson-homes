import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  PAIR_HOVER,
  PAIR_TRANSITION,
  SINGLE_HOVER,
  SINGLE_TRANSITION,
} from "$lib/components/WhButton.svelte";

const root = resolve(__dirname, "..");
const read = (path: string) => readFileSync(join(root, path), "utf8");
const css = read("src/app.css");

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

function hex(name: string): number[] {
  const value = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-f]{6})`, "i"))?.[1];
  if (!value) throw new Error(`no --color-${name}`);
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

function hoverContrast(text: number[], ground: number[], tint: number, opacity: number) {
  const bg = mix(mix(secondary, ground, tint), ground, opacity);
  return contrast(mix(text, ground, opacity), bg);
}

const opacityOf = (classes: string) => {
  const m = classes.match(/hover:opacity-(\d+)/);
  return m ? Number(m[1]) / 100 : 1;
};
const tintOf = (classes: string) => Number(classes.match(/hover:bg-secondary\/(\d+)/)?.[1]) / 100;

function filesUnder(dir: string): string[] {
  return readdirSync(join(root, dir)).flatMap((name) => {
    const path = join(dir, name);
    return statSync(join(root, path)).isDirectory() ? filesUnder(path) : [path];
  });
}

describe("the reference's 15 :hover rules", () => {
  it("1. `a:active, a:hover { outline: 0 }` is NOT adopted: hover never strips the focus ring", () => {
    expect(css).not.toMatch(/a:hover[^{]*\{[^}]*outline:\s*(0|none)/);
  });

  it("2–3. `.w-lightbox-*:hover` have no element: no captured page and no source ships a lightbox", () => {
    const pages = filesUnder("matching/spec/pages").filter((p) => p.endsWith(".html"));
    expect(pages.length).toBeGreaterThan(0);
    for (const page of pages) expect(read(page), page).not.toMatch(/w-lightbox/);
    const sources = filesUnder("src/lib").filter((p) => p.endsWith(".svelte"));
    for (const source of sources) expect(read(source), source).not.toMatch(/lightbox/i);
  });

  it("4. `a:hover { opacity: .8 }` with `background-color .7s ease-in-out, opacity .35s ease-in`", () => {
    const fade = utility("wh-hover-fade");
    expect(fade).toMatch(/background-color 0\.7s ease-in-out/);
    expect(fade).toMatch(/opacity 0\.35s ease-in/);
    expect(fade).toMatch(/opacity:\s*var\(--wh-hover-opacity,\s*0\.8\)/);
    const header = read("src/lib/components/SiteHeader.svelte");
    expect(header.match(/wh-link wh-hover-fade/g)).toHaveLength(2);
    expect(header.match(/wh-hover-fade block/g)).toHaveLength(2);
    expect(read("src/lib/components/SiteFooter.svelte")).toMatch(/wh-hover-fade block/);
  });

  it("4, clamped where .8 drops text below AA: footer links .87, Featured titles .92", () => {
    const footer = read("src/lib/components/SiteFooter.svelte");
    const footerOpacity = Number(
      footer.match(/wh-link wh-hover-fade[^"]*--wh-hover-opacity:([.\d]+)/)?.[1],
    );
    expect(footerOpacity).toBe(0.87);
    expect(hoverContrast(WHITE, secondary, 0, 0.8)).toBeLessThan(4.5);
    expect(hoverContrast(WHITE, secondary, 0, footerOpacity)).toBeGreaterThanOrEqual(4.5);

    const featured = read("src/lib/slices/FeaturedProjects/index.svelte");
    const titleOpacity = Number(
      featured.match(/wh-hover-fade inline-block \[--wh-hover-opacity:([.\d]+)\]/)?.[1],
    );
    expect(titleOpacity).toBe(0.92);
    expect(hoverContrast(secondary, WHITE, 0, 0.8)).toBeLessThan(4.5);
    expect(hoverContrast(secondary, WHITE, 0, titleOpacity)).toBeGreaterThanOrEqual(4.5);

    expect(hoverContrast(primary, WHITE, 0, 0.8)).toBeGreaterThanOrEqual(4.5);
    expect(hoverContrast(WHITE, primary, 0, 0.8)).toBeGreaterThanOrEqual(4.5);
  });

  it("5. `.text-color-secondary.mx-auto.max-width-600px:hover` sets the colour it already has, so nothing changes", () => {
    const cards = read("src/lib/slices/ImageCards/index.svelte");
    expect(cards).toMatch(/wh-statement-heading[^"]*text-secondary/);
    expect(cards).not.toMatch(/hover:text-/);
  });

  it("6, 12, 13. the anchor circles fill secondary and turn their number white, at full opacity", () => {
    const intro = read("src/lib/slices/AnchorIntro/index.svelte");
    expect(intro).toMatch(/\[--wh-hover-opacity:1\]/);
    expect(intro).toMatch(/bg-transparent text-secondary/);
    expect(intro).toMatch(/group-hover:bg-secondary/);
    expect(intro).toMatch(/group-hover:text-white/);
    expect(intro).toMatch(/background-color_\.7s_ease-in-out/);
    expect(intro).toMatch(/color_\.2s_cubic-bezier\(\.215,\.61,\.355,1\)/);
    expect(contrast(WHITE, secondary)).toBeGreaterThanOrEqual(4.5);
  });

  it("7. `.button-default:hover` (single): rgba(109,106,105,.35), background .2s and opacity .25s ease-in", () => {
    expect(SINGLE_TRANSITION).toBe(
      "[transition:background-color_.2s_ease-in,opacity_.25s_ease-in]",
    );
    expect(tintOf(SINGLE_HOVER.primary)).toBe(0.35);
    expect(opacityOf(SINGLE_HOVER.primary)).toBe(0.8);
    expect(tintOf(SINGLE_HOVER.light)).toBe(0.35);
    expect(read("src/lib/slices/LetsTalk/index.svelte")).toMatch(/<WhButton[^>]*\bsingle\b/);
  });

  it("8. `.button-default.mx-6:hover` (paired, light): rgba(109,106,105,.15), .25s ease-in, opacity .8", () => {
    expect(PAIR_TRANSITION).toBe("[transition:background-color_.25s_ease-in,opacity_.25s_ease-in]");
    expect(tintOf(PAIR_HOVER.light)).toBe(0.15);
    expect(opacityOf(PAIR_HOVER.light)).toBe(0.8);
  });

  it("9. `.mx-6.text-color-secondary:hover`: tint clamped to 4% with no fade, the most of .15 that holds AA", () => {
    expect(hoverContrast(secondary, WHITE, 0.15, 0.8)).toBeLessThan(4.5);
    expect(hoverContrast(secondary, WHITE, 0, 0.8)).toBeLessThan(4.5);
    expect(opacityOf(PAIR_HOVER.secondary)).toBe(1);
    expect(tintOf(PAIR_HOVER.secondary)).toBeGreaterThan(0);
    expect(hoverContrast(secondary, WHITE, tintOf(PAIR_HOVER.secondary), 1)).toBeGreaterThanOrEqual(
      4.5,
    );
    expect(SINGLE_HOVER.secondary).toBe(PAIR_HOVER.secondary);
  });

  it("10. `.mx-6.text-color-primary:hover`: the reference's .15 tint, fade clamped to .85 for AA", () => {
    expect(tintOf(PAIR_HOVER.primary)).toBe(0.15);
    expect(hoverContrast(primary, WHITE, 0.15, 0.8)).toBeLessThan(4.5);
    expect(opacityOf(PAIR_HOVER.primary)).toBe(0.85);
    expect(
      hoverContrast(primary, WHITE, 0.15, opacityOf(PAIR_HOVER.primary)),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("11. `.content-block.home-project-item-image:hover`: #005a7896 behind the photo, faded to .8", () => {
    const featured = read("src/lib/slices/FeaturedProjects/index.svelte");
    expect(featured).toMatch(/wh-featured-photo wh-hover-fade[^"]*hover:bg-\[#005a7896\]/);
    expect(featured).not.toMatch(/group-hover:scale/);
  });

  it("14–15. `.hamburger` and `.menu-close` `:hover { opacity: .66 }` with `opacity .2s`", () => {
    const header = read("src/lib/components/SiteHeader.svelte");
    for (const name of ["wh-hamburger", "wh-menu-close"]) {
      const classes = header.match(new RegExp(`class="${name} ([^"]*)"`))?.[1] ?? "";
      expect(classes, name).toMatch(/hover:opacity-\[\.66\]/);
      expect(classes, name).toMatch(/transition-opacity/);
      expect(classes, name).toMatch(/duration-200/);
    }
  });
});
