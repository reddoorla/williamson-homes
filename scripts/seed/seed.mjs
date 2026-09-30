import { readFileSync } from "node:fs";
import { basename, join } from "node:path";
import * as prismic from "@prismicio/client";

import { captureFileFor, collectImageKeys } from "../../src/lib/capture-files.js";
import { documents, lang } from "../../src/lib/site-pages.js";

const SPEC = "matching/spec";
const dryRun = process.argv.includes("--dry-run");
const manifest = JSON.parse(readFileSync(join(SPEC, "manifest.json"), "utf8"));

const keys = collectImageKeys(documents);
const files = new Map(keys.map((key) => [key, captureFileFor(manifest, key)]));
const plan = documents((key) => ({ key }));

console.log(
  `seed plan: ${plan.filter((d) => d.type === "page").length} pages, ` +
    `${plan.filter((d) => d.type === "project").length} projects, ${files.size} images from ${SPEC}`,
);
if (dryRun) process.exit(0);

const repositoryName = process.env.PRISMIC_REPOSITORY_NAME;
const writeToken = process.env.PRISMIC_WRITE_TOKEN;
if (!repositoryName || !writeToken) {
  console.error("PRISMIC_REPOSITORY_NAME and PRISMIC_WRITE_TOKEN must be set (or pass --dry-run).");
  process.exit(1);
}

const migration = prismic.createMigration();
const assets = new Map();
const img = (key) => {
  if (!assets.has(key)) {
    const file = files.get(key);
    const bytes = readFileSync(join(SPEC, file));
    assets.set(key, migration.createAsset(new File([bytes], basename(file)), basename(file)));
  }
  return assets.get(key);
};

const docs = documents(img);
const created = new Map();
const relink = (value) => {
  if (Array.isArray(value)) return value.map(relink);
  if (value && typeof value === "object") {
    if (value.link_type === "Document" && value.uid) {
      return () => created.get(`${value.type}:${value.uid}`);
    }
    if (value.constructor !== Object) return value;
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, relink(v)]));
  }
  return value;
};

for (const doc of docs) {
  created.set(
    `${doc.type}:${doc.uid}`,
    migration.createDocument(
      { type: doc.type, uid: doc.uid, lang, data: relink(doc.data) },
      doc.title,
    ),
  );
}

const client = prismic.createWriteClient(repositoryName, { writeToken });
await client.migrate(migration, {
  reporter: (event) => console.log(event.type, event.data?.current ?? "", event.data?.total ?? ""),
});
console.log("seed: done — review the migration release in Prismic, then publish it");
