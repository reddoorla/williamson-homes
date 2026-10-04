import { chromium } from "@playwright/test";
const b = await chromium.launch();
try {
  for (const vw of [1440, 390]) {
    const p = await b.newPage({ viewport: { width: vw, height: 900 }, reducedMotion: "reduce" });
    await p.goto("https://www.williamson-homes.com/about-us", { waitUntil: "networkidle", timeout: 60000 });
    await p.waitForTimeout(2500);
    console.log(vw, await p.evaluate(() => {
      const img = document.querySelector("img.tan-w-icon");
      const out = []; let a = img;
      for (let k = 0; k < 5 && a; k++, a = a.parentElement) { const c = getComputedStyle(a); out.push(`${a.tagName.toLowerCase()}.${String(a.className).split(" ").join(".")} filter=${c.filter} opacity=${c.opacity} blend=${c.mixBlendMode} bg=${c.backgroundColor}`); }
      return out.join("\n  ");
    }));
    const box = await p.locator("img.tan-w-icon").boundingBox();
    await p.screenshot({ path: `/tmp/claude-0/-home-user-reddoor-maintenance/de49e5b7-06c3-5124-8212-6702bbde7105/scratchpad/mark-${vw}.png`, clip: { x: box.x - 10, y: box.y - 10, width: box.width + 20, height: box.height + 20 }, fullPage: true });
    await p.close();
  }
} finally { await b.close(); }
