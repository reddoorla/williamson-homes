import { chromium } from "@playwright/test";
const [ref, cand, ...anchors] = process.argv.slice(2);
const b = await chromium.launch();
try {
  for (const vw of [1440, 834, 390]) {
    for (const [side, url] of [["ref", ref], ["cand", cand]]) {
      const p = await b.newPage({ viewport: { width: vw, height: 900 } });
      await p.goto(url, { waitUntil: "networkidle", timeout: 60000 });
      const hits = await p.evaluate((anchors) => {
        const norm = (s) => s.replace(/\s+/g, " ").trim().toLowerCase();
        return anchors.map((a) => {
          const want = norm(a);
          const els = [...document.body.querySelectorAll("*")].filter((el) => norm(el.textContent || "").startsWith(want));
          const leaves = els.filter((el) => ![...el.children].some((c) => norm(c.textContent || "").startsWith(want)));
          return a.slice(0, 28) + " → " + leaves.slice(0, 4).map((el) => {
            const r = el.getBoundingClientRect();
            const vis = r.height > 0 && getComputedStyle(el).visibility !== "hidden";
            return `${el.tagName.toLowerCase()}.${(el.className || "").toString().split(" ")[0]}@${Math.round(r.top + scrollY)}${vis ? "" : "(hidden)"}`;
          }).join(" ");
        });
      }, anchors);
      console.log(`${vw} ${side}\n  ` + hits.join("\n  "));
      await p.close();
    }
  }
} finally {
  await b.close();
}
