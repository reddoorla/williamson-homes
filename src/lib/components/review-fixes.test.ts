import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/svelte";

import SiteHeader from "./SiteHeader.svelte";

afterEach(() => cleanup());

describe("round-1 and round-2 review fixes stay fixed", () => {
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

  it("hands focus to the same link in the main header when the sticky bar hides at the top", async () => {
    const { container } = render(SiteHeader, { props: { tone: "dark" } });
    const doc = container.ownerDocument;
    const bar = doc.querySelector(".wh-sidekick") as HTMLElement;
    const scrollTo = async (y: number) => {
      Object.defineProperty(window, "scrollY", { value: y, configurable: true });
      await fireEvent.scroll(window);
    };
    await scrollTo(600);
    await scrollTo(400);
    const stickyLink = bar.querySelector('a[href="/about-us"]') as HTMLAnchorElement;
    stickyLink.focus();
    await fireEvent.focusIn(stickyLink);
    await scrollTo(0);
    const active = doc.activeElement as HTMLElement;
    expect(active.getAttribute("href")).toBe("/about-us");
    expect(active.closest("header")).not.toBeNull();
    await scrollTo(600);
    expect(bar.getAttribute("aria-hidden")).toBe("true");
  });
});
