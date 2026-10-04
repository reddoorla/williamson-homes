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

async function headersFor(pathname: string, policy: string | null = POLICY) {
  const response = await handle({
    event: { url: new URL(`https://williamson-homes.netlify.app${pathname}`) } as never,
    resolve: async () =>
      new Response("<html></html>", {
        headers: {
          "content-type": "text/html",
          ...(policy ? { "Content-Security-Policy": policy } : {}),
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
