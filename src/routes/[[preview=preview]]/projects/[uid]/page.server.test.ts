import { describe, expect, it, vi } from "vitest";
import { NotFoundError } from "@prismicio/client";
import { isHttpError } from "@sveltejs/kit";

const prismic = vi.hoisted(() => ({
  isPlaceholderRepo: false,
  getByUID: vi.fn(),
  getAllByType: vi.fn(async () => [{ uid: "palos-verdes-cove" }, { uid: "manhattan-beach" }]),
}));
vi.mock("$lib/prismicio", () => ({
  get isPlaceholderRepo() {
    return prismic.isPlaceholderRepo;
  },
  createClient: () => ({ getByUID: prismic.getByUID, getAllByType: prismic.getAllByType }),
}));

const { load, entries } = await import("./+page.server");

const event = (uid: string) =>
  ({ params: { uid }, fetch: globalThis.fetch, cookies: { get: () => undefined } }) as never;

async function statusOf(run: () => unknown): Promise<number | "resolved"> {
  try {
    await run();
    return "resolved";
  } catch (err) {
    if (isHttpError(err)) return err.status;
    throw err;
  }
}

describe("/projects/[uid]", () => {
  it("is a 404 for a slug Prismic does not have", async () => {
    prismic.isPlaceholderRepo = false;
    prismic.getByUID.mockRejectedValueOnce(new NotFoundError("none", "https://x", undefined));
    expect(await statusOf(() => load(event("no-such-project")))).toBe(404);
  });

  it("is a 404 on the placeholder repo without asking Prismic", async () => {
    prismic.isPlaceholderRepo = true;
    prismic.getByUID.mockClear();
    expect(await statusOf(() => load(event("palos-verdes-cove")))).toBe(404);
    expect(prismic.getByUID).not.toHaveBeenCalled();
  });

  it("prerenders one entry per project document", async () => {
    prismic.isPlaceholderRepo = false;
    expect(await entries()).toEqual([{ uid: "palos-verdes-cove" }, { uid: "manhattan-beach" }]);
  });

  it("prerenders nothing on the placeholder repo", async () => {
    prismic.isPlaceholderRepo = true;
    expect(await entries()).toEqual([]);
  });
});
