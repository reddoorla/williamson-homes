import { describe, expect, it } from "vitest";

import { headerToneFor } from "./header-tone";
import { hrefOf } from "./links";
import { telHref } from "./contact";

const page = (slices: unknown[]) => ({ data: { slices } }) as never;

describe("headerToneFor", () => {
  it("is light over a light-text hero", () => {
    expect(
      headerToneFor(page([{ slice_type: "page_hero", primary: { text_tone: "light" } }])),
    ).toBe("light");
  });

  it("is dark over a dark-text hero and on a page with no hero", () => {
    expect(headerToneFor(page([{ slice_type: "page_hero", primary: { text_tone: "dark" } }]))).toBe(
      "dark",
    );
    expect(headerToneFor(page([{ slice_type: "statement", primary: {} }]))).toBe("dark");
    expect(headerToneFor(page([]))).toBe("dark");
  });
});

describe("hrefOf", () => {
  it("resolves web, document and empty links", () => {
    expect(hrefOf({ link_type: "Web", url: "tel:3105707278" } as never)).toBe("tel:3105707278");
    expect(
      hrefOf({
        link_type: "Document",
        id: "x",
        type: "page",
        uid: "contact",
        isBroken: false,
      } as never),
    ).toBe("/contact");
    expect(hrefOf({ link_type: "Any" } as never)).toBeNull();
  });
});

describe("telHref", () => {
  it("keeps only the digits", () => {
    expect(telHref("310.570.7278")).toBe("tel:3105707278");
  });
});
