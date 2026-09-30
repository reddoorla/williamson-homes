import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const ROOTS = process.argv.slice(2).length ? process.argv.slice(2) : ["build", ".netlify"];
const TEXT = new Set([".html", ".js", ".mjs", ".cjs", ".css", ".json", ".svg", ".xml", ".txt"]);
const FORBIDDEN = /website-files\.com|webflow\.(?:com|io)|githack\.com/i;

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return walk(path);
    return TEXT.has(extname(name)) ? [path] : [];
  });
}

const roots = ROOTS.filter((root) => existsSync(root));
if (roots.length === 0) {
  console.error(`check-no-webflow: none of ${ROOTS.join(", ")} exists; build first`);
  process.exit(1);
}
const files = roots.flatMap(walk);
const hits = files.filter((file) => FORBIDDEN.test(readFileSync(file, "utf8")));
if (hits.length > 0) {
  console.error("check-no-webflow: built output still references Webflow or githack:");
  for (const file of hits) console.error(`  ${relative(process.cwd(), file)}`);
  process.exit(1);
}
console.log(`check-no-webflow: ${files.length} built files, no Webflow or githack host`);
