import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "..");
const html = readFileSync(resolve(root, "src/app.html"), "utf-8");
const md5 = (path: string) => createHash("md5").update(readFileSync(path)).digest("hex");

const STARTER_FAVICON = "3a387408ecc6cc283f724b39ca5fffb4";

function hrefFor(rel: string) {
  const link = [...html.matchAll(/<link\b[^>]*>/g)]
    .map((m) => m[0])
    .find((tag) => new RegExp(`rel="${rel}"`).test(tag));
  const href = link?.match(/href="%sveltekit\.assets%\/([^"]+)"/)?.[1];
  if (!href) throw new Error(`no <link rel="${rel}"> with an assets href in app.html`);
  return href;
}

describe("the favicons are the site's own, not the starter's", () => {
  for (const rel of ["icon", "apple-touch-icon"]) {
    it(`rel="${rel}" serves a file of the site's own`, () => {
      expect(md5(resolve(root, "static", hrefFor(rel)))).not.toBe(STARTER_FAVICON);
    });
  }
});

const NETLIFY_DEFAULT_ICO = "e0dc6025";

function icoImageCount(path: string) {
  const bytes = readFileSync(path);
  expect([...bytes.subarray(0, 4)]).toEqual([0, 0, 1, 0]);
  return bytes.readUInt16LE(4);
}

describe("/favicon.ico is ours, so Netlify never answers it with its own icon", () => {
  const path = resolve(root, "static/favicon.ico");

  it("ships a real ICO with at least one image", () => {
    expect(icoImageCount(path)).toBeGreaterThanOrEqual(1);
    expect(md5(path).startsWith(NETLIFY_DEFAULT_ICO)).toBe(false);
  });

  it("is linked from app.html", () => {
    const ico = [...html.matchAll(/<link\b[^>]*rel="icon"[^>]*>/g)]
      .map((m) => m[0])
      .find((tag) => tag.includes('href="%sveltekit.assets%/favicon.ico"'));
    expect(ico, 'no <link rel="icon"> for favicon.ico in app.html').toBeDefined();
  });
});
