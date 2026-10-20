// Every absolute URL a prerendered file carries must be the production origin.
// Kit 3 prerenders with the placeholder origin "http://sveltekit-prerender"
// (paths.origin is deliberately unset: sveltekit.config.js says why), and only
// code that goes through $lib/seo's siteOrigin swaps it for Netlify's URL. A
// read of page.url that skips siteOrigin builds green and ships the
// placeholder; three review rounds on reddoorla/beachfront-dentistry#90 kept finding new spellings of that
// read which a source scan could not see. So this checks the output instead:
// it builds the site exactly as Netlify does, with URL set, and fails on any
// built file that still names the placeholder.
import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync, realpathSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";

export const PLACEHOLDER = "http://sveltekit-prerender";
// The bare host, so an encoded (`http%3A%2F%2Fsveltekit-prerender`), host-only
// or protocol-relative form of the placeholder is caught too. A clean build
// names it nowhere outside `_app/immutable`, where $lib/seo's own constant is.
const NEEDLE = "sveltekit-prerender";
const PRODUCTION = "https://www.williamson-homes.com";
// The production origin as a whole origin (not a prefix of another host), for
// the control's count. A regex, not `includes`: CodeQL reads a URL literal in
// `includes` as a host check (js/incomplete-url-substring-sanitization).
const CARRIES_PRODUCTION = /https:\/\/www\.williamson-homes\.com(?![\w.-])/;

export function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

/** Built files that name the placeholder, and how many name production. */
export function scan(root) {
  const files = walk(root).filter((f) => !/[\\/]_app[\\/]immutable[\\/]/.test(f));
  const offenders = [];
  let production = 0;
  for (const file of files) {
    // Every file, whatever its extension (a prerendered endpoint can be named
    // anything); a NUL byte marks a binary (image, font), which cannot carry it.
    const bytes = readFileSync(file);
    if (bytes.includes(0)) continue;
    const text = bytes.toString("utf8");
    if (text.includes(NEEDLE)) offenders.push(relative(root, file));
    if (CARRIES_PRODUCTION.test(text)) production++;
  }
  return { files: files.length, offenders, production };
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  // Netlify's whole build environment, not only URL: a config can branch on
  // NETLIFY or CONTEXT, and the output must be the one a production deploy makes.
  const env = { ...process.env, NETLIFY: "true", CONTEXT: "production", URL: PRODUCTION };
  delete env.VITEST;
  const built = spawnSync("pnpm", ["exec", "vite", "build"], {
    env,
    stdio: "inherit",
  });
  if (built.status !== 0) process.exit(built.status ?? 1);
  const { files, offenders, production } = scan("build");
  if (offenders.length > 0) {
    console.error(
      `prerender-origin: ${offenders.length} built file(s) carry ${PLACEHOLDER}, ` +
        `kit 3's prerender placeholder, instead of ${PRODUCTION}. Build absolute ` +
        `URLs from page.url through $lib/seo's siteOrigin:\n  ` +
        offenders.join("\n  "),
    );
    process.exit(1);
  }
  // The instrument's control: a build that emitted nothing, or that never
  // took the production URL, would pass the placeholder check vacuously.
  // Measured on the kit 2 build of 2026-10-20 (main, URL and NETLIFY set):
  // 32 files outside _app/immutable, 10 naming production, every one a
  // prerendered page (robots.txt and sitemap.xml answer per request here).
  // A build whose pages lost the production origin names it nowhere.
  if (files < 25 || production < 8) {
    console.error(
      `prerender-origin: expected a full build carrying ${PRODUCTION}; ` +
        `saw ${files} files, ${production} naming it`,
    );
    process.exit(1);
  }
  console.log(
    `prerender-origin: ${files} built files, ${production} carry ${PRODUCTION}, none the placeholder`,
  );
}
