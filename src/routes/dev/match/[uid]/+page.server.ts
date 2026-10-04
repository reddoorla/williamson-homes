import { error } from "@sveltejs/kit";
import { dev } from "$app/environment";
import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { imageSize } from "$lib/image-size";
import { captureFileFor } from "$lib/capture-files.js";
import { documents } from "$lib/site-pages.js";
import { headerToneFor } from "$lib/header-tone";
import { toCard } from "$lib/projects";
import type { ProjectDocument } from "../../../../prismicio-types";

// Local matching surface: renders the assemblies in $lib/site-pages.js — the
// same module a Prismic Migration API script publishes from (start from the
// starter's scripts/import/migrate.example.ts; no `reddoor-maint` command does
// this, the seed is per-site work) — so a fix made to pass a gate is a fix to
// what ships. Not prerendered, SSR-on-demand, dev-only.
export const prerender = false;

export async function load({ params, url }) {
  // FIRST statement: everything below reads fixtures that must not be reachable
  // from a production build. The launch recipe asserts this route 404s on the
  // deployed URL, with /dev/a11y-fixtures as the 200 control.
  if (!dev) error(404, { message: "Not found" });

  const manifest = JSON.parse(await readFile("matching/spec/manifest.json", "utf8"));
  const sizes = new Map<string, { width: number; height: number }>();
  const sizeOf = (file: string) => {
    if (!sizes.has(file)) {
      let size: { width: number; height: number } | null;
      try {
        size = imageSize(readFileSync(`matching/spec/${file}`));
      } catch {
        size = null;
      }
      sizes.set(file, size ?? { width: 1600, height: 1067 });
    }
    return sizes.get(file)!;
  };
  const devImg = (key: string) => ({
    url: `${url.origin}/dev/spec/${encodeURI(captureFileFor(manifest, key))}`,
    alt: null,
    copyright: null,
    dimensions: sizeOf(captureFileFor(manifest, key)),
    edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
    id: key,
  });

  const docs = documents(devImg) as Array<{
    type: string;
    uid: string;
    data: { slices?: unknown[] };
  }>;
  const doc = docs.find((d) => d.uid === params.uid);
  // The leading token is a MACHINE tell for the launch recipe's dev-guard. This
  // 404 renders through the site's own +error.svelte exactly like a guarded
  // route's does, so on a site whose uids lack "home" an UNGUARDED twin would
  // pass the deployed check forever; the token is what tells the two apart.
  // Reword the prose freely — the token is the contract (#719).
  if (!doc)
    error(404, {
      message: `reddoor-match-twin:no-assembly: no assembly for "${params.uid}" (have: ${docs.map((d) => d.uid).join(", ") || "none"})`,
    });

  const projects = docs
    .filter((d) => d.type === "project")
    .map((d) => ({ ...d, id: `project-${d.uid}` }) as unknown as ProjectDocument);
  const project = doc.type === "project" ? projects.find((p) => p.uid === doc.uid) : undefined;

  return {
    uid: params.uid,
    slices: doc.data.slices ?? [],
    project,
    projects: projects.map(toCard),
    headerTone: project
      ? ("light" as const)
      : headerToneFor(doc as unknown as Parameters<typeof headerToneFor>[0]),
  };
}
