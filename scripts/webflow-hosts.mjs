import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

export const FORBIDDEN = /website-files\.com|webflow\.(?:com|io)|githack\.com/i;

const SKIP_DIRS = new Set(["node_modules", ".git"]);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    if (SKIP_DIRS.has(name)) return [];
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function isBinary(bytes) {
  return bytes.subarray(0, 8192).includes(0);
}

export function scanForWebflow(paths) {
  const files = [];
  for (const path of paths) {
    if (!existsSync(path)) continue;
    files.push(...(statSync(path).isDirectory() ? walk(path) : [path]));
  }
  let scanned = 0;
  const hits = [];
  for (const file of files) {
    const bytes = readFileSync(file);
    if (isBinary(bytes)) continue;
    scanned += 1;
    if (FORBIDDEN.test(bytes.toString("utf8"))) hits.push(file);
  }
  return { scanned, hits };
}
