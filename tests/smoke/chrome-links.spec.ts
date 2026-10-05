import { test, expect } from "@playwright/test";

// Every link the site chrome carries (the header nav, the sticky bar that
// replaces it on the way back up, the footer) must land on a page. The route
// manifest in ./routes.ts only proves the pages it lists exist; it says
// nothing about where the chrome actually points, so a header link to a path
// the site does not serve would go out with every other test green.
//
// Read from the server-rendered markup, so this needs no hydration: every one
// of these anchors is in the document on first byte. The phone menu reuses the
// header's NAV_LINKS and only exists while open, so the header covers it.
test("every header and footer link resolves to a page", { tag: "@smoke" }, async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const hrefs = await page.evaluate(() => {
    const anchors = document.querySelectorAll<HTMLAnchorElement>(
      "header a[href], .wh-sidekick a[href], footer a[href]",
    );
    const same = [...anchors]
      .map((a) => new URL(a.getAttribute("href")!, location.href))
      .filter((url) => url.origin === location.origin)
      .map((url) => url.pathname + url.search);
    return [...new Set(same)];
  });
  // Guard the loop: no links collected would pass with nothing checked.
  expect(hrefs.length, "same-origin chrome links found").toBeGreaterThan(0);

  for (const href of hrefs) {
    const response = await page.request.get(href);
    expect(response.status(), `${href} (a header or footer link)`).toBe(200);
  }
});
