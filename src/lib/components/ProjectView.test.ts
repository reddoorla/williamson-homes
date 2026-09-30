import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/svelte";

import ProjectView from "./ProjectView.svelte";

afterEach(() => cleanup());

const image = (name: string, alt: string | null = null) => ({
  url: `https://images.prismic.io/williamson-homes/${name}.jpg`,
  alt,
  copyright: null,
  dimensions: { width: 1600, height: 1067 },
  edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
  id: name,
});

const project = {
  id: "p1",
  uid: "palos-verdes-cove",
  type: "project",
  data: {
    title: "Palos Verdes Cove",
    hero_image: image("hero"),
    credits: [{ type: "paragraph", text: "Photographer: Elizabeth Nielsen", spans: [] }],
    gallery: [{ image: image("one", "Kitchen") }, { image: image("two") }, { image: {} }],
    meta_title: null,
    meta_description: null,
    meta_image: {},
  },
} as never;

describe("ProjectView", () => {
  it("titles the page with the project and contacts the real inbox", () => {
    const { getByRole } = render(ProjectView, { props: { project } });
    expect(getByRole("heading", { level: 1 }).textContent?.trim()).toBe("Palos Verdes Cove");
    expect(getByRole("link", { name: "Email Us" }).getAttribute("href")).toBe(
      "mailto:info@williamson-homes.com",
    );
    expect(getByRole("link", { name: "Call Us" }).getAttribute("href")).toBe("tel:3105707278");
  });

  it("paints the hero photo as a decorative background", () => {
    const { container } = render(ProjectView, { props: { project } });
    const hero = container.querySelector("section img");
    expect(hero?.getAttribute("src")).toContain("/hero.jpg");
    expect(hero?.getAttribute("alt")).toBe("");
  });

  it("shows the credits and every filled gallery image, keeping editor alt text", () => {
    const { container, getByText } = render(ProjectView, { props: { project } });
    expect(getByText("Photographer: Elizabeth Nielsen")).toBeTruthy();
    const photos = [...container.querySelectorAll("ul img")];
    expect(photos).toHaveLength(2);
    expect(photos.map((img) => img.getAttribute("alt"))).toEqual(["Kitchen", ""]);
  });
});
