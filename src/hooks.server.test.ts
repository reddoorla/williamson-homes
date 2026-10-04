import { readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { handle } from "./hooks.server";
import {
  CMS_FRAMED_ROUTES,
  CMS_FRAME_ANCESTORS,
  isCmsFramedRoute,
  widenFrameAncestors,
} from "$lib/security/cms-framing";
import { prerender as simulatorPrerender } from "./routes/slice-simulator/+page";

const POLICY =
  "default-src 'self'; frame-src 'self' https://williamson-homes.prismic.io; frame-ancestors 'self'; base-uri 'self'";

const HOME = "/[[preview=preview]]";
const PAGE = "/[[preview=preview]]/[uid]";
const SIMULATOR = "/slice-simulator";

async function headersFor(
  pathname: string,
  routeId: string | null,
  policy: string | null = POLICY,
  upstream: Record<string, string> = {},
) {
  const response = await handle({
    event: {
      url: new URL(`https://williamson-homes.netlify.app${pathname}`),
      route: { id: routeId },
    } as never,
    resolve: async () =>
      new Response("<html></html>", {
        headers: {
          "content-type": "text/html",
          ...(policy ? { "Content-Security-Policy": policy } : {}),
          ...upstream,
        },
      }),
  });
  return response.headers;
}

describe("handle", () => {
  it("sends the baseline security headers on every response", async () => {
    for (const [path, routeId] of [
      ["/", HOME],
      ["/slice-simulator", SIMULATOR],
    ]) {
      const headers = await headersFor(path, routeId);
      expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
      expect(headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
      expect(headers.get("Permissions-Policy")).toBe("camera=(), microphone=(), geolocation=()");
    }
  });
});

describe("CMS framing", () => {
  // A prerendered /slice-simulator is a static file on Netlify: the hook never
  // runs for it and netlify.toml's `/*` X-Frame-Options: SAMEORIGIN reaches it,
  // so every test below would pass while the Type Builder still cannot frame it.
  it("keeps /slice-simulator server-rendered, so the hook decides its headers", () => {
    expect(simulatorPrerender).toBe(false);
  });

  it("keeps every ordinary page SAMEORIGIN with frame-ancestors 'self'", async () => {
    const headers = await headersFor("/about-us", PAGE);
    expect(headers.get("X-Frame-Options")).toBe("SAMEORIGIN");
    expect(headers.get("Content-Security-Policy")).toBe(POLICY);
  });

  it("lets Prismic frame /slice-simulator: no X-Frame-Options, widened frame-ancestors", async () => {
    const headers = await headersFor("/slice-simulator", SIMULATOR);
    expect(headers.get("X-Frame-Options")).toBeNull();
    const csp = headers.get("Content-Security-Policy") ?? "";
    expect(csp).toContain(CMS_FRAME_ANCESTORS);
    expect(csp.match(/frame-ancestors/g)).toHaveLength(1);
    expect(csp).toContain("frame-src 'self' https://williamson-homes.prismic.io");
    expect(csp).toContain("base-uri 'self'");
  });

  // The hook must REMOVE an X-Frame-Options that reaches it, not merely skip
  // setting one: every other test hands it a response with none, so a hook that
  // only stopped adding the header would pass them all.
  it("strips an X-Frame-Options the response already carries on /slice-simulator", async () => {
    const headers = await headersFor("/slice-simulator", SIMULATOR, POLICY, {
      "X-Frame-Options": "DENY",
    });
    expect(headers.get("X-Frame-Options")).toBeNull();
  });

  // Spelled out rather than read from CMS_FRAME_ANCESTORS: a test that compares
  // the constant with itself passes whatever the constant is narrowed to.
  it("names exactly the Type Builder's framers", async () => {
    const csp =
      (await headersFor("/slice-simulator", SIMULATOR)).get("Content-Security-Policy") ?? "";
    expect(csp).toContain(
      "frame-ancestors 'self' http://localhost:* https://*.prismic.io https://prismic.io",
    );
  });

  it("frames the route SvelteKit resolved, so an encoded path gets the same headers", async () => {
    const headers = await headersFor("/slice%2Dsimulator", SIMULATOR);
    expect(headers.get("X-Frame-Options")).toBeNull();
    expect(headers.get("Content-Security-Policy")).toContain(CMS_FRAME_ANCESTORS);
  });

  it("keeps a path that only looks like the simulator SAMEORIGIN when no route matched", async () => {
    const headers = await headersFor("/slice-simulator", null);
    expect(headers.get("X-Frame-Options")).toBe("SAMEORIGIN");
    expect(headers.get("Content-Security-Policy")).toBe(POLICY);
  });

  it("names only route ids that exist, so moving the page cannot silently unframe it", () => {
    for (const id of CMS_FRAMED_ROUTES) {
      const dir = join("src/routes", ...id.split("/").filter(Boolean));
      expect(
        readdirSync(dir).some((file) => file.startsWith("+page.")),
        id,
      ).toBe(true);
    }
  });

  it("matches the route id exactly", () => {
    expect(isCmsFramedRoute(SIMULATOR)).toBe(true);
    expect(isCmsFramedRoute("/slice-simulator/")).toBe(false);
    expect(isCmsFramedRoute("/slice-simulator-x")).toBe(false);
    expect(isCmsFramedRoute("/slice-simulator/x")).toBe(false);
    expect(isCmsFramedRoute(PAGE)).toBe(false);
    expect(isCmsFramedRoute(null)).toBe(false);
  });

  it("adds frame-ancestors when the policy has none", () => {
    expect(widenFrameAncestors("default-src 'self'")).toBe(
      `default-src 'self'; ${CMS_FRAME_ANCESTORS}`,
    );
  });

  it("leaves a response without a CSP without one", async () => {
    const headers = await headersFor("/slice-simulator", SIMULATOR, null);
    expect(headers.get("Content-Security-Policy")).toBeNull();
    expect(headers.get("X-Frame-Options")).toBeNull();
  });
});
