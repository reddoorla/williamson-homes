import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/svelte";

import FeaturedProjects from "./FeaturedProjects/index.svelte";
import ProjectList from "./ProjectList/index.svelte";
import PageHero from "./PageHero/index.svelte";
import TeamContacts from "./TeamContacts/index.svelte";
import Statement from "./Statement/index.svelte";
import AnchorIntro from "./AnchorIntro/index.svelte";
import ProcessSteps from "./ProcessSteps/index.svelte";
import type { ProjectCard } from "$lib/projects";

afterEach(() => cleanup());

const image = (name: string) => ({
  url: `https://images.prismic.io/williamson-homes/${name}.jpg`,
  alt: null,
  copyright: null,
  dimensions: { width: 1600, height: 1067 },
  edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
  id: name,
});

const cards: ProjectCard[] = [
  { id: "p1", uid: "palos-verdes-cove", title: "Palos Verdes Cove", image: image("pvc") },
  { id: "p2", uid: "pv-malaga-cove", title: "Malaga Cove", image: image("pvmc") },
  { id: "p3", uid: "manhattan-beach", title: "Manhattan Beach", image: image("mb") },
];

const rel = (id: string) => ({
  project: { link_type: "Document", id, type: "project", uid: id, isBroken: false },
});
const web = (url: string) => ({ link_type: "Web", url });
const slice = (slice_type: string, primary: Record<string, unknown>, items: unknown[] = []) =>
  ({ slice_type, variation: "default", primary, items }) as never;

const hrefs = (container: HTMLElement) =>
  [...container.querySelectorAll("a")].map((a) => a.getAttribute("href"));

describe("FeaturedProjects", () => {
  it("links the chosen projects, in order, and nothing else", () => {
    const { container } = render(FeaturedProjects, {
      props: {
        slice: slice("featured_projects", { heading: "Featured Projects" }, [rel("p3"), rel("p1")]),
        context: { projects: cards },
      },
    });
    expect(hrefs(container)).toEqual(["/projects/manhattan-beach", "/projects/palos-verdes-cove"]);
    expect(container.querySelector("h2")?.textContent).toBe("Featured Projects");
  });
});

describe("ProjectList", () => {
  it("lists every project when the editor chose none", () => {
    const { container } = render(ProjectList, {
      props: {
        slice: slice("project_list", { heading: "Featured Projects" }),
        context: { projects: cards },
      },
    });
    expect(hrefs(container)).toEqual(cards.map((c) => `/projects/${c.uid}`));
  });

  it("names each project in its link", () => {
    const { getByRole } = render(ProjectList, {
      props: {
        slice: slice("project_list", { heading: null }, [rel("p2")]),
        context: { projects: cards },
      },
    });
    expect(getByRole("link", { name: /Malaga Cove/ }).getAttribute("href")).toBe(
      "/projects/pv-malaga-cove",
    );
  });
});

describe("PageHero", () => {
  const base = {
    heading: [{ type: "heading1", text: "Your construction partner", spans: [] }],
    background_image: image("hero"),
    background: "photo",
    text_tone: "light",
    mark: "w",
    ken_burns: true,
  };

  it("renders the page's h1, the photo and its buttons", () => {
    const { container, getByRole } = render(PageHero, {
      props: {
        slice: slice("page_hero", base, [
          { button_label: "Email Us", button_link: web("mailto:info@williamson-homes.com") },
          { button_label: "Call Us", button_link: web("tel:3105707278") },
        ]),
      },
    });
    expect(getByRole("heading", { level: 1 }).textContent).toBe("Your construction partner");
    expect(container.querySelector("img.wh-ken-burns")).not.toBeNull();
    expect(hrefs(container)).toEqual(["mailto:info@williamson-homes.com", "tel:3105707278"]);
  });

  it("paints the teal ground with no photo", () => {
    const { container } = render(PageHero, {
      props: { slice: slice("page_hero", { ...base, background: "teal", mark: "ocean-w" }) },
    });
    expect(container.querySelector("section")?.className).toContain("bg-teal");
    expect(container.querySelector("img.wh-ken-burns")).toBeNull();
  });

  it("drops a button with no label or no link", () => {
    const { container } = render(PageHero, {
      props: {
        slice: slice("page_hero", base, [
          { button_label: "", button_link: web("tel:1") },
          { button_label: "Email", button_link: { link_type: "Any" } },
        ]),
      },
    });
    expect(container.querySelectorAll("a")).toHaveLength(0);
  });
});

describe("TeamContacts", () => {
  it("links each person's email and phone", () => {
    const { container } = render(TeamContacts, {
      props: {
        slice: slice("team_contacts", { heading: "Talk to us" }, [
          {
            photo: image("mark"),
            name: "Mark Mayotte",
            role: "VP",
            email: "mark@williamson-homes.com",
            phone: "310.709.7380",
          },
        ]),
      },
    });
    expect(hrefs(container)).toEqual(["mailto:mark@williamson-homes.com", "tel:3107097380"]);
  });
});

describe("Statement", () => {
  it("anchors on its section id and tones each button", () => {
    const { container } = render(Statement, {
      props: {
        slice: slice(
          "statement",
          {
            section_id: "builders",
            eyebrow: null,
            heading: [],
            body: [],
            show_mark: true,
            ground: "light",
          },
          [
            {
              button_label: "Email Us",
              button_link: web("mailto:a@b.c"),
              button_tone: "secondary",
            },
            { button_label: "Call Us", button_link: web("tel:1"), button_tone: "primary" },
          ],
        ),
      },
    });
    const section = container.querySelector("section");
    expect(section?.id).toBe("builders");
    expect(section?.className).toContain("bg-light");
    const [email, call] = container.querySelectorAll("a");
    expect(email.className).toContain("text-secondary");
    expect(call.className).toContain("text-primary");
  });
});

describe("AnchorIntro", () => {
  it("links each numbered item to its section", () => {
    const { container } = render(AnchorIntro, {
      props: {
        slice: slice("anchor_intro", { heading: "About Us", body: [] }, [
          { label: "Family of Builders", anchor: "builders" },
          { label: "Commercial Advantage", anchor: "commercial" },
        ]),
      },
    });
    expect(hrefs(container)).toEqual(["#builders", "#commercial"]);
  });
});

describe("ProcessSteps", () => {
  it("numbers the steps in order and names each for screen readers", () => {
    const { getAllByRole } = render(ProcessSteps, {
      props: {
        slice: slice("process_steps", { section_id: null, heading: "Steps", intro: [] }, [
          { title: "Meet with Us", body: [] },
          { title: "Partner Early", body: [] },
        ]),
      },
    });
    expect(getAllByRole("heading", { level: 3 }).map((h) => h.textContent?.trim())).toEqual([
      "Step 1: Meet with Us",
      "Step 2: Partner Early",
    ]);
  });
});
