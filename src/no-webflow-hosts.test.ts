import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

import { scanForWebflow } from "../scripts/webflow-hosts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SELF = fileURLToPath(import.meta.url);

describe("nothing shipped loads from Webflow", () => {
  it("finds no Webflow or githack host in src, static, customtypes or netlify.toml", () => {
    const { scanned, hits } = scanForWebflow(
      ["src", "static", "customtypes", "netlify.toml"].map((p) => join(ROOT, p)),
    );
    expect(scanned).toBeGreaterThan(50);
    expect(hits.filter((file) => file !== SELF).map((file) => relative(ROOT, file))).toEqual([]);
  });
});
