import { afterEach, describe, expect, it } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

import { scanForWebflow } from "./webflow-hosts.mjs";

const dirs: string[] = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function fixture(files: Record<string, string | Buffer>): string {
  const dir = mkdtempSync(join(tmpdir(), "no-webflow-"));
  dirs.push(dir);
  for (const [name, body] of Object.entries(files)) {
    mkdirSync(join(dir, name, ".."), { recursive: true });
    writeFileSync(join(dir, name), body);
  }
  return dir;
}

const run = (...args: string[]) =>
  spawnSync(process.execPath, ["scripts/check-no-webflow.mjs", ...args], { encoding: "utf8" });

describe("check-no-webflow", () => {
  it("passes clean output", () => {
    const dir = fixture({
      "index.html": "<p>hi</p>",
      _headers: "/*\n  X-Frame-Options: SAMEORIGIN\n",
    });
    const result = run(dir);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("2 built text files");
  });

  it("catches a Webflow proxy in an extensionless _redirects and a .webmanifest", () => {
    const dir = fixture({
      _redirects: "/old/* https://cdn.prod.website-files.com/abc/:splat 200!\n",
      "site.webmanifest": '{"icons":[{"src":"https://assets.website-files.com/x.png"}]}',
      "ok.html": "<p>fine</p>",
    });
    const { hits } = scanForWebflow([dir]);
    expect(hits.map((file) => file.slice(dir.length + 1)).sort()).toEqual([
      "_redirects",
      "site.webmanifest",
    ]);
    expect(run(dir).status).toBe(1);
  });

  it("skips binary files rather than decoding them", () => {
    const dir = fixture({ "font.woff2": Buffer.from([0, 1, 2, 0x77, 0x65, 0x62]) });
    expect(scanForWebflow([dir])).toEqual({ scanned: 0, hits: [] });
  });

  it("fails when an output root is missing", () => {
    const dir = fixture({ "index.html": "<p>hi</p>" });
    expect(run(dir, join(dir, "does-not-exist")).status).toBe(1);
  });
});
