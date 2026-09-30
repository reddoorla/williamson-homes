import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/svelte";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import SiteHeader from "./SiteHeader.svelte";

afterEach(() => cleanup());

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");

function token(name: string): [number, number, number] {
  const hex = read("src/app.css").match(new RegExp(`--color-${name}:\\s*(#[0-9a-f]{6})`, "i"))?.[1];
  if (!hex) throw new Error(`no --color-${name}`);
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}

function contrast(a: number[], b: number[]): number {
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

describe("round-1 and round-2 review fixes stay fixed", () => {
  it("keeps secondary button text AA on its hover tint over white and light", () => {
    const alpha =
      Number(read("src/lib/components/WhButton.svelte").match(/hover:bg-secondary\/(\d+)/)?.[1]) /
      100;
    expect(alpha).toBeGreaterThan(0);
    const secondary = token("secondary");
    for (const ground of [[255, 255, 255], token("light")]) {
      const tint = ground.map((g, i) => alpha * secondary[i] + (1 - alpha) * g);
      expect(contrast(secondary, tint)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("renders featured project titles and the Let's Talk heading at full opacity", () => {
    for (const file of [
      "src/lib/slices/FeaturedProjects/index.svelte",
      "src/lib/slices/LetsTalk/index.svelte",
    ]) {
      expect(read(file), file).not.toMatch(/opacity-\d+/);
    }
  });

  it("points aria-controls at the menu only while it is open", async () => {
    const { getByRole } = render(SiteHeader, { props: { tone: "dark" } });
    const open = getByRole("button", { name: "Open menu" });
    expect(open.hasAttribute("aria-controls")).toBe(false);
    await fireEvent.click(open);
    expect(open.getAttribute("aria-controls")).toBe("wh-menu");
  });

  it("labels the sticky bar's nav apart from the main nav", () => {
    const { container } = render(SiteHeader, { props: { tone: "dark" } });
    const labels = [...container.ownerDocument.querySelectorAll("nav")].map((n) =>
      n.getAttribute("aria-label"),
    );
    expect(labels).toContain("Main");
    expect(labels).toContain("Main, sticky");
  });

  it("keeps the sticky bar hidden at the top of the page even while it holds focus", async () => {
    const { container } = render(SiteHeader, { props: { tone: "dark" } });
    const bar = container.ownerDocument.querySelector(".wh-sidekick") as HTMLElement;
    const scrollTo = async (y: number) => {
      Object.defineProperty(window, "scrollY", { value: y, configurable: true });
      await fireEvent.scroll(window);
    };
    await scrollTo(600);
    await scrollTo(400);
    expect(bar.getAttribute("aria-hidden")).toBe("false");
    await fireEvent.focusIn(bar);
    await scrollTo(800);
    expect(bar.getAttribute("aria-hidden")).toBe("false");
    await scrollTo(0);
    expect(bar.getAttribute("aria-hidden")).toBe("true");
  });
});
