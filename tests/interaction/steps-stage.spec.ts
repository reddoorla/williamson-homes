import { expect, test, type Page } from "@playwright/test";

const SECTION = "[data-slice-type=process_steps]";

async function pinTop(page: Page) {
  return page.evaluate(
    (sel) =>
      parseFloat((document.querySelector(`${sel} .wh-steps-stage`) as HTMLElement).style.top),
    SECTION,
  );
}

async function scrollIntoStage(page: Page, scrolled: number) {
  const target = await page.evaluate(
    ([sel, scrolled]) => {
      const track = document.querySelector(`${sel} .wh-steps-track`) as HTMLElement;
      const stage = track.querySelector(".wh-steps-stage") as HTMLElement;
      return (
        track.getBoundingClientRect().top +
        window.scrollY -
        parseFloat(stage.style.top) +
        Number(scrolled)
      );
    },
    [SECTION, scrolled] as const,
  );
  const from = await page.evaluate(() => window.scrollY);
  for (let s = 1; s <= 8; s++) {
    await page.evaluate(
      (y) => window.scrollTo({ top: y, behavior: "instant" }),
      from + ((target - from) * s) / 8,
    );
    await page.waitForTimeout(20);
  }
  await page.waitForTimeout(150);
}

const stageTop = (page: Page) =>
  page.evaluate(
    (sel) =>
      Math.round(
        (document.querySelector(`${sel} .wh-steps-stage`) as HTMLElement).getBoundingClientRect()
          .top,
      ),
    SECTION,
  );

const circleBox = (page: Page, i: number) =>
  page.evaluate(
    ([sel, i]) => {
      const n = document.querySelectorAll(`${sel} .wh-step-number`)[Number(i)] as HTMLElement;
      const li = n.closest("li") as HTMLElement;
      const ol = li.parentElement as HTMLElement;
      const a = ol.getBoundingClientRect();
      const b = li.getBoundingClientRect();
      return {
        top: Math.round(b.top - a.top),
        centre: Math.round(
          (n.getBoundingClientRect().left + n.getBoundingClientRect().right) / 2 - a.left,
        ),
      };
    },
    [SECTION, i] as const,
  );

const unclipped = (page: Page, i: number) =>
  page.evaluate(
    ([sel, i]) => {
      const n = document.querySelectorAll(`${sel} .wh-step-number`)[Number(i)] as HTMLElement;
      const ol = n.closest("ol") as HTMLElement;
      const reach = [n, ...n.querySelectorAll<HTMLElement>(".wh-step-halo")].map(
        (el) => el.getBoundingClientRect().top,
      );
      return Math.min(...reach) >= ol.getBoundingClientRect().top;
    },
    [SECTION, i] as const,
  );

const lit = (page: Page) =>
  page
    .locator(`${SECTION} li`)
    .evaluateAll((lis) => lis.map((li) => li.hasAttribute("data-active")));

for (const path of ["/dev/match/home", "/dev/match/about-us"]) {
  test.describe(`the steps stage on ${path}, desktop`, () => {
    test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });

    test("holds still while the steps advance, and parks the last step, solid, before releasing", async ({
      page,
    }) => {
      await page.goto(path);
      await expect(page.locator(`${SECTION}[data-pinning]`)).toHaveCount(1);
      const pin = Math.round(await pinTop(page));
      const len = await page.evaluate(() =>
        Math.round(window.innerHeight * (location.pathname.includes("about") ? 0.85 : 0.6)),
      );

      const hold = await page.evaluate(() => Math.round(window.innerHeight * 0.8));
      await scrollIntoStage(page, 0);
      expect(await stageTop(page)).toBe(pin);
      const restingCircle = await circleBox(page, 0);
      expect(await lit(page)).toEqual([true, false, false, false]);

      await scrollIntoStage(page, len / 2);
      const arriving = page.locator(`${SECTION} li`).nth(1).locator(".wh-step-number");
      await expect(arriving).toHaveCSS("opacity", "1");
      await expect(arriving).toHaveCSS("background-color", "rgb(255, 255, 255)");

      await scrollIntoStage(page, len);
      expect(await stageTop(page)).toBe(pin);
      expect(await lit(page)).toEqual([false, true, false, false]);

      await scrollIntoStage(page, 3 * len);
      expect(await stageTop(page)).toBe(pin);
      expect(await lit(page)).toEqual([false, false, false, true]);
      const last = page.locator(`${SECTION} li`).last();
      await expect(last).toHaveCSS("opacity", "1");
      await expect(last.locator(".wh-prose")).toHaveCSS("opacity", "1");

      for (const into of [0.1, 0.25, 0.4]) {
        await scrollIntoStage(page, 3 * len + into * hold);
        const box = await circleBox(page, 3);
        expect(box.top).toBe(restingCircle.top);
        expect(box.centre).toBe(restingCircle.centre);
        expect(await unclipped(page, 3)).toBe(true);
      }

      await scrollIntoStage(page, 3 * len + 0.8 * hold);
      expect(await stageTop(page)).toBe(pin);
      await expect(page.locator(`${SECTION}[data-solid]`)).toHaveCount(1);
      await expect(last.locator(".wh-step-number")).toHaveCSS(
        "background-color",
        "rgb(0, 90, 120)",
      );
      await expect(last.locator("h3")).toHaveCSS("color", "rgb(0, 90, 120)");

      await scrollIntoStage(page, 3 * len + hold + 300);
      expect(await stageTop(page)).toBeLessThan(pin);
      await expect(page.locator(`${SECTION}[data-solid]`)).toHaveCount(1);
    });

    test("the wheel carries the page past the section instead of trapping it", async ({ page }) => {
      await page.goto(path);
      await expect(page.locator(`${SECTION}[data-pinning]`)).toHaveCount(1);
      await scrollIntoStage(page, -200);
      const bottom = await page.evaluate(
        (sel) =>
          (document.querySelector(sel) as HTMLElement).getBoundingClientRect().bottom +
          window.scrollY,
        SECTION,
      );
      for (let i = 0; i < 80; i++) {
        await page.mouse.wheel(0, 120);
        await page.waitForTimeout(15);
      }
      await page.waitForTimeout(300);
      expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(bottom - 900);
    });
  });
}

test.describe("the steps stay a plain list under reduced motion", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("no pinning, every step's text visible", { tag: "@smoke" }, async ({ page }) => {
    await page.goto("/dev/match/home");
    await page.waitForLoadState("networkidle");
    const pinned = page.locator(`${SECTION}[data-pinning]`);
    await expect(pinned).toHaveCount(0);
    // Read the page a reduced-motion visitor loads, before the control below
    // toggles motion on and off: reading after the toggle raced the un-pin,
    // which can leave a step's inline opacity at 0 for a frame.
    const opacities = await page
      .locator(`${SECTION} li`)
      .evaluateAll((lis) =>
        lis.flatMap((li) =>
          [...li.children]
            .filter((el) => el.getAttribute("aria-hidden") !== "true")
            .map((el) => getComputedStyle(el).opacity),
        ),
      );
    expect(opacities.length, "steps with text").toBeGreaterThan(0);
    expect(opacities, "no step's text is left at opacity 0").not.toContain("0");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect(pinned, "control: the stage is live and pins when motion is allowed").toHaveCount(
      1,
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(pinned).toHaveCount(0);
  });
});

test.describe("the steps stage on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, reducedMotion: "no-preference" });

  test("home pins, advances in one column, and parks the last step solid", async ({ page }) => {
    await page.goto("/dev/match/home");
    await expect(page.locator(`${SECTION}[data-pinning]`)).toHaveCount(1);
    const pin = Math.round(await pinTop(page));
    const len = await page.evaluate(() => Math.round(window.innerHeight * 0.6));
    const hold = await page.evaluate(() => Math.round(window.innerHeight * 0.8));
    await scrollIntoStage(page, 0);
    const resting = await circleBox(page, 0);
    expect(await lit(page)).toEqual([true, false, false, false]);
    await expect(page.locator(`${SECTION} li`).first().locator(".wh-step-number")).toHaveCSS(
      "background-color",
      "rgb(109, 106, 105)",
    );
    await scrollIntoStage(page, 3 * len + 0.8 * hold);
    expect(await stageTop(page)).toBe(pin);
    expect(await lit(page)).toEqual([false, false, false, true]);
    const box = await circleBox(page, 3);
    expect(box.top).toBe(resting.top);
    expect(box.centre).toBe(resting.centre);
    expect(await unclipped(page, 3)).toBe(true);
    await expect(page.locator(`${SECTION}[data-solid]`)).toHaveCount(1);
    const left = await page
      .locator(`${SECTION} li`)
      .last()
      .locator(".wh-step-number")
      .evaluate((n) => n.getBoundingClientRect().left);
    expect(left).toBeGreaterThanOrEqual(0);
  });
});

test.describe("a phone screen too short for the stage", () => {
  test.use({ viewport: { width: 390, height: 664 }, reducedMotion: "no-preference" });

  test("about-us keeps the plain list, steps stacked in order", async ({ page }) => {
    await page.goto("/dev/match/about-us");
    await page.waitForLoadState("networkidle");
    await expect(page.locator(`${SECTION}[data-pinning]`)).toHaveCount(0);
    const tops = await page
      .locator(`${SECTION} li`)
      .evaluateAll((lis) => lis.map((li) => li.getBoundingClientRect().top));
    expect(tops).toEqual([...tops].sort((a, b) => a - b));
    expect(new Set(tops).size).toBe(4);
  });
});
