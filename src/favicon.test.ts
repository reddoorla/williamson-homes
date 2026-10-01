import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "..");
const html = readFileSync(resolve(root, "src/app.html"), "utf-8");
const md5 = (path: string) => createHash("md5").update(readFileSync(path)).digest("hex");

const STARTER_FAVICON = "3a387408ecc6cc283f724b39ca5fffb4";

const ICONS = [
  {
    rel: "icon",
    md5: "e8ecf444a257adfb3c9293cf8d742727",
    reference: "646bf4ff2076780ea7c8a110_Asset 1.png",
  },
  {
    rel: "apple-touch-icon",
    md5: "b96227fa7b825d31353cd1421f292ea4",
    reference: "646bf4e6eb85a69aa73a1400_Asset 1.png",
  },
];

function hrefFor(rel: string) {
  const link = [...html.matchAll(/<link\b[^>]*>/g)]
    .map((m) => m[0])
    .find((tag) => new RegExp(`rel="${rel}"`).test(tag));
  const href = link?.match(/href="%sveltekit\.assets%\/([^"]+)"/)?.[1];
  if (!href) throw new Error(`no <link rel="${rel}"> with an assets href in app.html`);
  return href;
}

describe("favicons are the reference's files", () => {
  for (const icon of ICONS) {
    it(`rel="${icon.rel}" serves ${icon.reference}`, () => {
      const served = md5(resolve(root, "static", hrefFor(icon.rel)));
      expect(served).not.toBe(STARTER_FAVICON);
      expect(served).toBe(icon.md5);
    });
  }
});

const NETLIFY_DEFAULT_ICO = "e0dc6025";

function icoSizes(path: string) {
  const bytes = readFileSync(path);
  expect([...bytes.subarray(0, 4)]).toEqual([0, 0, 1, 0]);
  const count = bytes.readUInt16LE(4);
  return Array.from({ length: count }, (_, i) => bytes[6 + 16 * i] || 256).sort((a, b) => a - b);
}

describe("/favicon.ico is ours, so Netlify never answers it with its own icon", () => {
  const path = resolve(root, "static/favicon.ico");

  it("ships a real ICO with 16, 32 and 48px images", () => {
    expect(icoSizes(path)).toEqual([16, 32, 48]);
    expect(md5(path).startsWith(NETLIFY_DEFAULT_ICO)).toBe(false);
  });

  it("is linked from app.html, after the reference's PNG", () => {
    const links = [...html.matchAll(/<link\b[^>]*rel="icon"[^>]*>/g)].map((m) => m[0]);
    expect(links[0]).toContain("favicon.png");
    expect(links[1]).toContain('href="%sveltekit.assets%/favicon.ico"');
    expect(links[1]).toContain('sizes="any"');
  });
});
