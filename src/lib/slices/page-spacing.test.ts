import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/svelte";

import PageHero from "./PageHero/index.svelte";
import Statement from "./Statement/index.svelte";
import ProcessSteps from "./ProcessSteps/index.svelte";
import ImageCards from "./ImageCards/index.svelte";
import Timeline from "./Timeline/index.svelte";
import AnchorIntro from "./AnchorIntro/index.svelte";
import ProjectList from "./ProjectList/index.svelte";
import ProjectView from "$lib/components/ProjectView.svelte";
import SiteFooter from "$lib/components/SiteFooter.svelte";

afterEach(() => cleanup());

const image = (name: string, width = 1600, height = 1067) => ({
  url: `https://images.prismic.io/williamson-homes/${name}.png`,
  alt: null,
  copyright: null,
  dimensions: { width, height },
  edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
  id: name,
});
const rt = (text: string) => [{ type: "heading2", text, spans: [] }];
const slice = (slice_type: string, primary: Record<string, unknown>, items: unknown[] = []) =>
  ({ slice_type, variation: "default", primary, items }) as never;
const has = (el: Element | null, cls: string) =>
  new RegExp(`(^|\\s)${cls.replace(/[[\]()/.]/g, "\\$&")}(\\s|$)`).test(el?.className ?? "");

const hero = (primary: Record<string, unknown>) =>
  render(PageHero, {
    props: {
      slice: slice("page_hero", {
        heading: rt("Your construction partner"),
        background: "photo",
        background_image: image("beach"),
        text_tone: "light",
        mark: "w",
        ...primary,
      }),
    },
  }).container;

describe("PageHero spacing and photo position", () => {
  it("keeps home's 12rem/8rem and a covering photo when the fields are blank", () => {
    const c = hero({});
    const body = c.querySelector(".wh-hero > div") as HTMLElement;
    expect(has(body, "pt-48")).toBe(true);
    expect(has(body, "pb-32")).toBe(true);
    expect(has(c.querySelector("img"), "inset-0")).toBe(true);
  });

  it("takes about's 8rem top and pins the photo to the bottom edge", () => {
    const c = hero({ top_space: "8rem", image_position: "bottom" });
    const body = c.querySelector(".wh-hero > div") as HTMLElement;
    expect(has(body, "pt-32")).toBe(true);
    const img = c.querySelector("img");
    expect(has(img, "bottom-0")).toBe(true);
    expect(has(img, "inset-0")).toBe(false);
  });

  it("takes contact's and projects' 4rem bottom", () => {
    const body = hero({ bottom_space: "4rem" }).querySelector(".wh-hero > div");
    expect(has(body, "pb-16")).toBe(true);
  });

  it("puts the mark first by default, and below the heading for projects, with the buttons 6rem down", () => {
    const order = (c: HTMLElement) =>
      [...c.querySelectorAll(".wh-hero > div > *")].map((el) =>
        el.tagName === "IMG"
          ? "mark"
          : has(el, "wh-hero-heading")
            ? "heading"
            : el.querySelector("a") && has(el, "justify-center")
              ? "buttons"
              : `unexpected ${el.tagName}`,
      );
    const withButtons = (layout: string | null) =>
      render(PageHero, {
        props: {
          slice: slice(
            "page_hero",
            {
              heading: rt("Featured Projects"),
              background: "photo",
              background_image: image("beach"),
              text_tone: "light",
              mark: "w",
              layout,
            },
            [{ button_label: "Email Us", button_link: { link_type: "Web", url: "mailto:a@b.c" } }],
          ),
        },
      }).container;
    const markFirst = withButtons(null);
    expect(order(markFirst)).toEqual(["mark", "heading", "buttons"]);
    expect(has(markFirst.querySelector(".wh-hero-heading"), "mt-16")).toBe(true);
    expect(has(markFirst.querySelector(".wh-hero-heading"), "max-w-[450px]")).toBe(true);
    const headingFirst = withButtons("heading-first");
    expect(order(headingFirst)).toEqual(["heading", "mark", "buttons"]);
    expect(has(headingFirst.querySelector(".wh-hero > div > img"), "mt-16")).toBe(true);
    expect(has(headingFirst.querySelector(".wh-hero-heading"), "max-w-[450px]")).toBe(false);
    expect(has(headingFirst.querySelector(".wh-hero > div > div:last-child"), "mt-24")).toBe(true);
  });

  it("never caps its height, so a tall heading cannot clip the buttons on a short phone", () => {
    expect(hero({}).querySelector(".wh-hero")?.className).not.toMatch(/max-h-/);
  });
});

const statement = (primary: Record<string, unknown>) =>
  render(Statement, {
    props: {
      slice: slice("statement", {
        heading: rt("We treat our clients like family."),
        body: [],
        ground: "white",
        ...primary,
      }),
    },
  }).container;

describe("Statement spacing and W mark", () => {
  it("keeps 4rem/4rem when the fields are blank", () => {
    const s = statement({}).querySelector("section");
    expect(has(s, "pt-16")).toBe(true);
    expect(has(s, "pb-16")).toBe(true);
  });

  it("takes 0 top for home's closing call to action and 8rem for about's", () => {
    expect(has(statement({ top_space: "0" }).querySelector("section"), "pt-0")).toBe(true);
    const about = statement({ top_space: "8rem", bottom_space: "8rem" }).querySelector("section");
    expect(has(about, "pt-32")).toBe(true);
    expect(has(about, "pb-32")).toBe(true);
  });

  it("draws the mark tan at 4rem by default and blue at 8rem for contact, 4rem above the heading", () => {
    const tan = statement({ show_mark: true }).querySelector("img");
    expect(has(tan, "wh-filter-tan")).toBe(true);
    expect(has(tan, "w-16")).toBe(true);
    expect(has(tan, "mb-16")).toBe(true);
    const blue = statement({ show_mark: true, mark_style: "blue" }).querySelector("img");
    expect(has(blue, "wh-filter-blue")).toBe(true);
    expect(has(blue, "w-32")).toBe(true);
  });
});

describe("ProcessSteps heading style", () => {
  const steps = (heading_style: string | null) =>
    render(ProcessSteps, {
      props: {
        slice: slice(
          "process_steps",
          { section_id: null, heading: "Collaborative approach", intro: [], heading_style },
          [{ title: "Design and Construction", body: [] }],
        ),
      },
    }).container;

  it("names a step for heading navigation only when it has a title", () => {
    const c = render(ProcessSteps, {
      props: {
        slice: slice("process_steps", { section_id: null, heading: "Steps", intro: [] }, [
          { title: "Meet with Us", body: [] },
          { title: null, body: [] },
        ]),
      },
    }).container;
    const h3s = [...c.querySelectorAll("h3")];
    expect(h3s.map((h) => h.getAttribute("aria-label"))).toEqual(["Step 1: Meet with Us"]);
  });

  it("uses the heading style by default and the eyebrow for about", () => {
    expect(has(steps(null).querySelector("h2"), "wh-h3")).toBe(true);
    expect(has(steps("eyebrow").querySelector("h2"), "wh-eyebrow")).toBe(true);
  });
});

describe("ImageCards (Commercial Advantage)", () => {
  const c = () =>
    render(ImageCards, {
      props: {
        slice: slice(
          "image_cards",
          {
            section_id: "commercial",
            eyebrow: "Commercial Advantage",
            heading: rt("Our mission"),
            logo: image("logo"),
            button_label: null,
            button_link: { link_type: "Any" },
          },
          [{ image: image("hs"), label: "Education" }],
        ),
      },
    }).container;

  it("is a flush panel with 80px inside, 728px under 992 and full width on phones", () => {
    const panel = c().querySelector("section > div");
    for (const cls of [
      "py-20",
      "max-w-[940px]",
      "max-[992px]:max-w-[728px]",
      "max-[480px]:max-w-none",
    ])
      expect(has(panel, cls)).toBe(true);
    expect(has(c().querySelector("section"), "py-16")).toBe(false);
  });

  it("narrows the heading to 80% and gutters the cards like a Webflow row", () => {
    const root = c();
    expect(has(root.querySelector(".wh-statement-heading"), "w-4/5")).toBe(true);
    expect(has(root.querySelector("ul"), "md:-mx-2.5")).toBe(true);
    expect(has(root.querySelector("li"), "px-2.5")).toBe(true);
  });
});

describe("Timeline (A family of builders)", () => {
  const entries = [
    {
      name: rt("Glen Alwin Bentley"),
      body: "1950",
      image: image("one", 333, 333),
      caption: "1954",
    },
    { name: rt("Ron Bentley"), body: "1976", image: image("two", 334, 251), caption: "1976" },
    { name: rt("Brian Williamson"), body: "2012", image: image("three", 373, 248), caption: "HQ" },
  ];
  const c = () =>
    render(Timeline, {
      props: {
        slice: slice(
          "timeline",
          { section_id: "builders", heading: "A family of builders" },
          entries,
        ),
      },
    }).container;

  it("puts text and photo on opposite sides, alternating, in 32rem rows and a 16rem last row", () => {
    const lis = [...c().querySelectorAll("li")];
    expect(lis).toHaveLength(3);
    expect(has(lis[0], "min-[480px]:min-h-128")).toBe(true);
    expect(has(lis[2], "min-[480px]:min-h-64")).toBe(true);
    const textCol = (li: Element) => li.querySelector(":scope > div");
    const photoCol = (li: Element) => li.querySelector(":scope > figure");
    expect(has(textCol(lis[0]), "min-[480px]:col-start-1")).toBe(true);
    expect(has(photoCol(lis[0]), "min-[480px]:col-start-2")).toBe(true);
    expect(has(textCol(lis[1]), "min-[480px]:col-start-2")).toBe(true);
    expect(has(photoCol(lis[1]), "min-[480px]:col-start-1")).toBe(true);
  });

  it("shows each photo at its natural width, and tucks the first up 9px as the reference does", () => {
    const imgs = [...c().querySelectorAll("img")];
    expect(imgs.map((i) => i.style.width)).toEqual(["333px", "334px", "373px"]);
    expect(has(imgs[0], "-mt-[9px]")).toBe(true);
    expect(has(imgs[1], "-mt-[9px]")).toBe(false);
  });

  it("draws the phone line beside every entry but the last", () => {
    const lis = [...c().querySelectorAll("li")];
    expect(lis.map((li) => has(li, "border-secondary"))).toEqual([true, true, false]);
  });
});

describe("AnchorIntro (the three circles)", () => {
  const c = () =>
    render(AnchorIntro, {
      props: {
        slice: slice(
          "anchor_intro",
          { heading: "About Us", body: [{ type: "paragraph", text: "As a family", spans: [] }] },
          [
            { label: "Family of Builders", anchor: "builders" },
            { label: "Commercial Advantage", anchor: "commercial" },
            { label: "Collaborative Approach", anchor: "collab" },
          ],
        ),
      },
    }).container;

  it("ends at the labels, with the reference's row gutters and phone gap", () => {
    const root = c();
    expect(has(root.querySelector("section"), "pb-16")).toBe(false);
    const ol = root.querySelector("ol");
    for (const cls of ["gap-16", "pb-4", "md:gap-0", "md:-mx-2.5"]) expect(has(ol, cls)).toBe(true);
  });

  it("sits each label flush under its circle at the h4's 28px line height", () => {
    const link = c().querySelector("a");
    expect(has(link, "gap-2")).toBe(false);
    expect(has(link?.querySelector(".wh-eyebrow") ?? null, "leading-7")).toBe(true);
  });
});

describe("ProjectList (the projects index)", () => {
  const cards = ["a", "b", "c"].map((uid) => ({
    id: uid,
    uid,
    title: uid.toUpperCase(),
    image: image(uid),
  }));
  const c = () =>
    render(ProjectList, {
      props: {
        slice: slice("project_list", { heading: "Featured Projects" }),
        context: { projects: cards },
      },
    }).container;

  it("alternates photo sides above 480 and stacks centred below it", () => {
    const links = [...c().querySelectorAll("a")];
    expect(links.map((a) => has(a, "min-[480px]:flex-row-reverse"))).toEqual([true, false, true]);
    expect(has(links[1], "min-[480px]:flex-row")).toBe(true);
    for (const a of links) expect(has(a, "flex-col")).toBe(true);
    const title = links[0].querySelector("h3");
    expect(has(title, "min-[480px]:self-end")).toBe(true);
    expect(has(title, "min-[480px]:text-left")).toBe(true);
  });

  it("draws each photo as a 60% square and keeps the reference's 1px phone inset", () => {
    const root = c();
    const frame = root.querySelector("a > div");
    expect(has(frame, "aspect-square")).toBe(true);
    expect(has(frame, "min-[480px]:w-[60%]")).toBe(true);
    const section = root.querySelector("section");
    expect(has(section, "border-l")).toBe(true);
    expect(has(section, "min-[480px]:border-l-0")).toBe(true);
  });
});

describe("ProjectView gallery spacing", () => {
  const project = (credits: unknown[]) =>
    ({
      id: "p",
      uid: "pv-malaga-cove",
      type: "project",
      data: {
        title: "Malaga Cove",
        hero_image: image("hero"),
        credits,
        gallery: [{ image: image("one") }],
        meta_title: null,
        meta_description: null,
        meta_image: {},
      },
    }) as never;

  it("sets the credits at the paragraph scale with 10px under each line, kept out of the gallery's margin", () => {
    const c = render(ProjectView, {
      props: {
        project: project([
          { type: "paragraph", text: "Design: Christien Vroom Interiors", spans: [] },
        ]),
      },
    }).container;
    const credits = c.querySelector(".wh-credits");
    for (const cls of ["wh-p", "flow-root", "[&_p]:mb-2.5"]) expect(has(credits, cls)).toBe(true);
  });

  it("ends 4rem under the last photo, with the 1px phone inset", () => {
    const gallery = render(ProjectView, {
      props: { project: project([]) },
    }).container.querySelectorAll("section")[1];
    expect(has(gallery, "pb-16")).toBe(true);
    expect(has(gallery, "py-32")).toBe(false);
    expect(has(gallery, "min-[480px]:border-l-0")).toBe(true);
  });
});

describe("SiteFooter", () => {
  it("makes each link its own line box, so a link row is the link's 20px and not the list's 24px, and only as wide as its text", () => {
    const links = [...render(SiteFooter).container.querySelectorAll("nav a")];
    expect(links.length).toBeGreaterThan(0);
    for (const a of links) {
      expect(has(a, "block")).toBe(true);
      expect(has(a, "w-fit")).toBe(true);
      expect(has(a, "ml-auto")).toBe(true);
    }
  });
});

describe("ProjectView title", () => {
  it("steps the title down the heading ladder on tablets and phones", () => {
    const c = render(ProjectView, {
      props: {
        project: {
          id: "p",
          uid: "x",
          type: "project",
          data: { title: "Malaga Cove", hero_image: image("h"), credits: [], gallery: [] },
        } as never,
      },
    }).container;
    expect(has(c.querySelector("h1"), "wh-h3")).toBe(true);
  });
});
