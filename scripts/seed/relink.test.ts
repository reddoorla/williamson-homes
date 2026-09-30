import { describe, expect, it } from "vitest";

import { makeRelink } from "./relink.mjs";

const link = (type: string, uid: string) => ({
  link_type: "Document",
  type,
  uid,
  id: `${type}-${uid}`,
});

describe("seed relink", () => {
  it("resolves a document link to the migration document the seed created", () => {
    const home = { title: "Home" };
    const relink = makeRelink(new Map([["page:home", home]]));
    const out = relink({ items: [{ project: link("page", "home") }] }) as {
      items: Array<{ project: () => unknown }>;
    };
    expect(out.items[0].project()).toBe(home);
  });

  it("throws on a link to a document the seed does not create", () => {
    const relink = makeRelink(new Map());
    const out = relink({ project: link("project", "no-such-project") }) as {
      project: () => unknown;
    };
    expect(() => out.project()).toThrow("project:no-such-project");
  });

  it("passes class instances such as assets through untouched", () => {
    class Asset {}
    const asset = new Asset();
    expect((makeRelink(new Map())({ image: asset }) as { image: unknown }).image).toBe(asset);
  });
});
