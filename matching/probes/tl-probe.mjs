import { chromium } from "@playwright/test";
const URL_ = process.env.URL || "https://www.williamson-homes.com/about-us";
const SEL = process.env.SEL || ".builders-section";
const ITEMS = process.env.ITEMS || "img,h3,p,h4,figcaption,.timeline-circle-left,.timeline-circle-last,li > span,div > span.absolute";
const b = await chromium.launch();
try {
  for (const vw of (process.env.VWS || "1440,834").split(",").map(Number)) {
    const p = await b.newPage({ viewport: { width: vw, height: 900 } });
    await p.goto(URL_, { waitUntil: "networkidle", timeout: 60000 });
    for (let y = 0; y < 4000; y += 250) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(30); }
    console.log(vw, await p.evaluate(([SEL, ITEMS]) => {
      const s = document.querySelector(SEL);
      const s0 = s.getBoundingClientRect().top;
      const rows = [];
      for (const el of s.querySelectorAll(ITEMS)) {
        const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
        if (r.height === 0) continue;
        rows.push(`${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0]} x=${Math.round(r.left)} y=${Math.round(r.top - s0)} w=${Math.round(r.width)} h=${Math.round(r.height)} ${cs.fontSize}/${cs.lineHeight} ${cs.textAlign} "${(el.textContent || "").trim().slice(0, 22)}"`);
      }
      rows.push(`section h=${Math.round(s.getBoundingClientRect().height)}`);
      return rows.join("\n");
    }, [SEL, ITEMS]));
    await p.close();
  }
} finally { await b.close(); }
