import { expect, test, type Page } from "@playwright/test";

const offsetVh = (page: Page) =>
  page.evaluate(() => {
    const menu = document.getElementById("wh-menu");
    if (!menu) return null;
    return (menu.getBoundingClientRect().top / window.innerHeight) * 100;
  });

test.describe("the phone menu slides like IX2 a-6/a-7", () => {
  test.use({ viewport: { width: 390, height: 844 }, reducedMotion: "no-preference" });

  test("drops from above with ease-in, and lifts away with ease-out, 500ms each way", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.waitForTimeout(250);
    const opening = (await offsetVh(page))!;
    expect(opening).toBeLessThan(-35);
    expect(opening).toBeGreaterThan(-90);
    await page.waitForTimeout(400);
    expect(Math.round((await offsetVh(page))!)).toBe(0);

    await page.getByRole("button", { name: "Close menu" }).click();
    await page.waitForTimeout(250);
    const closing = (await offsetVh(page))!;
    expect(closing).toBeLessThan(-35);
    expect(closing).toBeGreaterThan(-95);
    await page.waitForTimeout(400);
    expect(await offsetVh(page)).toBeNull();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
  });
});

test.describe("the phone menu under reduced motion", () => {
  test.use({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });

  test("appears in place with no slide", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.waitForTimeout(50);
    expect(Math.round((await offsetVh(page))!)).toBe(0);
  });
});

const heroHeaderTop = (page: Page) =>
  page.evaluate(
    () => (document.querySelector(".wh-hero-header") as HTMLElement).getBoundingClientRect().top,
  );

async function scrollToY(page: Page, y: number) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);
}

for (const [width, shows] of [
  [1440, true],
  [834, false],
] as const) {
  test.describe(`a project page at ${width}`, () => {
    test.use({ viewport: { width, height: 900 }, reducedMotion: "no-preference" });

    test(`the gallery ${shows ? "brings the header back" : "leaves the header away"} (IX2 e-35/e-36)`, async ({
      page,
    }) => {
      await page.goto("/projects/pv-malaga-cove");
      await page.waitForLoadState("networkidle");
      const [galleryTop, galleryBottom] = await page.evaluate(() => {
        const gallery = document.querySelector("[data-wh-header-show]") as HTMLElement;
        const box = gallery.getBoundingClientRect();
        return [box.top + window.scrollY, box.bottom + window.scrollY];
      });
      await scrollToY(page, galleryTop + 200);
      if (shows) await expect.poll(() => heroHeaderTop(page)).toBeGreaterThanOrEqual(0);
      else await expect.poll(() => heroHeaderTop(page)).toBeLessThan(0);
      const maxY = await page.evaluate(
        () => document.documentElement.scrollHeight - window.innerHeight,
      );
      if (galleryBottom + 50 <= maxY) {
        await scrollToY(page, galleryBottom + 50);
        await expect.poll(() => heroHeaderTop(page)).toBeLessThan(0);
      } else {
        await scrollToY(page, maxY);
        expect(await page.evaluate(() => window.scrollY)).toBeLessThan(galleryBottom);
      }
    });
  });
}
