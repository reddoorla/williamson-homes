import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/svelte";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import SiteHeader from "./SiteHeader.svelte";

const HERO_HEIGHT = 810;

const css = readFileSync(resolve(process.cwd(), "src/app.css"), "utf8");
const NAMED: Record<string, string> = { white: "#ffffff", black: "#000000" };

function hex(name: string): number[] {
  const raw = css.match(new RegExp(`--color-${name}:\\s*([^;]+);`))?.[1]?.trim() ?? "";
  const value = NAMED[raw] ?? raw;
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

/** The menu icon's ink: white under `wh-filter-white`, else the SVG's own
 *  paths, which carry no fill and so draw black. */
function inkOf(icon: HTMLImageElement) {
  const filters = icon.className.split(/\s+/).filter((c) => c.startsWith("wh-filter-"));
  if (filters.join(" ") === "wh-filter-white") return [255, 255, 255];
  if (filters.length) throw new Error(`cannot measure the icon under ${filters.join(" ")}`);
  const src = icon.getAttribute("src") ?? "";
  const svg = src.endsWith(".svg")
    ? readFileSync(resolve(process.cwd(), `static${src}`), "utf8")
    : "";
  if (!svg || /\s(fill|stroke|style)=/.test(svg))
    throw new Error(`cannot measure the ink of ${src}`);
  return [0, 0, 0];
}

/** What the phone bar shows behind the icon: the nearest colour fill on the
 *  icon's wrappers (the phone-width one where there are two) over the page
 *  background, or the page background where none has one. */
function groundOf(icon: Element) {
  const page = hex("background");
  for (let el = icon.parentElement; el; el = el.parentElement) {
    const fills = (el.getAttribute("class") ?? "").split(/\s+/).flatMap((c) => {
      const m = /^(max-md:)?bg-(\[[^\]]*\]|[a-z]+(?:-\d+)?)(?:\/(\S+))?$/.exec(c);
      const colour = m && (/^\[|-\d+$/.test(m[2]) || css.includes(`--color-${m[2]}:`));
      return colour ? [m] : [];
    });
    const fill = fills.find((m) => m[1]) ?? fills[0];
    if (!fill || fill[2] === "transparent") continue;
    const alpha = /^(?:(\d+)|\[(\d*\.?\d+)(%?)\])$/.exec(fill[3] ?? "100");
    if (!alpha) throw new Error(`cannot measure ${fill[0]}`);
    const share = alpha[1] ? Number(alpha[1]) / 100 : Number(alpha[2]) / (alpha[3] ? 100 : 1);
    return hex(fill[2]).map((v, i) => share * v + (1 - share) * page[i]);
  }
  return page;
}

let main: HTMLElement;

beforeEach(() => {
  main = document.createElement("main");
  main.id = "main-content";
  const hero = document.createElement("section");
  hero.setAttribute("data-wh-hero", "");
  main.append(hero);
  document.body.append(main);
  vi.spyOn(hero, "getBoundingClientRect").mockImplementation(
    () => ({ bottom: HERO_HEIGHT - window.scrollY }) as DOMRect,
  );
});

afterEach(() => {
  cleanup();
  main.remove();
  vi.restoreAllMocks();
  Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
});

async function scrollTo(y: number) {
  Object.defineProperty(window, "scrollY", { value: y, configurable: true });
  await fireEvent.scroll(window);
}

const parts = (container: HTMLElement) => {
  const doc = container.ownerDocument;
  return {
    header: doc.querySelector("header.wh-header") as HTMLElement,
    hero: doc.querySelector(".wh-hero-header") as HTMLElement,
    bar: doc.querySelector(".wh-sidekick") as HTMLElement,
  };
};

async function phoneHeaderAt(y: number, tone: "light" | "dark") {
  const { getByRole, unmount } = render(SiteHeader, { props: { tone } });
  await scrollTo(y);
  const icon = getByRole("button", { name: "Open menu" }).querySelector("img") as HTMLImageElement;
  const seen = { ink: inkOf(icon), ground: groundOf(icon) };
  unmount();
  return seen;
}

describe("the header's IX2 scroll interactions", () => {
  it("marks the header data-hero-out once the hero has left the viewport, and clears it back over the hero (a-4/a-5, e-9/e-10)", async () => {
    const { container } = render(SiteHeader, { props: { tone: "light" } });
    const { header } = parts(container);
    await scrollTo(HERO_HEIGHT / 2);
    expect(header.hasAttribute("data-hero-out")).toBe(false);
    await scrollTo(HERO_HEIGHT + 400);
    expect(header.hasAttribute("data-hero-out")).toBe(true);
    await scrollTo(100);
    expect(header.hasAttribute("data-hero-out")).toBe(false);
  });

  it("past the hero, keeps the hamburger visible against the phone bar on light- and dark-toned pages (a-12/a-13, e-25/e-26)", async () => {
    for (const tone of ["light", "dark"] as const) {
      const { ink, ground } = await phoneHeaderAt(HERO_HEIGHT + 400, tone);
      expect(contrast(ink, ground), tone).toBeGreaterThanOrEqual(3);
    }
  });

  it("over the hero, colours the hamburger by the page's tone", async () => {
    const dark = await phoneHeaderAt(0, "dark");
    const light = await phoneHeaderAt(0, "light");
    expect(dark.ink).not.toEqual(light.ink);
  });

  it("brings the sticky bar back on the way up from far down the page, and puts it away over the hero", async () => {
    const { container } = render(SiteHeader, { props: { tone: "light" } });
    const { bar } = parts(container);
    await scrollTo(HERO_HEIGHT + 2000);
    await scrollTo(HERO_HEIGHT + 1500);
    expect(bar.getAttribute("aria-hidden")).toBe("false");
    await scrollTo(HERO_HEIGHT / 2);
    expect(bar.getAttribute("aria-hidden")).toBe("true");
  });

  it("makes the slid-away header inert, so Tab never lands on a link off-screen", async () => {
    const { container } = render(SiteHeader, { props: { tone: "light" } });
    const { hero } = parts(container);
    const inert = () => hero.inert || hero.hasAttribute("inert");
    expect(inert()).toBe(false);
    await scrollTo(HERO_HEIGHT + 50);
    expect(inert()).toBe(true);
    await scrollTo(0);
    expect(inert()).toBe(false);
  });

  it("keeps the sticky bar up while it holds focus and the header is away", async () => {
    const { container } = render(SiteHeader, { props: { tone: "light" } });
    const { bar } = parts(container);
    await scrollTo(HERO_HEIGHT + 900);
    await scrollTo(HERO_HEIGHT + 600);
    await fireEvent.focusIn(bar);
    await scrollTo(HERO_HEIGHT + 100);
    expect(bar.getAttribute("aria-hidden")).toBe("false");
  });

  it("hands focus back to the header only once the header is showing again", async () => {
    const { container } = render(SiteHeader, { props: { tone: "light" } });
    const doc = container.ownerDocument;
    const { bar } = parts(container);
    await scrollTo(HERO_HEIGHT + 900);
    await scrollTo(HERO_HEIGHT + 600);
    const sticky = bar.querySelector('a[href="/projects"]') as HTMLAnchorElement;
    sticky.focus();
    await fireEvent.focusIn(sticky);
    await scrollTo(HERO_HEIGHT + 100);
    expect(doc.activeElement).toBe(sticky);
    await scrollTo(HERO_HEIGHT - 300);
    const active = doc.activeElement as HTMLElement;
    expect(active.closest(".wh-hero-header")).not.toBeNull();
    expect(active.getAttribute("href")).toBe("/projects");
  });
});

describe("the project gallery brings the header back (IX2 e-35/e-36)", () => {
  let gallery: HTMLElement;
  const galleryTop = 2000;

  beforeEach(() => {
    gallery = document.createElement("section");
    gallery.dataset.whHeaderShow = "(min-width: 992px)";
    main.append(gallery);
    Object.defineProperty(window, "innerHeight", { value: 900, configurable: true });
    vi.spyOn(gallery, "getBoundingClientRect").mockImplementation(
      () =>
        ({
          top: galleryTop - window.scrollY,
          bottom: galleryTop + 3000 - window.scrollY,
        }) as DOMRect,
    );
  });

  const wideEnough = (matches: boolean) =>
    vi.stubGlobal("matchMedia", (query: string) => ({ matches, media: query }));

  it("shows the header while the gallery is on screen past the hero, and hides it once the gallery leaves", async () => {
    wideEnough(true);
    const { container } = render(SiteHeader, { props: { tone: "light" } });
    const { hero, header } = parts(container);
    await scrollTo(HERO_HEIGHT + 100);
    expect(hero.inert || hero.hasAttribute("inert")).toBe(true);
    await scrollTo(galleryTop - 400);
    expect(hero.inert || hero.hasAttribute("inert")).toBe(false);
    expect(header.hasAttribute("data-hero-out")).toBe(true);
    await scrollTo(galleryTop + 3000 + 10);
    expect(hero.inert || hero.hasAttribute("inert")).toBe(true);
    vi.unstubAllGlobals();
  });

  it("ignores the gallery where its media query does not match (768-991 on the reference)", async () => {
    wideEnough(false);
    const { container } = render(SiteHeader, { props: { tone: "light" } });
    const { hero } = parts(container);
    await scrollTo(galleryTop - 400);
    expect(hero.inert || hero.hasAttribute("inert")).toBe(true);
    vi.unstubAllGlobals();
  });
});

describe("a page whose first block is not a hero", () => {
  it("ignores an unmarked first child and treats the header itself as the hero", async () => {
    main.querySelector("section")?.removeAttribute("data-wh-hero");
    const { container } = render(SiteHeader, { props: { tone: "dark" } });
    const { header, bar } = parts(container);
    await scrollTo(0);
    expect(header.hasAttribute("data-hero-out")).toBe(false);
    await scrollTo(400);
    expect(header.hasAttribute("data-hero-out")).toBe(true);
    await scrollTo(300);
    expect(bar.getAttribute("aria-hidden")).toBe("false");
  });
});
