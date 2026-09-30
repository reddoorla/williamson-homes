import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, extname, join, relative } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TEXT = new Set([".ts", ".js", ".mjs", ".svelte", ".json", ".css", ".html", ".svg", ".toml"]);
const FORBIDDEN = /website-files\.com|webflow\.(?:com|io)|githack\.com/i;

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return walk(path);
    return TEXT.has(extname(name)) ? [path] : [];
  });
}

describe("nothing shipped loads from Webflow", () => {
  it("finds no Webflow or githack host in src, static, customtypes or netlify.toml", () => {
    const files = [
      ...walk(join(ROOT, "src")),
      ...walk(join(ROOT, "static")),
      ...walk(join(ROOT, "customtypes")),
      join(ROOT, "netlify.toml"),
    ].filter((file) => !file.endsWith("no-webflow-hosts.test.ts"));
    expect(files.length).toBeGreaterThan(50);
    const hits = files.filter((file) => FORBIDDEN.test(readFileSync(file, "utf8")));
    expect(hits.map((file) => relative(ROOT, file))).toEqual([]);
  });
});
