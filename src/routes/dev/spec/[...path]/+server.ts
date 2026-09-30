import { error } from "@sveltejs/kit";
import { dev } from "$app/environment";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";

export const prerender = false;

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET({ params }) {
  if (!dev) error(404, { message: "Not found" });

  const root = resolve("matching/spec");
  const target = resolve(root, params.path);
  if (!target.startsWith(root + sep)) error(404, { message: "Not found" });
  const type = TYPES[extname(target).toLowerCase()];
  if (!type) error(404, { message: "Not found" });

  try {
    return new Response(await readFile(target), { headers: { "Content-Type": type } });
  } catch {
    error(404, { message: "Not found" });
  }
}
