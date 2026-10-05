import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/svelte";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import FeaturedProjects from "./FeaturedProjects/index.svelte";
import ProjectList from "./ProjectList/index.svelte";
import PageHero from "./PageHero/index.svelte";
import TeamContacts from "./TeamContacts/index.svelte";
import Statement from "./Statement/index.svelte";
import AnchorIntro from "./AnchorIntro/index.svelte";
import ProcessSteps from "./ProcessSteps/index.svelte";
import Timeline from "./Timeline/index.svelte";
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
const rt = (text: string) => [{ type: "heading2", text, spans: [] }];
const slice = (slice_type: string, primary: Record<string, unknown>, items: unknown[] = []) =>
  ({ slice_type, variation: "default", primary, items }) as never;

const hrefs = (container: HTMLElement) =>
  [...container.querySelectorAll("a")].map((a) => a.getAttribute("href"));
const projectHrefs = (links: Element[]) =>
  links.map((a) => a.getAttribute("href") ?? "").filter((href) => /^\/projects\/[^/]+$/.test(href));

/** The theme's colours, read from app.css's @theme block. */
const THEME: Record<string, string> = (() => {
  const css = readFileSync(resolve(process.cwd(), "src/app.css"), "utf8");
  const body = /@theme\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? "";
  const out: Record<string, string> = {};
  for (const m of body.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-f]{6}|white|black)\s*;/gi)) {
    out[m[1]] = m[2] === "white" ? "#ffffff" : m[2] === "black" ? "#000000" : m[2];
  }
  return out;
})();

/** WCAG 2.x contrast between two #rrggbb values. */
function contrast(a: string, b: string): number {
  const luminance = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** The nearest theme token in a `<prefix>-<token>` class on the element or an
 *  ancestor: what it is painted in. */
const painted = (el: Element | null, prefix: string): string | undefined =>
  el
    ? ((el.getAttribute("class") ?? "")
        .split(/\s+/)
        .map((c) => new RegExp(`^${prefix}-([a-z0-9-]+)$`).exec(c)?.[1])
        .find((token) => token !== undefined && token in THEME) ??
      painted(el.parentElement, prefix))
    : undefined;

/** Whether the element fixes or caps its own height, at any breakpoint. */
const fixesHeight = (el: Element | null) =>
  (el?.getAttribute("class") ?? "")
    .split(/\s+/)
    .map((c) => c.split(":").pop() ?? "")
    .some((u) => /^(max-)?h-(?!(auto|none|fit|max|min)$)/.test(u));

const expectLegible = (el: Element, where: string) => {
  const [fg, bg] = [painted(el, "text"), painted(el, "bg")];
  expect(fg && bg, `${el.textContent?.trim()} on ${where} is unmeasured`).toBeTruthy();
  expect(
    contrast(THEME[fg!], THEME[bg!]),
    `${el.textContent?.trim()} on ${where}: ${fg} on ${bg}`,
  ).toBeGreaterThanOrEqual(4.5);
};

describe("FeaturedProjects", () => {
  it("links the chosen projects, in order, and not the others", () => {
    const { container } = render(FeaturedProjects, {
      props: {
        slice: slice("featured_projects", { heading: "Featured Projects" }, [rel("p3"), rel("p1")]),
        context: { projects: cards },
      },
    });
    const named = projectHrefs([...container.querySelectorAll("a:not([aria-hidden='true'])")]);
    expect(named).toEqual(["/projects/manhattan-beach", "/projects/palos-verdes-cove"]);
    for (const photo of container.querySelectorAll("a[aria-hidden='true']")) {
      expect(photo.getAttribute("tabindex")).toBe("-1");
      expect(named).toContain(photo.getAttribute("href"));
    }
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
    expect(projectHrefs([...container.querySelectorAll("a")])).toEqual(
      cards.map((c) => `/projects/${c.uid}`),
    );
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
  const email = { button_label: "Email Us", button_link: web("mailto:info@williamson-homes.com") };
  const call = { button_label: "Call Us", button_link: web("tel:3105707278") };
  const photo = (container: HTMLElement) => container.querySelector('img[src*="/hero.jpg"]');

  it("renders the page's h1, the photo and its buttons", () => {
    const { container, getByRole } = render(PageHero, {
      props: { slice: slice("page_hero", base, [email, call]) },
    });
    expect(getByRole("heading", { level: 1 }).textContent).toBe("Your construction partner");
    expect(photo(container)).not.toBeNull();
    expect(getByRole("link", { name: "Email Us" }).getAttribute("href")).toBe(
      "mailto:info@williamson-homes.com",
    );
    expect(getByRole("link", { name: "Call Us" }).getAttribute("href")).toBe("tel:3105707278");
  });

  it("drops the photo on a solid ground, and keeps the heading and buttons legible on it", () => {
    const grounds: Record<string, string | undefined> = {};
    for (const background of ["primary", "teal"]) {
      const { container, getByRole, unmount } = render(PageHero, {
        props: { slice: slice("page_hero", { ...base, background }, [call]) },
      });
      expect(photo(container)).toBeNull();
      const heading = getByRole("heading", { level: 1 });
      grounds[background] = painted(heading, "bg");
      expectLegible(heading, `the ${background} ground`);
      expectLegible(getByRole("link", { name: "Call Us" }), `the ${background} ground`);
      unmount();
    }
    expect(grounds.teal).not.toBe(grounds.primary);
  });

  it("sizes the hero from its height field, falling back to tall with slow zoom and short without", () => {
    const sized = (fields: Record<string, unknown>) =>
      render(PageHero, {
        props: { slice: slice("page_hero", { ...base, ...fields }) },
      })
        .container.querySelector("section")
        ?.className.split(/\s+/)
        .filter((c) => /(^|:)(min-|max-)?h-/.test(c))
        .join(" ");
    const tall = sized({ ken_burns: false, height: "tall" });
    const short = sized({ ken_burns: true, height: "short" });
    expect(tall).not.toBe(short);
    expect(sized({ ken_burns: true, height: null })).toBe(tall);
    expect(sized({ ken_burns: false, height: null })).toBe(short);
  });

  it("puts the mark above the heading, or below it for heading-first, with the buttons last", () => {
    const precedes = (a: Node, b: Node) =>
      Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    const parts = (layout: string | null) => {
      const { container, getByRole } = render(PageHero, {
        props: { slice: slice("page_hero", { ...base, background: "primary", layout }, [email]) },
      });
      return {
        mark: [...container.querySelectorAll("img")].find((img) => !img.closest("a")) as Element,
        heading: getByRole("heading", { level: 1 }),
        buttons: getByRole("link", { name: "Email Us" }),
      };
    };
    const markFirst = parts(null);
    expect(precedes(markFirst.mark, markFirst.heading)).toBe(true);
    expect(precedes(markFirst.heading, markFirst.buttons)).toBe(true);
    cleanup();
    const headingFirst = parts("heading-first");
    expect(precedes(headingFirst.heading, headingFirst.mark)).toBe(true);
    expect(precedes(headingFirst.mark, headingFirst.buttons)).toBe(true);
  });

  it("never fixes or caps its height while it hides overflow, so a long heading cannot clip its buttons", () => {
    const section = render(PageHero, {
      props: { slice: slice("page_hero", base, [email, call]) },
    }).container.querySelector("section");
    const clips = (section?.className ?? "")
      .split(/\s+/)
      .some((c) => /^overflow(-y)?-(hidden|clip)$/.test(c.split(":").pop() ?? ""));
    expect(clips && fixesHeight(section)).toBe(false);
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
    expect(container.querySelector('a[href="tel:1"]')).toBeNull();
    expect(container.textContent).not.toContain("Email");
  });
});

describe("TeamContacts", () => {
  const people = [
    {
      photo: image("mark"),
      name: "Mark Mayotte",
      role: "VP",
      email: "mark@williamson-homes.com",
      phone: "310.709.7380",
    },
    {
      photo: image("brian"),
      name: "Brian Williamson",
      role: "CEO",
      email: "brian@williamson-homes.com",
      phone: "310.570.7278",
    },
  ];
  const team = (items: unknown[]) =>
    render(TeamContacts, {
      props: { slice: slice("team_contacts", { heading: "Talk to us" }, items) },
    }).container;

  it("links each person's email and phone", () => {
    expect(hrefs(team(people))).toEqual(
      expect.arrayContaining([
        "mailto:mark@williamson-homes.com",
        "tel:3107097380",
        "mailto:brian@williamson-homes.com",
        "tel:3105707278",
      ]),
    );
  });

  it("gives a third person a row of their own, so they never land on the first", () => {
    const rows = [
      ...team([
        ...people,
        { ...people[0], name: "Third Person", email: "third@x.com" },
      ]).querySelectorAll("li"),
    ].map((li) => li.style.gridRow);
    expect(rows[2]).not.toBe(rows[0]);
  });

  it("shows a person with no photo by name, with no broken image", () => {
    const li = team([{ ...people[0], photo: {} }]).querySelector("li");
    expect(li?.querySelector("img:not([src]), img[src='']")).toBeNull();
    expect(li?.querySelector("h3")?.textContent).toContain("Mark Mayotte");
  });

  it("lets a long name or email wrap inside its column instead of running out of it", () => {
    const wrap =
      /^(\[overflow-wrap:(anywhere|break-word)\]|wrap-(anywhere|break-word)|break-(words|all))$/;
    const wraps = (el: Element | null): boolean =>
      !!el &&
      ((el.getAttribute("class") ?? "").split(/\s+/).some((c) => wrap.test(c)) ||
        wraps(el.parentElement));
    for (const el of team(people).querySelectorAll("li h3, li a"))
      expect(wraps(el), el.textContent?.trim()).toBe(true);
  });

  it("grows each card with its text instead of fixing its height", () => {
    const cards = [...team(people).querySelectorAll("li")];
    expect(cards.length).toBeGreaterThan(0);
    for (const li of cards) expect(fixesHeight(li)).toBe(false);
  });

  it("makes each contact link a box, so the paragraph's line is its tap target", () => {
    const links = [...team(people).querySelectorAll("li a")];
    expect(links.length).toBeGreaterThan(0);
    for (const a of links)
      expect(
        (a.getAttribute("class") ?? "")
          .split(/\s+/)
          .some((c) => /^(inline-)?(block|flex|grid)$/.test(c)),
        a.textContent?.trim(),
      ).toBe(true);
  });

  it("hides everything in the list but its people from assistive tech", () => {
    const list = team(people).querySelector("ul");
    expect(list).not.toBeNull();
    for (const el of list!.children)
      if (el.tagName !== "LI") expect(el.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("Statement", () => {
  it("anchors on its section id, tones each button, and keeps both legible on its ground", () => {
    const { container, getByRole } = render(Statement, {
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
    expect(container.querySelector("section")?.id).toBe("builders");
    const email = getByRole("link", { name: "Email Us" });
    const call = getByRole("link", { name: "Call Us" });
    expect(email.className).not.toBe(call.className);
    for (const button of [email, call]) expectLegible(button, "the light ground");
  });

  it("paints the ground the editor chose", () => {
    const ground = (choice: string) => {
      const section = render(Statement, {
        props: {
          slice: slice("statement", { section_id: null, heading: [], body: [], ground: choice }),
        },
      }).container.querySelector("section");
      const token = painted(section, "bg");
      cleanup();
      return token;
    };
    const light = ground("light");
    expect(light).toBeDefined();
    expect(ground("white")).not.toBe(light);
  });
});

describe("AnchorIntro", () => {
  it("links each numbered item to its section", () => {
    const { getByRole } = render(AnchorIntro, {
      props: {
        slice: slice("anchor_intro", { heading: "About Us", body: [] }, [
          { label: "Family of Builders", anchor: "builders" },
          { label: "Commercial Advantage", anchor: "commercial" },
        ]),
      },
    });
    expect(getByRole("link", { name: /Family of Builders/ }).getAttribute("href")).toBe(
      "#builders",
    );
    expect(getByRole("link", { name: /Commercial Advantage/ }).getAttribute("href")).toBe(
      "#commercial",
    );
  });
});

describe("ProcessSteps", () => {
  const steps = (primary: Record<string, unknown>, items: unknown[]) =>
    render(ProcessSteps, {
      props: {
        slice: slice(
          "process_steps",
          { section_id: null, heading: "Steps", intro: [], ...primary },
          items,
        ),
      },
    });

  it("numbers the titled steps in order and names each for screen readers", () => {
    const { getAllByRole } = steps({}, [
      { title: "Meet with Us", body: [] },
      { title: "Partner Early", body: [] },
      { title: null, body: [] },
    ]);
    const headings = getAllByRole("heading", { level: 3 });
    expect(headings.map((h) => h.getAttribute("aria-label"))).toEqual([
      "Step 1: Meet with Us",
      "Step 2: Partner Early",
    ]);
    expect(getAllByRole("heading", { level: 3, name: "Step 2: Partner Early" })).toHaveLength(1);
    expect(headings.map((h) => h.textContent?.trim())).toEqual(["Meet with Us", "Partner Early"]);
  });

  it("sets the eyebrow heading style apart from the default", () => {
    const h2Class = (heading_style: string | null) => {
      const cls = steps({ heading_style }, [
        { title: "Meet with Us", body: [] },
      ]).container.querySelector("h2")?.className;
      cleanup();
      return cls;
    };
    expect(h2Class("eyebrow")).not.toBe(h2Class(null));
  });
});

describe("Timeline", () => {
  it("anchors on its section id and renders every entry", () => {
    const entries = ["Glen Alwin Bentley", "Ron Bentley", "Brian Williamson"].map((name, i) => ({
      name: rt(name),
      body: "1950",
      image: image(`entry-${i}`),
      caption: "1954",
    }));
    const { container } = render(Timeline, {
      props: {
        slice: slice(
          "timeline",
          { section_id: "builders", heading: "A family of builders" },
          entries,
        ),
      },
    });
    expect(container.querySelector("section")?.id).toBe("builders");
    const lis = [...container.querySelectorAll("li")];
    expect(lis).toHaveLength(entries.length);
    lis.forEach((li, i) => expect(li.textContent).toContain(entries[i].name[0].text));
  });

  it("grows each row with a tall photo instead of fixing its height", () => {
    const { container } = render(Timeline, {
      props: {
        slice: slice("timeline", { section_id: null, heading: null }, [
          { name: rt("Ron Bentley"), body: "1976", image: image("tall"), caption: null },
          { name: rt("Brian Williamson"), body: "2012", image: image("last"), caption: null },
        ]),
      },
    });
    const rows = [...container.querySelectorAll("li")];
    expect(rows.length).toBeGreaterThan(0);
    for (const li of rows) expect(fixesHeight(li)).toBe(false);
  });
});
