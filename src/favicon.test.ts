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
      const captured = resolve(
        root,
        "matching/spec/files/cdn.prod.website-files.com/645ec08251dadc9000a072e5",
        icon.reference,
      );
      expect(md5(captured)).toBe(icon.md5);
    });
  }
});
