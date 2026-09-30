import { existsSync } from "node:fs";
import { relative } from "node:path";

import { scanForWebflow } from "./webflow-hosts.mjs";

const roots = process.argv.slice(2).length ? process.argv.slice(2) : ["build", ".netlify"];
const missing = roots.filter((root) => !existsSync(root));
if (missing.length > 0) {
  console.error(`check-no-webflow: ${missing.join(", ")} does not exist; build first`);
  process.exit(1);
}

const { scanned, hits } = scanForWebflow(roots);
if (hits.length > 0) {
  console.error("check-no-webflow: built output still references Webflow or githack:");
  for (const file of hits) console.error(`  ${relative(process.cwd(), file)}`);
  process.exit(1);
}
console.log(`check-no-webflow: ${scanned} built text files, no Webflow or githack host`);
