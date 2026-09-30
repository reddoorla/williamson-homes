import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { captureFileFor, collectImageKeys } from "./capture-files.js";
import { documents, HOME_FEATURED, PROJECTS } from "./site-pages.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const SPEC = join(ROOT, "matching/spec");
const manifest = JSON.parse(readFileSync(join(SPEC, "manifest.json"), "utf8")) as {
  pages: Array<{ path: string; file: string }>;
  files: Array<{ file: string }>;
};

type Doc = { type: string; uid: string; data: Record<string, unknown> };
const docs = documents((key: string) => ({ key })) as Doc[];

const capturedProjectSlugs = manifest.pages
  .map((page) => page.path.match(/^\/projects\/([^/]+)$/)?.[1])
  .filter((slug): slug is string => !!slug)
  .sort();

function galleryInCapture(slug: string): number {
  const html = readFileSync(join(SPEC, `pages/projects/${slug}/index.html`), "utf8");
  const list = html.split('role="list" class="w-dyn-items"')[1]?.split("</section>")[0] ?? "";
  return (list.match(/<img /g) ?? []).length;
}

function modelFields(file: string): string[] {
  const model = JSON.parse(readFileSync(join(ROOT, file), "utf8"));
  return Object.values(model.json as Record<string, Record<string, unknown>>).flatMap((tab) =>
    Object.keys(tab),
  );
}

describe("site-pages against the Webflow capture", () => {
  it("seeds exactly the projects the reference publishes", () => {
    expect(capturedProjectSlugs).toHaveLength(6);
    expect(PROJECTS.map((p) => p.uid).sort()).toEqual(capturedProjectSlugs);
    expect(
      docs
        .filter((d) => d.type === "project")
        .map((d) => d.uid)
        .sort(),
    ).toEqual(capturedProjectSlugs);
  });

  it("carries every gallery photo each project page shows", () => {
    for (const project of PROJECTS) {
      expect(project.gallery.length, project.uid).toBe(galleryInCapture(project.uid));
    }
  });

  it("features only projects that exist", () => {
    for (const uid of HOME_FEATURED) expect(capturedProjectSlugs).toContain(uid);
  });

  it("resolves every image to exactly one captured file", () => {
    const keys = collectImageKeys(documents);
    const galleryTotal = PROJECTS.reduce((n, p) => n + p.gallery.length, 0);
    expect(galleryTotal).toBe(64);
    expect(keys.length).toBeGreaterThan(galleryTotal);
    for (const key of keys) {
      const file = captureFileFor(manifest, key);
      expect(existsSync(join(SPEC, file)), key).toBe(true);
    }
  });

  it("names no Webflow host or githack URL outside the image resolver", () => {
    const serialized = JSON.stringify(documents(() => ({ key: "IMG" })));
    expect(serialized).not.toMatch(/website-files\.com|webflow|githack/i);
  });
});

describe("site-pages documents against their custom types", () => {
  const allowed: Record<string, string[]> = {
    page: modelFields("customtypes/page/index.json"),
    project: modelFields("customtypes/project/index.json"),
  };

  it("sets only fields the model declares, so the Migration API strips nothing", () => {
    const stripped: string[] = [];
    for (const doc of docs) {
      const fields = allowed[doc.type];
      expect(fields, doc.type).toBeDefined();
      for (const key of Object.keys(doc.data)) {
        if (!fields.includes(key)) stripped.push(`${doc.type}/${doc.uid}.${key}`);
      }
    }
    expect(stripped).toEqual([]);
  });

  it("gives every page a unique uid and the four reference paths", () => {
    const pages = docs.filter((d) => d.type === "page").map((d) => d.uid);
    expect(new Set(pages).size).toBe(pages.length);
    expect(pages.sort()).toEqual(["about-us", "contact", "home", "projects"]);
  });
});
