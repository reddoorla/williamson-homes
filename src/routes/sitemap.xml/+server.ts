import { isNetlifyMirrorHost } from "$lib/indexability";
import { createClient, isPlaceholderRepo } from "$lib/prismicio";
import { projectHref } from "$lib/projects";
import type { RequestHandler } from "./$types";

// Rendered PER REQUEST, not prerendered (#140): a prerendered sitemap lists the
// build origin's URLs on every host the build is served from, including the
// netlify.app mirror. See robots.txt/+server.ts.
export const prerender = false;

export const GET: RequestHandler = async ({ fetch, url }) => {
  const origin = url.origin;
  // The netlify.app mirror offers nothing to crawl — and so does not spend a
  // Prismic query per request building a list it would throw away.
  const mirror = isNetlifyMirrorHost(url.hostname);

  // One entry per page document ("home" renders at "/"). Empty on an
  // unconfigured starter so the route works before Prismic is wired.
  type Entry = { path: string; lastmod?: string };
  const publishedAt = (doc: { last_publication_date?: string | null }) =>
    new Date(doc.last_publication_date ?? Date.now()).toISOString();
  const client = mirror || isPlaceholderRepo ? null : createClient({ fetch });
  const [pages, projects] = client
    ? await Promise.all([client.getAllByType("page"), client.getAllByType("project")])
    : [[], []];
  const pageEntries: Entry[] = [
    ...pages.map((page) => ({
      path: page.uid === "home" ? "/" : `/${page.uid}`,
      lastmod: publishedAt(page),
    })),
    ...projects.map((project) => ({
      path: projectHref(project.uid),
      lastmod: publishedAt(project),
    })),
  ];

  const urls = pageEntries.map(
    ({ path, lastmod }) => `  <url>
    <loc>${origin}${path}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}
  </url>`,
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
};
