import { describe, it, expect } from "vitest";
import { handle } from "./hooks.server";
import {
  CMS_FRAME_ANCESTORS,
  isCmsFramedRoute,
  widenFrameAncestors,
} from "$lib/security/cms-framing";
import { prerender as simulatorPrerender } from "./routes/slice-simulator/+page";

const POLICY =
  "default-src 'self'; frame-src 'self' https://williamson-homes.prismic.io; frame-ancestors 'self'; base-uri 'self'";

async function headersFor(
  pathname: string,
  policy: string | null = POLICY,
  upstream: Record<string, string> = {},
) {
  const response = await handle({
    event: { url: new URL(`https://williamson-homes.netlify.app${pathname}`) } as never,
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
    for (const path of ["/", "/slice-simulator"]) {
      const headers = await headersFor(path);
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
    const headers = await headersFor("/about-us");
    expect(headers.get("X-Frame-Options")).toBe("SAMEORIGIN");
    expect(headers.get("Content-Security-Policy")).toBe(POLICY);
  });

  it("lets Prismic frame /slice-simulator: no X-Frame-Options, widened frame-ancestors", async () => {
    const headers = await headersFor("/slice-simulator");
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
    const headers = await headersFor("/slice-simulator", POLICY, { "X-Frame-Options": "DENY" });
    expect(headers.get("X-Frame-Options")).toBeNull();
  });

  // Spelled out rather than read from CMS_FRAME_ANCESTORS: a test that compares
  // the constant with itself passes whatever the constant is narrowed to.
  it("names exactly the Type Builder's framers", async () => {
    const csp = (await headersFor("/slice-simulator")).get("Content-Security-Policy") ?? "";
    expect(csp).toContain(
      "frame-ancestors 'self' http://localhost:* https://*.prismic.io https://prismic.io",
    );
  });

  it("treats a trailing slash as the same route, and nothing else", () => {
    expect(isCmsFramedRoute("/slice-simulator/")).toBe(true);
    expect(isCmsFramedRoute("/slice-simulator-x")).toBe(false);
    expect(isCmsFramedRoute("/slice-simulator/x")).toBe(false);
    expect(isCmsFramedRoute("/")).toBe(false);
  });

  it("adds frame-ancestors when the policy has none", () => {
    expect(widenFrameAncestors("default-src 'self'")).toBe(
      `default-src 'self'; ${CMS_FRAME_ANCESTORS}`,
    );
  });

  it("leaves a response without a CSP without one", async () => {
    const headers = await headersFor("/slice-simulator", null);
    expect(headers.get("Content-Security-Policy")).toBeNull();
    expect(headers.get("X-Frame-Options")).toBeNull();
  });
});
