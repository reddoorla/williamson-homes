import { chromium } from "@playwright/test";
const [url, vw, ...texts] = process.argv.slice(2);
const b = await chromium.launch();
try {
  const p = await b.newPage({ viewport: { width: Number(vw), height: 900 } });
  await p.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  console.log(await p.evaluate((texts) => texts.map((t) => {
    document.querySelectorAll("section").forEach((s) => { if (getComputedStyle(s).display === "none") s.remove(); });
    const els = [...document.querySelectorAll("h2,h3,h4,p,div")].filter((e) => e.textContent.trim().startsWith(t) && ![...e.children].some((c) => c.textContent.trim().startsWith(t)));
    const e = els[0]; if (!e) return t + " ?";
    const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
    const anc = []; let a = e; for (let k = 0; k < 4 && a; k++, a = a.parentElement) { const c = getComputedStyle(a); anc.push(`${a.tagName.toLowerCase()} w=${Math.round(a.getBoundingClientRect().width)} pl=${c.paddingLeft} pr=${c.paddingRight} mw=${c.maxWidth}`); }
    return `${t.slice(0, 20)}: x=${Math.round(r.left)} w=${Math.round(r.width)} ${cs.fontFamily.split(",")[0]} ${cs.fontWeight} ${cs.fontSize}/${cs.lineHeight} ls=${cs.letterSpacing} ws=${cs.wordSpacing}\n    ` + anc.join("\n    ");
  }).join("\n"), texts));
} finally { await b.close(); }
