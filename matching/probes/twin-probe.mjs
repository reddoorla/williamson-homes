import { chromium } from "@playwright/test";
const b = await chromium.launch();
try {
  for (const vw of [1440, 390]) {
    const p = await b.newPage({ viewport: { width: vw, height: 900 } });
    await p.goto("https://www.williamson-homes.com/about-us", { waitUntil: "networkidle", timeout: 60000 });
    console.log(vw, await p.evaluate(() =>
      [...document.querySelectorAll("body section, body > div, footer")].map((s) => {
        const r = s.getBoundingClientRect();
        const cs = getComputedStyle(s);
        return `${s.tagName.toLowerCase()}.${s.className.split(" ").join(".")} y=${Math.round(r.top + scrollY)} h=${Math.round(r.height)} ${cs.display === "none" ? "NONE" : ""} "${(s.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40)}"`;
      }).join("\n")));
    await p.close();
  }
} finally { await b.close(); }
