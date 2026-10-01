import { expect, test, type Page } from "@playwright/test";

const PAGE = "/dev/match/home";
const PIN = 256;

async function stepTops(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll("[data-slice-type=process_steps] li")].map((li) =>
      Math.round(li.getBoundingClientRect().top),
    ),
  );
}

async function scrollToSteps(page: Page, offset: number) {
  await page.evaluate(
    ([offset, pin]) => {
      const list = document.querySelector("[data-slice-type=process_steps] ol") as HTMLElement;
      const top = list.getBoundingClientRect().top + window.scrollY - pin + offset;
      window.scrollTo({ top, behavior: "instant" });
    },
    [offset, PIN],
  );
  await page.waitForTimeout(150);
}

test.describe("the counters pin and advance, desktop", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });

  test("step 1 holds at 256px while step 2 rises, then step 2 takes the circle", async ({
    page,
  }) => {
    await page.goto(PAGE);
    await expect(page.locator("[data-slice-type=process_steps][data-pinning]")).toHaveCount(1);
    await scrollToSteps(page, 120);
    const mid = await stepTops(page);
    expect(mid[0]).toBe(PIN);
    expect(mid[1]).toBeGreaterThan(PIN);
    await scrollToSteps(page, 250);
    const later = await stepTops(page);
    expect(later[0]).toBe(PIN);
    expect(later[1]).toBe(PIN);
    const active = await page
      .locator("[data-slice-type=process_steps] li")
      .evaluateAll((lis) => lis.map((li) => li.hasAttribute("data-active")));
    expect(active).toEqual([false, true, false, false]);
  });

  test("the wheel carries the page past the section instead of trapping it", async ({ page }) => {
    await page.goto(PAGE);
    await scrollToSteps(page, -200);
    const sectionBottom = await page.evaluate(() => {
      const section = document.querySelector("[data-slice-type=process_steps]") as HTMLElement;
      return section.getBoundingClientRect().bottom + window.scrollY;
    });
    for (let i = 0; i < 30; i++) {
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(40);
    }
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(sectionBottom);
  });
});

test.describe("the counters stay put under reduced motion", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("no pinning, every step's text visible", async ({ page }) => {
    await page.goto(PAGE);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("[data-slice-type=process_steps][data-pinning]")).toHaveCount(0);
    await scrollToSteps(page, 400);
    const tops = await stepTops(page);
    expect(tops[0]).toBeLessThan(PIN - 300);
    const opacities = await page
      .locator("[data-slice-type=process_steps] .wh-prose")
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity));
    expect(opacities).toEqual(["1", "1", "1", "1"]);
  });
});
