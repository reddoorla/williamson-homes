import { render, cleanup } from "@testing-library/svelte";
import { describe, it, expect, afterEach } from "vitest";
import SiteFooter from "./SiteFooter.svelte";

afterEach(() => cleanup());

describe("SiteFooter", () => {
  it("links to the privacy policy from the rendered chrome, not from CMS content", () => {
    const { container } = render(SiteFooter);
    const link = container.querySelector("footer a[href='/privacy']");
    expect(link?.textContent?.trim()).toBe("Privacy Policy");
  });

  it("names the business the privacy policy names", () => {
    const { container } = render(SiteFooter);
    expect(container.querySelector("footer")?.textContent).toContain("Williamson Homes");
  });
});
