import { expect, test, type Page } from "@playwright/test";

const PAGE = "/dev/match/home";

async function scrollTo(page: Page, y: number) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);
  await page.waitForTimeout(150);
}

const focused = (page: Page) =>
  page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    return {
      href: el?.getAttribute("href") ?? null,
      inHeader: !!el?.closest(".wh-hero-header"),
      inSidekick: !!el?.closest(".wh-sidekick"),
      top: el ? Math.round(el.getBoundingClientRect().top) : null,
    };
  });

test.describe("header focus in a real browser (inert is honoured here, not in jsdom)", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });

  test("a focused sticky-bar link hands focus to the same header link when the header returns", async ({
    page,
  }) => {
    await page.goto(PAGE);
    await page.waitForLoadState("networkidle");
    await scrollTo(page, 2600);
    await scrollTo(page, 2300);
    const sticky = page.locator('.wh-sidekick a[href="/projects"]');
    await expect(sticky).toBeVisible();
    await sticky.focus();
    await scrollTo(page, 0);
    const now = await focused(page);
    expect(now).toMatchObject({ href: "/projects", inHeader: true });
  });

  test("a focused header link keeps focus, and stays on screen, when the page scrolls past the hero", async ({
    page,
  }) => {
    await page.goto(PAGE);
    await page.waitForLoadState("networkidle");
    const link = page.locator('.wh-hero-header a[href="/projects"]');
    await link.focus();
    await scrollTo(page, 2000);
    const now = await focused(page);
    expect(now.href).toBe("/projects");
    expect(now.top).toBeGreaterThanOrEqual(0);
  });

  test("a mouse click on a sticky-bar link navigates (nothing covers the bar)", async ({
    page,
  }) => {
    await page.goto(PAGE);
    await page.waitForLoadState("networkidle");
    await scrollTo(page, 2600);
    await scrollTo(page, 2300);
    const sticky = page.locator('.wh-sidekick a[href="/projects"]');
    await expect(sticky).toBeVisible();
    const box = (await sticky.boundingBox())!;
    const hit = await page.evaluate(
      ([x, y]) => document.elementFromPoint(x, y)?.closest("a")?.closest(".wh-sidekick") !== null,
      [box.x + box.width / 2, box.y + box.height / 2],
    );
    expect(hit).toBe(true);
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await expect(page).toHaveURL(/\/projects$/);
  });

  test("a pointer-focused header link (ctrl-click) does not pin the header", async ({ page }) => {
    await page.goto(PAGE);
    await page.waitForLoadState("networkidle");
    await page.locator('.wh-hero-header a[href="/projects"]').click({ modifiers: ["Control"] });
    await scrollTo(page, 2500);
    const top = await page.evaluate(
      () => (document.querySelector(".wh-hero-header") as HTMLElement).getBoundingClientRect().top,
    );
    expect(top).toBeLessThan(0);
  });
});
