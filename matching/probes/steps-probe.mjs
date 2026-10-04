import { chromium } from "@playwright/test";
const [url, sel] = process.argv.slice(2);
const b = await chromium.launch();
try {
  const p = await b.newPage({ viewport: { width: 390, height: 900 }, reducedMotion: "reduce" });
  await p.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  console.log(await p.evaluate((sel) => {
    document.querySelectorAll("section").forEach((s) => { if (getComputedStyle(s).display === "none") s.remove(); });
    const s = document.querySelector(sel); const items = [...s.querySelectorAll("h3,p,li,.wh-prose")];
    const first = items.find((e) => e.textContent.trim().startsWith("Design") || e.textContent.trim().startsWith("Meet"));
    const y0 = first.getBoundingClientRect().top;
    return items.filter((e) => e.getBoundingClientRect().height > 0).slice(0, 12).map((e) => { const r = e.getBoundingClientRect(); const c = getComputedStyle(e); return `${e.tagName.toLowerCase()} x=${Math.round(r.left)} y=${Math.round(r.top - y0)} w=${Math.round(r.width)} h=${Math.round(r.height)} pt=${c.paddingTop} pb=${c.paddingBottom} mt=${c.marginTop} mb=${c.marginBottom} "${e.textContent.trim().slice(0, 18)}"`; }).join("\n");
  }, sel));
} finally { await b.close(); }
