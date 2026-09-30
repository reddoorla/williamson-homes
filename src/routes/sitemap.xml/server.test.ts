import { describe, it, expect, vi } from "vitest";

const prismic = vi.hoisted(() => ({
  isPlaceholderRepo: true,
  getAllByType: vi.fn(async (_type: string) => [] as unknown[]),
}));
vi.mock("$lib/prismicio", () => ({
  get isPlaceholderRepo() {
    return prismic.isPlaceholderRepo;
  },
  createClient: () => ({ getAllByType: prismic.getAllByType }),
}));

const { GET, prerender } = await import("./+server");

const body = async (origin = "https://example.com") => {
  const response = await GET({
    url: new URL(`${origin}/sitemap.xml`),
    fetch: globalThis.fetch,
  } as unknown as Parameters<typeof GET>[0]);
  return response.text();
};

const locs = (xml: string) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const wired = () => {
  prismic.isPlaceholderRepo = false;
  prismic.getAllByType.mockReset();
  prismic.getAllByType.mockImplementation(async (type: string) =>
    type === "page"
      ? [
          { uid: "home", last_publication_date: "2026-09-01T00:00:00Z" },
          { uid: "about-us", last_publication_date: "2026-09-01T00:00:00Z" },
        ]
      : [{ uid: "palos-verdes-cove", last_publication_date: "2026-09-02T00:00:00Z" }],
  );
};

describe("GET /sitemap.xml on the placeholder repo", () => {
  it("emits a well-formed, empty urlset", async () => {
    const xml = await body();
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain("<urlset");
    expect(xml).toContain("</urlset>");
    expect(locs(xml)).toEqual([]);
  });
});

describe("GET /sitemap.xml", () => {
  it("is rendered per request, not baked at build time", () => {
    expect(prerender).toBe(false);
  });

  it("lists every page and every project on the production origin", async () => {
    wired();
    expect(locs(await body("https://www.example.com"))).toEqual([
      "https://www.example.com/",
      "https://www.example.com/about-us",
      "https://www.example.com/projects/palos-verdes-cove",
    ]);
  });

  it("dates each entry by its publication", async () => {
    wired();
    const xml = await body("https://www.example.com");
    expect(xml).toContain("<lastmod>2026-09-02T00:00:00.000Z</lastmod>");
  });

  it("offers no URLs on the netlify.app mirror and does not query Prismic", async () => {
    wired();
    const xml = await body("https://williamson-homes.netlify.app");
    expect(locs(xml)).toEqual([]);
    expect(prismic.getAllByType).not.toHaveBeenCalled();
  });
});
