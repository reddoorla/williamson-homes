// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { collectBuildServices } from "./privacy-services.ts";
import { GA4_DISCLOSED_AHEAD_OF_TAG } from "../src/lib/privacy/policy.ts";

let root: string;
const put = (rel: string, text: string) => {
  mkdirSync(dirname(join(root, rel)), { recursive: true });
  writeFileSync(join(root, rel), text);
};

// SvelteKit 3: the options are top-level in sveltekit.config.js, with no `kit`.
const config = (directives: Record<string, string[]> | null) =>
  `export default { adapter: { name: "@sveltejs/adapter-netlify" }${
    directives ? `, csp: { directives: ${JSON.stringify(directives)} }` : ""
  } };`;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "privacy-"));
  put("package.json", `{ "type": "module" }`);
  put("sveltekit.config.js", config({ "frame-src": ["self"] }));
});
afterEach(() => rmSync(root, { recursive: true, force: true }));

describe("collectBuildServices", () => {
  it("reads the client hook for GA4", async () => {
    put("src/hooks.client.ts", `initAnalytics({ measurementId: "G-ABCDEFGHIJ" });`);
    expect((await collectBuildServices(root)).ga4).toBe(true);
  });

  it("does not count tests, type declarations, dev fixtures or the privacy code itself", async () => {
    const all = `initAnalytics({}); createIngestAction({ formType: "newsletter" });`;
    put("src/hooks.client.test.ts", all);
    put("src/lib/a.spec.ts", all);
    put("src/global.d.ts", all);
    put("src/routes/dev/x/+page.svelte", all);
    put("src/routes/privacy/+page.svelte", all);
    put("src/lib/privacy/services.ts", all);
    expect(await collectBuildServices(root)).toMatchObject({
      ga4: false,
      forms: false,
      newsletter: false,
    });
  });

  it("reads the CSP the config resolves to, not the text it is written in", async () => {
    put(
      "sveltekit.config.js",
      `const base = { "frame-src": ["https://*.vimeo.com"] };
export default { csp: { directives: { ...base } } };`,
    );
    expect((await collectBuildServices(root)).vimeo).toBe(true);
  });

  it("finishes on a source tree with symlink cycles", async () => {
    put("src/a/x.ts", "export {};");
    put("src/b/y.ts", "export {};");
    symlinkSync(join(root, "src"), join(root, "src/a/up"));
    symlinkSync(join(root, "src"), join(root, "src/b/up2"));
    expect((await collectBuildServices(root)).forms).toBe(false);
  });

  it("keeps a CSP with no directives from counting as a CSP", async () => {
    put("sveltekit.config.js", `export default { csp: { directives: {} } };`);
    put("src/lib/V.svelte", `<iframe src="https://player.vimeo.com/video/1"></iframe>`);
    expect((await collectBuildServices(root)).vimeo).toBe(true);
  });

  it("falls back to the source when the config sets no CSP", async () => {
    put("sveltekit.config.js", config(null));
    put("src/lib/V.svelte", `<iframe src="https://player.vimeo.com/video/1"></iframe>`);
    expect((await collectBuildServices(root)).vimeo).toBe(true);
  });
});

describe("this site itself", () => {
  const site = join(dirname(fileURLToPath(import.meta.url)), "..");

  // What williamson-homes's own source and sveltekit.config.js say, read the way
  // the page reads them. forms is false because no route posts to the central
  // ingest (/contact is a Prismic page of mailto/tel links), and so Turnstile,
  // which the CSP still admits, is off too (withRuntime needs a form). Vimeo is
  // on because the CSP frames player.vimeo.com (VimeoBanner); Google Fonts is
  // off because nothing loads fonts.googleapis.com though the CSP admits it.
  // ga4 flips to true the moment the analytics-tag PR adds initAnalytics: update
  // this line then, and clear GA4_DISCLOSED_AHEAD_OF_TAG (the test below).
  it("lists Netlify, the Vimeo its CSP admits and the GA4 its hook starts, and no form or fonts it never loads", async () => {
    expect(await collectBuildServices(site)).toEqual({
      forms: false,
      newsletter: false,
      ga4: true,
      netlify: true,
      vimeo: true,
      youtube: false,
      googleFonts: false,
      adobeFonts: false,
    });
  });

  it("drops the GA4 override once the site's own code starts analytics", async () => {
    const { ga4 } = await collectBuildServices(site);
    expect(ga4 && GA4_DISCLOSED_AHEAD_OF_TAG, "clear GA4_DISCLOSED_AHEAD_OF_TAG").toBe(false);
  });
});
