import { test, expect } from "@playwright/test";

// The page's switches come from a build-time virtual module that the unit tests
// mock, so this is the one place they are read through the route a visitor hits.
// It asserts what the policy says about THIS site, never how it looks.
test(
  "/privacy discloses this site's services and names the business",
  { tag: "@smoke" },
  async ({ page }) => {
    const response = await page.goto("/privacy", { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: "Privacy Policy" })).toBeVisible();
    await expect(page.getByTestId("privacy-draft")).toBeVisible();
    await expect(page.locator("article")).toContainText(
      'Williamson Homes ("we") runs this website',
    );

    // On: GA4 (disclosed ahead of its tag), the Vimeo the CSP frames, the host.
    for (const id of ["ga4", "vimeo", "netlify"]) {
      await expect(page.getByTestId(`service-${id}`), id).toBeVisible();
    }
    // Off: the site has no form, so nothing about form handling or Turnstile.
    for (const id of ["forms", "turnstile", "newsletter", "youtube", "adobeFonts"]) {
      await expect(page.getByTestId(`service-${id}`), id).toHaveCount(0);
    }
  },
);
