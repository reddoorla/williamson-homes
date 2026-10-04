import { chromium } from "@playwright/test";
const [url, vw, fromText, toText] = process.argv.slice(2);
const b = await chromium.launch();
try {
  const p = await b.newPage({ viewport: { width: Number(vw), height: 900 } });
  await p.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  for (let y = 0; y < 9000; y += 300) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(30); }
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(500);
  console.log(await p.evaluate(([fromText, toText]) => {
    document.querySelectorAll("section").forEach((s) => { if (getComputedStyle(s).display === "none") s.remove(); });
    const norm = (s) => (s || "").replace(/\s+/g, " ").trim().toLowerCase();
    const find = (t) => [...document.querySelectorAll("h1,h2,h3,h4,h5,h6,p,a,li,span,div,section")].find((e) => norm(e.textContent).startsWith(norm(t)));
    const a = find(fromText), z = find(toText);
    const y0 = a.getBoundingClientRect().top + scrollY, y1 = z.getBoundingClientRect().top + scrollY;
    const out = [`from ${Math.round(y0)} to ${Math.round(y1)} (${Math.round(y1 - y0)})  to-el=${z.tagName}.${z.className}`];
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect(); const top = r.top + scrollY;
      if (top < y0 - 1 || top > y1 + 1 || r.height === 0) continue;
      const cs = getComputedStyle(el);
      const own = [...el.childNodes].filter((n) => n.nodeType === 3 && n.nodeValue.trim()).map((n) => n.nodeValue.trim()).join(" ").slice(0, 30);
      if (!own && !["SECTION","IMG","svg"].includes(el.tagName) && !(cs.borderTopWidth !== "0px" && cs.borderRadius !== "0px")) continue;
      out.push(`${Math.round(top - y0)}+${Math.round(r.height)} ${el.tagName.toLowerCase()}.${String(el.className).split(" ").slice(0,3).join(".")} ${cs.fontSize}/${cs.lineHeight} mt=${cs.marginTop} pt=${cs.paddingTop} pb=${cs.paddingBottom} mb=${cs.marginBottom} "${own}"`);
    }
    return out.join("\n");
  }, [fromText, toText]));
} finally { await b.close(); }
