import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/svelte";

import SiteHeader from "./SiteHeader.svelte";

const HERO_HEIGHT = 810;
let main: HTMLElement;

beforeEach(() => {
  main = document.createElement("main");
  main.id = "main-content";
  const hero = document.createElement("section");
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

describe("the header's IX2 scroll interactions", () => {
  it("is fixed, and sits at translateY(1px) while the hero is in view (a-5, e-9)", async () => {
    const { container } = render(SiteHeader, { props: { tone: "light" } });
    const { header, hero } = parts(container);
    expect(header.className).toMatch(/(^|\s)fixed(\s|$)/);
    await scrollTo(HERO_HEIGHT - 1);
    expect(header.hasAttribute("data-hero-out")).toBe(false);
    expect(hero.className).toMatch(/min-\[480px\]:translate-y-px/);
    expect(hero.className).not.toMatch(/-translate-y-\[152px\]/);
  });

  it("slides up 152px over 500ms once the hero has left the viewport (a-4, e-10)", async () => {
    const { container } = render(SiteHeader, { props: { tone: "light" } });
    const { header, hero } = parts(container);
    await scrollTo(HERO_HEIGHT);
    expect(header.hasAttribute("data-hero-out")).toBe(true);
    expect(hero.className).toMatch(/min-\[480px\]:-translate-y-\[152px\]/);
    expect(hero.className).not.toMatch(/translate-y-px/);
    expect(hero.className).toMatch(/duration-500/);
    await scrollTo(100);
    expect(hero.className).toMatch(/min-\[480px\]:translate-y-px/);
  });

  it("turns the phone bar --primary past the hero and back to transparent over it (a-12/a-13, e-25/e-26)", async () => {
    const { container } = render(SiteHeader, { props: { tone: "light" } });
    const { header } = parts(container);
    expect(header.className).not.toMatch(/max-\[479px\]:bg-primary/);
    await scrollTo(HERO_HEIGHT + 400);
    expect(header.className).toMatch(/max-\[479px\]:bg-primary/);
    expect(header.className).toMatch(/duration-500/);
    expect(header.className).toMatch(/ease-out/);
    await scrollTo(0);
    expect(header.className).not.toMatch(/max-\[479px\]:bg-primary/);
  });

  it("whitens the hamburger over the teal bar even on a dark-toned page", async () => {
    const { container } = render(SiteHeader, { props: { tone: "dark" } });
    const icon = container.ownerDocument.querySelector(".wh-hamburger img") as HTMLElement;
    expect(icon.className).not.toMatch(/wh-filter-white/);
    await scrollTo(HERO_HEIGHT + 400);
    expect(icon.className).toMatch(/wh-filter-white/);
  });

  it("keeps the sticky bar back until 200px past the hero, as the reference's page script does", async () => {
    const { container } = render(SiteHeader, { props: { tone: "light" } });
    const { bar } = parts(container);
    await scrollTo(HERO_HEIGHT + 150);
    await scrollTo(HERO_HEIGHT + 100);
    expect(bar.getAttribute("aria-hidden")).toBe("true");
    await scrollTo(HERO_HEIGHT + 600);
    await scrollTo(HERO_HEIGHT + 300);
    expect(bar.getAttribute("aria-hidden")).toBe("false");
  });
});
